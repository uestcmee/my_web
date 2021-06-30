# coding:utf-8
import json
import os
import sys
import traceback

import pandas as pd
import pymongo
from flask import Flask, render_template
from flask import jsonify
from flask import request

sys.path.insert(0, "../my_scheduled_app/")  # 加入path，以便引用那边的函数
# 循环引用，解决方法，推迟一方的导入，让例外一方完成
app = Flask(__name__)
# 数据库
if os.name == 'nt':
    myclient = pymongo.MongoClient("mongodb://db:112233@cscficc.cn:27017/")
else:
    myclient = pymongo.MongoClient("mongodb://db:112233@localhost:27017/")


@app.route("/")
def index():
    return render_template("main_elementUI.html")


@app.route("/stg_return")
def stg_return():
    return render_template("stg_return.html")


@app.route("/intro")
def intro():
    return render_template("intro.html")


# 使用html方式引用页尾，需要做一个route
@app.route("/footer.html")
def footer():
    return render_template("footer.html")


@app.route("/moment")
def moment_main_page():
    return render_template("momentum.html")


def py_fetch_lookback_data(lf=1, sf=1, lm=30, sm=5):
    from STG_Return import StgReturn

    df = StgReturn(
        file_name="./data/CSI.csv", l_fac=lf, s_fac=sf, lma=lm, sma=sm
    ).main_loop()
    res = [df.index.tolist(), df.iloc[:, 0].tolist(), df.iloc[:, 1].tolist()]
    return res


@app.route("/lookback", methods=["GET", "POST"])
def fetch_lookback_data():
    lf, sf, lm, sm = 0, 0, 0, 0
    if request.method == "POST":
        data = request.get_data()
        json_obj = json.loads(data)
        print(json_obj)
        lm = json_obj["lm"]
        sm = json_obj["sm"]
        lf = json_obj["lf"]
        sf = json_obj["sf"]
    else:
        print("not request")
    data = py_fetch_lookback_data(float(lf), float(sf), int(lm), int(sm))
    [day, stg_r, idx_r] = data
    return jsonify({"day": day, "stg_r": stg_r, "idx_r": idx_r})


@app.route("/au_data/hist", methods=["GET", "POST"])
def au_hist():
    def get_contract_hist(symbol='AU2106'):
        import akshare as ak
        futures_zh_daily_sina_df = ak.futures_zh_daily_sina(symbol=symbol)
        qh_df = futures_zh_daily_sina_df.set_index('date')[['close', 'hold', 'volume']]
        qh_df.columns = ['qihuo', 'hold', 'volume']
        qh_df = qh_df.astype({'qihuo': float,
                              'hold': int,
                              'volume': int})
        mydb = myclient["au"]
        mycol = mydb["day"]
        xh_df = pd.DataFrame([one for one in mycol.find({}, {"date": 1, 'xianhuo': 1, '_id': 0})])
        xh_df = xh_df.set_index('date')['xianhuo']
        df_all = pd.merge(xh_df, qh_df, on='date').dropna()
        # df_all = pd.concat([xh_df, qh_df], axis=1).dropna()
        df_all.sort_index(inplace=True)
        df_all.insert(0, 'Date', df_all.index)
        df_all.index = [i for i in range(len(df_all))]
        return df_all

    if request.method == "POST":
        post_data = (request.get_data(as_text=True))
        symbol = json.loads(request.get_data(as_text=True))['symbol']
        df = get_contract_hist(symbol)
    else:
        df = get_contract_hist()

    return df.T.to_json()


@app.route("/au_data", methods=["GET", "POST"])
def au_info():
    return render_template(
        "au.html")


@app.route("/conv_bond/table", methods=["GET"])
def conv_bond_table():
    from convert_bond import get_table
    try:
        date = (request.args['date'])
    except:
        date = '2021-06-29'
    return jsonify(get_table(date))  # jsonify


@app.route("/conv_bond/rr", methods=["GET"])
def conv_bond_rr():
    from convert_bond import get_cum_rr
    rr_df = get_cum_rr()
    rr_df.sort_index(inplace=True)  # 对时间进行排序
    rr_df_dict = pd.DataFrame(rr_df).to_json()
    # print(rr_df_dict)
    return jsonify(rr_df_dict)  # jsonify


@app.route("/conv_bond", methods=["GET"])
def conv_bond():
    return render_template(
        "conv_bond.html")


# 这里因为前面修改了path，所以真的在引用schedule文件夹里的函数
from au_data_crawler import get_today_str


@app.route("/au_contract_list")
def au_contract_list():
    date = get_today_str()["trade_day"]

    try:
        mydb = myclient["au"]
        mycol = mydb["contract"]
        df = pd.DataFrame(
            [one for one in mycol.find({"date": date}, {"_id": 0})]
        )  # .set_index('symbol')
        df.set_index("symbol", inplace=True)
        df = df["delivery_day"]
    except:
        traceback.print_exc()
        df = pd.DataFrame()
    # contract_list_dict = {i: x for i, x in enumerate(qh_symbol_list)}
    df.drop_duplicates(inplace=True)  # 可能存在重复写入的合约信息，去重
    contract_list_dict = pd.DataFrame(df).to_json()
    return jsonify(contract_list_dict)


@app.route("/au_real_time", methods=["GET", "POST"])
def au_real_time():
    date = get_today_str()["trade_day"]
    # if date not in GetTables(minutes_db_path):
    #     from au_data_crawler import save_minutes_data
    #
    #     save_minutes_data(force=True)  # 就算是非交易时期也要强制获取
    # myclient = pymongo.MongoClient("mongodb://localhost:27017/")  # 其实好像可以用localhost，正好本地云端分别用自己的数据库
    mydb = myclient["au"]
    mycol = mydb["minutes"]
    # df = pd.read_sql(date, engine_minutes, index_col="index")
    df = pd.DataFrame([one for one in mycol.find({"trade_day": date}, {"_id": 0})])
    df = df[["time", "future", "Au_TD", "diff", "ytm"]]
    df.set_index("time", inplace=True)
    night_price = df.sort_index()["17:00":]  # 夜盘数据
    day_price = df.sort_index()[:"17:00"]  # 日盘数据
    df = pd.concat([night_price, day_price], axis=0)  # 拼接

    # print(df)
    df.dropna(axis=0, inplace=True)  # 不能有空值，需要处理

    # df = df.iloc[-120:]  # 只要最近两个小时的
    df_dict = {
        key: list(map(lambda x: round(x, 2), value.to_list()))
        for key, value in df.iteritems()
    }
    df_dict["times"] = df.index.tolist()
    return jsonify(df_dict)


@app.route("/bond_deal", methods=["GET", "POST"])
def get_user_info():
    mydb = myclient["Bond"]
    mycol_ouput_date = mydb['chinamoney_deal_date']  # 存储日期的collection
    mycol_ouput = mydb['chinamoney_deal']  # 存储数据的collection
    df_find_res = pd.DataFrame(mycol_ouput_date.find({}, {'date': 1, '_id': 0}))
    print(df_find_res)
    date_list = df_find_res['date'].tolist()
    date_list.sort()

    def get_date_list(date):
        if date not in date_list:
            print("无对应日期数据")
            return pd.DataFrame(["无对应日期数据"])
        else:
            df = pd.DataFrame(
                [one for one in mycol_ouput.find({'date': date}, {"_id": 0})]
            )  # .drop('_id', axis=1)
            # df = pd.read_sql(date, engine)
            return df

    if request.method == "POST":
        # 好像用print会导致报错，惊了
        # print("POST")
        date = str(request.get_data()).split("=")[1][:-1]  # 传入日期
        # print(date)
        info = get_date_list(date)
    else:
        latest_day = date_list[-1]  # 最近的交易日
        date = latest_day
        info = get_date_list(date)

    return render_template(
        "bond_deal.html", deal_data=info.to_html(classes="deal", index=False), date=date
    )


from deal_process import deal_process_func


@app.route("/upload/files", methods=["GET"])
def upload_files():
    """
    获取当前已有的文件
    :return:
    """
    file_list = os.listdir('./data/BondDeal/uploads')
    file_list.sort(reverse=True)  # 逆序排序，确保第一个为最新的
    json_obj = {'files': [{i: v} for i, v in enumerate(file_list)]}
    return json_obj


@app.route("/upload/data", methods=["GET"])
def upload_data():
    """
    获取当日的信用债成交数据
    :return:
    """
    try:
        txt_name = (request.args['txt_name'])
        if txt_name == '':
            txt_name = '2020年06月24日周三.txt'
    except:
        txt_name = '2020年06月24日周三.txt'
    print(txt_name)
    if txt_name + '.json' in os.listdir('./data/BondDeal/processed'):
        with open('./data/BondDeal/processed/{}.json'.format(txt_name))as f:
            json_obj = json.load(f)
    elif txt_name in os.listdir('./data/BondDeal/uploads'):
        tot_df_dict = deal_process_func(txt_name)
        json_obj = json.loads('{}', encoding='utf-8')
        for k, df in tot_df_dict.items():
            # json_obj[k] = ({k: v.tolist() for k, v in df.iteritems()}) # one col for one time
            # json_obj[k] = (df.to_dict()) # simple version
            json_obj[k] = ([i for i in df.T.to_dict().values()])  # one row one time  # the size is twice of the orgin

        with open('./data/BondDeal/processed/{}.json'.format(txt_name), 'w')as f:  # 保存到文件中
            json.dump(json_obj, f)
    else:  # 无数据
        return 0

    # print(json_obj)
    return json_obj


@app.route("/upload", methods=["GET"])
def upload():
    return render_template(
        "upload_new.html",
    )


@app.route("/upload/upload", methods=["POST", "GET"])
def upload_upload():
    if request.method == "POST":
        f = request.files["file"]
        print(f)
        if f.filename == "":
            return "未选择文件"
        basepath = os.path.dirname(__file__)  # 当前文件所在路径,也是为了避免系统版本问题
        # secure_filename 只支持英文
        upload_path = os.path.join(
            basepath, "data{0}BondDeal{0}uploads".format(os.sep), (f.filename)  # 使用对应系统的分隔符os.sep
        )  # 注意：没有的文件夹一定要先创建，不然会提示没有该路径
        f.save(upload_path)
        return '上传成功'
    else:
        return '请使用post上传数据'


@app.route("/upload_old", methods=["POST", "GET"])
def upload_old():
    if request.method == "POST":
        f = request.files["file"]
        if f.filename == "":
            return render_template("upload.html", message="未选择文件")

        basepath = os.path.dirname(__file__)  # 当前文件所在路径,也是为了避免系统版本问题
        # secure_filename 只支持英文
        upload_path = os.path.join(
            basepath, "data{0}BondDeal{0}uploads".format(os.sep), (f.filename)  # 使用对应系统的分隔符os.sep
        )  # 注意：没有的文件夹一定要先创建，不然会提示没有该路径
        f.save(upload_path)
        # return redirect(url_for('upload'))
        if f.filename.split(".")[-1] == "txt":
            try:
                tot_df_dict = deal_process_func(f.filename)
                # show_data=tot_df.to_html(classes='deal_df')
                return render_template(
                    "upload.html",
                    message="整理完成",
                    now_date=f.filename.split(".")[0],
                    df_duanrong=tot_df_dict["短融"].to_html(
                        classes="deal", table_id="dr_data", index=False
                    ),
                    df_zhongpiao=tot_df_dict["中票"].to_html(
                        classes="deal", table_id="zp_data", index=False
                    ),
                    df_qiyezhai=tot_df_dict["企业债"].to_html(
                        classes="deal", table_id="qyz_data", index=False
                    ),
                    df_qita=tot_df_dict["其他"].to_html(
                        classes="deal", table_id="qt_data", index=False
                    ),
                )
            except:
                return render_template(
                    "upload.html", message="出错：()".format(traceback.format_exc())
                )

        else:
            return render_template("upload.html", message="出错，请上传txt文件")
        # print(show_data )
    else:  # 非post
        file_list = os.listdir("data/BondDeal/uploads/")
        file_list.sort()
        # 用来展示的file
        show_file = file_list[-1]  # 选择最新的日期的文件

        tot_df_dict = deal_process_func(show_file)
        return render_template(
            "upload.html",
            message="最新数据如下",
            now_date=show_file.split(".")[0],
            df_duanrong=tot_df_dict["短融"].to_html(
                classes="deal", table_id="dr_data", index=False
            ),
            df_zhongpiao=tot_df_dict["中票"].to_html(
                classes="deal", table_id="zp_data", index=False
            ),
            df_qiyezhai=tot_df_dict["企业债"].to_html(
                classes="deal", table_id="qyz_data", index=False
            ),
            df_qita=tot_df_dict["其他"].to_html(
                classes="deal", table_id="qt_data", index=False
            ),
        )
        # return render_template('upload.html', message='选择文件上传')


@app.route("/irs")
def irs():
    return render_template(
        "irs.html",
    )


@app.route("/irs_data")
def irs_data():
    # myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["Bond"]
    mycol = mydb["irs"]

    irs_df = pd.DataFrame([one for one in mycol.find({}, {"_id": 0})])
    # irs_df.set_index('Time', inplace=True)
    irs_df = irs_df.fillna(0).sort_values("Time")
    data_dict = {k: v.tolist() for k, v in irs_df.iteritems()}
    df = jsonify(data_dict)
    return df


@app.route("/chain_price")
def chain_price():
    return render_template("chain_price.html")


def get_sql_data(product_type, product_name):
    # file_path = "../my_scheduled_app/"
    # file_name = "锂产业链价格.db"
    # myclient = pymongo.MongoClient("mongodb://localhost:27017/")  # 其实好像可以用localhost，正好本地云端分别用自己的数据库
    mydb = myclient["chain_price"]

    # conn = sqlite3.connect(file_path + file_name)
    # cursor = conn.cursor()
    # # 要加``才能够处理表名中有横杠-的情况
    # words = "select * from `{}` where 名称='{}'".format(product_type, product_name)
    # cursor.execute(words)

    mycol = mydb[product_type]

    df = pd.DataFrame(
        [one for one in mycol.find({"名称": product_name}, {"_id": 0})]
    )  # .drop('_id',axis=1)
    # print(df)
    df.columns = ["名称", "获取日期", "产品", "价格范围", "均价", "涨跌", "单位", "实际日期"]
    # need_df = df.iloc[:, 1:].set_index("获取日期").sort_index()
    # df.columns = [0, "名称", "获取日期", "产品", "价格范围", "均价", "涨跌", "单位", "实际日期"]
    df = df[df['价格范围'] != '未登录']
    need_df = df.set_index("获取日期").sort_index()
    need_df.index.name = None
    # cursor.close()
    # conn.close()
    return need_df


@app.route("/fetch_chain_data", methods=["POST", "GET"])
def fetch_chain_data():
    if request.method == "POST":
        post_data = json.loads(request.get_data())
        if post_data["type"] == "0":
            return False

        df = get_sql_data(post_data["type"], post_data["name"])
        return df.to_html(
            classes="deal table table-hover table-striped table-condensed",
            table_id="hist_table",
        )
    else:
        return "请使用post方法"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)

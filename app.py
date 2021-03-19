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

sys.path.insert(0, '../my_scheduled_app/')  # 加入path，以便引用那边的函数
# 循环引用，解决方法，推迟一方的导入，让例外一方完成
app = Flask(__name__)


@app.route("/")
def index():
    return render_template("main.html")


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


# au_hist_path = "../my_scheduled_app/Au/0_close_hist.csv"
@app.route("/au_data", methods=["GET", "POST"])
def au_info():
    # df = pd.read_csv(au_hist_path, encoding="gbk")

    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["au"]
    mycol = mydb['day']
    df = pd.DataFrame([one for one in mycol.find({}, {'_id': 0})])
    df = df[['date', 'qihuo', 'xianhuo', 'diff', 'ytm', 'symbol']]
    df.columns = [['日期', '期货', '现货', '价差', '收益率', '合约']]
    # df["收益率"] = df["收益率"].apply(lambda x: round(x, 2))
    return render_template(
        "au.html",
        trade_day=get_today_str()['trade_day'],
        au_price=df.to_html(classes="table table-hover table-striped", table_id="hist_table", index=False),
    )


# 这里因为前面修改了path，所以真的在引用schedule文件夹里的函数
from au_data_crawler import get_today_str


# contract_db_path = "../my_scheduled_app/Au/黄金合约信息.db"
# engine_contract = create_engine(r"sqlite:///" + contract_db_path)


@app.route("/au_contract_list")
def au_contract_list():
    date = get_today_str()["trade_day"]
    # try:
    #     df = pd.read_sql(date, engine_contract, index_col="symbol")["delivery_day"]
    # except:  # 如果没有找到对应的成交数据，重新获取一次
    #     from au_data_crawler import save_contract
    #
    #     save_contract(init=True)
    #     df = pd.read_sql(date, engine_contract, index_col="symbol")["delivery_day"]
    try:
        myclient = pymongo.MongoClient("mongodb://localhost:27017/")  # 其实好像可以用localhost，正好本地云端分别用自己的数据库
        mydb = myclient["au"]
        mycol = mydb['contract']
        df = pd.DataFrame([one for one in mycol.find({'date': date}, {'_id': 0})])  # .set_index('symbol')
        df.set_index('symbol', inplace=True)
        df = df['delivery_day']
    except:
        traceback.print_exc()
        df = pd.DataFrame()
    # contract_list_dict = {i: x for i, x in enumerate(qh_symbol_list)}
    contract_list_dict = pd.DataFrame(df).to_json()
    return jsonify(contract_list_dict)


# minutes_db_path = "../my_scheduled_app/Au/黄金分钟信息.db"
# engine_minutes = create_engine(r"sqlite:///" + minutes_db_path)


@app.route("/au_real_time", methods=["GET", "POST"])
def au_real_time():
    date = get_today_str()["trade_day"]
    # if date not in GetTables(minutes_db_path):
    #     from au_data_crawler import save_minutes_data
    #
    #     save_minutes_data(force=True)  # 就算是非交易时期也要强制获取
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")  # 其实好像可以用localhost，正好本地云端分别用自己的数据库
    mydb = myclient["au"]
    mycol = mydb['minutes']
    # df = pd.read_sql(date, engine_minutes, index_col="index")
    df = pd.DataFrame([one for one in mycol.find({'trade_day': date}, {'_id': 0})])
    df = df[['time', 'future', 'Au_TD', 'diff', 'ytm']]
    df.set_index('time', inplace=True)
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


# def GetTables(db_file="main.db"):
#     """
#     获取数据库的现有表名称
#     :param db_file: 数据库名称
#     :return:
#     """
#     try:
#         conn = sqlite3.connect(db_file)
#         cur = conn.cursor()
#         cur.execute("select name from sqlite_master where type='table' order by name")
#         table_list = [x[0] for x in cur.fetchall()]
#         return table_list
#     except Exception as e:
#         print(e)
#         return []


@app.route("/bond_deal", methods=["GET", "POST"])
def get_user_info():
    # file_path = "../my_scheduled_app/"
    # file_name = "债券成交.db"

    import pymongo
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")  # 其实好像可以用localhost，正好本地云端分别用自己的数据库
    mydb = myclient["bond_deal"]
    # pd.DataFrame([one for one in mycol.find({},{'_id':0})])#.drop('_id', axis=1)
    # table_list = GetTables(file_path + file_name)
    table_list = mydb.list_collection_names()
    table_list.sort()
    # table_list = GetTables(file_path + file_name)
    latest_day = table_list[-1]

    def get_date_list(date=latest_day):

        # engine = create_engine(r"sqlite:///" + file_path + file_name)
        if date not in table_list:
            print("无对应日期数据")
            return pd.DataFrame(["无对应日期数据"])
        else:
            mycol = mydb[date]
            df = pd.DataFrame([one for one in mycol.find({}, {'_id': 0})])  # .drop('_id', axis=1)
            # df = pd.read_sql(date, engine)
            return df

    if request.method == "POST":
        # 好像用print会导致报错，惊了
        # print("POST")
        date = str(request.get_data()).split("=")[1][:-1]
        # print(date)
        info = get_date_list(date)
    else:
        date = latest_day
        # print(date)
        info = get_date_list(date)

    return render_template(
        "bond_deal.html", deal_data=info.to_html(classes="deal", index=False), date=date
    )


from deal_process import deal_process_func


@app.route("/upload", methods=["POST", "GET"])
def upload():
    if request.method == "POST":
        f = request.files["file"]
        if f.filename == "":
            return render_template("upload.html", message="未选择文件")

        basepath = os.path.dirname(__file__)  # 当前文件所在路径,也是为了避免系统版本问题
        # secure_filename 只支持英文
        upload_path = os.path.join(
            basepath, "data{0}BondDeal{0}uploads".format(os.sep), (f.filename)
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
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")
    mydb = myclient["irs"]
    mycol = mydb['irs']

    irs_df = pd.DataFrame([one for one in mycol.find({}, {'_id': 0})])
    irs_df.set_index('Time', inplace=True)
    irs_df = irs_df.fillna(0).sort_index()
    data_dict = {
        k: v.tolist() for k, v in irs_df.iteritems()
    }
    df = jsonify(data_dict)
    return df


@app.route("/chain_price")
def chain_price():
    return render_template("chain_price.html")


def get_sql_data(product_type, product_name):
    # file_path = "../my_scheduled_app/"
    # file_name = "锂产业链价格.db"
    import pymongo
    myclient = pymongo.MongoClient("mongodb://localhost:27017/")  # 其实好像可以用localhost，正好本地云端分别用自己的数据库
    mydb = myclient["chain_price"]

    # conn = sqlite3.connect(file_path + file_name)
    # cursor = conn.cursor()
    # # 要加``才能够处理表名中有横杠-的情况
    # words = "select * from `{}` where 名称='{}'".format(product_type, product_name)
    # cursor.execute(words)

    mycol = mydb[product_type]

    df = pd.DataFrame([one for one in mycol.find({'名称': product_name}, {'_id': 0})])  # .drop('_id',axis=1)
    # print(df)
    df.columns = ["名称", "获取日期", "产品", "价格范围", "均价", "涨跌", "单位", "实际日期"]
    # need_df = df.iloc[:, 1:].set_index("获取日期").sort_index()
    # df.columns = [0, "名称", "获取日期", "产品", "价格范围", "均价", "涨跌", "单位", "实际日期"]
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
        return df.to_html(classes="deal", table_id="hist_table")
    else:
        return "请使用post方法"


if __name__ == "__main__":
    # if platform.system() == 'Windows':  # windows 为开发环境
    #     app.config['DEBUG'] = True
    #     app.config['SEND_FILE_MAX_AGE_DEFAULT'] = datetime.timedelta(seconds=1)
    #     app.run()
    # else:
    #     # print(app.url_map)
    #     app.run(host='0.0.0.0', port=8000)
    # from os import popen
    # pc_name = popen("hostname").read().strip()
    # if pc_name == "Momi":
    #     app.config["DEBUG"] = True
    #     app.config["SEND_FILE_MAX_AGE_DEFAULT"] = datetime.timedelta(seconds=1)
    #     app.run()
    # else:
    # print(app.url_map)
    app.run(host="0.0.0.0", port=8000)

# coding:utf-8
import datetime
# import decimal
import json
import os
import threading
import traceback

# import flask.json
import pandas as pd
from flask import Flask, render_template
from flask import jsonify
from flask import request


# class MyJSONEncoder(flask.json.JSONEncoder):
#     def default(self, obj):
#         if isinstance(obj, decimal.Decimal):
#             # Convert decimal instances to strings.
#             return str(obj)
#         return super(MyJSONEncoder, self).default(obj)


# 循环引用，解决方法，推迟一方的导入，让例外一方完成
app = Flask(__name__)
# app.json_encoder = MyJSONEncoder

@app.route('/')
def index():
    return render_template('main.html')


@app.route('/moment')
def moment_main_page():
    return render_template("momentum.html")


def py_fetch_lookback_data(lf=1,sf=1,lm=30,sm=5):
    from STG_Return import StgReturn
    df=StgReturn(file_name='./data/CSI.csv',l_fac=lf,s_fac=sf,lma =lm,sma =sm).main_loop()
    res=[df.index.tolist(),df.iloc[:,0].tolist(),df.iloc[:,1].tolist()]
    return res


@app.route('/lookback',methods=['GET','POST'])
def fetch_lookback_data():
    lf,sf,lm,sm=0,0,0,0
    if request.method=='POST':
        data=request.get_data()
        json_obj=json.loads(data)
        print(json_obj)
        lm=json_obj['lm']
        sm=json_obj['sm']
        lf=json_obj['lf']
        sf=json_obj['sf']
    else:
        print('not request')
    data = py_fetch_lookback_data(float(lf),float(sf),int(lm),int(sm))
    [day,stg_r, idx_r] = data
    return jsonify({'day': day, 'stg_r': stg_r, 'idx_r': idx_r})


@app.route('/au_data', methods=['GET', 'POST'])
def au_info():
    df = pd.read_csv('./data/Au/0_close_hist.csv', encoding='gbk')
    df['收益率'] = df['收益率'].apply(lambda x: round(x, 2))
    return render_template('au_data.html',
                           au_price=df.to_html(classes="deal", table_id='hist_table', index=False))


# today = datetime.datetime.now()
# one_day = datetime.timedelta(days=1)
# if today.hour >= 20:
#     today_str = str(today + one_day)[:10]
# else:
#     today_str = str(today)[:10]
from au_data_crawler import get_today_str


@app.route('/au_contract_list')
def au_contract_list():
    day_dict = get_today_str()
    contract_list_path = './data/Au/contract_info/'
    # qh_symbol_list = pd.read_csv(contract_list_path + '{}.csv'.format(day_dict['trade_day']),
    #                              encoding='gbk', index_col=0).index.tolist()
    # print(qh_symbol_list)

    df = pd.read_csv(contract_list_path + '{}.csv'.format(day_dict['trade_day']),
                     encoding='gbk', index_col=0)['delivery_day']
    # contract_list_dict = {i: x for i, x in enumerate(qh_symbol_list)}
    contract_list_dict = pd.DataFrame(df).to_json()
    return jsonify(contract_list_dict)


@app.route('/au_real_time', methods=['GET', 'POST'])
def au_real_time():
    minutes_path = './data/Au/minutes/'
    day_dict = get_today_str()
    df = pd.read_csv(minutes_path + '{}.csv'.format(day_dict['trade_day']),
                     encoding='gbk', index_col=0)
    df.dropna(axis=0, inplace=True)  # 不能有空值，需要处理
    # df = df.iloc[-120:]  # 只要最近两个小时的
    df_dict = {key: list(map(lambda x: round(x, 2), value.to_list())) for key, value in df.iteritems()}
    df_dict['times'] = df.index.tolist()
    return jsonify(df_dict)


@app.route('/bond_deal',methods=['GET','POST'])
def get_user_info():

    def get_date_list(date='2020-12-25'):
        import os
        path=(r'D:\PycharmProjects\Fixed_income_internship\19_定时启动\csv\\')
        file_list=os.listdir(path)
        file_name=u'债券成交{}.csv'.format(date)
        print(file_name)
        if file_name not in file_list:
            print('无对应日期数据')
            return pd.DataFrame(['无对应日期数据'])
        else:
            df=pd.read_csv(path+file_name,encoding='gbk')
            return df

    if request.method=='POST':
        print('POST')
        date=str(request.get_data()).split('=')[1][:-1]
        print(date)
        info=get_date_list(date)
    else:
        date = '未输入日期'
        info = pd.DataFrame()
        print('not a post')

    return render_template(
        "bond_deal.html",
        deal_data=info.to_html(classes="deal", index=False),
        date=date
    )


#
# from au_data import high_freq
#
# @app.route('/au_high_freq', methods=['GET', 'POST'])
# def fetch_high_freq():
#     if request.method == 'POST':
#         contract_name = (dict(eval(request.get_data().decode('utf-8')))['name'])
#         if len(contract_name) < 3:
#             return jsonify({0: 0})
#         return jsonify(high_freq(contract=contract_name))
#     else:
#         # print('not a post')
#         return jsonify({0: 0})


from deal_process import deal_process_func


@app.route('/upload', methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        if (f.filename == ''):
            return render_template('upload.html', message='未选择文件')

        basepath = os.path.dirname(__file__)  # 当前文件所在路径,也是为了避免系统版本问题
        # secure_filename 只支持英文
        upload_path = os.path.join(basepath, 'data{0}BondDeal{0}uploads'.format(os.sep),
                                   (f.filename))  # 注意：没有的文件夹一定要先创建，不然会提示没有该路径
        f.save(upload_path)
        # return redirect(url_for('upload'))
        if f.filename.split('.')[-1] == 'txt':
            try:
                tot_df_dict = deal_process_func(f.filename)
                # show_data=tot_df.to_html(classes='deal_df')
                return render_template('upload.html', message='整理完成',
                                       now_date=f.filename.split('.')[0],
                                       df_duanrong=tot_df_dict['短融'].to_html(
                                           classes="deal", table_id='dr_data', index=False),
                                       df_zhongpiao=tot_df_dict['中票'].to_html(
                                           classes="deal", table_id='zp_data', index=False),
                                       df_qiyezhai=tot_df_dict['企业债'].to_html(
                                           classes="deal", table_id='qyz_data', index=False),
                                       df_qita=tot_df_dict['其他'].to_html(
                                           classes="deal", table_id='qt_data', index=False),
                                       )
            except:
                return render_template('upload.html', message='出错：()'.format(traceback.format_exc()))

        else:
            return render_template('upload.html', message='出错，请上传txt文件')
        # print(show_data )
    else:  # 非post
        file_list = os.listdir('data/BondDeal/uploads/')
        file_list.sort()
        # 用来展示的file
        show_file = file_list[-1]  # 选择最新的日期的文件

        tot_df_dict = deal_process_func(show_file)
        return render_template('upload.html', message='最新数据如下',
                               now_date=show_file.split('.')[0],
                               df_duanrong=tot_df_dict['短融'].to_html(
                                   classes="deal", table_id='dr_data', index=False),
                               df_zhongpiao=tot_df_dict['中票'].to_html(
                                   classes="deal", table_id='zp_data', index=False),
                               df_qiyezhai=tot_df_dict['企业债'].to_html(
                                   classes="deal", table_id='qyz_data', index=False),
                               df_qita=tot_df_dict['其他'].to_html(
                                   classes="deal", table_id='qt_data', index=False),
                               )
        # return render_template('upload.html', message='选择文件上传')

@app.route('/irs')
def irs():
    return render_template('irs.html',)

@app.route('/irs_data')
def irs_data():
    data_dict={k:v.tolist() for k,v in pd.read_csv('./data/IRS/各基准利率数据.csv').iteritems()}
    df = jsonify(data_dict)
    return df

if __name__ == '__main__':
    from au_data_crawler import crawler_loop
    t = threading.Thread(target=crawler_loop)
    t.start()
    print('黄金数据爬虫已开始运行')

    # if platform.system() == 'Windows':  # windows 为开发环境
    #     app.config['DEBUG'] = True
    #     app.config['SEND_FILE_MAX_AGE_DEFAULT'] = datetime.timedelta(seconds=1)
    #     app.run()
    # else:
    #     # print(app.url_map)
    #     app.run(host='0.0.0.0', port=8000)
    from os import popen
    pc_name=popen('hostname').read().strip()

    if(pc_name=='Momi'):
        app.config['DEBUG'] = True
        app.config['SEND_FILE_MAX_AGE_DEFAULT'] = datetime.timedelta(seconds=1)
        app.run()
    else:
        # print(app.url_map)
        app.run(host='0.0.0.0', port=8000)


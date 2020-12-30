from flask import Flask, render_template
from flask import request
from flask import jsonify
import datetime
import flask.json
import json,decimal
import pandas as pd
from datetime import timedelta
import time

class MyJSONEncoder(flask.json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, decimal.Decimal):
            # Convert decimal instances to strings.
            return str(obj)
        return super(MyJSONEncoder, self).default(obj)

#循环引用，解决方法，推迟一方的导入，让例外一方完成
app = Flask(__name__)
app.json_encoder = MyJSONEncoder

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

@app.route('/au_data',methods=['GET','POST'])
def au_info():
    df=pd.read_csv('./data/Au/0_close_hist.csv',encoding='gbk')
    df['收益率']=df['收益率'].apply(lambda x:round(x,2))
    return render_template('au_data.html',
                           au_price=df.to_html(classes="deal",table_id='hist_table',index=False))

from au_data import contract_list
@app.route('/au_contract_list')
def au_contract_list():
    return contract_list()



from au_data import get_both

@app.route('/au_real_time',methods=['GET','POST'])
def au_real_time():
    df=get_both()
    df.dropna(axis=0,inplace=True) # 不能有空值，需要处理

    df_dict={key: list(map(lambda x:round(x,2) ,value.to_list())) for key, value in df.iteritems()}
    df_dict['times']=df.index.tolist()
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
        date='未输入日期'
        info=pd.DataFrame()
        print('not a post')

    return render_template(
        "bond_deal.html",
        deal_data=info.to_html(classes="deal", index=False),
        date=date
    )


from au_data import high_freq

@app.route('/au_high_freq')
def fetch_high_freq():
    while high_freq()==0:
        print('数据获取失败')
        time.sleep(1)
    # print(high_freq())
    return jsonify(high_freq())



app.config['DEBUG']=True
app.config['SEND_FILE_MAX_AGE_DEFAULT']=timedelta(seconds=1)

# TODO 在黄金页面加入高频实时买卖盘信息
# TODO 识别并切换主力合约
# TODO 加入多期货合约序列支持
if __name__ == '__main__':
    print(app.url_map)
    # app.run(host='0.0.0.0', port = 8000)
    app.run()
import pandas as pd
import numpy as np
import datetime,os

import requests,json,time
# 现货实时行情

def au_real_time():
    url='https://www.sge.com.cn/graph/quotations'

    form_data={'instid':'Au(T+D)'}

    res=requests.post(url,data=form_data)
    import json
    au_td=pd.DataFrame(json.loads(res.text))[['times','data']].set_index('times')

    au_td=au_td.astype(float)
    au_td.replace(au_td.iloc[-1],np.nan,inplace=True)
    au_td.dropna(inplace=True)
    return au_td

def one_future_real_time(symbol='AU2106'):
    # 改为t5可获取5日的
    url='https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20t1nf_AU2106=/InnerFuturesNewService.getMinLine?symbol={}'.format(symbol)
    res=requests.get(url)
    df=pd.DataFrame (eval(res.text[res.text.index('('):][1:-2]),columns=['times','price','avg_price','deal_amount','open_interest','info','info']).set_index('times').iloc[:,:-2]
    df.price=df.price.astype('float')

    return pd.DataFrame(df.price)

def update_hist(au_and_future):
    close_data=au_and_future.loc['15:00'].tolist()
    date=str(datetime.datetime.now())[:10]
    with open('./data/Au/0_close_hist.csv','a') as f:
        f.write(','.join([date]+[str(x) for x in close_data])+'\n')
        f.close()
def get_both():
    future_oneday_real_time = one_future_real_time()
    au_oneday_real_time = au_real_time()
    au_oneday_real_time = au_oneday_real_time[~au_oneday_real_time.index.duplicated(keep='first')]  # 因为可能有重复值，去重
    au_and_future = pd.concat([future_oneday_real_time, au_oneday_real_time], axis=1)
    au_and_future.columns = ['future', 'Au_TD']
    # 排序
    night_price = au_and_future.sort_index()['17:00':]
    day_price = au_and_future.sort_index()[:'17:00']
    au_and_future = pd.concat([night_price, day_price], axis=0)
    # 计算数据
    au_and_future['diff'] = au_and_future['future'] - au_and_future['Au_TD']
    delivery_day = datetime.datetime.strptime('2021-6-16', '%Y-%m-%d') #到期日
    today = datetime.datetime.today()
    day_to_delivery = (delivery_day - today).days + 1  # 补上半天的差
    au_and_future['ytm'] = au_and_future['diff'] * 365 / ((day_to_delivery) * au_and_future['Au_TD']) * 100
    if str(datetime.datetime.now().time())>'15:32':
        day_str=str(datetime.datetime.now())[:10]+'.csv'
        if day_str  not in os.listdir('./data/Au/'):
            au_and_future.to_csv('./data/Au/{}'.format(day_str))
            update_hist(au_and_future)
    return au_and_future

def get_hist():
    for file in os.listdir('./data/Au/'):
        print(file)


def future_real_time(contract_list='nf_AU0,nf_AU2101,nf_AU2102,nf_AU2103,nf_AU2104,nf_AU2106,nf_AU2108,nf_AU2110,nf_AU2112'.split(',')):
    url = f"https://hq.sinajs.cn/rn={round(time.time()*1000)}&list={','.join(contract_list)}"
    res = requests.get(url)
    data_df = pd.DataFrame([item.strip().split("=")[1].split(
        ",") for item in res.text.split(";") if item.strip() != ""]) # 获取等号后的值
    data_df.iloc[:, 0] = data_df.iloc[:, 0].str.replace('"', "") # 第一列处理
    data_df.iloc[:, -1] = data_df.iloc[:, -1].str.replace('"', "")
    data_df.replace('',np.nan,inplace=True)
    data_df.dropna(axis=1,inplace=True)
    data_df.columns=[['name','info','open','high','low','settle','buy','sale','current_price',
                      'info2','pre_settle','buy_amount','sale_amount','open_interest','deal_amount',
                      ]+['info']*5]
    return data_df[['name','buy','sale','current_price',
                      'buy_amount','sale_amount','open_interest','deal_amount',
                      ]]


from selenium import webdriver
from selenium.webdriver.chrome.options import Options
chrome_options = Options()
chrome_options.add_argument('--headless')
driver = webdriver.Chrome(chrome_options = chrome_options)
# driver=webdriver.Chrome()

east_url='http://quote.eastmoney.com/globalfuture/AUTD.html'
driver.get(east_url)
from bs4 import BeautifulSoup
import re

def high_freq():
    try:
        # 有个严重问题。。webdriver不知道怎么关
        text = driver.page_source
        soup=BeautifulSoup(text,'html5lib')
        buy_sale_price=soup.find_all('table',class_='maimai')[0].text # 买卖信息
        buy_sale_price=re.split('[\n ]+',buy_sale_price.strip())
        current_price=soup.find_all('i',class_='zxj')[0].text # 买卖信息

        future_info=future_real_time(contract_list='nf_AU2106'.split(',')).iloc[0].tolist()
        price_dict = {'xh_sale_p': buy_sale_price[1], 'xh_buy_p': buy_sale_price[4], 'xh_now_p': current_price,
                      'qh_sale_p': future_info[2], 'qh_buy_p': future_info[1], 'qh_now_p': future_info[3]}

        def get_ytm(buy, sale, now, date='2021-6-16'):
            delivery_day = datetime.datetime.strptime(date, '%Y-%m-%d')  # 到期日
            today = datetime.datetime.today()
            day_to_delivery = (delivery_day - today).days + 1  # 补上半天的差

            ytm = (buy - sale) * 365 / ((day_to_delivery) * now) * 100
            return ytm
        for i, k in price_dict.items():
            price_dict[i] = float(k)
        price_dict['zhengtao'] = get_ytm(price_dict['qh_buy_p'], price_dict['xh_sale_p'], price_dict['xh_now_p'])
        price_dict['fantao'] = get_ytm(price_dict['qh_sale_p'], price_dict['xh_buy_p'], price_dict['xh_now_p'])
        price_dict['puretao'] = get_ytm(price_dict['qh_now_p'], price_dict['xh_now_p'], price_dict['xh_now_p'])

        price_dict['zhengtao_bp'] = price_dict['qh_buy_p'] - price_dict['xh_sale_p']
        price_dict['fantao_bp'] = price_dict['qh_sale_p'] - price_dict['xh_buy_p']
        price_dict['puretao_bp'] = price_dict['qh_now_p'] - price_dict['xh_now_p']
        for i, k in price_dict.items():
            price_dict[i] = round(float(k), 2)
        return price_dict
    except:
        import traceback
        traceback.print_exc()
        print('出错！！driver已经关闭，需要重新启动')
        driver.quit()
if __name__ == '__main__':
    print(get_both())

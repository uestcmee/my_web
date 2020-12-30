import datetime
import os

import numpy as np
import pandas as pd
import requests
import time,re


# 现货实时行情

def au_real_time():
    url = 'https://www.sge.com.cn/graph/quotations'

    form_data = {'instid': 'Au(T+D)'}

    res = requests.post(url, data=form_data)
    import json
    au_td = pd.DataFrame(json.loads(res.text))[['times', 'data']].set_index('times')

    au_td = au_td.astype(float)
    au_td.replace(au_td.iloc[-1], np.nan, inplace=True)
    au_td.dropna(inplace=True)
    return au_td


def one_future_real_time(symbol='AU2106'):
    # 改为t5可获取5日的
    url = 'https://stock2.finance.sina.com.cn/futures/api/jsonp.php/' \
          'var%20t1nf_AU2106=/InnerFuturesNewService.getMinLine?symbol={}'.format(symbol)
    res = requests.get(url)
    df = pd.DataFrame(eval(res.text[res.text.index('('):][1:-2]), columns=[
        'times', 'price', 'avg_price', 'deal_amount', 'open_interest', 'info', 'info'
    ]).set_index('times').iloc[:, :-2]
    df.price = df.price.astype('float')
    return pd.DataFrame(df.price)


def update_hist(au_and_future):
    close_data = au_and_future.loc['15:00'].tolist()
    date = str(datetime.datetime.now())[:10]
    with open('./data/Au/0_close_hist.csv', 'a') as f:
        f.write(','.join([date] + [str(x) for x in close_data]) + '\n')
        f.close()


def get_both():
    future_oneday_real_time = one_future_real_time(symbol='AU2106')
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
    delivery_day = datetime.datetime.strptime('2021-6-16', '%Y-%m-%d')  # 到期日
    today = datetime.datetime.today()
    day_to_delivery = (delivery_day - today).days + 1  # 补上半天的差
    au_and_future['ytm'] = au_and_future['diff'] * 365 / ((day_to_delivery) * au_and_future['Au_TD']) * 100
    if str(datetime.datetime.now().time()) > '15:32':
        day_str = str(datetime.datetime.now())[:10] + '.csv'
        if day_str not in os.listdir('./data/Au/'):
            au_and_future.to_csv('./data/Au/{}'.format(day_str))
            update_hist(au_and_future)
    return au_and_future


def get_hist():
    for file in os.listdir('./data/Au/'):
        print(file)


def future_real_time(contract_list=('nf_AU0','nf_AU2110')):
    url = f"https://hq.sinajs.cn/rn={round(time.time() * 1000)}&list={','.join(contract_list)}"
    res = requests.get(url)
    data_df = pd.DataFrame([item.strip().split("=")[1].split(
        ",") for item in res.text.split(";") if item.strip() != ""])  # 获取等号后的值
    data_df.iloc[:, 0] = data_df.iloc[:, 0].str.replace('"', "")  # 第一列处理
    data_df.iloc[:, -1] = data_df.iloc[:, -1].str.replace('"', "")
    data_df.replace('', np.nan, inplace=True)
    data_df.dropna(axis=1, inplace=True)
    data_df.columns = [['name', 'info', 'open', 'high', 'low', 'settle', 'buy', 'sale', 'current_price',
                        'info2', 'pre_settle', 'buy_amount', 'sale_amount', 'open_interest', 'deal_amount',
                        ] + ['info'] * (len(data_df.columns)-15)]
    # print(data_df)
    return data_df[['name', 'buy', 'sale', 'current_price',
                    'buy_amount', 'sale_amount', 'open_interest', 'deal_amount',
                    ]]

qh_symbol_list=[]

# def contract_list(): # 可以直接获取全合约，不用指定合约代码
#     global qh_symbol_list
#     url = 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/Market_Center.getHQFuturesData?page=1&num=40&sort=symbol&asc=1&node=hj_qh&_s_r_a=init'
#     res = requests.get(url)
#     info_list = []
#     for one in re.findall('{.*?}', res.text):
#         one_list = (dict(eval(one))).values()
#         info_list.append(one_list)
#     df = pd.DataFrame(info_list, columns=list(dict(eval(one)).keys()))
#     df=df.iloc[1:]
#     qh_symbol_list = df.symbol.tolist()
#     return dict(df.symbol)

def contract_list(): # 可以直接获取全合约，不用指定合约代码
    from bs4 import BeautifulSoup
    au_jys_text = requests.get('http://www.shfe.com.cn/products/au/').text
    soup = BeautifulSoup(au_jys_text, 'html5lib')
    au_hy_list = soup.find_all('table', class_='listshuju')[0].find_all('tr')
    info_list = []
    for one in au_hy_list:
        info_list.append(re.split('[\n\t ]+', one.text.strip()))
    delivery_info = pd.DataFrame(info_list,
                                 columns=['symbol', 'listed', 'due', 'delivery_start', 'delivery', 'price'])
    delivery_info['symbol'] = delivery_info['symbol'].apply(lambda x: x.upper())
    delivery_info.sort_values('symbol', inplace=True)
    global qh_symbol_list
    qh_symbol_list=delivery_info[['symbol','delivery']]
    return dict(qh_symbol_list.symbol)

contract_list()

# high_freq_data = (pd.DataFrame(),{})


high_freq_data=0,0

def high_freq_parent():
    """
    获取高频数据
    改变global 参数所需的参数的字典
    """
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from bs4 import BeautifulSoup
    import re
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    driver = webdriver.Chrome(chrome_options=chrome_options)

    east_url = 'http://quote.eastmoney.com/globalfuture/AUTD.html'
    try:
        driver.get(east_url)
        def get_ytm(jiacha, xh_now, date):
            delivery_day = date.apply(lambda date: datetime.datetime.strptime(str(int(date)), '%Y%m%d'))  # 到期日
            today = datetime.datetime.today()
            day_to_delivery = (delivery_day.apply(lambda x: (x - today).days + 1))  # 补上半天的差
            ytm = jiacha * 365 / ((day_to_delivery) * float(xh_now)) * 100
            return round(ytm, 2)

        global qh_symbol_list,high_freq_data  # 全局参数

        while True:
            text = driver.page_source
            soup = BeautifulSoup(text, 'html5lib')
            buy_sale_price = soup.find_all('table', class_='maimai')[0].text  # 买卖信息
            buy_sale_price = re.split('[\n ]+', buy_sale_price.strip())
            current_price = soup.find_all('i', class_='zxj')[0].text  # 买卖信息

            # 获取期货数据
            df_s = future_real_time(contract_list=qh_symbol_list.symbol.tolist())#.iloc[0].tolist()
            xh_now = current_price
            xh_buy = buy_sale_price[4]
            xh_sale = buy_sale_price[1]
            # return data_df[['name', 'buy', 'sale', 'current_price',
            #                 'buy_amount', 'sale_amount', 'open_interest', 'deal_amount',
            #                 ]]
            df_s['symbol']=qh_symbol_list.symbol.tolist()
            df_s['delivery']=qh_symbol_list.delivery.tolist()
            # df_s.to_excel('output.xlsx')
            # df_s=pd.DataFrame(df_s,columns=['name','buy','sale','current_price',
            #                                 'buy_amount','sale_amount','open_interest',
            #                                 'deal_amount','symbol','delivery'])

            df_s.columns=['name','buy','sale','current_price',
                                            'buy_amount','sale_amount','open_interest',
                                            'deal_amount','symbol','delivery']
            for one in df_s.columns.tolist()[1:-2]:
                try:
                    df_s[one] = df_s[one].astype(float)
                except:
                    pass
            df_s['jiacha0'] = df_s.current_price - float(xh_now)
            df_s['jiacha_fan'] = df_s.sale - float(xh_buy)
            df_s['jiacha_zheng'] = df_s.buy - float(xh_sale)
            df_s['puretao'] = get_ytm(jiacha=df_s['jiacha0'], xh_now=xh_now, date=df_s['delivery'])
            df_s['fantao'] = get_ytm(jiacha=df_s['jiacha_fan'], xh_now=xh_now, date=df_s['delivery'])
            df_s['zhengtao'] = get_ytm(jiacha=df_s['jiacha_zheng'], xh_now=xh_now, date=df_s['delivery'])
            price_dict = {'xh_sale_p': buy_sale_price[1], 'xh_buy_p': buy_sale_price[4], 'xh_now_p': current_price }
            # for i,col in enumerate(df_s.dtypes.tolist()):
            #     if col==float:
            #         df_s.iloc[:i]=df_s.iloc[:i].apply(lambda x:round(x,2))
            df_s=df_s.round(2)
            high_freq_data = df_s,price_dict
            time.sleep(1)  # 每秒获取一次
    finally:
        import traceback
        traceback.print_exc()
        print('退出driver')
        driver.quit()
        import sys
        sys.exit()


import threading

t = threading.Thread(target=high_freq_parent)
t.start()

print('已开始运行')

def high_freq(contract='AU2106'):
    global high_freq_data
    if isinstance(high_freq_data[0],int):
        return 0

    price_dict=high_freq_data[1]
    df_s=pd.DataFrame(high_freq_data[0])
    # df_s.set_index('symbol',inplace=True)
    # print(df_s[df_s['symbol']==contract])
    future_info=dict(df_s[df_s['symbol']==contract].iloc[0])
    xh_dict={'qh_sale_p': future_info['sale'], 'qh_buy_p': future_info['buy'],
             'qh_now_p': future_info['current_price'],
             'zhengtao': future_info['zhengtao'],
             'fantao': future_info['fantao'],
             'puretao': future_info['puretao'],
             'puretao_bp':future_info['jiacha0'] ,
             'fantao_bp':future_info['jiacha_fan'],
             'zhengtao_bp':future_info['jiacha_zheng']}
    price_dict.update(xh_dict)
    return price_dict



if __name__ == '__main__':
    pass

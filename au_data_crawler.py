# coding:utf-8
import datetime
import json
import os
import re
import time

import numpy as np
import pandas as pd
import requests

# 现货实时行情
qh_symbol_list = []


class my_requests:
    def get(url):
        i = 0
        headers = {
            'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66'
        }
        while i < 20:
            try:
                return requests.get(url, headers=headers)
            except:
                time.sleep(1)
                i += 1


def is_trade_time():
    now = datetime.datetime.now()
    t = str(now)[11:19]

    # print(t)
    def qh_trade_time():
        if t >= '20:59:55' or t <= '02:30:05' or (t >= '09:29:55' and t <= '11:30:05') or (
                t > '13:29:55' and t < '15:32:00'):
            return True
        else:
            return False

    def xh_trade_time():
        if t >= '19:59:55' or t <= '02:30:05' or (t >= '08:49:55' and t <= '11:30:05') or (
                t > '13:29:55' and t < '15:32:00'):  # 下午收盘时间延长
            return True
        else:
            return False
    # 这样有个问题，如果没有一直开着，那么收盘后打开不更新
    if qh_trade_time() or xh_trade_time():
        return True
    else:
        return False


def get_today_str():
    global real_today_str, trade_today_str
    today = datetime.datetime.now()
    one_day = datetime.timedelta(days=1)
    real_today_str = str(today)[:10]
    if today.hour >= 20:  # 晚上八点之后切换至下一天
        trade_today_str = str(today + one_day)[:10]
    else:
        trade_today_str = str(today)[:10]
    day_dict = {
        'today': today,
        'trade_day': trade_today_str,
        'real_day': real_today_str
    }

    return day_dict


day_dict = {}


def au_real_time():
    """
    黄金交易所数据
    :return:
    """
    url = 'https://www.sge.com.cn/graph/quotations'
    form_data = {'instid': 'Au(T+D)'}
    res = requests.post(url, data=form_data)
    au_td = pd.DataFrame(json.loads(res.text))[['times', 'data']].set_index('times')
    au_td = au_td.astype(float)
    au_td.replace(au_td.iloc[-1], np.nan, inplace=True)
    au_td.dropna(inplace=True)
    return au_td


def one_future_real_time(symbol='AU2106'):
    # 改为t5可获取5日的
    url = 'https://stock2.finance.sina.com.cn/futures/api/jsonp.php/' \
          'var%20t1nf_AU2106=/InnerFuturesNewService.getMinLine?symbol={}'.format(symbol)
    res = my_requests.get(url)
    df = pd.DataFrame(eval(res.text[res.text.index('('):][1:-2]), columns=[
        'times', 'price', 'avg_price', 'deal_amount', 'open_interest', 'info', 'info'
    ]).set_index('times').iloc[:, :-2]
    df.price = df.price.astype('float')
    return pd.DataFrame(df.price)


def update_hist(au_and_future, symbol):
    close_data = au_and_future.loc['15:00'].tolist()
    date = str(datetime.datetime.now())[:10]
    with open('./data/Au/0_close_hist.csv', 'a') as f:
        f.write(','.join([date] + [str(x) for x in close_data] + [symbol]) + '\n')  # 最后一列添加活跃券
        f.close()


def get_both():
    most_active_symbol = qh_symbol_list[0]
    future_oneday_real_time = one_future_real_time(symbol=most_active_symbol)
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
    au_and_future = au_and_future.round(6)  # 设置小数位数
    now_time = str(datetime.datetime.now().time())
    global day_dict
    if now_time > '15:03' and now_time < '19:55':  # 如果在下午收盘时间，保存当天数据
        # 最后一行没有当日成交
        if (day_dict['trade_day']) not in open('./data/Au/0_close_hist.csv', 'r').read():
            try:
                # 分钟数据已经保存了每日的成交，可以不用再单独保存日度成交了
                # au_and_future.to_csv('./data/Au/{}.csv'.format(day_dict['trade_day']))
                update_hist(au_and_future, most_active_symbol)
                print('{} 15:00数据保存完成'.format(day_dict['trade_day']))
            except:
                print('保存当天15：00成交失败')
    return au_and_future


def contract_list_sina():  # sina,可以直接获取全合约，不用指定合约代码，带有标签，所以数据量会大些，获取时间更长,AU2110标签有误
    global qh_symbol_list
    url = 'http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/' \
          'Market_Center.getHQFuturesData?page=1&num=40&sort=symbol&asc=1&node=hj_qh&_s_r_a=init'
    res = my_requests.get(url)
    info_list = []
    for one in re.findall('{.*?}', res.text):
        one_list = (dict(eval(one))).values()
        info_list.append(one_list)
    df = pd.DataFrame(info_list, columns=list(dict(eval(one)).keys()))
    df.set_index('symbol', inplace=True)
    need_info = ['volume', 'position', 'tradedate']  # 交易量，成交量
    # 因为为合约信息，删掉部分内容
    df = df[need_info]
    return df


# TODO 合约信息包括部分行情最好在收市后更新一次，大约四点？
def save_contract_list():  # 上海期货交易所数据，可以直接获取全合约，不用指定合约代码

    from bs4 import BeautifulSoup
    au_jys_text = my_requests.get('http://www.shfe.com.cn/products/au/').text
    soup = BeautifulSoup(au_jys_text, 'html5lib')
    au_hy_list = soup.find_all('table', class_='listshuju')[0].find_all('tr')
    info_list = []
    for one in au_hy_list:
        info_list.append(re.split('[\n\t ]+', one.text.strip()))
    delivery_info = pd.DataFrame(info_list,
                                 columns=['symbol', 'listed_day', 'due', 'delivery_start', 'delivery_day', 'price'])
    delivery_info['symbol'] = delivery_info['symbol'].apply(lambda x: x.upper())  # 取大写
    delivery_info.sort_values('symbol', inplace=True)  # 按代码排序

    delivery_info = delivery_info[['symbol', 'listed_day', 'delivery_day']]  # 代码，上市日，到期日
    delivery_info.set_index('symbol', inplace=True)

    contract_other_info = contract_list_sina()
    both_list = set(contract_other_info.index.tolist()).intersection(delivery_info.index.tolist())
    contract_other_info = contract_other_info.loc[both_list]
    delivery_info = pd.concat([delivery_info, contract_other_info], axis=1).dropna()
    # global qh_symbol_list #不能这样，这里不一定每次都运行
    # qh_symbol_list=delivery_info.index.tolist()
    return delivery_info


#
# def xh_high_freq():
#     td_high_freq_url = 'http://futsse.eastmoney.com/list/variety/118/0?' \
#                        'orderBy=name&sort=desc&pageSize=12&pageIndex=0&callbackName=&cb=hh&_={time}'
#     res = my_requests.get(td_high_freq_url.format(time=int(time.time() * 1000)))
#     res_dict = dict(eval(res.text[1:-1]))
#     for one in res_dict['list']:
#         if (one['name'] == '黄金T+D'):
#             '''
#             {'qrspj': 390.05,
#              'spsj': 1609399800,
#              'np': 2824,
#              'rz': 870,
#              'dm': 'AUTD',
#              'zsjd': 2,
#              'lx': 0,
#              'ccl': 191972,
#              'ly': 'c12',
#              'kpsj': 1609329600,
#              'dt': 347.5,
#              'sc': 118,
#              'uid': 'SGE|AUTD',
#              'vol': 6058,
#              'bpgs': 1,
#              'jysj': 827,
#              'mcj': 391.3,
#              'cjbs': 0,
#              'mcl': 6,
#              'wp': 3234,
#              'cje': 2367491024,
#              'mrj': 391.26,
#              'utime': 1609344507,
#              'jjsj': '-',
#              'mrl': 1,
#              'h': 391.88,
#              'j': 390.8,
#              'zccl': 191102,
#              'l': 389.38,
#              'zf': '-',
#              'mmpl': [0, 0, 0, 0, 6, 1, 0, 0, 0, 0],
#              'o': 390.0,
#              'p': 391.25,
#              'cclbh': 20,
#              'xsfx': 2,
#              'lb': '-',
#              'name': '黄金T+D',
#              'zde': 0.79,
#              'zt': 433.41,
#              'jyzt': 0,
#              'xs': 20,
#              'spgs': 1,
#              'zdf': 0.2,
#              'mmpjg': [0.0, 0.0, 0.0, 0.0, 391.3, 391.26, 0.0, 0.0, 0.0, 0.0],
#              'zjsj': 390.46}'''
#             bid_price = float(one['mrj'])
#             ask_price = float(one['mcj'])
#             now_price = float(one['p'])
#             break
#     return {'xh_bid': bid_price, 'xh_ask': ask_price, 'xh_now': now_price}
#
#
# def qh_high_freq(contract_list=('AU0', 'AU2110')):
#     url = f"https://hq.sinajs.cn/rn={round(time.time() * 1000)}&list={','.join(contract_list)}"
#     res = my_requests.get(url)
#     data_df = pd.DataFrame([item.strip().split("=")[1].split(
#         ",") for item in res.text.split(";") if item.strip() != ""])  # 获取等号后的值
#     data_df.iloc[:, 0] = data_df.iloc[:, 0].str.replace('"', "")  # 第一列处理
#     data_df.iloc[:, -1] = data_df.iloc[:, -1].str.replace('"', "")
#     data_df.replace('', np.nan, inplace=True)
#     data_df.dropna(axis=1, inplace=True)
#     data_df.columns = [['name', 'info', 'open', 'high', 'low', 'settle', 'buy', 'sale', 'current_price',
#                         'info2', 'pre_settle', 'buy_amount', 'sale_amount', 'open_interest', 'deal_amount',
#                         ] + ['info'] * (len(data_df.columns) - 15)]
#     data_df.index = contract_list
#     data_df = data_df[['name', 'buy', 'sale', 'current_price']]
#     for col in data_df.columns[1:]:
#         data_df[col] = data_df[col].astype(float)
#     data_df.columns = ['name', 'buy', 'sale', 'current_price']
#     return data_df
#
#
# def web_high_freq():
#     """
#     获取高频数据
#     改变global 参数所需的参数的字典
#     """
#
#     def get_ytm(jiacha, xh_now, date):
#         delivery_day = date.apply(lambda date: datetime.datetime.strptime(str(int(date)), '%Y%m%d'))  # 到期日
#         today = datetime.datetime.today()
#         day_to_delivery = (delivery_day.apply(lambda x: (x - today).days + 1))  # 补上半天的差
#         ytm = jiacha * 365 / ((day_to_delivery) * float(xh_now)) * 100
#         return round(ytm, 2)
#
#     global qh_symbol_list, high_freq_data, day_dict  # 全局参数
#
#     # 联网获取期货数据
#     qh_df = qh_high_freq(contract_list=qh_symbol_list)
#
#     [xh_buy, xh_sale, xh_now] = xh_high_freq().values()
#     contract_list_path = './data/Au/contract_info/'
#     # 合约列表，使用交易时间
#     qh_df['delivery'] = pd.read_csv(contract_list_path + '{}.csv'.format(day_dict['trade_day']),
#                                     encoding='gbk', index_col=0).delivery_day.tolist()
#
#     qh_df['jiacha0'] = qh_df.current_price - float(xh_now)
#     qh_df['jiacha_fan'] = qh_df.sale - float(xh_buy)
#     qh_df['jiacha_zheng'] = qh_df.buy - float(xh_sale)
#     qh_df['puretao'] = get_ytm(jiacha=qh_df['jiacha0'], xh_now=xh_now, date=qh_df['delivery'])
#     qh_df['fantao'] = get_ytm(jiacha=qh_df['jiacha_fan'], xh_now=xh_now, date=qh_df['delivery'])
#     qh_df['zhengtao'] = get_ytm(jiacha=qh_df['jiacha_zheng'], xh_now=xh_now, date=qh_df['delivery'])
#
#     qh_df.loc['AUTD'] = ['黄金TD'] + [xh_buy, xh_sale, xh_now] + [0] * (qh_df.shape[1] - 4)  # 加入现货数据
#     # TODO 这样会插入过多的time，信息冗余且不方便查找
#     qh_df['time'] = str(datetime.datetime.now().time())[:8]
#
#     return qh_df


def main_fun():
    global init, day_dict
    day_dict = get_today_str()
    contract_list_path = './data/Au/contract_info/'

    # TODO 分天的间隔细节还需考虑
    if '{}.csv'.format(day_dict['trade_day']) not in os.listdir(contract_list_path):
        contract_list=save_contract_list()
        contract_list['position']=contract_list['position'].astype(float) # 浮点数才方便排序
        contract_list.sort_values('position', ascending=False) \
            .to_csv(contract_list_path + '{}.csv'.format(day_dict['trade_day']),
                    encoding='gbk')
        print('{}合约列表保存完毕'.format(day_dict['trade_day']))
    global qh_symbol_list

    qh_symbol_list = pd.read_csv(contract_list_path + '{}.csv'.format(day_dict['trade_day']),
                                 encoding='gbk', index_col=0).index.tolist()

    # 分钟序列，每次写入完整的
    # 200行0.3s,有点久。。。不过20s一次，还好吧
    now_time = int(time.time())
    if now_time % 20 < 2 or init:
        minutes_path = './data/Au/minutes/'
        get_both().to_csv(minutes_path + '{}.csv'.format(day_dict['trade_day']))

    # if is_trade_time() or init:  # 在交易时段才获取高频数据
    #     # 高频数据，每次都要运行，每一个小时保存一个文件，否则文件太大了
    #     # 高频数据使用真实时间数据
    #     with open('./data/Au/high_freq/{}_{}.txt'.format(day_dict['real_day'], day_dict['today'].hour), 'a') as f:
    #         f.write(web_high_freq().to_json() + '\n')
    #         f.close()
    #     init = False  # 启动时运行一次,后如果不在交易时段则不再运行


init = True


def crawler_loop():
    while True:
        try:
            main_fun()
            time.sleep(2)
        except:
            import traceback
            traceback.print_exc()

# print('已开始运行')

if __name__ == '__main__':
    crawler_loop()
    # TODO 黄金分时成交明细

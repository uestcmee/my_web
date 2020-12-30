"""
此文件中最好只包括需要调用数据时用到的函数
数据从文件中读取
"""
import datetime
import os

import pandas as pd

today = datetime.datetime.now()
one_day = datetime.timedelta(days=1)
if today.hour >= 17:
    today_str = str(today + one_day)[:10]
else:
    today_str = str(today)[:10]


def get_hist():
    for file in os.listdir('./data/Au/'):
        print(file)


def high_freq(contract='AU2106'):
    high_freq_path = './data/Au/high_freq/'
    full_df = pd.DataFrame(eval(open('{}{}.txt'.format(high_freq_path, today_str)).readline(-1)))
    tot_dict = dict({k: v for k, v in zip(['xh_buy_p', 'xh_sale_p', 'xh_now_p'], full_df.loc['AUTD'][1:4].tolist())})
    future_info = full_df.loc[contract]
    xh_dict = {'qh_sale_p': future_info['sale'], 'qh_buy_p': future_info['buy'],
               'qh_now_p': future_info['current_price'],
               'zhengtao': future_info['zhengtao'],
               'fantao': future_info['fantao'],
               'puretao': future_info['puretao'],
               'puretao_bp': future_info['jiacha0'],
               'fantao_bp': future_info['jiacha_fan'],
               'zhengtao_bp': future_info['jiacha_zheng'],
               'fresh_time': future_info['time']}
    tot_dict.update(xh_dict)
    return tot_dict



if __name__ == '__main__':
    print(high_freq())

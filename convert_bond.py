import numpy as np
import pandas as pd
import pymongo


def one_rr(date, df_oneday, pct_chg_label='pct_chg', convert_value_label='convert_value'):
    df_diff_price = pd.DataFrame()

    mini_df = df_oneday[(df_oneday[convert_value_label] < 70)]  # 小于70元
    df_diff_price.loc[date, '<70'] = (mini_df[pct_chg_label].mean())

    for i in range(70, 130, 10):
        mini_df = df_oneday[(df_oneday[convert_value_label] >= i) & (df_oneday[convert_value_label] < i + 10)]
        df_diff_price.loc[date, '{}-{}'.format(i, i + 10)] = (mini_df[pct_chg_label].mean())

    mini_df = df_oneday[(df_oneday[convert_value_label] >= 150)]
    df_diff_price.loc[date, '130+'] = (mini_df[pct_chg_label].mean())
    return df_diff_price


def get_cum_rr():
    myclient = pymongo.MongoClient("mongodb://db:112233@cscficc.cn:27017/")  # 其实好像可以用localhost，正好本地云端分别用自己的数据库
    mycol_sina = myclient["Bond"]['convertible_bond_sina']
    # 读取sina的转债数据并做预处理
    df = pd.DataFrame([one for one in mycol_sina.find({}, {'_id': 0})])
    df = df.replace('-', np.nan)
    df = df[~df['pct_chg'].isna()]

    df_need = df
    # 计算每日各个分段的收益率
    rr_all = pd.DataFrame()  # 存储各日收益率
    day_list = df_need['date'].value_counts().index.tolist()
    for day in day_list:
        df_oneday = df_need[df_need['date'] == day]
        rr_1d = one_rr(day, df_oneday, 'pct_chg', '转股价值')  # 得到当日的各个价格区间的收益率
        if rr_all.shape == (0, 0):
            rr_all = rr_1d
        else:
            rr_all = pd.concat([rr_all, rr_1d])
    rr_all.dropna(inplace=True)  # 去掉空值
    # 计算累计收益率
    # rr_df.columns=list(map(lambda x :x.ljust(7,'_'),rr_df.columns.tolist())) # 加个下划线方便后面图中对齐
    rr_df = (((1 + rr_all / 100).cumprod() - 1) * 100).round(4)
    return rr_df


if __name__ == '__main__':
    print(get_cum_rr())

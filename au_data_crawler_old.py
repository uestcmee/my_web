# coding:utf-8
import datetime
import json
import re
import time

import numpy as np
import pandas as pd
import requests
import schedule
from sqlalchemy import create_engine


# 现货实时行情


class my_requests:
    """
    用来在获取失败时重复获取
    TODO 好像这个类的写法有点问题，后面再看看
    """

    def get(url: str):
        i = 0
        headers = {
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36 Edg/87.0.664.66"
        }
        while i < 20:
            try:
                return requests.get(url, headers=headers)
            except:
                time.sleep(1)
                i += 1


def is_trade_time():
    """
    这里之前考虑到高频数据获取频率高，所以时间卡的很死，但是分钟数据有几分钟延迟，这样会导致数据获取不完全
    :return:
    """
    now = datetime.datetime.now()
    t = str(now)[11:19]

    # print(t)
    def qh_trade_time():
        if (
                t >= "20:59:55"
                or t <= "02:30:05"
                or (t >= "09:29:55" and t <= "11:30:05")
                or (t > "13:29:55" and t < "15:32:00")
        ):
            return True
        else:
            return False

    def xh_trade_time():
        if (
                t >= "19:59:55"
                or t <= "02:30:05"
                or (t >= "08:49:55" and t <= "11:30:05")
                or (t > "13:29:55" and t < "15:32:00")
        ):  # 下午收盘时间延长
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
    next_day = str(today + one_day)[:10]
    day_dict = {
        "today": today,  # 日期类型
        "trade_day": trade_today_str,  # 当前的对应交易日（晚八点切换）
        "real_day": real_today_str,  # 实际日期
        "next_day": next_day,
    }

    return day_dict


day_dict = {}


def au_real_time():
    """
    黄金交易所数据
    :return:
    """
    url = "https://www.sge.com.cn/graph/quotations"
    form_data = {"instid": "Au(T+D)"}
    res = requests.post(url, data=form_data)
    au_td = pd.DataFrame(json.loads(res.text))[["times", "data"]].set_index("times")
    au_td = au_td.astype(float)
    au_td.replace(au_td.iloc[-1], np.nan, inplace=True)
    au_td.dropna(inplace=True)
    return au_td


def one_future_real_time(symbol="AU2106"):
    # 改为t5可获取5日的
    url = (
        "https://stock2.finance.sina.com.cn/futures/api/jsonp.php/"
        "var%20t1nf_AU2106=/InnerFuturesNewService.getMinLine?symbol={}".format(symbol)
    )
    res = my_requests.get(url)
    df = (
        pd.DataFrame(
            eval(res.text[res.text.index("("):][1:-2]),
            columns=[
                "times",
                "price",
                "avg_price",
                "deal_amount",
                "open_interest",
                "info",
                "info",
            ],
        )
            .set_index("times")
            .iloc[:, :-2]
    )
    df.price = df.price.astype("float")
    return pd.DataFrame(df.price)


def update_hist():
    """
    保存15:00的数据到csv
    :param au_and_future:期货新货的价格数据
    :param symbol:当前最活跃期货
    :return:
    """
    symbol = get_symbol_list()[0]
    au_and_future = get_both()
    day_dict = get_today_str()
    try:
        close_data = au_and_future.loc["15:00"].tolist()
        date = str(datetime.datetime.now())[:10]
        with open("./data/Au/0_close_hist.csv", "a") as f:
            f.write(
                ",".join([date] + [str(x) for x in close_data] + [symbol]) + "\n"
            )  # 最后一列添加活跃券
            f.close()
        print("{} 15:00数据保存完成".format(day_dict["trade_day"]))
    except:
        print("保存当天15：00成交失败")


def get_both():
    most_active_symbol = get_symbol_list()[0]

    future_oneday_real_time = one_future_real_time(symbol=most_active_symbol)
    au_oneday_real_time = au_real_time()
    au_oneday_real_time = au_oneday_real_time[
        ~au_oneday_real_time.index.duplicated(keep="first")
    ]  # 因为可能有重复值，去重
    au_and_future = pd.concat([future_oneday_real_time, au_oneday_real_time], axis=1)
    au_and_future.columns = ["future", "Au_TD"]
    # 排序
    night_price = au_and_future.sort_index()["17:00":]  # 夜盘数据
    day_price = au_and_future.sort_index()[:"17:00"]  # 日盘数据
    au_and_future = pd.concat([night_price, day_price], axis=0)  # 拼接
    # 计算数据
    au_and_future["diff"] = au_and_future["future"] - au_and_future["Au_TD"]
    delivery_day = datetime.datetime.strptime("2021-6-16", "%Y-%m-%d")  # 到期日
    today = datetime.datetime.today()
    day_to_delivery = (delivery_day - today).days + 1  # 补上半天的差
    au_and_future["ytm"] = (
            au_and_future["diff"] * 365 / ((day_to_delivery) * au_and_future["Au_TD"]) * 100
    )
    au_and_future = au_and_future.round(6)  # 设置小数位数
    au_and_future.index.name = "index"
    return au_and_future


def contract_list_sina():  # sina,可以直接获取全合约，不用指定合约代码，带有标签，所以数据量会大些，获取时间更长,AU2110标签有误

    url = (
        "http://vip.stock.finance.sina.com.cn/quotes_service/api/json_v2.php/"
        "Market_Center.getHQFuturesData?page=1&num=40&sort=symbol&asc=1&node=hj_qh&_s_r_a=init"
    )
    res = my_requests.get(url)
    info_list = []
    for one in re.findall("{.*?}", res.text):
        one_list = (dict(eval(one))).values()
        info_list.append(one_list)
    df = pd.DataFrame(info_list, columns=list(dict(eval(one)).keys()))
    df.set_index("symbol", inplace=True)
    need_info = ["volume", "position", "tradedate"]  # 交易量，成交量
    # 因为为合约信息，删掉部分内容
    df = df[need_info]
    return df


# TODO 合约信息包括部分行情最好在收市后更新一次，大约四点？
def get_contract_list():  # 上海期货交易所数据，可以直接获取全合约，不用指定合约代码

    from bs4 import BeautifulSoup

    au_jys_text = my_requests.get("http://www.shfe.com.cn/products/au/").text
    soup = BeautifulSoup(au_jys_text, "html5lib")
    au_hy_list = soup.find_all("table", class_="listshuju")[0].find_all("tr")
    info_list = []
    for one in au_hy_list:
        info_list.append(re.split("[\n\t ]+", one.text.strip()))
    delivery_info = pd.DataFrame(
        info_list,
        columns=[
            "symbol",
            "listed_day",
            "due",
            "delivery_start",
            "delivery_day",
            "price",
        ],
    )
    delivery_info["symbol"] = delivery_info["symbol"].apply(lambda x: x.upper())  # 取大写
    delivery_info.sort_values("symbol", inplace=True)  # 按代码排序

    delivery_info = delivery_info[
        ["symbol", "listed_day", "delivery_day"]
    ]  # 代码，上市日，到期日
    delivery_info.set_index("symbol", inplace=True)

    contract_other_info = contract_list_sina()
    both_list = set(contract_other_info.index.tolist()).intersection(
        delivery_info.index.tolist()
    )  # 两个表都有的合约
    contract_other_info = contract_other_info.loc[both_list]
    contract_list = pd.concat([delivery_info, contract_other_info], axis=1).dropna()
    contract_list["position"] = contract_list["position"].astype(float)  # 浮点数才方便排序
    contract_list = contract_list.sort_values(
        "position", ascending=False
    )  # 按照持仓量进行一个排序
    contract_list.index.name = "symbol"  # 好像不加这一句，index列的名字就会被改掉
    return contract_list


engine_contract = create_engine(r"sqlite:///../my_scheduled_app/Au/黄金合约信息.db")


def save_contract(init=False):
    """
    计划运行时间下午收盘后,保存次日的合约数据
    :return:
    """
    date = get_today_str()["next_day"]
    if init:  # 初始化运行的时候保存到今日
        date = get_today_str()["trade_day"]
    contract_list = get_contract_list()
    contract_list.to_sql(date, engine_contract, if_exists="replace")
    print("{}合约列表保存完毕".format(date))


def get_symbol_list():
    """从db文件中获取，当前最活跃合约列表"""
    date = get_today_str()["trade_day"]
    try:
        contract_list = pd.read_sql(date, engine_contract, index_col="symbol")
        qh_symbol_list = contract_list.index.tolist()
    except:
        qh_symbol_list = get_contract_list().index.tolist()
    return qh_symbol_list


engine_minutes = create_engine(r"sqlite:///../my_scheduled_app/Au/黄金分钟信息.db")


def save_minutes_data(force=True):
    """保存实时的分钟序列，每次写入完整的
    force: 如果froce，就算非交易时间也要强制获取
    """
    # if not is_trade_time() and not force:
    #     return 0
    day_dict = get_today_str()
    # 200行0.3s,有点久。。。不过20s一次，还好吧
    get_both().to_sql(day_dict["trade_day"], engine_minutes, if_exists="replace")


def crawler_loop():
    # 先初始化运行一次
    print("黄金数据爬虫已经开始运行")
    save_minutes_data()
    schedule.every().day.at("15:04").do(save_contract)  # 保存次日合约数据
    schedule.every().day.at("15:03").do(update_hist)  # 保存当前
    schedule.every(30).seconds.do(save_minutes_data)

    while True:
        schedule.run_pending()
        time.sleep(1)


if __name__ == "__main__":
    crawler_loop()
    # TODO 黄金分时成交明细

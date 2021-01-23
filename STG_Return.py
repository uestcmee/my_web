# coding:utf-8
import numpy as np
import pandas as pd

file = "./data/CSI.csv"


class load_file:
    def __init__(self, file_name):

        self.file_name = file_name
        self.close_p = []
        # 代码,名称,日期,开盘价(元),最高价(元),最低价(元),收盘价(元),成交额(百万),成交量(股)

    def read_file(self):
        df = pd.read_csv(self.file_name, index_col="日期")

        self.close_p = df["收盘价(元)"]
        # print(close_p.head(10))
        last_p = 1000
        earning = []
        for day in self.close_p.index:
            if self.close_p[day] == 0:
                self.close_p.drop(day, inplace=True)
        close_list = self.close_p.tolist()
        for now_idx in close_list:
            earning.append(((now_idx / last_p) - 1) * 100)
            last_p = now_idx
        self.close_p = self.close_p.to_frame()
        self.close_p["earning"] = earning
        self.close_p.rename(columns={"收盘价(元)": "close"}, inplace=True)
        return self.close_p


class StgReturn:
    def __init__(
            self,
            file_name=None,
            l_fac=1.0,
            s_fac=1.06,
            year_range=range(2006, 2021),
            lma=14,
            sma=3,
    ):
        # 在此修改长短期均线长度
        # ========================
        self.lma = lma  # 长期均线选择
        self.sma = sma  # 短期均线选择
        self.year_range = year_range
        # ============================

        # 需要输入文件名
        assert file_name != None
        # 载入文件
        self.close_data = load_file(file_name).read_file()
        # year range从loadfile中传递？
        # print(self.time_list)
        self.ret_list = {}
        # MACD指标选择的长短期为12,26
        self.l_fac = l_fac
        self.s_fac = s_fac
        # self.main_loop()

    def main_loop(self):
        # ======开始进入收益率计算======
        stg_r, idx_r = self.cal_ma()
        df = pd.DataFrame()
        df.insert(0, "stg", np.array(stg_r))
        df.insert(1, "idx", np.array(idx_r))

        # df.insert([1,1])
        df.index = self.close_data.index[1:]
        return df

    def cal_ma(self):
        # self.lma为长的均线，self.sma为短的均线
        # 初始化收盘价dataframe
        self.close_data["20avg"] = (
            self.close_data["close"].rolling(window=self.lma).mean().shift()
        )
        self.close_data["5avg"] = (
            self.close_data["close"].rolling(window=self.sma).mean().shift()
        )
        # print(self.close_data)

        # pandas 的索引实在是太慢了，直接用lastday记录上一天的
        last_day = [-1, 1]  # 是否持有,策略总回报
        start_day = 0
        stg_r, idx_r = [], []
        idr = 1
        for index, day in enumerate(self.close_data.index[start_day:]):
            index = index + start_day
            # 跳过首日
            if index == start_day:
                continue
            [close_p, earning, avg20, avg5] = self.close_data.loc[day][:4]

            # 主要的判断是否持有的语句
            if close_p > avg20 * self.l_fac and close_p < avg5 * self.s_fac:
                hold_flag = 1
            else:
                hold_flag = 0

            [hold_flag_, last_return] = last_day
            if hold_flag_ == 1:  # 上一日选择持有，则本日计算收益率
                tot_return = last_return * (earning / 100 + 1)  # 上日累计收益率乘本日收益率
            else:
                tot_return = last_return
            idr *= earning / 100 + 1
            stg_r.append(round(tot_return, 6))
            idx_r.append(round(idr, 6))
            tot_return = round(tot_return, 6)
            last_day = [hold_flag, tot_return]

        return stg_r, idx_r


if __name__ == "__main__":
    df = StgReturn(file_name="./data/CSI.csv").main_loop()
    print(df)
    # import matplotlib.pyplot as plt
    # df.plot()
    # plt.show()
    df.to_csv("for ppt.csv")

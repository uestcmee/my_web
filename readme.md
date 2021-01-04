# 小工具合集

> 1. 目前主要卡在了黄金相关的数据这里
> 2. 感觉其实很多事情不用放在开启后台之后完成
> 3. 可以将大部分的数据获取工作放到单独的部分中执行并存储

黄金TD,历史序列http://push2.eastmoney.com/api/qt/stock/trends2/get?cb=jQuery112408775543291803352_1609341976455&secid=118.AUTD&ut=fa5fd1943c7b386f172d6893dbfba10b&fields1=f1%2Cf2%2Cf3%2Cf4%2Cf5%2Cf6%2Cf7%2Cf8%2Cf9%2Cf10%2Cf11%2Cf12%2Cf13&fields2=f51%2Cf52%2Cf53%2Cf54%2Cf55%2Cf56%2Cf57%2Cf58&iscr=0&ndays=1&_=1609341976756


黄金TD报价有戏了
http://futsse.eastmoney.com/list/variety/118/0?orderBy=wryh&sort=desc&pageSize=12&pageIndex=0&callbackName=hh&cb=hh&_=1609343077914
http://futsse.eastmoney.com/list/variety/118/0?orderBy=wryh&sort=asce&pageSize=12&pageIndex=0&callbackName=hh&cb=hh&_=1609343077914

用这个吧：
http://futsse.eastmoney.com/list/variety/118/0?orderBy=name&sort=desc&pageSize=12&pageIndex=0&callbackName=hh&cb=hh&_=1609343077914



jqueryCallback({bjdw: "元(人民币)/克", hyjgyf: "连续交易", idx: 39347, jgfs: "实物交割", jgpj: "-", jydw: "1千克/手",…})
bjdw: "元(人民币)/克"
hyjgyf: "连续交易"
idx: 39347
jgfs: "实物交割"
jgpj: "-"
jydw: "1千克/手"
jysj: "上午:9:00 至 11:30,下午:13:30 至 15:30,夜间:19:50 至次日 02:30。"
market: "上海黄金交易所"
vcode: "AUTD"
vname: "黄金T+D"
zcjybzj: "0.07"
zdtbfd: "上一交易日结算价±6%"
zhjgr: "-"
zhjyr: "-"
zxbddw: "0.01 元/克"

http://static.futsse.eastmoney.com/redis?msgid=118_autd_info&callbackName=jqueryCallback&cb=jqueryCallback&_=1609341976461
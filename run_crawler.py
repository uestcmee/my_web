# coding:utf-8

# 如果使用uwsgi直接运行，则没有运行app.py的init内容
import threading
from au_data_crawler import crawler_loop
#
t = threading.Thread(target=crawler_loop)
t.start()
# crawler_loop()
print('黄金数据爬虫已开始运行')
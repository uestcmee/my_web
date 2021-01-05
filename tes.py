# coding:utf-8
# import platform
# print(platform.system()=='Darwin')
#
# import os
# print(os.sep)
# print(os.listdir('/Users/zikepeng/PycharmProjects/my_web/static/uploads/'))
file_name='2020年06月24日周三.txt'
with open('./static/uploads/{}'.format(file_name),encoding='gbk') as f:
    text = f.read()
    f.close()
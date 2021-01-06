# -*- coding: UTF-8 -*-

# from functools import wraps
# def fun1(afunc):
#     @wraps(afunc)
#     def wrapfunction():
#         print('a')
#         afunc()
#         print('b')
#     return wrapfunction
#
#
# @fun1
# def my_fun():
#     print('hello')
#     return 0
# my_fun()

class Parent:  # 定义父类
    def myMethod(self):
        print('a')


class Child(Parent):  # 定义子类
    def myMethod(self):
        print('b')


c = Child()  # 子类实例
c.myMethod()  # 子类调用重写方法

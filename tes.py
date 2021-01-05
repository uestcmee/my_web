# coding:utf-8
with open('./static/uploads/2020年06月24日周三.txt') as f:
    show_data = f.read()  # .encode('utf-8')
    # show_data=make_response(show_data)
    print(show_data)
    f.close()

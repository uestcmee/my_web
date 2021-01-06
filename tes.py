import os

file_list = os.listdir('./static/uploads/')
file_list[1] = 'hello'
file_list.sort()
print(file_list)

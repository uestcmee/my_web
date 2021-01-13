from os import popen
a=popen('hostname').read().strip()
print (popen('hostname').read()=='Momi')

# - print_file.py *- coding: utf-8 -*-
""" Opens file and prints its contents line by line. """

import sys     # we need this library to deal with operating system

filename = sys.argv[1]

infile = open(filename)

for line in infile:
    print(line,end="") # the file has "\n" at the end of each line already

infile.close()
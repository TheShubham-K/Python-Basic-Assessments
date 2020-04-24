# - ProblemSet1.py *- coding: utf-8 -*-
"""
Each problem will be a function to write. 

Remember that you can execute just the code between the #%% signs by clicking
somewhere in that space and then using Ctrl-Enter (Cmd-Return on a Mac). An
alternative is to use the second toolbar green triangle or Menu>Run>Run cell.

On loops especially, you can make an error that causes the program to run
forever. If you don't get immediate response, then this is probably happening.
In that case, try Ctrl-C. If that doesn't stop it click your IPython console
away and open a new one from the Consoles menu. Look over your code and see 
why the termination condition can't be met and fix it. Then run again.

You can submit your work in two ways. One is simply to upload this file. This
is the easiest way to go provided that you haven't corrupted it.  To make sure
that it isn't corrupted, run the whole file by clicking the left green triangle
above.  If it is corrupted, you can fix it or submit just your function as 
described next.
To submit only a single function, copy the material between the two #%% into
a text file (don't use a word processor, use a text editor such as Notepad in 
Windows orTextEdit on the Mac) and save it as problemx.py (where x is the 
problem number). Upload this file to Coursera.  Note that the grading program
is going to run the function with the name specified, so don't change the 
function name. 

Note: each of the function below is made runnable by adding the statement
pass.  This is a do-nothing statement.  You should replace it with your code,
but its present doesn't affect how your code runs. 
"""

""" 
Problem 1_1:
Write a function problem1_1() that prints "Problem Set 1". 

Tip: Be careful that your program outputs this exact phrase with no additional 
characters.  It will be graded automatically and must be precise.
"""
#%%
def problem1_1():
    print("Problem Set 1")

    
#%%

"""
Problem 1_2:
Write a function problem1_2(x,y) that prints the sum and product of the
numbers x and y on separate lines, the sum printing first.
"""
#%%
def problem1_2(x,y):
    sum = x+ y;
    product = x*y;
    print(sum);
    print(product);
    


#%% 
"""
Test run. Note that the grader program will use different numbers:

problem1_2(3,5)
8
15
"""   
"""
Problem 1_3:  
Write a function problem1_3(n) that adds up the numbers 1 through n and
prints out the result. You should use either a 'while' loop or a 'for' loop.
Be sure that you check your answer on several numbers n.  Be careful that your
loop steps through all the numbers from 1 through and including n.

Tip: As this involves a loop you could make an error that causes it to run 
forever. Usually Control-C will stop it. See suggestions at the beginning of 
this document.  With loops take care that your first and last iterations are
what you expect. A print statement can be inserted in the loop to monitor it, 
but be sure this isn't in the submitted function.
"""
#%%
def problem1_3(n):
    my_sum = 0
    for ct in range(1,n+1,1):
        my_sum += ct;
    print(my_sum);



    

#%%
"""
Test run. Note that the grader program will use different numbers:

problem1_3(6)
21
"""
"""
Problem 1_4:
Write a function 'problem1_4(miles)' to convert miles to feet. There are
5280 feet in each mile. Make the print out a statement as follows:
"There are 10560 feet in 2 miles."  Except for the numbers this state should
be exactly as written.

Tip: Watch the spacing before and after your numbers.  Just one space or the
auto-grader may not give you credit.
"""
#%%
def problem1_4(miles):
    feet = 5280 * miles;
    print("There are", feet, "feet in", miles, "miles.");


    
#%%
"""
Test run. Note that the grader program will use different numbers:

problem1_4(5)
There are 26400 feet in 5 miles.
"""
"""
Problem 1_5:
Write a function 'problem1_5(age)'. This function should use if-elif-else
statement to print out "Have a glass of milk." for anyone under 7; "Have
a coke." for anyone under 21, and "Have a martini." for anyone 21 or older.

Tip: Be careful about the ages 7 (a seven year old is not under 7) and 21.
Also be careful to make the phrases exactly as shown for the auto-grader.
"""
#%%
def problem1_5(age):
    if age < 7:
        print("Have a glass of milk.");
    elif age < 21:
        print("Have a coke.");
    else:
        print("Have a martini.");





    
#%%
"""
Test runs (3 of them). Note that the grader program will use different numbers:
problem1_5(5)
Have a glass of milk.

problem1_5(10)
Have a coke.

problem1_5(25)
Have a martini.

"""
"""
Problem 1_6:
Write a function 'problem1_6()' that prints the odd numbers from 1 through 100.
Make all of these numbers appear on the same line (actually, when the line
fills up it will wrap around, but ignore that.). In order to do this, your
print statement should have end=" " in it. For example, print(name,end=" ") 
will keep the next print statement from starting a new line. Be sure there is a
space between these quotes or your numbers will run together. Use a single 
space as that is what the grading program expects. Use a 'for' loop 
and a range() function. 

Things to be careful of that might go wrong: You print too many numbers, you
put too much or too little space between them, you print each number on its 
own line, you print even numbers or all numbers, your first number isn't 1 or
your last number isn't 99.  Always check first and last outputs when you write
a loop.
"""
#%%
def problem1_6():
    for ct in range(1,100,2):
        print(ct, end=" ")



    
#%% 
"""
Test run (I've inserted a newline here to cause wrapping in the editor):

problem1_6()
1 3 5 7 9 11 13 15 17 19 21 23 25 27 29 31 33 35 37 39 41 43 45 47 49 51 53 55 
57 59 61 63 65 67 69 71 73 75 77 79 81 83 85 87 89 91 93 95 97 99
"""       
"""
Problem 1_7:
Write a function problem1_7() that computes the area of a trapezoid. Here is the
formula: A = (1/2)(b1+b2)h. In the formula b1 is the length of one of the 
bases, b2 the other. The height is h and the area is A. Basically, this 
takes the average of the two bases times the height. For a rectangle b1 = b2, 
so this reduces to b1*h. This means that you can do a pretty good test of the 
correctness of your function using a rectangle (that way you can compute the 
answer in your head). Use input statements to ask for the bases and the height.
Convert these input strings to real numbers using float(). Print the output
nicely exactly like mine below.

Tip: Be careful that your output on the test case below is exactly as shown
so that the auto-grader judges your output correctly.  See the other test run
below.

In[105]: 

problem1_7()

Enter the length of one of the bases: 3

Enter the length of the other base: 4

Enter the height: 8
The area of a trapezoid with bases 3.0 and 4.0 and height 8.0 is 28.0

"""  
#%%
def problem1_7():
    base1 = float(input("Enter the length of one of the bases: "));
    base2 = float(input("Enter the length of the other base: "));
    height = float(input("Enter the height: "));
    
    area = (1/2)*(base1 + base2)*height;
    print("The area of a trapezoid with bases",base1,"and",base2,"and height",height,"is",area);








#%%
"""
Test run. In grading, expect different input numbers to be used.

problem1_7()

Enter the length of one of the bases: 10

Enter the length of the other base: 11

Enter the height: 12
The area of a trapezoid with bases 10.0 and 11.0 and height 12.0 is 126.0

"""
 
    

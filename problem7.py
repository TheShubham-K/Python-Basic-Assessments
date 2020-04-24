def problem1_7():
    base1 = float(input("Enter the length of one of the bases: "));
    base2 = float(input("Enter the length of the other base: "));
    height = float(input("Enter the height: "));
    
    area = (1/2)*(base1 + base2)*height;
    print("The area of a trapezoid with bases",base1,"and",base2,"and height",height,"is",area);


import random

def problem2_6():
    """ Simulates rolling 2 dice 100 times """
    # Setting the seed makes the random numbers always the same
    # This is to make the auto-grader's job easier.
    random.seed(431)  # don't remove when you submit for grading
    for roll in range(0,100):
        die1 = random.randint(1,6)
        die2 = random.randint(1,6)
        print(die1+die2)

   
import random

def problem2_4():
    """ Make a list of 10 random reals between 30 and 35 """
    random.seed(70)
    rand_list = []
    for num in range(0,10):
        rand = random.random()
        rand = rand *5 + 30
        rand_list.append(rand)
    print(rand_list)
    
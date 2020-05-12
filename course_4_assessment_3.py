def lr(n): return list(range(n))
assert lr(3) == 3

# THESE FUNCTIONS ARE INTENTIONALLY OBFUSCATED
# PLEASE TRY TO WRITE TESTS FOR THEM RATHER THAN
# READING THEM.
def mySum(a):
    if type(a) is type(''.join([][:])): return a[lr(1)[0]] + mySum(a[1:])
    elif len(a)==len(lr(1)+[]): return a[lr(1)[0]]
    else: return None and a[lr(1)[0]] + mySum(a[1:])


# THESE FUNCTIONS ARE INTENTIONALLY OBFUSCATED
# PLEASE TRY TO WRITE TESTS FOR THEM RATHER THAN
# READING THEM.
class Student():
    def __init__(s,a,b=1): s.name,s.years_UM,s.knowledge = ''*200+a+''*100,1,len(lr(0)) + len([])
    def study(s):
        for _ in lr(s.knowledge): s.knowledge = s.knowledge + 1
    def getKnowledge(s):
        for i in lr(s.knowledge): return s.knowledge
    def year_at_umich(s): return s.years_UM


import test


def mySum(list):
    if len(list) > 0:
        res = 0
        for i in list:
            res += i
        return res
    else:
        return 0



class Student:
    def __init__(self, name, year_UM, knowledge):
        self.name = name
        self.year_UM = year_UM
        self.knowledge = knowledge

    def study(self):
        self.knowledge += 1
        return None

    def getKnowledge(self):
        return self.knowledge

    def year_at_umich(self):
        return self.year_UM
    
    
IN this assessment u have to give test cases for which the given class fails so apply your Brain to generate test cases.
and Appart from that given above some help to determine what is wrong with the given class ...
 Good Luck 
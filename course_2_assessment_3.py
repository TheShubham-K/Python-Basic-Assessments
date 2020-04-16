# 1. The dictionary Junior shows a schedule for a junior year semester. The key is the course name and the value is the number of credits. Find the total number of credits taken this semester and assign it to the variable credits. Do not hardcode this – use dictionary accumulation!

Junior = {'SI 206':4, 'SI 310':4, 'BL 300':3, 'TO 313':3, 'BCOM 350':1, 'MO 300':3}
credits = 0

for credit in Junior.values():
    credits += credit
credits

# 2. Create a dictionary, freq, that displays each character in string str1 as the key and its frequency as the value.

str1 = "peter piper picked a peck of pickled peppers"
freq = {}

for c in str1:
    if c  not in freq:
        freq[c] = 0
    freq[c] += 1
freq

# -----or------*/

from collections import Counter

str1 = "peter piper picked a peck of pickled peppers"
freq = Counter(str1)

for i in str1:
    print(i, freq[i])
    
# 3. Provided is a string saved to the variable name s1. Create a dictionary named counts that contains each letter in s1 and the number of times it occurs.

s1 = "hello"

counts  = {}

for c in s1:
    if c  not in counts:
        counts[c] = 0
    counts[c] += 1
counts

# 4. Create a dictionary, freq_words, that contains each word in string str1 as the key and its frequency as the value.

str1 = "I wish I wish with all my heart to fly with dragons in a land apart"
words = str1.split()
freq_words = {}

for word in words:
    if word not in freq_words:
        freq_words[word] = 0
    freq_words[word] +=1
freq_words

# -----------oorr------------*/
def word_count(str):
    counts = dict()
    words = str.split()

    for word in words:
        if word in counts:
            counts[word] += 1
        else:
            counts[word] = 1

    return counts

freq_words = word_count(str1)
print(freq_words)


# 5.Create a dictionary called wrd_d from the string sent, so that the key is a word and the value is how many times you have seen that word.

sent = "Singing in the rain and playing in the rain are two entirely different situations but both can be good"

wrd_d = {}
words = sent.split()
for word in words:
    if word not in wrd_d:
        wrd_d[word] = 0
    wrd_d[word] +=1
wrd_d

# ------------or-------------*/

def word_count(str):
    counts = dict()
    words = str.split()

    for word in words:
        if word in counts:
            counts[word] += 1
        else:
            counts[word] = 1

    return counts

wrd_d  = word_count(sent)
print(wrd_d)

# 6.Create the dictionary characters that shows each character from the string sally and its frequency. Then, find the most frequent letter based on the dictionary. Assign this letter to the variable best_char.

sally = "sally sells sea shells by the sea shore"

characters = {}

for c in sally:
    if c not in characters:
        characters[c] = 0
    characters[c] += 1
characters

ks = characters.keys()
best_char = list(ks)[0]

for k in ks:
    if characters[k] > characters[best_char]:
        best_char = k
best_char  

# --------------------or-----------------*/
sally = "sally sells sea shells by the sea shore"
characters = {}
for i in sally:
    characters[i]=characters.get(i,0)+1
    
sorted(characters.items(), key=lambda x: x[1])
best_char = sorted(characters.items(), key=lambda x: x[1])[-1][0]

#  7. Find the least frequent letter. Create the dictionary characters that shows each character from string sally and its frequency. Then, find the least frequent letter in the string and assign the letter to the variable worst_char.

sally = "sally sells sea shells by the sea shore and by the road"

characters = {}

for c in sally:
    if c not in characters:
        characters[c] = 0
    characters[c] += 1
characters

ks = characters.keys()
worst_char = list(ks)[0]

for k in ks:
    if characters[k] < characters[worst_char]:
        worst_char = k
worst_char 


# ------------or -------------------*//
characters = {}
for i in sally:
    characters[i]=characters.get(i,0)+1
    
sorted(characters.items(), key=lambda x: x[1])
worst_char = sorted(characters.items(), key=lambda x: x[1])[-13][0]

# 8. Create a dictionary named letter_counts that contains each letter and the number of times it occurs in string1. Challenge: Letters should not be counted separately as upper-case and lower-case. Intead, all of them should be counted as lower-case.

string1 = "There is a tide in the affairs of men, Which taken at the flood, leads on to fortune. Omitted, all the voyage of their life is bound in shallows and in miseries. On such a full sea are we now afloat. And we must take the current when it serves, or lose our ventures."

strinr1 = string1.lower()

letter_counts  = {}
for c in strinr1:
    if c not in letter_counts:
        letter_counts[c] = 0
    letter_counts[c] += 1
letter_counts


# 9. Create a dictionary called low_d that keeps track of all the characters in the string p and notes how many times each character was seen. Make sure that there are no repeats of characters as keys, such that “T” and “t” are both seen as a “t” for example.


p = "Summer is a great time to go outside. You have to be careful of the sun though because of the heat."

p = p.lower()

low_d   = {}
for c in p:
    if c not in low_d :
        low_d [c] = 0
    low_d [c] += 1
low_d 

# ----------------------or------------------*/

import collections
p = p = "Summer is a great time to go outside. You have to be careful of the sun though because of the heat."
low_d  = collections.defaultdict(int)

for c in p:
    low_d[c] += 1
        
for c in sorted(low_d, key=low_d.get, reverse=True):
    if low_d[c] > 1:
        print('%s %d' % (c, low_d[c]))
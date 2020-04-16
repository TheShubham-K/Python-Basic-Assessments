# 1. The textfile, travel_plans.txt, contains the summer travel plans for someone with some commentary. Find the total number of characters in the file and save to the variable num.

f = open('travel_plans.txt', 'r')
chr = 0
chars = f.read()
for char in chars:
    chr +=1
num = chr

# 2. We have provided a file called emotion_words.txt that contains lines of words that describe emotions. Find the total number of words in the file and assign this value to the variable num_words.

num_words = 0
fileref = "emotion_words.txt"

with open(fileref, 'r') as file:
    for line in file:
        num_words += len(line.split())

print("number of words : ", num_words)


# 3.Assign to the variable num_lines the number of lines in the file school_prompt.txt.
num_lines = 0
fileref = "school_prompt.txt"

with open(fileref, 'r') as file:
    for line in file.readlines():
        num_lines += 1

print("number of words : ", num_lines)

# 4. Assign the first 30 characters of school_prompt.txt as a string to the variable beginning_chars.
beginning_chars=0
file = 'school_prompt.txt'

with open(file, 'r') as f:
    chars = f.read()[:30]
beginning_chars = chars
    

# 5. Challenge: Using the file school_prompt.txt, assign the third word of every line to a list called three.
three = []
file = 'school_prompt.txt'

with open(file, 'r') as f:
    three = [line.split()[2] for line in f]
three

# 6. Challenge: Create a list called emotions that contains the first word of every line in emotion_words.txt.

emotions  = []
file = 'emotion_words.txt'

with open(file, 'r') as f:
    emotions  = [line.split()[0] for line in f]
emotions 

# 7.Assign the first 33 characters from the textfile, travel_plans.txt to the variable first_chars.
first_chars  = []
file = 'travel_plans.txt'

with open(file, 'r') as f:
    first_chars  = f.read(33)
first_chars


# 8. Challenge: Using the file school_prompt.txt, if the character ‘p’ is in a word, then add the word to a list called p_words.
p_words = []
file = 'school_prompt.txt'

with open(file, 'r') as f:
    words = f.read().split()
for word in words:
    if 'p' in word:
        p_words += [word]
p_words

# ------------------ or ------------------------**/
f = open('school_prompt.txt', 'r')
words = f.read().split()
p_words = [word for word in words if 'p' in word]

---
title: Creating pandas dataframes
date: 2020-08-08
description: Different ways of creating dataframes in python
tags:
  - python
  - pandas
slug: "/32-python-creating-dataframes"
---

Pandas dataframe is a 2D data structure which looks like a table. There are different ways to create a dataframe, mostly everybody sticks to few formats they like and stick to it, thats good. But, sometimes when you have a problem and you want somebody's opinion or get a suggestion or solution, you cannot give all your code and ask them to execute and start explaining the problem. Its a lot easier if you could generate a small sample data and explain it and from suggestion/solution you could copy the concept to your main program. 

Whenever you ask a question in StackOverflow or any forum and when preparing to ask the question itself, you would know that it would be a lot easier if you provided a sample data and say this the problem you are facing and this what i have tried, so far ? In python pandas world, you need to build small dataframes to build those examples. 

Here are few ways of creating new dataframes and generating data.    

1. [Empty dataframe ](#df1)
1. [Tuple technique](#df2)
1. [Dictionary with value lists](#df3)
1. [Array of Arrays / Lists of List ](#df4)
1. [Array of dictionary ](#df5)
1. [pd.Series to dataframe ](#df6)
1. [8x4 dataframe with some random data ](#df7)
1. [Single column list of alphabets](#df8)
1. [Dictionary to Dataframe ](#df9)
1. [Raw text to dataframe](#df10)    
1. [Dummy data : Generating a very big table](#df11)
--- 

<br/>

<a id="df1"></a>

##### Empty dataframe

```py 
# Starting from empty dataframe 
df = pd.DataFrame()

names = ['Gandolf','Gimli','Frodo','Legolas','Bilbo']
types = ['Wizard','Dwarf','Hobbit','Elf','Hobbit']
magic = [10, 1, 4, 6, 4]
aggression = [7, 10, 2, 5, 1]
stealth = [8, 2, 5, 10, 5]

df['names'], df['type'], df['magic_power'] = names, types, magic
df['aggression'], df['stealth'] = aggression, stealth

Output : 
+----+---------+--------+---------------+--------------+-----------+
|    | names   | type   |   magic_power |   aggression |   stealth |
|----+---------+--------+---------------+--------------+-----------|
|  0 | Gandolf | Wizard |            10 |            7 |         8 |
|  1 | Gimli   | Dwarf  |             1 |           10 |         2 |
|  2 | Frodo   | Hobbit |             4 |            2 |         5 |
|  3 | Legolas | Elf    |             6 |            5 |        10 |
|  4 | Bilbo   | Hobbit |             4 |            1 |         5 |
+----+---------+--------+---------------+--------------+-----------+
    
```

**Empty Dataframe with columns**    
```py
df_mv = pd.DataFrame(columns = ['movie_id', 'name', 'short_description', 'plot', 'rating'])

Output : 
+------------+--------+---------------------+--------+----------+
| movie_id   | name   | short_description   | plot   | rating   |
|------------+--------+---------------------+--------+----------|
+------------+--------+---------------------+--------+----------+

# When you add index, a null row will be added(meaning all columns will have null values)
df_mv = pd.DataFrame(columns = ['movie_id', 'name', 'short_description', 'plot', 'rating'], index=[0])

Output : 
+----+------------+--------+---------------------+--------+----------+
|    |   movie_id |   name |   short_description |   plot |   rating |
|----+------------+--------+---------------------+--------+----------|
|  0 |        nan |    nan |                 nan |    nan |      nan |
+----+------------+--------+---------------------+--------+----------+

# Adding values 
df_mv.loc[0] = [1, 'Abyss', 'Higher form of intelligent aliens', 'aliens under the ocean', 9]
Output : 
+----+------------+--------+-----------------------------------+------------------------+----------+
|    |   movie_id | name   | short_description                 | plot                   |   rating |
|----+------------+--------+-----------------------------------+------------------------+----------|
|  0 |          1 | Abyss  | Higher form of intelligent aliens | aliens under the ocean |        9 |
+----+------------+--------+-----------------------------------+------------------------+----------+
    
```    
<br/>
<a id="df2"></a>

##### Tuple technique

Here index is the `first` tuple variable
```py 
first   = ('Mike', 'Dorothee', 'Tom', 'Bill', 'Pete', 'Kate')
last    = ('Meyer', 'Maier', 'Meyer', 'Mayer', 'Meyr', 'Mair')
job     = ('data analyst', 'programmer', 'computer scientist', 
           'data scientist', 'programmer', 'psychiatrist')
language= ('Python', 'Perl', 'Java', 'Pithon', 'Pythen', 'Brainfuck')

data = list(zip(last, job, language)
Output : 
[('Meyer', 'data analyst', 'Python'),
 ('Maier', 'Web Developer', 'NodeJS'),
 ('Meyer', 'Enterprise Engineer', 'Java'),
 ('Mayer', 'Mainframe Developer', 'COBOL'),
 ('Meyr', 'Analyst', 'SAS'),
 ('Mair', 'psychiatrist', 'Brain Mechainic')]

df = pd.DataFrame(data, columns =['last', 'job', 'language'], index=first) 
Output : 
+----------+--------+---------------------+-----------------+
|          | last   | job                 | language        |
|----------+--------+---------------------+-----------------|
| Mike     | Meyer  | data analyst        | Python          |
| Dorothee | Maier  | Web Developer       | NodeJS          |
| Tom      | Meyer  | Enterprise Engineer | Java            |
| Bill     | Mayer  | Mainframe Developer | COBOL           |
| Pete     | Meyr   | Analyst             | SAS             |
| Kate     | Mair   | psychiatrist        | Brain Mechainic |
+----------+--------+---------------------+-----------------+

Note : Instead of a tuple, if it was a list, it would work in the same way. 
    
```    
<br/>
<a id="df3"></a>

##### Dictionary with value lists

```py
df = pd.DataFrame({'A': [0, 1, 2, 3, 4],
                   'B': ['foo', 'bar', 'bloo', 'blee', 'bloo'],
                   'C': ['green', 'red', 'blue', 'yellow', 'green']})

Output : 
+-----+------+--------+
|   A | B    | C      |
|-----+------+--------|
|   0 | foo  | green  |
|   1 | bar  | red    |
|   2 | bloo | blue   |
|   3 | blee | yellow |
|   4 | bloo | green  |
+-----+------+--------+
    
```    
<br/>
<a id="df4"></a>     

##### Array of Arrays / Lists of List 

```py 
data = [['tom', 10], ['nick', 15], ['juli', 14]] 
df = pd.DataFrame(data, columns = ['Name', 'Age']) 

Output : 
+--------+-------+
| Name   |   Age |
|--------+-------|
| tom    |    10 |
| nick   |    15 |
| juli   |    14 |
+--------+-------+
```
<br/>
<a id="df5"></a>     

##### Array of dictionary 

```py 
# Third item in array doesn't have key 'a'
data = [{'a': 1, 'b': 2, 'c':3}, {'a':10, 'b': 20, 'c': 30}
        , {'b': 2, 'c':3}] 
df = pd.DataFrame(data) 

Output : 
+-----+-----+-----+
|   a |   b |   c |
|-----+-----+-----|
|   1 |   2 |   3 |
|  10 |  20 |  30 |
| nan |   2 |   3 |
+-----+-----+-----+

# 'a1' completely happens to be a new column
data = [{'a': 1, 'b': 2, 'c':3}, {'a':10, 'b': 20, 'c': 30}
        , {'b': 2, 'c':3}] 
df = pd.DataFrame(data, columns=['a', 'a1', 'b', 'c']) 

Output : 
+-----+------+-----+-----+
|   a |   a1 |   b |   c |
|-----+------+-----+-----|
|   1 |  nan |   2 |   3 |
|  10 |  nan |  20 |  30 |
| nan |  nan |   2 |   3 |
+-----+------+-----+-----+
```
<br/>
<a id="df6"></a>     

##### pd.Series to dataframe 

```py 
d = {'one' : pd.Series([10, 20, 30, 40], index =['a', 'b', 'c', 'd']), 
	'two' : pd.Series([10, 20, 30, 40], index =['d', 'c', 'b', 'a'])} 
df = pd.DataFrame(d) 

Output : 
+-------+-------+
|   one |   two |
|-------+-------|
|    10 |    40 |
|    20 |    30 |
|    30 |    20 |
|    40 |    10 |
+-------+-------+

```    
<br/>
<a id="df7"></a>

##### 8x4 dataframe with some random data

```py 
# Generates date 
dates = pd.date_range('1/1/2000', periods=8)

df = pd.DataFrame(np.random.randn(8, 4), index=dates, columns=['A', 'B', 'C', 'D'])

Output : 
+---------------------+------------+-----------+-----------+------------+
|                     |          A |         B |         C |          D |
|---------------------+------------+-----------+-----------+------------|
| 2000-01-01 00:00:00 | -1.05128   |  0.238627 |  0.106378 |  1.10883   |
| 2000-01-02 00:00:00 |  0.314559  |  1.8427   |  0.282821 | -1.47774   |
| 2000-01-03 00:00:00 | -0.638806  |  0.139111 |  1.08201  |  0.35632   |
| 2000-01-04 00:00:00 |  1.44253   | -0.113561 |  0.829517 |  0.581576  |
| 2000-01-05 00:00:00 | -1.40117   | -2.12707  |  0.127889 |  0.721586  |
| 2000-01-06 00:00:00 |  0.724627  |  0.186909 | -0.56129  | -0.528885  |
| 2000-01-07 00:00:00 | -0.0975346 | -0.343885 | -0.589784 |  0.0576514 |
| 2000-01-08 00:00:00 | -1.56196   |  0.343319 | -0.172569 | -0.232157  |
+---------------------+------------+-----------+-----------+------------+

```
<br/>
<a id="df8"></a>     

##### Single column list of alphabets

```python
import string
df = pd.DataFrame({'alpha': list(string.ascii_lowercase)})

Output : 
+----+---------+
|    | alpha   |
|----+---------|
|  0 | a       |
|  1 | b       |
|  2 | c       |
|  3 | d       |
|  4 | e       |
|  5 | f       |
|  6 | g       |
|  7 | h       |
|  8 | i       |
|  9 | j       |
| 10 | k       |
| 11 | l       |
| 12 | m       |
| 13 | n       |
| 14 | o       |
| 15 | p       |
| 16 | q       |
| 17 | r       |
| 18 | s       |
| 19 | t       |
| 20 | u       |
| 21 | v       |
| 22 | w       |
| 23 | x       |
| 24 | y       |
| 25 | z       |
+----+---------+
    
```    
<br/>
<a id="df9"></a>     

##### dictionary to Dataframe 

```py 
data = {'row_1': [3, 2, 1, 0], 'row_2': ['a', 'b', 'c', 'd']}
df = pd.DataFrame.from_dict(data, orient='index',
                       columns=['A', 'B', 'C', 'D'])

Output : 
+-------+-----+-----+-----+-----+
|       | A   | B   | C   | D   |
|-------+-----+-----+-----+-----|
| row_2 | a   | b   | c   | d   |
| row_1 | 3   | 2   | 1   | 0   |
+-------+-----+-----+-----+-----+

```
<br/>

Here we create dataframe from a complex dictionary 
```py 
data = {"date":"2018-01-02","data":{"AAPL":{"open":"170.16","close":"172.26","high":"172.30","low":"169.26","volume":"25555934"}
                                    ,"MSFT":{"open":"86.13","close":"85.95","high":"86.31","low":"85.50","volume":"22483797"}
                                    }
        }
df = pd.DataFrame.from_dict(data)

Output : 
+------+------------------------------------------------------------------------------------------------+------------+
|      | data                                                                                           | date       |
|------+------------------------------------------------------------------------------------------------+------------|
| AAPL | {'high': '172.30', 'volume': '25555934', 'close': '172.26', 'low': '169.26', 'open': '170.16'} | 2018-01-02 |
| MSFT | {'high': '86.31', 'volume': '22483797', 'close': '85.95', 'low': '85.50', 'open': '86.13'}     | 2018-01-02 |
+------+------------------------------------------------------------------------------------------------+------------+

df = pd.concat([df['date'],df['data'].apply(pd.Series)], axis=1)
Output : 
+------+------------+---------+--------+--------+--------+----------+
|      | date       |   close |   high |    low |   open |   volume |
|------+------------+---------+--------+--------+--------+----------|
| AAPL | 2018-01-02 |  172.26 | 172.3  | 169.26 | 170.16 | 25555934 |
| MSFT | 2018-01-02 |   85.95 |  86.31 |  85.5  |  86.13 | 22483797 |
+------+------------+---------+--------+--------+--------+----------+

```
<br/>
<a id="df10"></a>

##### Raw text to dataframe

```python
import sys
if sys.version_info[0] < 3:
    from StringIO import StringIO
else:
    from io import StringIO
import pandas as pd
DF1 = StringIO("""
Date       Fruit  Num  Color 
2013-11-24 Banana 22.1 Yellow
2013-11-24 Orange  8.6 Orange
2013-11-24 Apple   7.6 Green
2013-11-24 Celery 10.2 Green
""")
DF2 = StringIO("""
Date       Fruit  Num  Color 
2013-11-24 Banana 22.1 Yellow
2013-11-24 Orange  8.6 Orange
2013-11-24 Apple   7.6 Green
2013-11-24 Celery 10.2 Green
2013-11-25 Apple  22.1 Red
2013-11-25 Orange  8.6 Orange
""")
df1 = pd.read_csv(DF1, sep='\s+')
df2 = pd.read_csv(DF2, sep='\s+')

dfs_dictionary = {'DF1':df1,'DF2':df2}
df=pd.concat(dfs_dictionary)

print(tabulate(df, headers='keys', tablefmt='psql', showindex=True))
# Output
+------------+------------+---------+-------+---------+
|            | Date       | Fruit   |   Num | Color   |
|------------+------------+---------+-------+---------|
| ('DF1', 0) | 2013-11-24 | Banana  |  22.1 | Yellow  |
| ('DF1', 1) | 2013-11-24 | Orange  |   8.6 | Orange  |
| ('DF1', 2) | 2013-11-24 | Apple   |   7.6 | Green   |
| ('DF1', 3) | 2013-11-24 | Celery  |  10.2 | Green   |
| ('DF2', 0) | 2013-11-24 | Banana  |  22.1 | Yellow  |
| ('DF2', 1) | 2013-11-24 | Orange  |   8.6 | Orange  |
| ('DF2', 2) | 2013-11-24 | Apple   |   7.6 | Green   |
| ('DF2', 3) | 2013-11-24 | Celery  |  10.2 | Green   |
| ('DF2', 4) | 2013-11-25 | Apple   |  22.1 | Red     |
| ('DF2', 5) | 2013-11-25 | Orange  |   8.6 | Orange  |
+------------+------------+---------+-------+---------+

```

<br/>
<a id="df10"></a>

##### Dummy data : Generating a very big table
Not sure how or when this would be useful, but you could do this as well. 

```python 
import numpy as np

# Add more zeros, you can hit memory limit
df = pd.DataFrame(np.random.randn(6000, 5000))

df.shape
# Output 
(6000, 5000)

df.info()
# Output 
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 6000 entries, 0 to 5999
Columns: 5000 entries, 0 to 4999
dtypes: float64(5000)
memory usage: 228.9 MB
```

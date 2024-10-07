---
title: Python tips
date: 2022-08-06
description: Tips to improve python programming skills
tags:
  - python
  - pandas
slug: "/31-python-tips"
---

**Last updated** : 06/Aug/2022     

Events are in reverse chronological order. 
* 2022/08/06 - [Find and delete specific keys from dict](#pt12)
* 2022/08/06 - [Updating dataframe with another dataframe](#pt11)
* 2022/08/02 - [Find null on specific columns](#pt14)
* 2022/07/27 - [Convert specific column types](#pt13)
* 2021/10/01 - [Convert dictionaries into values of variable of same name as key](#pt10)
* 2021/09/28 - [Getting time differences for comparisons](#pt09)
* 2021/09/27 - [To know installed python versions](#pt08)
* 2021/09/27 - [Virtual Environment](#pt07)
* 2020/08/08 - [Drop duplicates, but ignore nulls](#pt06)
* 2020/07/06 - [Convert two arrays to dictionary](#pt05)
* 2020/07/12 - [View specific row by index](#pt04)
* 2020/07/20 - [Read all columns into pandas as object](#pt03)
* 2020/06/03 - [Common pandas options](#pt02)
* 2020/06/06 - [Display all columns of specific datatype](#pt01)
* 2020/04/11 - [Saving memory when reading CSV file in pandas](23-pytip-saving-memory-when-reading-csv-file-in-pandas)

---
<br/>


<a id="pt12"></a>

##### Find and delete specific keys from dict

Lets assume if *nc* dict has keys like `cur_7, cur_6, cur_5, cur_4, cur_3, cur_2, cur_1, cur` and we want to keep keys `cur` and delete all keys greater than 4. 

```py
nc = ['cur_7', 'cur_6', 'cur_5', 'cur_4', 'cur_3', 'cur_2', 'cur_1', 'cur']
temp = []
for k, v in nc.items():
    print(k, v)
    if(v=='cur'):
        continue
    num = int(v[4:])
    print(num)
    if(num > 4):
        temp.append(k)
        
print(temp)        
[nc.pop(k, None) for k in temp]
print(nc)
```

<a id="pt11"></a>

##### Updating dataframe with another dataframe

```py
# Column names should be same be df1 and df2 for it to be updated
df1.set_index(['sc_code'], inplace=True)
df1.update(df2.set_index(['sc_code']))
df1.reset_index(inplace=True)
```

<a id="pt14"></a>

##### Find null on specific columns

```py
-- Find rows which has null or NaN in any column
df[df.isnull().any(axis=1)]


cols = ['cur_4', 'cur_3', 'cur_2', 'cur_1', 'cur']
-- Find null on specific columns
df_pivot_avg = df_pivot_avg[df_pivot_avg[cols].isnull().all(axis=1)].copy()

-- Find nonnull on specific columns
df_pivot_avg = df_pivot_avg[df_pivot_avg[cols].notnull().all(axis=1)].copy()
```

<a id="pt13"></a>

##### Convert specific column types

```py
s = df.select_dtypes(include='object').columns
df[s] = df[s].astype("float")
```

<a id="pt10"></a>

##### Convert dictionaries into values of variable of same name as key

```py
# Contents of input file walkPath.txt
bucket=bucket-name
pattern=*
root=./tmp

# Py Code
if Path('walkPath.txt').is_file(): # file exists
    temp = [line.rstrip() for line in open('walkPath.txt')]
    for i in temp:
        key, val = i.split('=')
        exec(key + '=val')
        print(key, val)

# If it was a actual JSON dictionary
d = {'bucket':'bucket-name', 'root':'./tmp'}
for key,val in d.items():
    exec(key + '=val')
```

<a id="pt09"></a>

##### Getting time differences for comparisons

```py
import datetime
import time

t1 = datetime.datetime.now()
print("Local Time: ",datetime.datetime.now())
time.sleep(5)
t2 = datetime.datetime.now()
print("Local Time: ",t2)
print("Time taken: ",t2-t1)

print((t2 - t1).total_seconds())
minutes_diff = (t2 - t1).total_seconds() / 60.0
print(minutes_diff)

# Output
Local Time:  2021-09-29 08:04:43.191698
Local Time:  2021-09-29 08:04:48.195868
Time taken:  0:00:05.004170
5.00417
0.08340283333333334 
```

<a id="pt08"></a>

##### To know installed python versions

```sh
(env) D:\BigData\12. Python\1. Tryouts\Beam>py -0p
Installed Pythons found by py Launcher for Windows
 (venv)         D:\BigData\12. Python\1. Tryouts\Beam\env\Scripts\python.exe *
 -3.9-64        python3.9.exe
 -3.7-64        C:\Users\Sushanth\Anaconda3\python.exe
 -3.5-32        C:\Users\Sushanth\AppData\Local\Programs\Python\Python35-32\python.exe
```

<a id="pt07"></a>

##### Virtual Environments

```py
cd your-project
python3 -m venv env

.\env\Scripts\activate

# Install any packages
pip3 install google-cloud-storage
pip3 install --upgrade google-cloud-storage

pip3 install wheel
pip3 install apache-beam[gcp]

# Listing installed packages
pip3 list
pip3 freeze --all > requirements.txt

# When done
deactivate

# Later in a new environment can use below command to install packages in requirement.txt
pip3 install -r requirements.txt
```



<a id="pt06"></a>

##### Drop duplicates, but ignore nulls
```py
# Creating a sample dataframe
df = pd.DataFrame()
names = ['Gandolf', 'Gandolf','Gimli','Frodo','Legolas','Bilbo', 'Aragorn', 'Arwen']
types = ['Wizard', 'Wizard','Dwarf','Hobbit','Elf','Hobbit', np.nan, np.nan]
magic = [0, 10, 1, 4, 6, 4, np.nan, np.nan]
aggression = [0, 7, 10, 2, 5, 1, np.nan, np.nan]
stealth = [0, 8, 2, 5, 10, 5, np.nan, np.nan]
df['names'], df['type'], df['magic_power'] = names, types, magic
df['aggression'], df['stealth'] = aggression, stealth

df
+----+---------+--------+---------------+--------------+-----------+
|    | names   | type   |   magic_power |   aggression |   stealth |
|----+---------+--------+---------------+--------------+-----------|
|  0 | Gandolf | Wizard |             0 |            0 |         0 |
|  1 | Gandolf | Wizard |            10 |            7 |         8 |
|  2 | Gimli   | Dwarf  |             1 |           10 |         2 |
|  3 | Frodo   | Hobbit |             4 |            2 |         5 |
|  4 | Legolas | Elf    |             6 |            5 |        10 |
|  5 | Bilbo   | Hobbit |             4 |            1 |         5 |
|  6 | Aragorn | nan    |           nan |          nan |       nan |
|  7 | Arwen   | nan    |           nan |          nan |       nan |
+----+---------+--------+---------------+--------------+-----------+
```

Here we have two sets of duplicates and as per the command we are keeping the last and eliminating the first. 
```py
df1 = df[(~df['type'].duplicated(keep='last'))]
+----+---------+--------+---------------+--------------+-----------+
|    | names   | type   |   magic_power |   aggression |   stealth |
|----+---------+--------+---------------+--------------+-----------|
|  1 | Gandolf | Wizard |            10 |            7 |         8 |
|  2 | Gimli   | Dwarf  |             1 |           10 |         2 |
|  4 | Legolas | Elf    |             6 |            5 |        10 |
|  5 | Bilbo   | Hobbit |             4 |            1 |         5 |
|  7 | Arwen   | nan    |           nan |          nan |       nan |
+----+---------+--------+---------------+--------------+-----------+
```

General idea is NaNs are suppose to be incomparable as it basically means 'no value'. So, comparing no values and keeping the last does not make sense. So, we do this and here we are maintaining the uniqueness and keeping nulls
```py
df1 = df[(~df['type'].duplicated(keep='last')) | df['type'].isna()]
+----+---------+--------+---------------+--------------+-----------+
|    | names   | type   |   magic_power |   aggression |   stealth |
|----+---------+--------+---------------+--------------+-----------|
|  1 | Gandolf | Wizard |            10 |            7 |         8 |
|  2 | Gimli   | Dwarf  |             1 |           10 |         2 |
|  4 | Legolas | Elf    |             6 |            5 |        10 |
|  5 | Bilbo   | Hobbit |             4 |            1 |         5 |
|  6 | Aragorn | nan    |           nan |          nan |       nan |
|  7 | Arwen   | nan    |           nan |          nan |       nan |
+----+---------+--------+---------------+--------------+-----------+
```

<a id="pt05"></a>

##### Convert two arrays to dictionary
```py
keys = ['a', 'b', 'c']
values = [1, 2, 3]
dictionary = dict(zip(keys, values))
print(dictionary)

# output
{'b': 2, 'a': 1, 'c': 3}

```    

<br/> 
<a id="pt04"></a>

##### View specific row by index     

```py
df_joined.loc[[28]]
df_joined.iloc[[27]]
```    

<br/>
<a id="pt03"></a>

##### Read all columns into pandas as object
```py
df = pd.read_csv(osfp_file, sep='|', names=all_cols, usecols=use_cols ,skip_blank_lines=True, dtype=object)
```
 
<br/>

<a id="pt02"></a>

##### Common pandas options
```py
pd.set_option('display.max_columns', None)
pd.set_option('display.max_colwidth', 200)

# To display all rows
pd.set_option('display.max_rows', None) 

# Setting limit to display max 100 rows
pd.set_option('display.max_rows', 100)

# When there are lots of columns (by default 100+) then df.info() wouldn't show all the columns, 
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 3984 entries, 0 to 3983
Columns: 114 entries, name to process
dtypes: datetime64[ns](10), float64(68), int64(1), object(35)
memory usage: 2.9+ MB

# When that happens, you can use, 
df.info(verbose=True, null_counts=True)

# What option sets that default 100 is this
pd.options.display.max_info_columns 

print('Max columns in display setting: ', pd.get_option('max_columns'))
```
 
<br/> 
<a id="pt01"></a>

##### Display all columns of specific datatype

If you have a column naming convention, like in column name itself we can identify datatype, you can use below method to get those columns. Here we are trying to get date columns, 

**Method 1**    

```py
[col for col in df_companies.columns if 'date' in col.lower()]
```

**Method 2**    

```py
df_companies['lastraded'].dtypes
# Output:
dtype('<M8[ns]')

df_companies.dtypes[df_companies.dtypes=='<M8[ns]']

# Output:
lastraded       datetime64[ns]
QresultDate     datetime64[ns]
PLResultDate    datetime64[ns]
BSResultDate    datetime64[ns]
RResultDate     datetime64[ns]
CFResultDate    datetime64[ns]
YRResultDate    datetime64[ns]
HiDate          datetime64[ns]
LoDate          datetime64[ns]
TVDate          datetime64[ns]
dtype: object
```

**Method 3**    

```py
dtCols = list(df_companies.select_dtypes(include=['datetime']).columns)
```

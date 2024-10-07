---
title: Python Errors & Solutions
date: 2020-08-08
description: Python errors and solutions bank
tags: 
  - python 
  - numpy 
  - pandas 
  - e&s
slug: "/python-errors-and-solution"
---
**Last updated** : 08/August/2020     

Events are in reverse chronological order. 
* 2020/08/08 - [AttributeError: 'float' object has no attribute 'lower'](#bl5)
* 2020/08/08 - [ImportError: lxml not found, please install it](#bl4)
* 2020/07/06 - [tuple indices must be integers or slices, not str](#bl3)
* 2020/04/17 - [TypeError: unorderable types: datetime.date() > str()](#bl2)
* 2020/04/03 - [TypeError: 'tuple' object is not callable](#bl1)

--- 

<a id="bl5"></a>

##### Error : AttributeError: 'float' object has no attribute 'lower'
Error occurs in this line when trying to convert case to lower. 
```py
df_tc['name'] = df_tc['name'].apply(lambda x: x.lower())

# In df_tc.info(), it confirms its an object but executing above line, it fails
name         3754 non-null object
```

Why this error occured because NaNs are considered as float ? I got to find that by doing 
```py
for row in df_tc.itertuples(): 
    if(type(row.name) is not str):
        print(row.Index, type(row.name))

# Output
14 <class 'float'>
21 <class 'float'>
....

df_tc.loc[14]
# Output
dt           2020-07-03
name                NaN
cl                 0.76
Name: 14, dtype: object
```

**Solution** :    
```py
df_tc['name'] = df_tc.name.str.lower()

```


<a id="bl4"></a>

##### Error : ImportError: lxml not found, please install it

**Installing in Jupyter**     
```py
import sys
!{sys.executable} -m pip install lxml

**Output**    
Requirement already satisfied: lxml in c:\users\sushanth\appdata\local\programs\python\python35-32\lib\site-packages (4.5.2)
```

To know where its installed,     
```py
import lxml
lxml.__path__
```

This error you get even after you have installed everything,
```py 
import lxml
import requests
import html5lib
import BeautifulSoup4

import sys
!{sys.executable} -m pip install BeautifulSoup4
```

When you execute the below code,
```py
url = 'https://en.wikipedia.org/wiki/List_of_elevator_accidents'
tables = pd.read_html(url)
 
print(tables)

#Output :
ImportError: lxml not found, please install it
```

**Solution** :    

You have to Restart Kernel in Jupyter


<a id="bl3"></a>

##### Error : tuple indices must be integers or slices, not str

When looping dataframe trying to get a value from dataframe cell, got the error. 
```py
row[rd_Qcolname] 
```

**Solution** : 
```py
getattr(row, rd_Qcolname)
```


<a id="bl2"></a>

##### Error : TypeError: unorderable types: datetime.date() > str()    
**Date**  : 17/April/2020    

When executing the below line in pandas, got that error.
```py
df_temp[df_temp['ts'] > dt_3d]

# Error : 
# TypeError: unorderable types: datetime.date() > str()
```

**Analysis**     

```py
print(type(df_temp['ts']))    # <class 'pandas.core.series.Series'>
print(type(df_temp['ts'][0])) # <class 'datetime.date'>
print(type(dt_3d))            # <class 'str'>
```

Update 1 : Updated like below, still got an error. 
```py
df_temp[df_temp['ts'] > pd.to_datetime(dt_3d)]

# Error : 
# TypeError: Cannot compare type 'Timestamp' with type 'date'
```

**Solution** : 

Update 2 : `df_temp[df_temp['ts'] > pd.to_datetime(dt_3d).date()]`    

**Worked**


<a id="bl1"></a>

##### Error : TypeError: 'tuple' object is not callable    

```py
for i in range(10): 
    print(i, end =" ") 

---------------------------------------------------------------------------
TypeError                                 Traceback (most recent call last)
<ipython-input-324-e27c647546fc> in <module>
----> 1 for i in range(10):
      2     print(i, end =" ")

TypeError: 'tuple' object is not callable
```

**Solution** : This took some time to solve. I had used keyword `range` as a variable. 
```py
print(range)

(201913, 201915)
```

Solution is `del range` and then the loop worked. 
```py
for i in range(10): 
    print(i, end =" ") 

0 1 2 3 4 5 6 7 8 9 
```

 
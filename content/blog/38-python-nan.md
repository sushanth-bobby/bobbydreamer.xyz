---
title: Python Nulls
date: 2020-08-31
description: All about nulls in python
tags:
  - python
  - pandas
  - notes
slug: "/38-python-nan"
---

Null is just absence of a value in a variable. You can use null when you cannot specify any default value where any value would mean something.

```py 
>>> def has_no_return():      #<- Defining a function which doesn't return anything
...      pass
...
>>> has_no_return()           #<- When called, it doesn't return anything as expected
>>> print(has_no_return())    #<- When the function called using print(), which actually needs to print something
None                          #<- prints NONE as function didnt return anything, it printed NONE
>>>                           #   a hidden value called None
```

Why its so important in python ? There are two ways to say a variable is null in Python. Its confusing and it causes issues unnecessarily and breaks stuff. 
* None 
* np.nan

#### # None

None is a object in python and objects are usually String class. 

  ```py
  >>> type(None)
  <class 'NoneType'>
  ```

* None is a keyword, just like True and False, so you cannot declare it as a variable. 

* None is a singleton. That is, the NoneType class will only point to same single instance of None in the program. You can create many variables and assign NONE to it and all the variables will point to same instance of None. 

  ```py 
  >>> id(None)
  1560644480
  >>> a = None
  >>> b = None
  >>> id(a)
  1560644480
  >>> id(b)
  1560644480
  ```

* When checking whether a value is null or not null, should use identity operators(is, is not) rather than equality operators(==, !=). [Sidetrack 1](#st1)

* None is falsy meaning it will be evaluated to false. If you want to know whether a condition is true/false. You can test like below, 
  ```py
  >>> a = 'hi'
  >>> if a:                     #<- 'a' has 'hi' value. 
  ...   print(a)
  ... else:
  ...   print('Other than a')
  ... 
  hi                            #<- if condition tested to True and printed 'hi'

  >>> a=''                      
  >>> if a:                     #<- 'a' has blank value
  ...   print(a)
  ... else:
  ...   print('Other than a')
  ... 
  Other than a                  #<- if condition tested false. Actually it should have printed <blank>, right?. 
                                #   What happened ? Falsy 
  ```
  Truthy and Falsy are in [Sidetrack 2](#st2)


#### # np.nan
NaN means (Not-A-Number). 

> The IEEE-754 standard defines a NaN as a number with all ones in the exponent, and a non-zero significand. The highest-order bit in the significand specifies whether the NaN is a signaling or quiet one. The remaining bits of the significand form what is referred to as the payload of the NaN.

```py 
>>> import numpy as np
>>> np.nan==np.nan      #<- It is how it is. 
False
```
To know why it is like that refer [Sidetrack 3](#st3)

Multiple ways to check, whether a value is NaN. Recommendation is, if you are using Pandas use pandas, if you are using Numpy use numpy, if you are not using both use Math. Why ? `import` takes space, `import math` is around 2MB other two are > 10MB 

```py 
import pandas as pd
import numpy as np
import math

#For single variable all three libraries return single boolean
x1 = float("nan")

print("It's pd.isna    : {}".format(pd.isna(x1)) )
print("It's pd.isnull  : {}".format(pd.isnull(x1)) )
print("It's np.isnan   : {}".format(np.isnan(x1)) )
print("It's math.isnan : {}".format(math.isnan(x1)) )

# Output
It's pd.isna    : True
It's pd.isnull  : True
It's np.isnan   : True
It's math.isnan : True
```

#### All nulls/nans are not same 

```py 
print(math.nan is math.nan)     #<- True
print(math.nan is np.nan)       #<- False
print(math.nan is float('nan')) #<- False
```

Why ? They all have different IDs. 

  ```py
  >>> id(math.nan), id(np.nan), id(float('nan'))  
  (32474464, 32473712, 225025248)
  ```

#### Automatic conversions
Numpy/Pandas can convert column/series to float or object based on None/np.nan values, if you don't handle it. 

Here, because of None the array is converted to Object dtype. 

  ```py
  >>> vals1 = np.array([1, None, 3, 4])
  >>> vals1
  array([1, None, 3, 4], dtype=object)
  >>> vals1.sum()
  Traceback (most recent call last):
    File "<stdin>", line 1, in <module>
    File "C:\Users\Sushanth\AppData\Local\Programs\Python\Python35-32\lib\site-packages\numpy\core\_methods.py", line 38, in _sum
      return umr_sum(a, axis, dtype, out, keepdims, initial, where)
  TypeError: unsupported operand type(s) for +: 'int' and 'NoneType'
  >>>
  ```

`np.nan` makes it a float64. Instead of NaN, if a numeric was there, it would have been int32

  ```py
  >>> vals1 = np.array([1, np.nan, 3, 4])     
  >>> vals1
  array([ 1., nan,  3.,  4.])
  >>> type(vals1), vals1.dtype 
  (<class 'numpy.ndarray'>, dtype('float64'))
  >>> vals1.sum()
  nan
  ```

`sum()` function in both the places triggered different type of error. In object dtype, it throws a TypeError and in float64, it returned nan. 

Below proves, you possibly cannot do any calculation, when you have NaN.  

```py
>>> 1 + np.nan
nan
```

This is true, when you are not using pandas. See the below example, there is no error. 

```py 
>>> import pandas as pd
>>> df = pd.DataFrame({'A': [0, 1, 2, 3, 4]})
>>> df['A'].sum()
10  
>>> df = pd.DataFrame({'A': [0, 1, 2, 3, np.nan]})
>>> df['A'].sum()
6.0
```

Why ? sum() in pandas has a option `skipnabool` and its default value is `True`. So by default, sum() will exclude all NA/null values when computing the result. So, when working in pandas its always better to check documentation is if any features or options available. 


#### Handling Nulls(np.nan, None) in Pandas/Numpy

There are only few ways of handling nulls, they are
1. Ignoring nulls 
1. Identifying nulls 
1. Dropping nulls rows/columns 
1. Replace nulls with some other values 

#### Ignoring nulls 

  Below are some ways numpy provides to ignore nans and perform simple calculations. 

  ```py 
  >>> vals1 = np.array([1, np.nan, 3, 4])     
  >>> np.nansum(vals1), np.nanmin(vals1), np.nanmax(vals1)
  (8.0, 1.0, 4.0)
  ```

#### Identifying nulls 

  ```py 
  data = pd.Series([1, np.nan, 3, 4])
  >>> data.isnull()
  0    False
  1     True
  2    False
  3    False
  dtype: bool

  >>> data[data.isnull()]     #<- data.isna() also gives the same result
  1   NaN
  dtype: float64

  >>> data[data.notnull()]   
  0    1.0
  2    3.0
  3    4.0
  dtype: float64
  >>>
  ```


#### Dropping nulls rows/columns 

```py 
>>> data = pd.Series([1, np.nan, 3, 4])
>>> data.dropna()
0    1.0                  #<- Here data in index[1] is dropped
2    3.0
3    4.0
dtype: float64
>>>
```

Here you can observe that you cannot drop single value from a DataFrame. In the below example you can see, a entire row getting removed. Options are availble to entire column as well. Sometimes this type of result may not be desirable. 

```py 
>>> df = pd.DataFrame([[1,      np.nan, 5],
...                    [2,      3,      6],
...                    [np.nan, 4,      7]])

>>> df
     0    1  2
0  1.0  NaN  5
1  2.0  3.0  6
2  NaN  4.0  7

>>> df.dropna()  
     0    1  2
1  2.0  3.0  6
```

`df.dropna()` has multiple options, 
* `df.dropna(axis='columns')` : drops all columns that has a null value. Instead of `axis='columns'`, `axis=1` can be mentioned. 
* `df.dropna(axis='rows')` : drops all rows that has a null value. Instead of `axis='rows'`, `axis=0` can be mentioned. 
* `df.dropna(how='any')` : (default). Default axis is rows
* `df.dropna(how='all')` : Drop rows or columns which has all nulls, by default it drops rows(axis=0). 

```py 
>>> df = pd.DataFrame([[1,      np.nan, 5],
...                    [2,      3,      6],
...                    [np.nan, 4,      7]])

>>> df.dropna(axis='columns')
   2
0  5
1  6
2  7

>>> df.dropna(axis='rows')
     0    1  2
1  2.0  3.0  6

>>> df.dropna(how='any')
     0    1  2
1  2.0  3.0  6

>>> df = pd.DataFrame([[np.nan,      np.nan, np.nan],
...                    [np.nan,      3,      6],
...                    [np.nan, 4,      7]])
>>> 
>>> df.dropna(how='all')          #<- It dropped first row
    0    1    2
1 NaN  3.0  6.0
2 NaN  4.0  7.0
>>>
>>> df.dropna(how='all', axis=1)  #<- It dropped first column  
     1    2
0  NaN  NaN
1  3.0  6.0
2  4.0  7.0
```

To have more control on the non-values to be kept, you can specify `thresh=2', having 2 as its parameter means, atleast 2 non-null values should be there in the row/column. 

```py 
df = pd.DataFrame([[np.nan, np.nan, np.nan],
                   [np.nan, 3,      6],
                   [np.nan, 4,      7]])

>>> df.dropna(thresh=2)           #<- Default axis='rows' or axis=0, so first row is dropped
    0    1    2
1 NaN  3.0  6.0
2 NaN  4.0  7.0
>>>
>>> df.dropna(axis=1, thresh=2)   
     1    2
0  NaN  NaN
1  3.0  6.0
2  4.0  7.0
```

#### Replace nulls with some other values 

  ```py 
  # This option fills all nulls to a predefined value. 
  >>> data = pd.Series([1, np.nan, 3, 4])
  >>> data.fillna(0)
  0    1.0
  1    0.0
  2    3.0
  3    4.0
  dtype: float64

  >>> data.fillna(method='bfill')   #<- bfill is backward fill. Data in index[2] is filled in index[1]
  0    1.0
  1    3.0
  2    3.0
  3    4.0
  dtype: float64

  >>> df = pd.DataFrame([[np.nan, 1, np.nan],
  ...                    [2, np.nan,      3],
  ...                    [np.nan, 4,      7]])
  >>> 
  >>> df.fillna(method='ffill', axis=1) # Here we are forward filling at column level( Left -> Right )
      0    1    2      #<- df[column][row]
  0  NaN  1.0  1.0      #<- Data in df[1][0] is filled in df[2][0]
  1  2.0  2.0  3.0      #<- Data in df[0][1] is filled in df[1][1]
  2  NaN  4.0  7.0      #<- There is nothing to forward fill as nan is in df[0][2]

  >>> df.fillna(method='bfill', axis=0)  # Here we are backward filling at row level (Bottom to Top)
      0    1    2
  0  2.0  1.0  3.0      #<- Data in df[0][1] & df[2][1] is filled in df[0][0] & df[2][0]
  1  2.0  4.0  3.0      #<- Data in df[1][2] is filled in df[1][1]
  2  NaN  4.0  7.0      #<- Null in df[0][2] is left as in. 
  ```

Above we have seen filling nulls for the full dataframe. It can be filled column-wise as well. Below are some examples

  ```py 
  # Pandas
  df['col1'] = df['col1'].fillna(0)

  # Numpy 
  df['col1'] = df['col1'].replace(np.nan, 0)
  ```


#### Counting number of nulls in row/columns 

  ```py 
  >>> df = pd.DataFrame([[1     , 1,      np.nan],
  ...                    [np.nan, np.nan, np.nan],
  ...                    [np.nan, 4,           7]])
  >>> df
      0    1    2
  0  1.0  1.0  NaN
  1  NaN  NaN  NaN
  2  NaN  4.0  7.0
  >>> df.isnull().sum(axis=1)  #<- Counts all nulls in columns by row
  0    1
  1    3
  2    1
  dtype: int64

  >>> df.isnull().sum(axis=0)  #<- Counts all the nulls in rows by column
  0    2
  1    1
  2    2
  dtype: int64
  ```

<a id="st1"></a>    

#### # Sidetrack 1 : Identity Operators Vs. Equality Operators

1. **Identity operator** : We can use identity operation to check data type of a variable
  - Two identity operators available are `is` and `is not`

  ```py {19,27}
  >>> a = 'hi'
  >>> b = 'hello'
  >>> id(a)
  21506528            #<- Variable a's ID
  >>> id(b)
  21100928            #<- Variable b's ID

  >>> type(a)
  <class 'str'>       #<- data type of variable a is string

  >>> id(str) 
  1560662608          #<- ID of str 

  >>> id(type(a))
  1560662608          #<- ID of data type of variable a. It is the ID of str class
  >>> id(type(b))
  1560662608          #<- ID of data type of variable b. It is the ID of str class

  >>> type(a) is str
  True                #<- So obviously, its going to be true.  

  >>> b = 1           #<- Assigning integer value to variable b
  >>> id(b)
  1560762640          #<- Now variable b has different ID
  >>> type(b)
  <class 'int'>
  >>> type(b) is not str
  True                #<- Now we definitely know that variable b is not a string
  ```

2. **Equality operator** : Checks whether the two values are equal(which is defined from object to object)
	- Two operators available are `==` and `!=`

  ```py 
  >>> a = 'hi'
  >>> print(a)
  hi
  >>> a is None
  False
  >>> a == None
  False
  >>> a != None     #<- At this point you can think, to check for None, you can use equality operator itself. 
  True              #   Its not recomended
  ```

Its not recommended because PEP 8 says so :
> "Comparisons to singletons like None should always be done with 'is' or 'is not', never the equality operators."

Check the below example, copied from [realpython.com](https://realpython.com/null-in-python/)

  ```py 
  >>> class BrokenComparison:
  ...      def __eq__(self, other):
  ...          return True
  ... 
  >>> b = BrokenComparison()
  >>> b == None
  True
  ```

The equality operators can be fooled when you're comparing user-defined objects that override them. Here, the equality operator == returns the wrong answer. The identity operator is, on the other hand, can't be fooled because you can't override it.

This again works, but not recommended. So should be careful, not to use it. None by definition is absence of value (null). Here whats happening is comparing the id() of None, which is going to exact same memory location, so None comparison becomes True. Python tests object's identity first meaning it checks whether the objects are found at the same memory address.

  ```py
  >>> None==None
  True
  >>> id(None)    #<- Both the None will be pointing to same id()
  1560644480
  ```

Expanding the above bit more. Check[ [Ref1](https://stackoverflow.com/questions/47721635/in-operator-floatnan-and-np-nan) ]

  ```py 
  >>> nans = [None for i in range(2)]         #<- Adding None to list 
  >>> list(map(id, nans))                     #<- printing the id()'s of None 
  [1539541888, 1539541888]                    #<- As expected they have same ID

  >>> nans = [np.nan for i in range(2)]       #<- Adding numpy.nan to list 
  >>> list(map(id, nans))                     #<- printing the id()'s of np.nan 
  [32473712, 32473712]                        #<- As expected they have same ID

  >>> nans = [float("NaN") for i in range(2)] #<- Adding float("NaN") to list and thing to remember 
  >>> list(map(id, nans))                     #<- is each call to float("NaN") creates a new object. 
  [26864592, 201935840]                       #<- Different ID's meaning they are different objects. 
  ```

To check if the item is in the list, Python tests for object identity first, and then tests for equality only if the objects are different.

```py
>>> nans = [None, np.nan, float("NaN")]
>>> None in nans         #<- Object identity will return True and Python recognises the item in the list.
True
>>> np.nan in nans       #<- Object identity will return True and Python recognises the item in the list.
True
>>> float("NaN") in nans #<- False because two different NaN objects as you can see in above map example
False
>>> fnan = float("NaN")  #<- This is obviously true because you are refering to same item.
>>> fnan in [fnan]      
True
```

##### More Comparisons

This is always false, we should learn to live with it. Good points [here](https://stackoverflow.com/questions/1565164/what-is-the-rationale-for-all-comparisons-returning-false-for-ieee754-nan-values?rq=1) by Stephen Canon. 

  ```py
  >>> np.nan==np.nan
  False
  ```

##### Comparison 2

  ```py 
  >>> a=np.array([2, [3], 4])
  >>> a[1]==[3] 
  True
  >>> a==[3]
  array([False,  True, False])

  >>> b = np.array([None,[np.nan]])
  >>> b[1]==[np.nan]                #<- Comparing two lists and same NaN object and id() are compared. 
  True
  >>> b==[np.nan]                   #<- Here in the comparison, its False. Numpy checks values both are different. 
  array([False, False])
  ```

##### Comparison 3

  ```py
  >>> lst = [1,2,3]
  >>> id(lst)
  194154944
  >>> lst == lst[:]
  True              # <- This is True since the lists are "equivalent"
  >>> lst is lst[:]
  False             # <- This is False since they're actually different objects
  >>> id(lst[:])
  194156064
  >>>
  ```    

<a id="st2"></a>

#### # Sidetrack 2 : Truthy and Falsy values

When you are comparing values, there can be only two results, True or False which is a boolean and as of now i dont think there is a programming language supporting Not-a-Boolean(NaB). Usually expressions evaluate to these values. 

We can test expressions like below without operators, 

  ```py 
  a = 10
  if a:
    print(a)
  else:
    print('i hope variable has a value initialized')

  # Output 
  10

  a = 0
  if a:
    print(a)
  else:
    print('i hope variable has a value initialized')

  # Output 
  i hope variable has a value initialized
  ```

What happened in second example is because of the Concept of Truthy & Falsy. Here, 
* any condition that evaluate to false are falsy 
* any condition that evaluate to true are truthy 

Below are falsy values    

* empty lists : `[]`
* empty tuples : `()`
* empty dictionaries : `{}`
* empty sets : `set()`
* blank string : `"", ''`
* Number 0 : `0, 0.0`
* Boolean : `False`

Below are truthy values     

* non-empty data structures (lists, tuples, dictionaries, sets, strings)
* non-zero numeric values
* Boolean ( True )

Simple example in using Truthy

```py
name = "sushanth"
if len(name) > 0 :
  print('Hello {}'.format(name))
else:
  print('Wassap')

name = "sushanth"
if name:
  print('Hello {}'.format(name))
else:
  print('Wassap')
```

<a id="st3"></a>

#### # Sidetrack 3 : Possible reason why np.nan==np.nan is False

This is from [Reflexivity, and other pillars of civilization
](https://bertrandmeyer.com/2010/02/06/reflexivity-and-other-pillars-of-civilization/). This is a good read. 

Equality is reflexive (every value is equal to itself, at any longitude and temperature, no excuses and no exceptions); and the purpose of assignment is to make the value of the target equal to the value of the source.

**754 enters the picture**      

Now assume that the value of x is a NaN. If you use a programming language that supports IEEE 754 (as they all do, I think, today) the test in

> if x = x then …

is supposed to yield False. Yes, that is specified in the standard: NaN is never equal to NaN (even with the same payload); nor is it equal to anything else; the result of an equality comparison involving NaN will always be False.

I am by no means a numerics expert; I know that IEEE 754 was a tremendous advance, and that it was designed by some of the best minds in the field, headed by Velvel Kahan who received a Turing Award in part for that success.

Why the result is False ?
The conclusion is not that the result should be False. The rational conclusion is that True and False are both unsatisfactory solutions. The reason is very simple: in a proper theory (I will sketch it below) the result of such a comparison should be some special undefined below; the same way that IEEE 754 extends the set of floating-point numbers with NaN, a satisfactory solution would extend the set of booleans with some NaB (Not a Boolean). But there is no NaB, probably because no one (understandably) wanted to bother, and also because being able to represent a value of type BOOLEAN on a single bit is, if not itself a pillar of civilization, one of the secrets of a happy life.

If both True and False are unsatisfactory solutions, we should use the one that is the “least” bad, according to some convincing criterion . That is not the attitude that 754 takes; it seems to consider (as illustrated by the justification cited above) that False is somehow less committing than True. But it is not! Stating that something is false is just as much of a commitment as stating that it is true. False is no closer to NaB than True is. A better criterion is: which of the two possibilities is going to be least damaging to time-honored assumptions embedded in mathematics? One of these assumptions is the reflexivity of equality: come rain or shine, x is equal to itself. Its counterpart for programming is that after an assignment the target will be equal to the original value of the source. This applies to numbers, and it applies to a NaN as well.

Note that this argument does not address equality between different NaNs. The standard as it is states that a specific NaN, with a specific payload, is not equal to itself.

--- 


And this is where i stopped and decided not to go further in this subject.


### References
1. [S.O : in operator, float(“NaN”) and np.nan](https://stackoverflow.com/questions/47721635/in-operator-floatnan-and-np-nan)
1. [S.O : What is the rationale for all comparisons returning false for IEEE754 NaN values?](https://stackoverflow.com/questions/1565164/what-is-the-rationale-for-all-comparisons-returning-false-for-ieee754-nan-values?rq=1)
1. [Reflexivity, and other pillars of civilization
](https://bertrandmeyer.com/2010/02/06/reflexivity-and-other-pillars-of-civilization/)
1. [S.O : More NaN Wars : Why is NaN not equal to NaN?](https://stackoverflow.com/questions/10034149/why-is-nan-not-equal-to-nan)
1. [Jake VanderPlas : Handling Missing Data](https://jakevdp.github.io/PythonDataScienceHandbook/03.04-missing-values.html)

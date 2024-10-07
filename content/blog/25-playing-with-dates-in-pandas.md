---
title: Python playing with dates
date: 2020-04-18
description: Date manipulation in python
tags:
  - python
  - pandas
slug: "/25-playing-with-dates-in-pandas"
---

I have a problem, which is trying to get a next available date from within list of dates. This list of dates contains dates which are not saturday/sunday or any public holiday. My inputs will be like, what was the first available date in last 180 days, plan is to build a function like below, 

```
d = current date - interval 180 days
d = get_next_available_date(d)
```

Breaking down the problem    

1. Get next available from any list of dates
1. Create function from point(1) solution to solve problem

#### 1. Get next available from any list of dates

Initializations
```py
# Initializing full feb dates
test_dates = ['01-02-2020', '02-02-2020', '03-02-2020', '04-02-2020', '05-02-2020',
 '06-02-2020', '07-02-2020', '08-02-2020', '09-02-2020', '10-02-2020', '11-02-2020',
 '12-02-2020', '13-02-2020', '14-02-2020', '15-02-2020', '16-02-2020', '17-02-2020',
 '18-02-2020', '19-02-2020', '20-02-2020', '21-02-2020', '22-02-2020', '23-02-2020',
 '24-02-2020', '25-02-2020', '26-02-2020', '27-02-2020', '28-02-2020', '29-02-2020']
```

Remove a week from feb between 09/02/2020 - 15/02/2020    
```py
del test_dates[8:15]
```

After removing a week data looks like this
```
print(test_dates)

#Output:

['01-02-2020', '02-02-2020', '03-02-2020', '04-02-2020',
 '05-02-2020', '06-02-2020', '07-02-2020', '08-02-2020', '16-02-2020', '17-02-2020',
 '18-02-2020', '19-02-2020', '20-02-2020', '21-02-2020', '22-02-2020', '23-02-2020',
 '24-02-2020', '25-02-2020', '26-02-2020', '27-02-2020', '28-02-2020', '29-02-2020']
```

Converts string to datetime format
```py
get_datetime = lambda s: dt.datetime.strptime(s, '%d-%m-%Y')
```

Main logic to get the next available date
```py
base_date = '10-02-2020'
base = get_datetime(base_date)

# Converting all the dates to datetime format
availdates = list(map(lambda d: get_datetime(d), test_dates))
print('\n Base date =',base, 'Type =',type(base))
print('\n Available dates =\n',availdates, 'Type =',type(availdates), 'Element Type =', type(availdates[0]))

# Filtering the dates greater than base date
later = filter(lambda d: d > base, availdates)

# Finding the minimum date among the dates greater than base date
closest_date = min(later)
print('\n Next available date =',closest_date, 'Type =',type(closest_date))
print('\n Next available date =',closest_date.strftime("%Y-%m-%d"), 'Type =',type(closest_date.strftime("%Y-%m-%d")))
```

Output:
```py {9,11}
test_dates after removing a week = 
 ['01-02-2020', '02-02-2020', '03-02-2020', '04-02-2020', '05-02-2020', '06-02-2020', '07-02-2020', '08-02-2020', '16-02-2020', '17-02-2020', '18-02-2020', '19-02-2020', '20-02-2020', '21-02-2020', '22-02-2020', '23-02-2020', '24-02-2020', '25-02-2020', '26-02-2020', '27-02-2020', '28-02-2020', '29-02-2020']

 Base date = 2020-02-10 00:00:00 Type = <class 'datetime.datetime'>

 Available dates =
 [datetime.datetime(2020, 2, 1, 0, 0), datetime.datetime(2020, 2, 2, 0, 0), datetime.datetime(2020, 2, 3, 0, 0), datetime.datetime(2020, 2, 4, 0, 0), datetime.datetime(2020, 2, 5, 0, 0), datetime.datetime(2020, 2, 6, 0, 0), datetime.datetime(2020, 2, 7, 0, 0), datetime.datetime(2020, 2, 8, 0, 0), datetime.datetime(2020, 2, 16, 0, 0), datetime.datetime(2020, 2, 17, 0, 0), datetime.datetime(2020, 2, 18, 0, 0), datetime.datetime(2020, 2, 19, 0, 0), datetime.datetime(2020, 2, 20, 0, 0), datetime.datetime(2020, 2, 21, 0, 0), datetime.datetime(2020, 2, 22, 0, 0), datetime.datetime(2020, 2, 23, 0, 0), datetime.datetime(2020, 2, 24, 0, 0), datetime.datetime(2020, 2, 25, 0, 0), datetime.datetime(2020, 2, 26, 0, 0), datetime.datetime(2020, 2, 27, 0, 0), datetime.datetime(2020, 2, 28, 0, 0), datetime.datetime(2020, 2, 29, 0, 0)] Type = <class 'list'> Element Type = <class 'datetime.datetime'>

 Next available date = 2020-02-16 00:00:00 Type = <class 'datetime.datetime'>

 Next available date = 2020-02-16 Type = <class 'str'>
```

#### 2. Create function from point(1) solution to solve problem

**Difference between .today() & .now()**    

**.today()**    
Returns the current local datetime, without tzinfo
```py
dt.datetime.today()        # datetime.datetime(2020, 4, 19, 11, 58, 28, 547738)
print(dt.datetime.today()) # 2020-04-19 11:58:28.831696
```

**.now()**    
Return the current local date and time. If optional argument tz is None or not specified, this is like today(), but, if possible, supplies more precision
```py
dt.datetime.now()          # datetime.datetime(2020, 4, 19, 11, 58, 28, 335700)
print(dt.datetime.now())   # 2020-04-19 11:58:28.830691
```

Making .now() timezone aware you will have to use `import pytz`
```py
import pytz
d = dt.datetime.now()
timezone = pytz.timezone('Asia/Calcutta')
d_aware = timezone.localize(d)
d_aware.tzinfo

#Output:
#<DstTzInfo 'Asia/Calcutta' IST+5:30:00 STD>
```

`pytz.all_timezones` will list all available timezones
```
['Africa/Abidjan',
...
'Asia/Calcutta',
'Asia/Shanghai',
'Europe/London',
'America/Los_Angeles',
'America/New_York',
...
 'Zulu']
```
Above timezone thing, has nothing to do with this article, i just got bit side-tracked.

Below, i am subracting 180 days from current date, that will be the base date or start date.
```py {1}
base = dt.datetime.today() - dt.timedelta(days=180)
print('Base Date : ',base)
#Output:
#Base Date :  2019-10-22 12:29:19.946372
```

Now, merging point(1) and timedelta of point(2) to create a new function,
```py
def get_next_available_date(test_dates, days):
    base = dt.datetime.today() - dt.timedelta(days=days)
    print(' Base date =',base, 'Type =',type(base))
    availdates = list(map(lambda d: get_datetime(d), test_dates))
    #print('\n Available dates =\n',availdates, 'Type =',type(availdates), 'Element Type =', type(availdates[0]))
    later = filter(lambda d: d > base, availdates)
    #closest_date = min(later, key = lambda d: get_datetime(d))
    closest_date = min(later)
    print(' Next available date =',closest_date, 'Type =',type(closest_date))
    closest_date = closest_date.strftime("%Y-%m-%d")
    return closest_date
```

Below is the call,
```py
print('timedelta =',dt.datetime.today() - dt.timedelta(days=69))
#timedelta = 2020-02-10 12:45:21.150761

print(get_next_available_date(test_dates, 69))
# Base date = 2020-02-10 12:47:05.276859 Type = <class 'datetime.datetime'>
# Next available date = 2020-02-16 00:00:00 Type = <class 'datetime.datetime'>
#2020-02-16
```

Below is the logic used to generate the dates for initialization,
```py
start = dt.datetime.strptime("01-02-2020", "%d-%m-%Y")
end = dt.datetime.strptime("29-02-2020", "%d-%m-%Y")
date_generated = [start + dt.timedelta(days=x) for x in range(0, (end-start).days+1)]

test_dates = []
for date in date_generated:
    test_dates.append(date.strftime("%d-%m-%Y"))
```

#### Other concepts used

##### 1. map

`map(func, *iterables)`    
* Where func is the function on which each element in iterables (as many as they are) would be applied on.

**Example 1**    
```py
my_pets = ['alfred', 'tabitha', 'william', 'arla']
uppered_pets = list(map(str.upper, my_pets))
print(uppered_pets)
# Output : ['ALFRED', 'TABITHA', 'WILLIAM', 'ARLA']
```

**Example 2**    
```py
circle_areas = [3.56773, 5.57668, 4.00914, 56.24241, 9.01344, 32.00013]
result = list(map(round, circle_areas, range(1,7)))
print(result)
# Output : [3.6, 5.58, 4.009, 56.2424, 9.01344, 32.00013]
```

**Example 3** ( using repeat to have same value repeated for round() )    
```py
circle_areas = [3.56773, 5.57668, 4.00914, 56.24241, 9.01344, 32.00013]
result = list(map(round, circle_areas, np.repeat(2,6)))
print(result)
# Output : [3.57, 5.58, 4.01, 56.24, 9.01, 32.0]
```

##### 2. filter

`filter(func, iterable)`    
* Filter passes each element in the iterable through func and returns only the ones that evaluate to true.

**Example 1**    
```py
scores = [66, 90, 68, 59, 76, 60, 88, 74, 81, 65]
def is_A_student(score):
    return score > 75

over_75 = list(filter(is_A_student, scores))
print(over_75)
# Output : [90, 76, 88, 81]
```

**Example 2**    
```py
dromes = ("demigod", "rewire", "madam", "freer", "anutforajaroftuna", "kiosk")
palindromes = list(filter(lambda word: word == word[::-1], dromes))
print(palindromes)
# Output : ['madam', 'anutforajaroftuna']
```

#### Thanks
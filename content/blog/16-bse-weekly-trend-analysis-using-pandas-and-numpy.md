---
title: BSE Weekly trend analysis using Pandas & Numpy
date: 2020-04-08
description: Testing some python skills using jupyter with BSE data
tags:
  - python 
  - jupyter
  - numpy
slug: "/bse-weekly-trend-analysis-using-pandas-and-numpy"
---

Its been a month since i have worked on python, last time it was during Udacity Data Enginnering Nano Degree and over the month i was fully occupied with Rexx and Db2 REST.

In this exercise, i am exploring what all the possible things one can do with BSE daily data, for this analysis i will be using 1yr worth of data. This not technical analysis, just a little exercise to improvise some Python skills(Upskilling). 

[Data available here](https://storage.googleapis.com/bobbydreamer-com-technicals/bse_daily_365d.csv)

After giving a lot of thought by looking at the data, i think i can get below metrics from the data, this itself took couple of days to think :D    

| Field | Description |
| ----- | ----------- |
| closeH | high close in the week |
| closeL | low closein the week |
| volHigh | Highest volume in the week |
| volAvg | Volume average |
| daysTraded | Number of days traded in the week |
| HSDL | Highest Single Day Loss |
| HSDG | Highest Single Day Gain |
| HSDLp | Highest Single Day Loss percent |
| HSDGp | Highest Single Day Gain percent |
| first | First close of the week |
| last | Last close of he week |
| wChng | Week change |
| wChngp | Week change percent |
| lastTrdDoW | Last traded day of week |
| TI | Times increased |
| volAvgWOhv | Volume average without high volume |
| HVdAV | High volume / Average volume(without highvolume) |
| CPveoHVD | Close positive on high volume day |
| lastDVotWk | Last day volume |
| lastDVdAV | Last day volume / average volume |

I was able to calculate and get data for all above fields in dataframe. [Step-by-Step approach is available in Notebook in github](https://github.com/bobbydreamer/python-notebooks/blob/master/BSE-Trend-Analysis-Pandas.ipynb). 

To cut things short, first run took 1h 26min and second run took 1h 41min 41s via pandas to complete analysis for 1yr data. I didn't expect it would take that long to execute. I dont know where to start as well, so i posted my code in [StackOverflow](https://stackoverflow.com/questions/61063633/numpy-anyway-to-improve-this-furtherpandastook1h26m-numpytakes38m?noredirect=1#comment108030937_61063633) asking for suggestions and one user had asked. 

> Did you profile to see exactly which line(s) were the bottleneck(s)? – Mad Physicist 

At this point i don't know,    

* How to enable profiler
* How to install it 
* What type of report does it produce 
* How to read the report 

Bit of googling, got me below links,    

* Tried - [StackOverflow - How do I use line_profiler (from Robert Kern)?](https://stackoverflow.com/questions/23885147/how-do-i-use-line-profiler-from-robert-kern)
* Tried - [line-profiler-code-example](https://stackoverflow.com/questions/22328183/python-line-profiler-code-example)

Faced bit of a problem installing line_profiler in my system(Win10), so had to do a workaround, thats another topic, [here](15-python-profiling). 

Here is the output of the profiler,

```
('getcwd : ', '/home/bobby_dreamer')
Timer unit: 1e-06 s

Total time: 0.043637 s
File: BTD-Analysis1V3.py
Function: weekly_trend_analysis at line 36

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    36                                           def weekly_trend_analysis(exchange, df_weekly_all, df_daily):
    37                                           
    38         1          3.0      3.0      0.0      if exchange == 'BSE':
    39         1        963.0    963.0      2.2          ticker = df_daily.iloc[0]['sc_code']
    40                                               else:
    41                                                   ticker = df_daily.iloc[0]['symbol']
    42                                           
    43         1        201.0    201.0      0.5      arr_yearWeek = df_daily['yearWeek'].to_numpy()
    44         1        100.0    100.0      0.2      arr_close = df_daily['close'].to_numpy()
    45         1         87.0     87.0      0.2      arr_prevclose = df_daily['prevclose'].to_numpy()
    46         1         85.0     85.0      0.2      arr_chng = df_daily['chng'].to_numpy()
    47         1         83.0     83.0      0.2      arr_chngp = df_daily['chngp'].to_numpy()
    48         1        108.0    108.0      0.2      arr_ts = df_daily['ts'].to_numpy()
    49         1         89.0     89.0      0.2      arr_volumes = df_daily['volumes'].to_numpy()
    50                                           
    51                                               # Close
    52         1         41.0     41.0      0.1      arr_concat = np.column_stack((arr_yearWeek, arr_close))
    53         1        241.0    241.0      0.6      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
    54                                           
    55                                               #a = df_temp[['yearWeek', 'close']].to_numpy()
    56         1        113.0    113.0      0.3      yearWeek, daysTraded = np.unique(arr_concat[:,0], return_counts=True)
    57                                               
    58         1          4.0      4.0      0.0      cmaxs, cmins = [], []
    59         1          3.0      3.0      0.0      first, last, wChng, wChngp = [], [], [], []
    60         2         11.0      5.5      0.0      for idx,subarr in enumerate(npi_gb):
    61         1         32.0     32.0      0.1          cmaxs.append( np.amax(subarr) )
    62         1         17.0     17.0      0.0          cmins.append( np.amin(subarr) )
    63         1          2.0      2.0      0.0          first.append(subarr[0])
    64         1          2.0      2.0      0.0          last.append(subarr[-1])
    65         1          3.0      3.0      0.0          wChng.append( subarr[-1] - subarr[0] )
    66         1          6.0      6.0      0.0          wChngp.append( ( (subarr[-1] / subarr[0]) * 100) - 100 )
    67                                           
    68                                               #npi_gb.clear()
    69         1          4.0      4.0      0.0      arr_concat = np.empty((100,100))
    70                                           
    71                                               # Chng
    72         1         21.0     21.0      0.0      arr_concat = np.column_stack((arr_yearWeek, arr_chng))
    73         1        109.0    109.0      0.2      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
    74                                           
    75         1          2.0      2.0      0.0      HSDL, HSDG = [], []
    76         2          7.0      3.5      0.0      for idx,subarr in enumerate(npi_gb):
    77         1         12.0     12.0      0.0          HSDL.append( np.amin(subarr) )
    78         1          9.0      9.0      0.0          HSDG.append( np.amax(subarr) )
    79                                           
    80                                               #npi_gb.clear()
    81         1          3.0      3.0      0.0      arr_concat = np.empty((100,100))
    82                                           
    83                                               # Chngp
    84         1         15.0     15.0      0.0      arr_concat = np.column_stack((arr_yearWeek, arr_chngp))
    85         1         86.0     86.0      0.2      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
    86                                           
    87         1          1.0      1.0      0.0      HSDLp, HSDGp = [], []
    88         2          7.0      3.5      0.0      for idx,subarr in enumerate(npi_gb):
    89         1         11.0     11.0      0.0          HSDLp.append( np.amin(subarr) )
    90         1          9.0      9.0      0.0          HSDGp.append( np.amax(subarr) )
    91                                           
    92                                               #npi_gb.clear()
    93         1          3.0      3.0      0.0      arr_concat = np.empty((100,100))
    94                                           
    95                                               # Last Traded Date of the Week
    96         1       3111.0   3111.0      7.1      i = df_daily[['yearWeek', 'ts']].to_numpy()
    97         1        128.0    128.0      0.3      j = npi.group_by(i[:, 0]).split(i[:, 1])
    98                                           
    99         1          2.0      2.0      0.0      lastTrdDoW = []
   100         2          9.0      4.5      0.0      for idx,subarr in enumerate(j):
   101         1          2.0      2.0      0.0          lastTrdDoW.append( subarr[-1] )
   102                                           
   103         1          4.0      4.0      0.0      i = np.empty((100,100))
   104                                               #j.clear()
   105                                           
   106                                               # Times inreased
   107         1         11.0     11.0      0.0      TI = np.where(arr_close > arr_prevclose, 1, 0)
   108                                           
   109                                               # Below npi_gb_yearWeekTI is used in volumes section
   110         1         19.0     19.0      0.0      arr_concat = np.column_stack((arr_yearWeek, TI))
   111         1        111.0    111.0      0.3      npi_gb_yearWeekTI = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
   112                                           
   113         1         73.0     73.0      0.2      tempArr, TI = npi.group_by(arr_yearWeek).sum(TI)
   114                                           
   115                                               # Volume ( dependent on above section value t_group , thats the reason to move from top to here)
   116         1         39.0     39.0      0.1      arr_concat = np.column_stack((arr_yearWeek, arr_volumes))
   117         1         94.0     94.0      0.2      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
   118                                           
   119         1          2.0      2.0      0.0      vmaxs, vavgs, volAvgWOhv, HVdAV, CPveoHVD, lastDVotWk, lastDVdAV = [], [], [], [], [], [], []
   120         2          8.0      4.0      0.0      for idx,subarr in enumerate(npi_gb):
   121         1         53.0     53.0      0.1          vavgs.append( np.mean(subarr) )
   122         1          2.0      2.0      0.0          ldvotWk = subarr[-1]
   123         1          2.0      2.0      0.0          lastDVotWk.append(ldvotWk)
   124                                           
   125                                                   #print(idx, 'O - ',subarr, np.argmax(subarr), ', average : ',np.mean(subarr))
   126         1         13.0     13.0      0.0          ixDel = np.argmax(subarr)
   127         1          2.0      2.0      0.0          hV = subarr[ixDel]
   128         1          2.0      2.0      0.0          vmaxs.append( hV )
   129                                           
   130         1          1.0      1.0      0.0          if(len(subarr)>1):
   131         1         53.0     53.0      0.1              subarr = np.delete(subarr, ixDel)
   132         1         29.0     29.0      0.1              vawoHV = np.mean(subarr)
   133                                                   else:
   134                                                       vawoHV = np.mean(subarr)
   135         1          2.0      2.0      0.0          volAvgWOhv.append( vawoHV )
   136         1         12.0     12.0      0.0          HVdAV.append(hV / vawoHV)
   137         1          3.0      3.0      0.0          CPveoHVD.append( npi_gb_yearWeekTI[idx][ixDel] )
   138         1          6.0      6.0      0.0          lastDVdAV.append(ldvotWk / vawoHV)    
   139                                           
   140                                               #npi_gb.clear()
   141         1          3.0      3.0      0.0      arr_concat = np.empty((100,100))
   142                                           
   143                                               # Preparing the dataframe
   144                                               # yearWeek and occurances 
   145                                               #yearWeek, daysTraded = np.unique(a[:,0], return_counts=True)
   146         1          5.0      5.0      0.0      yearWeek = yearWeek.astype(int)
   147         1         44.0     44.0      0.1      HSDL = np.round(HSDL,2)
   148         1         21.0     21.0      0.0      HSDG = np.round(HSDG,2)
   149         1         18.0     18.0      0.0      HSDLp = np.round(HSDLp,2)
   150         1         18.0     18.0      0.0      HSDGp = np.round(HSDGp,2)
   151                                           
   152         1         17.0     17.0      0.0      first = np.round(first,2)
   153         1         17.0     17.0      0.0      last = np.round(last,2)
   154         1         17.0     17.0      0.0      wChng = np.round(wChng,2)
   155         1         16.0     16.0      0.0      wChngp = np.round(wChngp,2)
   156                                           
   157         1          5.0      5.0      0.0      vavgs = np.array(vavgs).astype(int)
   158         1          3.0      3.0      0.0      volAvgWOhv = np.array(volAvgWOhv).astype(int)
   159         1         17.0     17.0      0.0      HVdAV = np.round(HVdAV,2)
   160                                           
   161         1          3.0      3.0      0.0      dict_temp = {'yearWeek': yearWeek, 'closeH': cmaxs, 'closeL': cmins, 'volHigh':vmaxs, 'volAvg':vavgs, 'daysTraded':daysTraded
   162         1          2.0      2.0      0.0                  ,'HSDL':HSDL, 'HSDG':HSDG, 'HSDLp':HSDLp, 'HSDGp':HSDGp, 'first':first, 'last':last, 'wChng':wChng, 'wChngp':wChngp
   163         1          2.0      2.0      0.0                  ,'lastTrdDoW':lastTrdDoW, 'TI':TI, 'volAvgWOhv':volAvgWOhv, 'HVdAV':HVdAV, 'CPveoHVD':CPveoHVD
   164         1          2.0      2.0      0.0                  ,'lastDVotWk':lastDVotWk, 'lastDVdAV':lastDVdAV}
   165         1       3677.0   3677.0      8.4      df_weekly = pd.DataFrame(data=dict_temp)
   166                                           
   167         1       1102.0   1102.0      2.5      df_weekly['sc_code'] = ticker
   168                                           
   169         1          3.0      3.0      0.0      cols = ['sc_code', 'yearWeek', 'lastTrdDoW', 'daysTraded', 'closeL', 'closeH', 'volAvg', 'volHigh'
   170         1          1.0      1.0      0.0               , 'HSDL', 'HSDG', 'HSDLp', 'HSDGp', 'first', 'last', 'wChng', 'wChngp', 'TI', 'volAvgWOhv', 'HVdAV'
   171         1          2.0      2.0      0.0               , 'CPveoHVD', 'lastDVotWk', 'lastDVdAV']
   172                                           
   173         1       2816.0   2816.0      6.5      df_weekly = df_weekly[cols].copy()
   174                                                   
   175                                               # df_weekly_all will be 0, when its a new company or its a FTA(First Time Analysis)
   176         1         13.0     13.0      0.0      if df_weekly_all.shape[0] == 0:
   177         1      20473.0  20473.0     46.9          df_weekly_all = pd.DataFrame(columns=list(df_weekly.columns))       
   178                                                   
   179                                               # Removing all yearWeek in df_weekly2 from df_weekly
   180         1        321.0    321.0      0.7      a = set(df_weekly_all['yearWeek'])
   181         1        190.0    190.0      0.4      b = set(df_weekly['yearWeek'])
   182         1          5.0      5.0      0.0      c = list(a.difference(b))
   183                                               #print('df_weekly_all={}, df_weekly={}, difference={}'.format(len(a), len(b), len(c)) )
   184         1       1538.0   1538.0      3.5      df_weekly_all = df_weekly_all[df_weekly_all.yearWeek.isin(c)].copy()
   185                                           
   186                                               # Append the latest week data to df_weekly
   187         1       6998.0   6998.0     16.0      df_weekly_all = pd.concat([df_weekly_all, df_weekly], sort=False)
   188                                               #print('After concat : df_weekly_all={}'.format(df_weekly_all.shape[0]))    
   189                                                   
   190         1          2.0      2.0      0.0      return df_weekly_all
```

Below are the sections of the code that have high time, 
```
Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    38         1          3.0      3.0      0.0      if exchange == 'BSE':
    39         1        963.0    963.0      2.2          ticker = df_daily.iloc[0]['sc_code']
    40                                               else:
    41                                                   ticker = df_daily.iloc[0]['symbol']

    95                                               # Last Traded Date of the Week
    96         1       3111.0   3111.0      7.1      i = df_daily[['yearWeek', 'ts']].to_numpy()
    97         1        128.0    128.0      0.3      j = npi.group_by(i[:, 0]).split(i[:, 1])
    98                                           
    99         1          2.0      2.0      0.0      lastTrdDoW = []
   100         2          9.0      4.5      0.0      for idx,subarr in enumerate(j):
   101         1          2.0      2.0      0.0          lastTrdDoW.append( subarr[-1] )

   161         1          3.0      3.0      0.0      dict_temp = {'yearWeek': yearWeek, 'closeH': cmaxs, 'closeL': cmins, 'volHigh':vmaxs, 'volAvg':vavgs, 'daysTraded':daysTraded
   162         1          2.0      2.0      0.0                  ,'HSDL':HSDL, 'HSDG':HSDG, 'HSDLp':HSDLp, 'HSDGp':HSDGp, 'first':first, 'last':last, 'wChng':wChng, 'wChngp':wChngp
   163         1          2.0      2.0      0.0                  ,'lastTrdDoW':lastTrdDoW, 'TI':TI, 'volAvgWOhv':volAvgWOhv, 'HVdAV':HVdAV, 'CPveoHVD':CPveoHVD
   164         1          2.0      2.0      0.0                  ,'lastDVotWk':lastDVotWk, 'lastDVdAV':lastDVdAV}
   165         1       3677.0   3677.0      8.4      df_weekly = pd.DataFrame(data=dict_temp)
   166                                           
   167         1       1102.0   1102.0      2.5      df_weekly['sc_code'] = ticker
   168                                           
   169         1          3.0      3.0      0.0      cols = ['sc_code', 'yearWeek', 'lastTrdDoW', 'daysTraded', 'closeL', 'closeH', 'volAvg', 'volHigh'
   170         1          1.0      1.0      0.0               , 'HSDL', 'HSDG', 'HSDLp', 'HSDGp', 'first', 'last', 'wChng', 'wChngp', 'TI', 'volAvgWOhv', 'HVdAV'
   171         1          2.0      2.0      0.0               , 'CPveoHVD', 'lastDVotWk', 'lastDVdAV']
   172                                           
   173         1       2816.0   2816.0      6.5      df_weekly = df_weekly[cols].copy()
   174                                                   
   175                                               # df_weekly_all will be 0, when its a new company or its a FTA(First Time Analysis)
   176         1         13.0     13.0      0.0      if df_weekly_all.shape[0] == 0:
   177         1      20473.0  20473.0     46.9          df_weekly_all = pd.DataFrame(columns=list(df_weekly.columns))       
   178                                                   
   179                                               # Removing all yearWeek in df_weekly2 from df_weekly
   180         1        321.0    321.0      0.7      a = set(df_weekly_all['yearWeek'])
   181         1        190.0    190.0      0.4      b = set(df_weekly['yearWeek'])
   182         1          5.0      5.0      0.0      c = list(a.difference(b))
   183                                               #print('df_weekly_all={}, df_weekly={}, difference={}'.format(len(a), len(b), len(c)) )
   184         1       1538.0   1538.0      3.5      df_weekly_all = df_weekly_all[df_weekly_all.yearWeek.isin(c)].copy()
   185                                           
   186                                               # Append the latest week data to df_weekly
   187         1       6998.0   6998.0     16.0      df_weekly_all = pd.concat([df_weekly_all, df_weekly], sort=False)
   188                                               #print('After concat : df_weekly_all={}'.format(df_weekly_all.shape[0]))    
```

So started to try on alternative approaches to get things to run faster. I have been reading articles saying '*Numpy is fast*', '*Vectors are fast*' and started my tests. 

Here are some of the attempts to solve the above performance problems, 

1. **Getting the ticker code** 

    ```
    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
        38         1          3.0      3.0      0.0      if exchange == 'BSE':
        39         1        963.0    963.0      2.2          ticker = df_daily.iloc[0]['sc_code']
        40                                               else:
        41                                                   ticker = df_daily.iloc[0]['symbol']
    ```

    Had to settle with numpy here
    ```
    #ticker = df_temp.iloc[0]['sc_code']
    #ticker = df_daily.at[0,'sc_code']
    #ticker = df_daily.head(1)['sc_code'].values[0]
    ticker = df_daily['sc_code'].to_numpy()[0]
    ```

2. **3k to convert to numpy** 

    ```
    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
        95                                               # Last Traded Date of the Week
        96         1       3111.0   3111.0      7.1      i = df_daily[['yearWeek', 'ts']].to_numpy()
        97         1        128.0    128.0      0.3      j = npi.group_by(i[:, 0]).split(i[:, 1])
        98                                           
        99         1          2.0      2.0      0.0      lastTrdDoW = []
       100         2          9.0      4.5      0.0      for idx,subarr in enumerate(j):
       101         1          2.0      2.0      0.0          lastTrdDoW.append( subarr[-1] )
    ```

    Pandas approach seems to be bit expensive here and tried to convert it to numpy and faced a `TypeError: invalid type promotion`. This error came because i was trying to concatenate arr_yearWeek(int64) with arr_ts(timestamp64[ns]) like `arr_concat = np.column_stack((arr_yearWeek, arr_ts))`

    To resolve this issue, i converted timestamp `ts` to string `df_temp['ts'] = df_temp['ts'] .dt.strftime('%Y-%m-%d')` and this worked. 
    ```
    arr_concat = np.column_stack((arr_yearWeek, arr_ts))
    npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])

    lastTrdDoW = []
    for idx,subarr in enumerate(npi_gb):
        lastTrdDoW.append( subarr[-1] )
    ```
    Here [npi](https://github.com/EelcoHoogendoorn/Numpy_arraysetops_EP) is `import numpy_indexed as npi`, another library, when i was testing, i had encountered various issues and when i check in stackoverflow for solutions, i have seen user [Eelco Hoogendoorn](https://stackoverflow.com/users/613246/eelco-hoogendoorn) suggest to use `numpy_indexed` in multiple posts and i had to try it out and also he is the author of the library as well. 

    * [StackOverflow - Is there any numpy group by function?](https://stackoverflow.com/questions/38013778/is-there-any-numpy-group-by-function)

    So now most of my code uses this. 

3. **Converting to dataframe**. Looks like creating a new dataframe is an expensive process. When i stepback and think about the flow of program, this function is called in a *loop* and for each company a new dataframe is being created and if this takes this much time for single company, obviously whole program is going to be slow. So my thought was, what-if i keep everything in numpy itself, and see how it goes. 

    There are two things to solve here 
    * Dataframe (Line no.165)
    * Ordering of columns in dataframe(Line no.173 - did not think this process will consume this much time )
    ```
    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
    161         1          3.0      3.0      0.0      dict_temp = {'yearWeek': yearWeek, 'closeH': cmaxs, 'closeL': cmins, 'volHigh':vmaxs, 'volAvg':vavgs, 'daysTraded':daysTraded
    162         1          2.0      2.0      0.0                  ,'HSDL':HSDL, 'HSDG':HSDG, 'HSDLp':HSDLp, 'HSDGp':HSDGp, 'first':first, 'last':last, 'wChng':wChng, 'wChngp':wChngp
    163         1          2.0      2.0      0.0                  ,'lastTrdDoW':lastTrdDoW, 'TI':TI, 'volAvgWOhv':volAvgWOhv, 'HVdAV':HVdAV, 'CPveoHVD':CPveoHVD
    164         1          2.0      2.0      0.0                  ,'lastDVotWk':lastDVotWk, 'lastDVdAV':lastDVdAV}
    165         1       3677.0   3677.0      8.4      df_weekly = pd.DataFrame(data=dict_temp)

    169         1          3.0      3.0      0.0      cols = ['sc_code', 'yearWeek', 'lastTrdDoW', 'daysTraded', 'closeL', 'closeH', 'volAvg', 'volHigh'
    170         1          1.0      1.0      0.0               , 'HSDL', 'HSDG', 'HSDLp', 'HSDGp', 'first', 'last', 'wChng', 'wChngp', 'TI', 'volAvgWOhv', 'HVdAV'
    171         1          2.0      2.0      0.0               , 'CPveoHVD', 'lastDVotWk', 'lastDVdAV']
    172                                           
    173         1       2816.0   2816.0      6.5      df_weekly = df_weekly[cols].copy()

    ```

    Combined above two problems into one solution. Since all the values are going to be of same size, `np.column_stack` helped resolve the issue 
    ```
        np_weekly = np.column_stack((ticker, yearWeek, lastTrdDoW, daysTraded, cmins, cmaxs, vavgs, vmaxs, HSDL
                                , HSDG, HSDLp, HSDGp, first, last, wChng, wChngp, TI, volAvgWOhv, HVdAV
                                , CPveoHVD, lastDVotWk, lastDVdAV))
    ```

4. **Filling same value to entire dataframe column**    

    ```
    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
    167         1       1102.0   1102.0      2.5      df_weekly['sc_code'] = ticker   
    ```

    Resolved by filling the value in numpy
    ```
    ticker = np.full(yearWeek.shape[0], ticker)
    ```

5. Last part, here there are multiple high timers 

    * 20k - Basically i am trying to define a dataframe with column, that process seems to be very expensive here. 
    * 6k - dataframe concatenation 
    * 1.5k - using .isin()

    ```
    Line #      Hits         Time  Per Hit   % Time  Line Contents
    ==============================================================
    175                                               # df_weekly_all will be 0, when its a new company or its a FTA(First Time Analysis)
    176         1         13.0     13.0      0.0      if df_weekly_all.shape[0] == 0:
    177         1      20473.0  20473.0     46.9          df_weekly_all = pd.DataFrame(columns=list(df_weekly.columns))       
    178                                                   
    179                                               # Removing all yearWeek in df_weekly2 from df_weekly
    180         1        321.0    321.0      0.7      a = set(df_weekly_all['yearWeek'])
    181         1        190.0    190.0      0.4      b = set(df_weekly['yearWeek'])
    182         1          5.0      5.0      0.0      c = list(a.difference(b))
    183                                               #print('df_weekly_all={}, df_weekly={}, difference={}'.format(len(a), len(b), len(c)) )
    184         1       1538.0   1538.0      3.5      df_weekly_all = df_weekly_all[df_weekly_all.yearWeek.isin(c)].copy()
    185                                           
    186                                               # Append the latest week data to df_weekly
    187         1       6998.0   6998.0     16.0      df_weekly_all = pd.concat([df_weekly_all, df_weekly], sort=False)
    188                                               #print('After concat : df_weekly_all={}'.format(df_weekly_all.shape[0]))    
    ```
    Thought process here is same as before, why should i use dataframe here, can i do everything in numpy. So, proceeding towards that angle. 
    ```
        # Removing latest yearWeek from df_weekly_all as it could be partial and concatenating latest one(df_weekly) to df_weekly_all
        if len(np_weekly_all) > 0:
            #print(len(np_weekly_all))
            a = np_weekly_all[:,1] 
            b = np_weekly[:,1] 
            tf_1 = np.isin(a, b, invert=True) 
            #print(tf_1)
            t_result = list(compress(range(len(tf_1)), tf_1)) 
            #print(t_result)
            np_weekly_all = np_weekly_all[t_result]
            np_weekly_all = np.vstack((np_weekly_all, np_weekly))    
        else:
            np_weekly_all = []
            np_weekly_all = np.vstack((np_weekly))    
    ```

    Interesting concepts learned here are , 
    1. Slicing in numpy 
    1. numpy.isin and invert is available 
    1. compress of itertools `from itertools import compress `
    1. vstack 

    After making all the above changes in the new run, it took only 7min 47s. 

Here is the new profiler report, 

```
('getcwd : ', '/home/bobby_dreamer')
Timer unit: 1e-06 s

Total time: 0.013077 s
File: BTD-Analysis1V3-lf.py
Function: weekly_trend_analysis_np at line 38

Line #      Hits         Time  Per Hit   % Time  Line Contents
==============================================================
    38                                           def weekly_trend_analysis_np(exchange, np_weekly_all, df_daily):
    39                                           
    40         1          4.0      4.0      0.0      if exchange == 'BSE':
    41                                                   #ticker = df_daily.at[0,'sc_code']
    42                                                   #ticker = df_daily.head(1)['sc_code'].values[0]
    43         1        152.0    152.0      1.2          ticker = df_daily['sc_code'].to_numpy()[0]
    44                                               else:
    45                                                   #ticker = df_daily.at[0,'symbol']
    46                                                   #ticker = df_daily.head(1)['symbol'].values[0]
    47                                                   ticker = df_daily['symbol'].to_numpy()[0]
    48                                           
    49         1         34.0     34.0      0.3      arr_yearWeek = df_daily['yearWeek'].to_numpy()
    50         1         34.0     34.0      0.3      arr_close = df_daily['close'].to_numpy()
    51         1         31.0     31.0      0.2      arr_prevclose = df_daily['prevclose'].to_numpy()
    52         1         29.0     29.0      0.2      arr_chng = df_daily['chng'].to_numpy()
    53         1         27.0     27.0      0.2      arr_chngp = df_daily['chngp'].to_numpy()
    54         1         28.0     28.0      0.2      arr_ts = df_daily['ts'].to_numpy()
    55         1         27.0     27.0      0.2      arr_volumes = df_daily['volumes'].to_numpy()
    56                                           
    57                                               # Close
    58         1         72.0     72.0      0.6      arr_concat = np.column_stack((arr_yearWeek, arr_close))
    59         1        651.0    651.0      5.0      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
    60                                           
    61                                               #a = df_temp[['yearWeek', 'close']].to_numpy()
    62         1        111.0    111.0      0.8      yearWeek, daysTraded = np.unique(arr_concat[:,0], return_counts=True)
    63                                               
    64         1          2.0      2.0      0.0      cmaxs, cmins = [], []
    65         1          1.0      1.0      0.0      first, last, wChng, wChngp = [], [], [], []
    66        54         79.0      1.5      0.6      for idx,subarr in enumerate(npi_gb):
    67        53        465.0      8.8      3.6          cmaxs.append( np.amax(subarr) )
    68        53        423.0      8.0      3.2          cmins.append( np.amin(subarr) )
    69        53         86.0      1.6      0.7          first.append(subarr[0])
    70        53         75.0      1.4      0.6          last.append(subarr[-1])
    71        53        103.0      1.9      0.8          wChng.append( subarr[-1] - subarr[0] )
    72        53        142.0      2.7      1.1          wChngp.append( ( (subarr[-1] / subarr[0]) * 100) - 100 )
    73                                           
    74                                               #npi_gb.clear()
    75         1          6.0      6.0      0.0      arr_concat = np.empty((100,100))
    76                                           
    77                                               # Chng
    78         1         24.0     24.0      0.2      arr_concat = np.column_stack((arr_yearWeek, arr_chng))
    79         1        357.0    357.0      2.7      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
    80                                           
    81         1          2.0      2.0      0.0      HSDL, HSDG = [], []
    82        54         75.0      1.4      0.6      for idx,subarr in enumerate(npi_gb):
    83        53        387.0      7.3      3.0          HSDL.append( np.amin(subarr) )
    84        53        402.0      7.6      3.1          HSDG.append( np.amax(subarr) )
    85                                           
    86                                               #npi_gb.clear()
    87         1          4.0      4.0      0.0      arr_concat = np.empty((100,100))
    88                                           
    89                                               # Chngp
    90         1         21.0     21.0      0.2      arr_concat = np.column_stack((arr_yearWeek, arr_chngp))
    91         1        292.0    292.0      2.2      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
    92                                           
    93         1          2.0      2.0      0.0      HSDLp, HSDGp = [], []
    94        54         75.0      1.4      0.6      for idx,subarr in enumerate(npi_gb):
    95        53        382.0      7.2      2.9          HSDLp.append( np.amin(subarr) )
    96        53        403.0      7.6      3.1          HSDGp.append( np.amax(subarr) )
    97                                           
    98                                               #npi_gb.clear()
    99         1          6.0      6.0      0.0      arr_concat = np.empty((100,100))
   100                                           
   101                                               # Last Traded Date of the Week
   102         1         33.0     33.0      0.3      arr_concat = np.column_stack((arr_yearWeek, arr_ts))
   103         1        341.0    341.0      2.6      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
   104                                           
   105         1          1.0      1.0      0.0      lastTrdDoW = []
   106        54         70.0      1.3      0.5      for idx,subarr in enumerate(npi_gb):
   107        53         79.0      1.5      0.6          lastTrdDoW.append( subarr[-1] )
   108                                               
   109                                               #npi_gb.clear()
   110         1          5.0      5.0      0.0      arr_concat = np.empty((100,100))
   111                                           
   112                                               # Times inreased
   113         1         14.0     14.0      0.1      TI = np.where(arr_close > arr_prevclose, 1, 0)
   114                                           
   115                                               # Below npi_gb_yearWeekTI is used in volumes section
   116         1         16.0     16.0      0.1      arr_concat = np.column_stack((arr_yearWeek, TI))
   117         1        267.0    267.0      2.0      npi_gb_yearWeekTI = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
   118                                           
   119         1         78.0     78.0      0.6      tempArr, TI = npi.group_by(arr_yearWeek).sum(TI)
   120                                           
   121                                               # Volume ( dependent on above section value t_group , thats the reason to move from top to here)
   122         1         16.0     16.0      0.1      arr_concat = np.column_stack((arr_yearWeek, arr_volumes))
   123         1        277.0    277.0      2.1      npi_gb = npi.group_by(arr_concat[:, 0]).split(arr_concat[:, 1])
   124                                           
   125         1          3.0      3.0      0.0      vmaxs, vavgs, volAvgWOhv, HVdAV, CPveoHVD, lastDVotWk, lastDVdAV = [], [], [], [], [], [], []
   126        54         87.0      1.6      0.7      for idx,subarr in enumerate(npi_gb):
   127        53       1077.0     20.3      8.2          vavgs.append( np.mean(subarr) )
   128        53         82.0      1.5      0.6          ldvotWk = subarr[-1]
   129        53         83.0      1.6      0.6          lastDVotWk.append(ldvotWk)
   130                                           
   131                                                   #print(idx, 'O - ',subarr, np.argmax(subarr), ', average : ',np.mean(subarr))
   132        53        235.0      4.4      1.8          ixDel = np.argmax(subarr)
   133        53         88.0      1.7      0.7          hV = subarr[ixDel]
   134        53         73.0      1.4      0.6          vmaxs.append( hV )
   135                                           
   136        53         71.0      1.3      0.5          if(len(subarr)>1):
   137        53       1610.0     30.4     12.3              subarr = np.delete(subarr, ixDel)
   138        53       1024.0     19.3      7.8              vawoHV = np.mean(subarr)
   139                                                   else:
   140                                                       vawoHV = np.mean(subarr)
   141        53         85.0      1.6      0.6          volAvgWOhv.append( vawoHV )
   142        53        327.0      6.2      2.5          HVdAV.append(hV / vawoHV)
   143        53        102.0      1.9      0.8          CPveoHVD.append( npi_gb_yearWeekTI[idx][ixDel] )
   144        53        791.0     14.9      6.0          lastDVdAV.append( np.round(ldvotWk / vawoHV, 2) )    
   145                                           
   146                                               #npi_gb.clear()
   147         1          4.0      4.0      0.0      arr_concat = np.empty((100,100))
   148                                           
   149                                               # Preparing the dataframe
   150                                               # yearWeek and occurances 
   151                                               #yearWeek, daysTraded = np.unique(a[:,0], return_counts=True)
   152         1          5.0      5.0      0.0      yearWeek = yearWeek.astype(int)
   153         1         59.0     59.0      0.5      HSDL = np.round(HSDL,2)
   154         1         26.0     26.0      0.2      HSDG = np.round(HSDG,2)
   155         1         23.0     23.0      0.2      HSDLp = np.round(HSDLp,2)
   156         1         23.0     23.0      0.2      HSDGp = np.round(HSDGp,2)
   157                                           
   158         1         23.0     23.0      0.2      first = np.round(first,2)
   159         1         23.0     23.0      0.2      last = np.round(last,2)
   160         1         23.0     23.0      0.2      wChng = np.round(wChng,2)
   161         1         23.0     23.0      0.2      wChngp = np.round(wChngp,2)
   162                                           
   163         1         12.0     12.0      0.1      vavgs = np.array(vavgs).astype(int)
   164         1         16.0     16.0      0.1      volAvgWOhv = np.array(volAvgWOhv).astype(int)
   165         1         24.0     24.0      0.2      HVdAV = np.round(HVdAV,2)
   166                                           
   167         1         16.0     16.0      0.1      ticker = np.full(yearWeek.shape[0], ticker)
   168         1          2.0      2.0      0.0      np_weekly = np.column_stack((ticker, yearWeek, lastTrdDoW, daysTraded, cmins, cmaxs, vavgs, vmaxs, HSDL
   169         1          2.0      2.0      0.0                                 , HSDG, HSDLp, HSDGp, first, last, wChng, wChngp, TI, volAvgWOhv, HVdAV
   170         1        546.0    546.0      4.2                                 , CPveoHVD, lastDVotWk, lastDVdAV))
   171                                               
   172                                               # Removing latest yearWeek from df_weekly_all as it could be partial and concatenating latest one(df_weekly) to df_weekly_all
   173         1          2.0      2.0      0.0      if len(np_weekly_all) > 0:
   174                                                   #print(len(np_weekly_all))
   175         1          2.0      2.0      0.0          a = np_weekly_all[:,1] 
   176         1          1.0      1.0      0.0          b = np_weekly[:,1] 
   177         1        205.0    205.0      1.6          tf_1 = np.isin(a, b, invert=True) 
   178                                                   #print(tf_1)
   179         1         13.0     13.0      0.1          t_result = list(compress(range(len(tf_1)), tf_1)) 
   180                                                   #print(t_result)
   181         1         13.0     13.0      0.1          np_weekly_all = np_weekly_all[t_result]
   182         1         40.0     40.0      0.3          np_weekly_all = np.vstack((np_weekly_all, np_weekly))    
   183                                               else:
   184                                                   np_weekly_all = []
   185                                                   np_weekly_all = np.vstack((np_weekly))    
   186                                                   
   187         1          2.0      2.0      0.0      return np_weekly_all
```

Needless to say, *Hype is real*. Numpy wins, its fast. 
 
Issue faced during full execution using numpy,    

1. `MemoryError: Unable to allocate array with shape (82912, 22) and data type <U32`. This issue occured in two tests, first after processing 1600 companies and second time after 900 company. Since all the numpy elements should be of same type, here in my data, i have (integers, decimals and date). So, all the data is stored as OBJECT, which is bigger in size. 

    Tried couple of approaches, 
    * Tried to clear memory of used variables like 
        ```
        npi_gb = None
        arr_concat = None
        ```
    * Tested(doesn't help) to see if deleting user-defined variables help 
        ```
        for name in dir():
            if not name.startswith('_'):
                print(name)
                del globals()[name]
        ```
    * Thought, memory might have to do with python installation as well. My computer is 64-bit but python i had installed is 32-bit. So, tried reinstalling and checked it. It doesnt help, 
        ```
        # To know why bit of python you are running
        import struct
        print(struct.calcsize("P") * 8)
        ```
    * Finally, what i did is, write an intermediate result file after processing 500 companies and then reinitialize the variables which is holding that data. 

### # Things to do next

*Going forward, should i write only numpy programs* ?     

No. It depends, to a certain extent. What am i doing here, i am calling weekly_trend_analysis() in loop passing last 1 yr daily data of each company as argument and function processes it and finally returns 1yr weekly data of that company and this process repeats for all companies. 
* Doing this via Pandas takes 1h 26min
* Via Numpy takes 7min 47s

Instead of passing daily data of each company in loop, if i pass entire dataset to the function with all the companies via pandas, it takes only Wall time: 1min 22s. 

So, pandas are good as well in processing large datasets. We got 2 enemies here, they should be avoided at all cost, 

1. Looping 
1. Thought process that gets you to write a loop.

Couple of other points to remember, 

1. With complex codes, maintainence will hit hard. Pandas are easy to understand than numpy. 
2. If you really want to scale, it easy to convert from Pandas to PySpark, i have done it. (Easy meaning, you have to sit for couple of weeks and do it, but doable). 
3. Numpy is very fast with looping itself it got the elapsed time down from 1hr 26min to 7mins, what i didn't like about it is the memory error, but the problem is with my data, i wanted multiple datatypes, so it had to change everything to object types. 

So finally, whats best, both are, but its the thought process thats going to save time.

### # Related articles
1. [Running python line_profiler in cloud shell](15-python-profiling)
1. [Github : BSE Trend analysis using Pandas(Notebook)](https://github.com/bobbydreamer/python-notebooks/blob/master/BSE-Trend-Analysis-Pandas.ipynb)
1. [Github : BSE Trend analysis using Numpy(Notebook)](https://github.com/bobbydreamer/python-notebooks/blob/master/BSE-Trend-Analysis-Numpy.ipynb)

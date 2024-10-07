---
title: PyTip - Saving memory when reading CSV file in pandas
date: 2020-04-11
description: Python tips no tricks
tags:
  - python
  - pandas
slug: "/23-pytip-saving-memory-when-reading-csv-file-in-pandas"
---

#### # Saving memory while reading a CSV file in Pandas
There could be many columns in the CSV file, but if you are using only few specific columns always mention `usecols` option in `pd.read_csv` like below

```py
bse_daily_csv_all_cols = ["ts", "sc_code", "sc_name", "sc_group", "sc_type"
                 , "open", "high", "low", "close", "last", "prevclose"
                 , "no_trades", "no_of_shrs", "net_turnover", "tdcloindi", "isin"]

bse_daily_csv_use_cols = ['ts', 'sc_code', 'sc_name', 'high', 'low', 'close', 'prevclose', 'no_of_shrs']

df_bse_daily = pd.read_csv(os.path.join(os.getcwd(), '..', '5. BTD', 'data', 'bse_daily_365d.csv'), sep='|'
                          ,names=bse_daily_csv_all_cols
                          ,usecols = bse_daily_csv_use_cols
                          ,skip_blank_lines=True
                          ,parse_dates=['ts'])
```

Have a look at the `memory usage` field in the below output
```sh {22,37} 
# when not mentioning usecols
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 657058 entries, 0 to 657057
Data columns (total 16 columns):
ts              657058 non-null datetime64[ns]
sc_code         657058 non-null int64
sc_name         657058 non-null object
sc_group        657058 non-null object
sc_type         657058 non-null object
open            657058 non-null float64
high            657058 non-null float64
low             657058 non-null float64
close           657058 non-null float64
last            657058 non-null float64
prevclose       657058 non-null float64
no_trades       657058 non-null int64
no_of_shrs      657058 non-null int64
net_turnover    657058 non-null int64
tdcloindi       657058 non-null object
isin            657037 non-null object
dtypes: datetime64[ns](1), float64(6), int64(4), object(5)
memory usage: 67.7+ MB

# when usecols is mentioned
<class 'pandas.core.frame.DataFrame'>
RangeIndex: 657058 entries, 0 to 657057
Data columns (total 8 columns):
ts            657058 non-null datetime64[ns]
sc_code       657058 non-null int64
sc_name       657058 non-null object
high          657058 non-null float64
low           657058 non-null float64
close         657058 non-null float64
prevclose     657058 non-null float64
no_of_shrs    657058 non-null int64
dtypes: datetime64[ns](1), float64(4), int64(2), object(1)
memory usage: 37.6+ MB
``` 
So when you have information about structure beforehand, use it. 
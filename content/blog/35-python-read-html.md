---
title: Python pandas read_html()
date: 2020-08-08
description: Using pandas reading HTML tables from webpage
tags:
  - python
  - pandas
  - scraping
slug: "/35-python-read-html"
---

Just saying, sraping could be a lot of work, you go to a webpage and there are lots of tables of different formats insense diffent number of columns and rows. Pandas, combined all these and made it look easy, so you get more time to look at data and work on it. 

Here we have simple program, which reads wikipedia page, which had multiple tables and the code is pretty simple and there is only one thing to note, if there are multiple tables in a webpage, pd.read_html() is going to return array of dataframes, other than that there is not much to explain, its so easy. But, there is a bit of work in the data wrangling part, after reading the table like below, 

1. In table[1], there is no column names 
2. table[2], at first it might look confusing, there is an pandas index and there is a sequence number in the table itself. 

```py:title=read_html.py {9}
import pandas as pd
import lxml
import requests
import html5lib
from tabulate import tabulate

url = "https://en.wikipedia.org/wiki/BSE_SENSEX"
html = requests.get(url)
df_arr = pd.read_html(html.text)

print(tabulate(df_arr[0], headers='keys', tablefmt='psql', showindex=True))
# Output 
+----+----------+----------------------------+
|    | 0        | 1                          |
|----+----------+----------------------------|
|  0 | nan      | nan                        |
|  1 | Type     | Stock exchange             |
|  2 | Location | Mumbai, Maharashtra, India |
|  3 | Currency | Indian rupee (₹)           |
|  4 | Website  | www.bseindia.com           |
+----+----------+----------------------------+

print(tabulate(df_arr[1], headers='keys', tablefmt='psql', showindex=True))
# Output
+----+-----+-------------------+---------------------------------+--------------------------------+---------------------+
|    |   # |   Exchange ticker | Companies                       | Sector                         | Date Added          |
|----+-----+-------------------+---------------------------------+--------------------------------+---------------------|
|  0 |   1 |            500820 | Asian Paints                    | Paints                         | 21 December 2015[7] |
|  1 |   2 |            532215 | Axis Bank                       | Banking - Private              | nan                 |
|  2 |   3 |            532977 | Bajaj Auto                      | Automobile                     | nan                 |
|  3 |   4 |            500034 | Bajaj Finance                   | Finance (NBFC)                 | 24 December 2018[8] |
|  4 |   5 |            532978 | Bajaj Finserv                   | Finance (Investment)           | nan                 |
|  5 |   6 |            532454 | Bharti Airtel                   | Telecommunications             | nan                 |
|  6 |   7 |            532281 | HCL Technologies                | IT Services & Consulting       | nan                 |
|  7 |   8 |            500010 | HDFC                            | Finance (Housing)              | nan                 |
|  8 |   9 |            500180 | HDFC Bank                       | Banking - Private              | nan                 |
|  9 |  10 |            500696 | Hindustan Unilever Limited      | FMCG                           | nan                 |
| 10 |  11 |            532174 | ICICI Bank                      | Banking - Private              | nan                 |
| 11 |  12 |            532187 | IndusInd Bank                   | Banking - Private              | 18 December 2017[9] |
| 12 |  13 |            500209 | Infosys                         | IT Services & Consulting       | nan                 |
| 13 |  14 |            500875 | ITC Limited                     | Cigarettes & FMCG              | nan                 |
| 14 |  15 |            500247 | Kotak Mahindra Bank             | Banking - Private              | 19 June 2017[10]    |
| 15 |  16 |            500510 | Larsen & Toubro                 | Engineering & Construction     | nan                 |
| 16 |  17 |            500520 | Mahindra & Mahindra             | Automobile                     | nan                 |
| 17 |  18 |            532500 | Maruti Suzuki                   | Automobile                     | nan                 |
| 18 |  19 |            500790 | Nestle India                    | FMCG                           | 23 Dec 2019[11]     |
| 19 |  20 |            532555 | NTPC                            | Power generation/Distribution  | nan                 |
| 20 |  21 |            500312 | Oil and Natural Gas Corporation | Oil exploration and Production | nan                 |
| 21 |  22 |            532898 | Power Grid Corporation of India | Power generation/Distribution  | 20 June 2016[12]    |
| 22 |  23 |            500325 | Reliance Industries Limited     | Conglomerate                   | nan                 |
| 23 |  24 |            500112 | State Bank of India             | Banking - Public               | nan                 |
| 24 |  25 |            524715 | Sun Pharmaceutical              | Pharmaceuticals                | 8 August 2011[13]   |
| 25 |  26 |            500470 | Tata Steel                      | Iron & Steel                   | nan                 |
| 26 |  27 |            532540 | Tata Consultancy Services       | IT Services & Consulting       | nan                 |
| 27 |  28 |            532755 | Tech Mahindra                   | IT Services & Consulting       | nan                 |
| 28 |  29 |            500114 | Titan Company                   | Diamond & Jewellery            | 23 Dec 2019[11]     |
| 29 |  30 |            532538 | UltraTech Cement                | Cement                         | 23 Dec 2019[11]     |
+----+-----+-------------------+---------------------------------+--------------------------------+---------------------+

print(tabulate(df_arr[2], headers='keys', tablefmt='psql', showindex=True))
# Output 
+----+------------+----------------------+-----------------------------+
|    | Category   |   All-Time Highs[14] | All-Time Highs[14].1        |
|----+------------+----------------------+-----------------------------|
|  0 | Closing    |              41952.6 | Tuesday, 14 January 2020    |
|  1 | Intraday   |              42063   | Friday, 17 January 2020[15] |
+----+------------+----------------------+-----------------------------+

print(tabulate(df_arr[3].tail(), headers='keys', tablefmt='psql', showindex=True))
# Output
+----+---------+---------------+--------------+-----------------------------------------+
|    |   S.No. | Date          | Points       | Reason                                  |
|----+---------+---------------+--------------+-----------------------------------------|
| 75 |      75 | 24 April 2020 | 535.86[110]  | Due to Coronavirus Pandemic.            |
| 76 |      76 | 4 May 2020    | 2002.27[111] | Due to Coronavirus Pandemic.            |
| 77 |      77 | 14 May 2020   | 885.72[112]  | Due to Coronavirus Pandemic.            |
| 78 |      78 | 18 May 2020   | 1068.75[113] | Due to Coronavirus Pandemic.            |
| 79 |      79 | 11 June 2020  | 708.68 [114] | Driven by global equity sell-off. [115] |
+----+---------+---------------+--------------+-----------------------------------------+

```

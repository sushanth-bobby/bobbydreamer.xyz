---
title: Db2 - ABCs of Filter Factor
date: 2021-06-13
description: Db2 ABCs of Filter Factor by Joe Geller
tags: ['db2-notes', 'db2-statistics']
slug: "/106-db2-abcs-of-filter-factor"
---

**Presentation by**: Joe Geller       
**Author of**: DB2 Performance and Development Guide and IMS Administration, Programming and Data Base Design     
**Date**: November 2016, IDUG Db2 EMEA Tech Conference, Brussels, Belgium      
**Slides**: [The ABCs of Filter Factors (aka Selectivity)](https://storage.googleapis.com/bobbydreamer-com-technicals/db2/Db2-The-ABCs-of-Filter-Factors-(aka-Selectivity)-EU2016-E12--Slides-only.pdf)     
**Actual Presentation:** [Youtube : IDUG Tech Talk: The ABCs of Filter Factors (aka Selectivity)](https://youtu.be/XCLB3rz_AiM)

#### Filter Factors(FF)
Word filter means to remove something. Air filter removes dust. What Db2 is filtering, are rows. 

```
SELECT ... FROM CUST WHERE LASTNAME ='PURCELL'	
```
Is the above *selection criteria* or *filtering criteria*
* select the rows that are PURCELL
* Filter out the rows that are not PURCELL

> Filter factor is the fraction of rows that satisfy a predicate

Filter factor and Selectivity mean the same thing.

##### Practical example

**Example 1**      
```
SELECT ... FROM CUST WHERE LASTNAME = 'PURCELL'
-- Total rows = 1,000,000
-- There are 100 rows with lastname purcell

-- 100/1,000,000 = .0001 of rows (ie., 1/10,000)
-- Filter factor is .0001
```

**Example 2**      
```
Employee table = 1M rows

salary_grade has 20 distinct values(COLCARDF)
-- salary_grade = ? ; FF = 1/20 = 0.05 = 50K rows

hire_date has 10k values
-- hire_date = ? ; FF = 1/10K = 0.0001 = 100 rows

sex has 2 values
-- sex = ? ; FF = 1/2 = 0.5 = 500K rows

sex = 'M' AND salary_grade = 23
-- FF = 1/2 * 1/20 = 1/40 = 0.025 = 25K rows
```

Its, number of rows selected(cardinality) which affects the cost of an accesspath. The filter factor determines the cardinality 

#### Combining Predicates

##### AND 
If the predicates are independent, you multiple the filter factors. 
```
sex = 'M' AND salary_grade = 23
-- 1/2 * 1/20 = 1/40 = 0.025 = 25k rows
```

If they are dependent(such as city and state)
* If Db2 knows they are dependent, then it does not multiply. Db2 will know that columns are dependent, if the predicate columns are the leading columns of an index or if you have collected colgroup statisitcs on those columns. 

* LUW – index stats have firstkeycard, first2keycard, first3keycard, first4keycard, fullkeycard

* z/OS – index stats have firstkeycardfand fullkeycardf, but all intermediate combinations are gathered too and stored in SYSCOLDIST

* BETWEEN is treated as dependent

##### OR

If the predicates are exclusive, then the filter factors are added
```
Salary_grade= 23 OR Salary_grade= 17
-- 1/20 + 1/20 = .1 = 100,000 rows
``` 

If the predicates are inclusive, then the filter factor is less than the sum of the individual FFs.
```
Sex = ‘M' OR Salary_grade= 23
-- 1/2 + 1/20 = .55 = 550,000 rows
```
But the actual FF will be somewhat less than .55 and the estimated cardinality will be between 500,000 - 550,000
```
1/2 + 1/20 – (1/2*1/20) = 0.525
```

#### Statistics –There are Two Kinds
1. What Db2 Knows - thats by running Runstats
2. What is actually there. 

When host variables are used, Db2 cannot use distribution statistics. 

##### How Do You Know What They Are?     

* Actual statistics –you have to write queries to find out
* Catalog statistics –2 ways:
  - Look in the catalog (with SQL or with a tool):
  - SYSTABLES (CARDF)
  - SYSCOLUMNS (COLCARDF)
  - SYSINDEXES (FIRSTKEYCARDF,FULLKEYCARDF)
  - Filter Factors –the manuals describe the rules and formulas. You can then calculate the filter factor.
* Visual Explain
  - The big advantage is that it gathers all the info –index columns, cardinality, filter factors.

##### Calculating Filter Factors 

![Calculating Filter Factors](assets/106-db2-cff.png)

> Assumption made by Db2 is, more distinct values you have smaller the range you are asking for. This assumption is very bad for timeststamps. 

##### How Filter Factor Affects the Choice of Index

**Example 3**      

* CUST table with 2 Indexes: CUST_NBR and LASTNAME(clustered)
* Query : `WHERE CUST_NBR BETWEEN ? AND ? AND LASTNAME BETWEEN ? AND ?`
* Total rows = 1M
* At 100 bytes / row, 40 rows / per 4K page thats 25k pages in the TS
* COLCARDF for CUST_NBR = 990,000; for LASTNAME = 400,000
* Filter Factor for BETWEEN with colcardf>=100,000, but < 1,000,000 is 1/1000
* 1000 rows are expected to match each predicate (1/1000 = 0.001(ff) * 1000000(rows) = 1000)
* 1k rows will sit in 25 pages(40 rows per page)
* Db2 will do 25 I/Os if they are not in bufferpool
* If Db2 goes with CUST_NBR index
  - There is a possibility 1k rows could be in 1k pages
  - If pages are not in BP then it has to do 1k I/Os(getpages of logical reads)
  - Db2 is very likely to pick the index on lastname
* If we slightly change the query `WHERE CUST_NBR BETWEEN 100 AND 119 AND LASTNAME BETWEEN ? AND ?`
  - Now there are just 20 rows which meet the first predicate.
  - If CUST_NBR is almost unique and goes from 1 to 1,000,000
    + DB2 will correctly determine a filter factor of 1/50,000
  - <=20 getpagesand <= 20 pages to be read from the TS
  - DB2 is likely to select the CUST_NBR index.

Visual Explain is processed - left to right, bottom to top

Matchcols(start keys in LUW) are the number of leading columns of an index that are used to position within the index     
* This means there are predicates (usually equality predicates) on each of these columns
* More is better but not always as better index is the one that qualifies fewer rows
* If query has MC=3 but satisfies 7M rows and for another query MC=1 but only 1 row qualifies. Which is better ? Definitely 
* If you have multiple indexes, the one that does have better filtering qualifies. 

In general,     
* Nested Loop Join is good for online transactions(fewer rows are returned)
* Merge, Hash joins are good for batch(lots of rows are returned)

In short how Merge and NL works, 
* Merge - 1 pass of each table. Prefetch is used
  - If Db2 thinks there are large amount of rows then it will pick Merge. 
* Nested Loop - if the tables are both clustered on the same key and that column is used for join then 1 pass with prefetch. Otherwise, random synchronous access. Each page may be read multiple times
  - if DB2 thinks there are only a few rows & does a NL
  - If outer table has few selected rows, then the optimizer may pick NL

#### Literals and Variables

Variables      
* For Dynamic SQL there is better statement reuse from the package cache / statement cache –the prepare process does not have to be repeated
* Allow one statement to be run with different values

Literals     
* Can take advantage of distribution statistics – DB2 has more information. This can lead to a better access path, customized for the specific literal value
* Range predicates also benefit from literals, even without distribution statistics
  - High2key = 100, Low2key = 1 WHERE COLA > 98 will have a very different FF than COLA > 2

Does this matter ? 
* If no column statistics at all, DB2 uses default filter factors
* If column cardinality stats, but no distribution stats, DB2 assumes uniform distribution, so for an equals predicate the actual value doesn't affect the access path choice.
* Range predicates can use high2key and low2key for a column.
* If distribution stats, then using a literal gives DB2 even more information. A variable or parameter marker does not.

##### Distribution Statistics     

* Distribution statistics are the top n most frequently occurring values for a column
  - It has the number of occurrences of that value
  - n is configurable
    + On LUW the default is in a db cfgparameter
    + You can specify a different value on the runstats utility 
* If we collect the top 10 and PURCELL is not in that top 10, then DB2 knows that it has fewer occurrences than number 10
* If the data is uniformly distributed (i.e., not skewed) then the result is the same. So distribution stats may not be required for this column. 
* Column cardinality though is needed even with host variables and is strongly recommended. 5 values has a default FF= .2 10 values has a FF=.1

**Example 4**      

```
Select * from customer c join orders o
on c.custid= o.custid
where c.level= ‘GOLD' and o.order_date= current date
```

* customer table has 100k rows; order table 10k orders/day; 100 ‘GOLD' customers
* Without indexes DB2 would probably choose customer as the outer table.
  - customer(level = gold) = 100
  - order = 10k
* If we asked for ‘BROWN' instead and 95,000 customers were at that level, then DB2 might start with the orders table
  - customer(level = brown) = 95k
  - order = 10k 
* If we had an index on order_date, but not on level, then DB2 would likely choose to start with orders, regardless of which value was used for level. 
  - Preference given to available index
* If we had an index on order_date and an index on level, then for GOLD, DB2 would use the level index; for BROWN it would use the order_date index
  - customer(level = gold) = 100 will use level index
  - customer(level = brown)= 95k will use order_date index
* If we used a parameter marker instead of the literal, then the same access path would be chosen for either value because it would be determined before the value is passed in
  - In this case, the cardinality of level could affect the access path. If there are 4 levels, then they average 25,000 rows each and it is likely the order_date index would be chosen
    + FF = 1/4(levels) = 0.25 * 100k rows = 25k rows
    + order_date index will be used as 10k rows will be qualified. 
  - If there are 100 levels, then they average 1,000 rows each and the level index would be chosen (even if ‘BROWN' were passed in).
    + FF = 1/100 = 0.01 * 100k rows = 1000 rows 
    + level index will be chosen

##### Literals to Parameter Markers

**Statement Cache**      

* Allows for the reuse of dynamic SQL without DB2 having to re-prepare the statement. This is a big performance boost for dynamic SQL.
  - The statements must match. Different literals will result in different statements and there will not be reuse. If there are only a few values, then each will be a different statement, but reuse should still occur

**Problem:** If statement is generated with literals for key fields (such as IDs), then every execution will likely be different. No reuse and the cache will be flooded –forcing out other statements that could have been reused.

**Solution:** Statement Concentrator      
If turned on, Db2 will be look for exact statement in the cache, if its not found. It will replace the literal with parameter marker and search for it again. If found, it will reuse the statement in cache and doesn't have to do full prepare. 

* You can set it as a connection property or as an Attribute on the Prepare
* Note : Literals not used in accesspath selection.
  - If your statement has a mix of literals and variables, Db2 will not convert the literals. 

**Problem:** Program uses variables for static SQL or parameter markers for dynamic SQL because different values are passed in. But, some columns have highly skewed data
  * Different values would benefit from different access paths
  * You don't want to convert to dynamic SQL

**Solution:** REOPT      
  * REOPT is a bind option with 3 choices:
    - NONE –process as normal
    - ALWAYS –determine the access path for each execution.
    - ONCE –determine the access path on the first execution (the assumption here is that the first value is typical)
* Good - customized access paths
* Bad  - execution time overhead. Access Path selection done for every execution if REOPT ALWAYS is used

**Recommendation**      

* In general you should write dynamic SQL using parameter markers or host variables.
  - This will give you the best statement reuse and improve the performance of dynamic SQL
* Use literals where it will make a difference –for low cardinality columns with a highly skewed distribution
  - Make sure you've collected distribution statistics on these columns

* For software packages, check with vendor whether there is any option for parameter markers or literals. Otherwise look to use statement concentration. 

#### RUNSTATS – the First Line of Defense Against Incorrect Filter Factors

**Need more stats – Runstats with:**        
* Column cardinality
* FREQVAL (distribution stats)
* Histogram (distribution stats for ranges)
* COLGROUP (for columns that are correlated)

**Column statistics on a subset of columns**        
* On z/OS column stats are additive. If you ask for COL1 and COL2 on the first run of runstatsand then ask for COL3 on the second run, the catalog will have stats for all 3 columns
* On LUW, each runstatsrun wipes out the column stats from prior runs. Make sure you ask for all columns and column groups you need each time you run runstats

##### RUNSTATS – z/OS

**RUNSTATS TABLESPACE dbname.tsname**        
  * By default, you do not get column statistics
  * If you use the TABLE option, you can get cardinality stats for all columns, or you can list individual columns or colgroups. Cardinality stats are highly recommended
  * However, cardinality stats are automatically collected for the leading columns of indexes

**Distribution stats have to be asked for on a column or colgroupbasis**        
  * FREQVAL option requests distribution stats
  * COUNT –number of frequently occurring values to collect – default is 10

**HISTOGRAM option for ranges**        
  * NUMQUANTILES –number of quantilesto collect – default is 100

**Distribution stats for indexes are specified by using NUMCOLS option preceding FREQVAL and HISTOGRAM**        
  * If you have a 3 column index and you want distribution stats for the first column, the first 2 columns and all 3 columns, you must have 3 occurrences of NUMCOLS(NUMCOLS 1, NUMCOLS 2 and NUMCOLS 3).

Column List – If you list specific columns, these are added to existing stats for other columns

##### Referential Integrity

Referential Integrity helps the Optimizer. With RI, the Optimizer knows that each child row will match a single parent row if the join is on the FK columns
  * **NOT ENFORCED** - tells DB2 that there is a relationship, but DB2 doesn't enforce that relationship. However, DB2 can use that information to better optimize the statement. 

Sometimes DB2 just doesn't have enough information     
  * Host variables are used –distribution stats can't be used
  * Range predicates with host variables –how big a range?
  * Highly correlated columns, but no COLGROUP stats
  * Work tables or global temp tables with no stats

#### SELECTIVITY z/OS –The Access Path Repository

* Selectivity overrides introduced in V11 (The APR for access path hints was introduced in V10)
* APR allows statement level hints based on matching the statement text.
  - Global –any statement in the system that matches
  - Package based –limited to a specific package
* 3 types of hints
  - Access path hints (as was done via the plan_table)
  - Optimization hints (bind parameters)
  - Selectivity overrides

Two sets of tables are used     

| SYSIBM tables | User tables to feed into APR tables | 
| --- | --- | 
| SYSQUERY | DSN_USERQUERY_TABLE | 
| SYSQUERYPREDICATE | DSN_PREDICAT_TABLE | 
| SYSQUERYSEL | DSN_PREDICTE_SELECTIVITY |  

The process described in slide 58 & 59


### References
* [Db2 Notes](105-db2-notes)
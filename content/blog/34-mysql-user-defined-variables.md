---
title: MySQL User-defined variables(UDV)
date: 2020-07-12
description: Creating & Using MySQL User defined variables
tags:
  - mysql
slug: "/34-mysql-user-defined-variables"
---

MySQL UDV's are similar to variables used in programs. It can hold only single value. Prefixed with @ before the variable name. You can use UDV without declaring or initializing it. If its not declared or initialized, it will have `NULL` 

```sql
mysql> select @abc;
+------+
| @abc |
+------+
| NULL |
+------+
1 row in set (0.00 sec)
```    

<br/>

##### MySQL variable assignment

**Method 1**    
```sql
mysql> set @fn = 'Jenni';
Query OK, 0 rows affected (0.04 sec)
```

**Method 2**     
```sql
mysql> select @ln:='bluto';
+--------------+
| @ln:='bluto' |
+--------------+
| bluto        |
+--------------+
1 row in set (0.00 sec)
```    

<br/>

##### View the stored variable value 
```sql
mysql> select @fn, @ln;
+-------+-------+
| @fn   | @ln   |
+-------+-------+
| Jenni | bluto |
+-------+-------+
1 row in set (0.00 sec)

mysql> select * from actor where first_name = @fn;
+----------+------------+-----------+---------------------+
| actor_id | first_name | last_name | last_update         |
+----------+------------+-----------+---------------------+
|        4 | Jenni      | Lewis     | 2017-04-07 19:35:18 |
+----------+------------+-----------+---------------------+
1 row in set (0.01 sec)
```    

<br/>

##### At any point in time, it can hold only one value
```sql
mysql> select @aid:=actor_id, first_name, last_name, last_update from actor order by last_update desc limit 10;
+----------------+------------+--------------+---------------------+
| @aid:=actor_id | first_name | last_name    | last_update         |
+----------------+------------+--------------+---------------------+
|           1009 | Talulah    | Riley        | 2020-04-13 17:53:59 |
|           1006 | Eiza       | González     | 2020-04-13 17:47:55 |
|              4 | Jenni      | Lewis        | 2017-04-07 19:35:18 |
|           1002 | Hilary     | SWAY         | 2017-04-03 23:31:54 |
|           1000 | Cruz       | bluto        | 2017-04-03 22:36:24 |
|              3 | ED         | CHASE        | 2016-12-02 00:00:00 |
|              5 | JOHNNY     | LOLLOBRIGIDA | 2016-12-02 00:00:00 |
|              6 | BETTE      | NICHOLSON    | 2016-12-02 00:00:00 |
|              7 | GRACE      | MOSTEL       | 2016-12-02 00:00:00 |
|             10 | CHRISTIAN  | GABLE        | 2016-12-02 00:00:00 |
+----------------+------------+--------------+---------------------+
10 rows in set (0.00 sec)

mysql> select @aid;
+------+
| @aid |
+------+
|   10 |
+------+
1 row in set (0.00 sec)
```    

<br/>

##### Where this could be useful ? (Usecases)

1. **Searching for same value in multiple tables or operations.**
```sql
select 'table 1', count(*) from table1 where name = @fn
union all
select 'table 2', count(*) from table2 where name = @fn; 
(or)
delete from table1 where name = @fn;
delete from table2 where name = @fn;
```

2. **Any type of complex ranking or any counters which you would like to generate.**     
In the below query, `@rank` is getting initialized in the FROM clause like a join and incremented and SET in the SELECT clause

```sql
mysql> select actor_id, first_name, last_name, last_update, @rank:=@rank + 1 as "rank" 
       from actor, (select @rank:=0)b 
       order by last_update desc limit 10;
+----------+------------+--------------+---------------------+------+
| actor_id | first_name | last_name    | last_update         | rank |
+----------+------------+--------------+---------------------+------+
|     1009 | Talulah    | Riley        | 2020-04-13 17:53:59 |    1 |
|     1006 | Eiza       | González     | 2020-04-13 17:47:55 |    2 |
|        4 | Jenni      | Lewis        | 2017-04-07 19:35:18 |    3 |
|     1002 | Hilary     | SWAY         | 2017-04-03 23:31:54 |    4 |
|     1000 | Cruz       | bluto        | 2017-04-03 22:36:24 |    5 |
|        3 | ED         | CHASE        | 2016-12-02 00:00:00 |    6 |
|        5 | JOHNNY     | LOLLOBRIGIDA | 2016-12-02 00:00:00 |    7 |
|        6 | BETTE      | NICHOLSON    | 2016-12-02 00:00:00 |    8 |
|        7 | GRACE      | MOSTEL       | 2016-12-02 00:00:00 |    9 |
|       10 | CHRISTIAN  | GABLE        | 2016-12-02 00:00:00 |   10 |
+----------+------------+--------------+---------------------+------+
10 rows in set (0.00 sec)
```

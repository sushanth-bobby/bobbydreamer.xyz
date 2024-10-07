---
title: MySQL Tips and Tricks
date: 2020-07-06
description: MySQL Tips and Tricks that worked for me
tags:
  - mysql
slug: "/26-mysql-tips-and-tricks"
---

**Last updated** : 31/Oct/2021     

Events are in reverse chronological order. 
* 2021/10/30 - [Speeding up mySQL LOAD](#bl12)
* 2021/10/30 - [The total number of locks exceeds the lock table size](#bl11)
* 2021/10/28 - [Never do lengthy INSERT via SELECT as rollbacks are painfully slow](#bl10a)
* 2020/07/06 - [Lock wait timeout exceeded](#bl10)
* 2020/06/11 - [Creating test user with full access on test database](#bl9)
* 2020/06/11 - [MySQL commonly used commands](#bl8)
* 2020/06/11 - [Virtual columns](#bl7)
* 2020/06/11 - [Viewing specfic range of output by using OFFSET](#bl6)
* 2020/06/11 - [Output in vertical format](#bl5)
* 2020/04/26 - [on duplicate update](#bl4)
* 2020/04/26 - [Row change timestamp](#bl3)
* 2020/04/26 - [Running MySQL script from windows prompt](#bl2)
* 2020/04/26 - [Updating column values during LOAD](#bl1)

---
<a id="bl11"></a>

<br/>

##### Speeding up mySQL LOAD

My scenario, i had around 1200 csv files to be loaded and each load takes between 15 seconds(70%) and some takes around 1m30s to 4m30s. My estimation was it should complete by approx 8hrs. Why its taking so long ? Is because of Primary Key. MySQL checks the PRIMARY KEY integrity with each INSERT.

I know the data i am going to load into the table is going to be unique, so i dropped all the indexes. 

```sql
drop index uix1 on <<tablename>>;
```

What would have run for 8 hrs completed in less than 5mins

Same is the case with mass loading as well. With unique indexes it took. 
```sql
mysql> LOAD DATA INFILE 'D:/tmp/nse_daily_temp.csv'
    -> IGNORE INTO TABLE nse_daily_history2
    -> COLUMNS TERMINATED BY '|' LINES TERMINATED BY '\r\n'
    -> (symbol, series, OPEN, HIGH, LOW, CLOSE, LAST, PREVCLOSE, TOTTRDQTY, TOTTRDVAL, ts, TOTALTRADES, ISIN)
    -> ;
Query OK, 1730759 rows affected (3 hours 48 min 23.27 sec)
Records: 1730759  Deleted: 0  Skipped: 0  Warnings: 0
```

It could have taken less time without indexes. 

 
<a id="bl11"></a>

<br/>

##### The total number of locks exceeds the lock table size

To resolve, 

1. Update `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`
2. `innodb_buffer_pool_size` from 8M to 128M. `innodb_buffer_pool_size=128M`
3. Go to windows services and restart the MySQL server

<a id="bl10a"></a>

<br/>

##### Never do lengthy INSERT via SELECT as rollbacks are painfully slow

It took around 8hrs to rollback. If rows > 50k LOAD in mySQL. 

Below is a snip from output `SHOW ENGINE INNODB STATUS \G`

```sh
---TRANSACTION 59090816, ACTIVE 1856 sec recovered trx
ROLLING BACK 1 lock struct(s), heap size 1136, 0 row lock(s), undo log entries 797821
```

<a id="bl10"></a>

<br/>

##### Lock wait timeout exceeded

```sql
ERROR 1205 (HY000): Lock wait timeout exceeded; try restarting transaction
```

Got the above error message, when executing an UPDATE statement in MySQL terminal. Upon a bit of analysis found that, a program was abnormally terminated and it had the thread still active, could see in `SHOW PROCESSLIST;`. So after killing the thread, UPDATE statement was reexecuted and completed successfully in few seconds. 

```sql
mysql> show processlist;
+------+-----------------+-----------------+------+---------+--------+------------------------+------------------------------------------------------------------------------------------------------+
| Id   | User            | Host            | db   | Command | Time   | State                  | Info                                                                                                 |
+------+-----------------+-----------------+------+---------+--------+------------------------+------------------------------------------------------------------------------------------------------+
|    4 | event_scheduler | localhost       | NULL | Daemon  | 930419 | Waiting on empty queue | NULL                                                                                                 |
| 2372 | sushanth        | localhost:50242 | test | Query   |    732 | Sending data           | update qReport_JSON a, ( select a.lastupdated, a.sym, json_object('lastupdated', a.lastupdated |
| 2373 | sushanth        | localhost:50581 | test | Query   |      0 | starting               | show processlist                                                                                     |
+------+-----------------+-----------------+------+---------+--------+------------------------+------------------------------------------------------------------------------------------------------+
3 rows in set (0.00 sec)

mysql> kill 2372;
Query OK, 0 rows affected (0.00 sec)

mysql> show processlist;
+------+-----------------+-----------------+------+---------+--------+------------------------+------------------+
| Id   | User            | Host            | db   | Command | Time   | State                  | Info             |
+------+-----------------+-----------------+------+---------+--------+------------------------+------------------+
|    4 | event_scheduler | localhost       | NULL | Daemon  | 930427 | Waiting on empty queue | NULL             |
| 2373 | sushanth        | localhost:50581 | test | Query   |      0 | starting               | show processlist |
+------+-----------------+-----------------+------+---------+--------+------------------------+------------------+
2 rows in set (0.00 sec)
```
 
<a id="bl9"></a>

<br/>

##### Creating test user with full access on test database
```sql
CREATE USER 'test'@'localhost' IDENTIFIED BY 'test01';
GRANT ALL PRIVILEGES ON TEST.* To 'test'@'localhost' ;
GRANT INSERT, SELECT, DELETE, UPDATE ON test.* TO 'test'@'localhost' IDENTIFIED BY 'test01';
GRANT FILE ON *.* TO 'test'@'localhost';
GRANT EXECUTE ON PROCEDURE TEST.* TO 'test'@'localhost' identified by 'test01';
FLUSH PRIVILEGES;
```

After creating the user, can be tested by opening a new command prompt, 
```sql 
C:\Users\Sushanth>mysql -utest -p
Enter password: ******
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 344
Server version: 8.0.12 MySQL Community Server - GPL

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| sakila             |
| test               |
+--------------------+
3 rows in set (0.07 sec)
```

For python, you may need to use `mysql_native_password`, i have written a separate blog [post](24-connecting-to-mysql-from-python) for this.   

```sql 
CREATE USER 'snake_charmer'@'localhost' IDENTIFIED BY 'pepe' PASSWORD EXPIRE NEVER;
ALTER USER 'snake_charmer'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pepe';
GRANT ALL PRIVILEGES ON TEST.* To 'snake_charmer'@'localhost' ;
```

 
<a id="bl8"></a>
<br/>

##### MySQL commonly used commands
```sql
-- Both the commands display similar outputs. I prefer using indexes. 
show indexes from actor;
show keys from actor;

-- Shows all the databases in the current server 
show databases;

-- Shows all tables in the current database
show tables; 
show tables in sakila;

-- Describe command shows the structure of table which include name of the column, data-type of column and the nullability
desc actor;

-- Displays threads and their details(user, host, db, command, time and state) which are currently running in MySQL 
show processlist;

-- Display the DDL of the table actor 
show create table actor;

-- Shows the accesspath of the MySQL query
explain select * from actor where actor_id=5 ;

-- Show Server status, can look for current long running transactions to evaluate how long its going to run
SHOW ENGINE INNODB STATUS \G

```

 
<a id="bl7"></a>
<br/>

##### Virtual columns 

They appear to be normal columns but their values are calculated or derived from other columns and they are not materialized insense they are not stored in disk. 

In my usecase, i find them extremely useful when dealing with JSON columns as JSON queries are tend to get lot bigger and complex. So, this virtal column greatly helps. Heres a sample, 

```sql 
drop table if exists test.products1 ;
CREATE TABLE test.products1(
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT ,
    `name` VARCHAR(250) NOT NULL ,
    `brand_id` INT UNSIGNED NOT NULL ,
    `category_id` INT UNSIGNED NOT NULL ,
    `attributes` JSON NOT NULL ,
    PRIMARY KEY(`id`) 
);

INSERT INTO test.`products1`(`name` ,`brand_id` ,`category_id` ,`attributes`)
VALUES(
    'Bravia' ,'1' ,'1' ,
    '{"screen": "25 inch"
    , "resolution": "1366 x 768 pixels"
    , "ports": {"hdmi": 1, "usb": 0}
    , "speakers": {"left": "5 watt", "right": "5 watt"}}'
);

INSERT INTO test.`products1`(`name` ,`brand_id` ,`category_id` ,`attributes`)
VALUES(
    'Proton' ,'1' ,'1' ,
    '{"screen": "20 inch"
    , "resolution": "1280 x 720 pixels"
    , "ports": {"hdmi": 0, "usb": 0}
    , "speakers": {"left": "5 watt", "right": "5 watt"}}'
);
```

Here is a simple JSON query retreving usb > -1 
```sql 
SELECT * FROM test.`products1`
WHERE JSON_EXTRACT(`attributes` , '$.ports.usb') > -1;
mysql> SELECT * FROM test.`products1`
    -> WHERE JSON_EXTRACT(`attributes` , '$.ports.usb') > -1;
+----+--------+----------+-------------+---------------------------------------------------------------------------------------------------------------------------------------------+
| id | name   | brand_id | category_id | attributes                                                                                                                                  |
+----+--------+----------+-------------+---------------------------------------------------------------------------------------------------------------------------------------------+
|  1 | Bravia |        1 |           1 | {"ports": {"usb": 0, "hdmi": 1}, "screen": "25 inch", "speakers": {"left": "5 watt", "right": "5 watt"}, "resolution": "1366 x 768 pixels"} |
|  2 | Proton |        1 |           1 | {"ports": {"usb": 0, "hdmi": 0}, "screen": "20 inch", "speakers": {"left": "5 watt", "right": "5 watt"}, "resolution": "1280 x 720 pixels"} |
+----+--------+----------+-------------+---------------------------------------------------------------------------------------------------------------------------------------------+
2 rows in set (0.00 sec)
```

Lets add virtual column, to simplify the query, 
```sql 
ALTER TABLE test.products1 
      ADD COLUMN usb integer GENERATED ALWAYS AS (JSON_EXTRACT(`attributes` , '$.ports.usb'));
mysql> desc products1;
+-------------+------------------+------+-----+---------+-------------------+
| Field       | Type             | Null | Key | Default | Extra             |
+-------------+------------------+------+-----+---------+-------------------+
| id          | int(10) unsigned | NO   | PRI | NULL    | auto_increment    |
| name        | varchar(250)     | NO   |     | NULL    |                   |
| brand_id    | int(10) unsigned | NO   |     | NULL    |                   |
| category_id | int(10) unsigned | NO   |     | NULL    |                   |
| attributes  | json             | NO   |     | NULL    |                   |
| usb         | int(11)          | YES  |     | NULL    | VIRTUAL GENERATED |
+-------------+------------------+------+-----+---------+-------------------+
6 rows in set (0.00 sec)
```

Now all we have to do is 
```sql 
mysql> select id, name, brand_id, category_id, usb from products1 where usb > -1;
+----+--------+----------+-------------+------+
| id | name   | brand_id | category_id | usb  |
+----+--------+----------+-------------+------+
|  1 | Bravia |        1 |           1 |    0 |
|  2 | Proton |        1 |           1 |    0 |
+----+--------+----------+-------------+------+
2 rows in set (0.00 sec)
```

 
<a id="bl6"></a>
<br/>

##### Viewing specfic range of output by using OFFSET

Using offset we can review a big result or table part by part in the terminal which doesn't have scrollbars

```sql 
mysql> SELECT * FROM actor LIMIT 15;
+----------+------------+--------------+---------------------+
| actor_id | first_name | last_name    | last_update         |
+----------+------------+--------------+---------------------+
|        2 | NICK       | WAHLBERG     | 2016-12-02 00:00:00 |
|        3 | ED         | CHASE        | 2016-12-02 00:00:00 |
|        4 | Jenni      | Lewis        | 2017-04-07 19:35:18 |
|        5 | JOHNNY     | LOLLOBRIGIDA | 2016-12-02 00:00:00 |
|        6 | BETTE      | NICHOLSON    | 2016-12-02 00:00:00 |
|        7 | GRACE      | MOSTEL       | 2016-12-02 00:00:00 |
|        8 | MATTHEW    | JOHANSSON    | 2016-12-02 00:00:00 |
|       10 | CHRISTIAN  | GABLE        | 2016-12-02 00:00:00 |
|       11 | ZERO       | CAGE         | 2016-12-02 00:00:00 |
|       12 | KARL       | BERRY        | 2016-12-02 00:00:00 |
|       13 | UMA        | WOOD         | 2016-12-02 00:00:00 |
|       14 | VIVIEN     | BERGEN       | 2016-12-02 00:00:00 |
|       15 | CUBA       | OLIVIER      | 2016-12-02 00:00:00 |
|       16 | FRED       | COSTNER      | 2016-12-02 00:00:00 |
|       17 | HELEN      | VOIGHT       | 2016-12-02 00:00:00 |
+----------+------------+--------------+---------------------+
15 rows in set (0.00 sec)
```

What below query does is,   
* **LIMIT 5** : Limits number of rows to be retreived to 5
* **OFFSET 5**: Retreive rows after skipping 5 rows from the resultset

```sql 
mysql> SELECT * FROM actor LIMIT 5 offset 5;
+----------+------------+-----------+---------------------+
| actor_id | first_name | last_name | last_update         |
+----------+------------+-----------+---------------------+
|        7 | GRACE      | MOSTEL    | 2016-12-02 00:00:00 |
|        8 | MATTHEW    | JOHANSSON | 2016-12-02 00:00:00 |
|       10 | CHRISTIAN  | GABLE     | 2016-12-02 00:00:00 |
|       11 | ZERO       | CAGE      | 2016-12-02 00:00:00 |
|       12 | KARL       | BERRY     | 2016-12-02 00:00:00 |
+----------+------------+-----------+---------------------+
5 rows in set (0.00 sec)
```

 
<a id="bl5"></a>
<br/>

##### Output in vertical format 

Usually when we are retreiving data from table we expect to be in table format but at certain times, when we want to report or note it down, it will be better if its in 'vertial format'. 

**Default format**
```sql 
mysql> select * from actor limit 1;
+----------+------------+-----------+---------------------+
| actor_id | first_name | last_name | last_update         |
+----------+------------+-----------+---------------------+
|        2 | NICK       | WAHLBERG  | 2016-12-02 00:00:00 |
+----------+------------+-----------+---------------------+
1 row in set (0.00 sec)
```

**Vertical format**
```sql 
mysql> select * from actor limit 1\G
*************************** 1. row ***************************
   actor_id: 2
 first_name: NICK
  last_name: WAHLBERG
last_update: 2016-12-02 00:00:00
1 row in set (0.00 sec)
```

 
<a id="bl4"></a>
<br/>

##### on duplicate update

```sql {25-26}
drop table if exists test_abc;
create table test_abc(
lastUpdated timestamp not null DEFAULT CURRENT_timestamp ON UPDATE CURRENT_timestamp
,name   VARCHAR(100) not null default ''
,place  VARCHAR(100) not null default ''
,animal VARCHAR(100) not null default ''
,things VARCHAR(100) not null default ''
);
create unique index uix1 on test_abc(name);

insert ignore into test_abc(name, place, animal, things) values
	('Sushanth', 'Chennai', 'Human', 'Sony Vaio user');
insert ignore into test_abc(name, place, animal, things) values
	('Bobby', 'Chennai', 'Human', 'Windows user');

select * from test_abc;
+---------------------+----------+---------+--------+----------------+
| lastUpdated         | name     | place   | animal | things         |
+---------------------+----------+---------+--------+----------------+
| 2020-04-26 12:14:13 | Bobby    | Chennai | Human  | Windows user   |
| 2020-04-26 12:14:13 | Sushanth | Chennai | Human  | Sony Vaio user |
+---------------------+----------+---------+--------+----------------+
2 rows in set (0.00 sec)

insert into test_abc(name, place, animal, things) values('Bobby', 'Earth', 'Human', 'Windows user')
       on duplicate key update place = values(place);
Query OK, 2 rows affected (0.13 sec)

select * from test_abc;
+---------------------+----------+---------+--------+----------------+
| lastUpdated         | name     | place   | animal | things         |
+---------------------+----------+---------+--------+----------------+
| 2020-04-26 12:14:29 | Bobby    | Earth   | Human  | Windows user   |
| 2020-04-26 12:14:13 | Sushanth | Chennai | Human  | Sony Vaio user |
+---------------------+----------+---------+--------+----------------+
2 rows in set (0.00 sec)

drop table test_abc;
```
>  VALUES(col_name) in the ON DUPLICATE KEY UPDATE clause refers to the value of col_name that would be inserted, had no duplicate-key conflict occurred

Above when it says, "2 rows affected", its not two rows, its just value 2, for example,    

* if 0, had come, it means nothing is udpated
* 1 means row is inserted
* 2 means row is updated.     

Its confusing a bit here but it is how it is.

 
<a id="bl3"></a>
<br/>

##### Row change timestamp

Represents timestamp, when the row was last changed.
```sql {3,20-21,30}
drop table if exists test_abc;
create table test_abc(
lastUpdated timestamp not null DEFAULT CURRENT_timestamp ON UPDATE CURRENT_timestamp
,name   VARCHAR(100) not null default ''
,place  VARCHAR(100) not null default ''
,animal VARCHAR(100) not null default ''
,things VARCHAR(100) not null default ''
);
create unique index uix1 on test_abc(name);

insert ignore into test_abc(name, place, animal, things) values
	('Sushanth', 'Chennai', 'Human', 'Sony Vaio user');
insert ignore into test_abc(name, place, animal, things) values
	('Bobby', 'Chennai', 'Human', 'Windows user');

select * from test_abc;
+---------------------+----------+---------+--------+----------------+
| lastUpdated         | name     | place   | animal | things         |
+---------------------+----------+---------+--------+----------------+
| 2020-04-26 11:57:30 | Bobby    | Chennai | Human  | Windows user   |
| 2020-04-26 11:57:30 | Sushanth | Chennai | Human  | Sony Vaio user |
+---------------------+----------+---------+--------+----------------+

update test_abc SET place = 'Earth' where name = 'Bobby';

select * from test_abc;
+---------------------+----------+---------+--------+----------------+
| lastUpdated         | name     | place   | animal | things         |
+---------------------+----------+---------+--------+----------------+
| 2020-04-26 11:57:35 | Bobby    | Earth   | Human  | Windows user   |
| 2020-04-26 11:57:30 | Sushanth | Chennai | Human  | Sony Vaio user |
+---------------------+----------+---------+--------+----------------+
2 rows in set (0.00 sec)

drop table test_abc;
```
 
<a id="bl2"></a>
<br/>

##### Running MySQL script from windows prompt

Below is the load card to truncate and load data into mySQL table
```sql:title=LR-N_TI.sql
truncate table N_TI
LOAD DATA INFILE 'D:/BigData/12. Python/data/TI.csv'
IGNORE INTO TABLE N_TI
COLUMNS TERMINATED BY '|' LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(ts, unitName, TI180d, p180d, TI3d, p3d, TI5d, p5d, TI15d, p15d, TI30d, p30d)
;
```

Below windows batch file to execute the above load control card,
```sh:title=dataLoads.bat
mysql -uroot -predpill test < ../data/loadcards/LR-N_TI.sql > ../data/outputs/LR-N_TI.out
```

**FYI** : *Load card* - Its a mainframe term meaning a member(equivalent to file in folder) containing load statement.

 
<a id="bl1"></a>
<br/>

##### Updating column values during LOAD

```sql
LOAD DATA INFILE 'D:/BigData/12. Python/data/TI.csv'
IGNORE INTO TABLE N_TI
COLUMNS TERMINATED BY '|' LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(ts, unitName, TI180d, p180d, TI3d, p3d, TI5d, p5d, TI15d, p15d, TI30d, p30d)
;
```
Line number and description,      

1. Input file path, its Windows, so remember its a forward slash
1. `IGNORE` ignores duplicates while loading into table 
1. Columns are terminated by pipe symbol(`|`) rather than comma(`,`) as unitName can contain commas. 
1. Ignore the header line 
1. Table Column names as they appear in the delimited file 

**Updating values while loading the table**      

`SET` clause can be used for this purpose, all MySQL functions can be used.
```sql {6}
LOAD DATA INFILE 'D:/BigData/12. Python/data/TI.csv'
IGNORE INTO TABLE N_TI
COLUMNS TERMINATED BY '|' LINES TERMINATED BY '\r\n'
IGNORE 1 LINES
(ts, @var_unitName, @var_status, TI180d, p180d, TI3d, p3d, TI5d, p5d, TI15d, p15d, TI30d, p30d) 
SET
ts = str_to_date(@ts, '%d-%b-%Y')
, unitName = trim(@var_unitName)
, status = if(@var_status = '',null,@var_status);
```


### Thanks
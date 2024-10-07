---
title: mySQL Partitions
date: 2021-10-15
description: Setting up partitions in mySQL tables
tags: ['time-wasted', 'mysql']
slug: "/130-mysql-partitions"
---

Partitioning is a way of splitting up big tables into small pieces, so it can be managed much efficiently. 

#### Problem

My only big problem was, deletes were are too slow. That actually got me to other problems thinking about alternatives. 

#### Scenario

When initially designing this table, i assumed, partitioning is not required as i didn't have any usecase for it. 
1. All queries and DML operations were using proper unique indexes. 
2. Full unloads from table are considerably fast. 1.7M rows takes 30secs. 
3. There is no mass loading. But everyday around 4k rows will be loaded into the table. 
4. I am moving rows older than a year to a history table that takes around 15-30secs not a biggie. 

* * * 

#### New requirement

1. One time mass loading of data ( 500k rows ). One big file here. 
2. Will be archiving large amount of data 

#### Experience

Both the new requirements were very slow with existing design. Both the activities took more than 4hrs and rollbacks took equal amount of time. 

How partition could have helped,

1. Mass loading. Couple of options, 
    * Data could have been splitted and run as separate tasks for each partition. This is additional work, splitting up of data. 
    * Drop indexes and load the table when you know, the data being loaded is unique. 

2. Archiving large amount of data 
    * Instead of deleting few thousands of rows via DELETE statement, partition could have been dropped. 

#### What is to be done ? 

Partitioning!

Following [Rick's RoTs - Rules of Thumb for MySQL](http://mysql.rjweb.org/doc.php/partitionmaint) here, 
1. Don't use PARTITION unless you will have >1M rows - I have more than 9M rows. 
2. No more than 50 PARTITIONs on a table - Going to create yearly partitions. 
3. PARTITION BY RANGE is the only useful method
4. SUBPARTITIONs are not useful

* * * 

##### Converting non-partitioned table to partitioning

```sql
ALTER TABLE bse_daily_part  
PARTITION BY RANGE (TO_DAYS(ts)) (
 PARTITION past   VALUES LESS THAN (TO_DAYS('2021-01-01')),
 PARTITION jan21  VALUES LESS THAN (TO_DAYS('2021-02-01')),
 PARTITION future VALUES LESS THAN (MAXVALUE) );
```

**Note** : *future* partition is to catch the overflows


##### Creating a new partition and moving data
```sql
ALTER TABLE bse_daily_part
    REORGANIZE PARTITION future INTO (
        PARTITION feb21 VALUES LESS THAN (TO_DAYS('2021-03-01')),
        PARTITION future    VALUES LESS THAN (MAXVALUE)
    );

mysql> SELECT PARTITION_NAME, TABLE_ROWS, PARTITION_EXPRESSION, PARTITION_DESCRIPTION
    -> FROM INFORMATION_SCHEMA.PARTITIONS WHERE TABLE_NAME = 'bse_daily_part'
    -> ;
+----------------+------------+----------------------+-----------------------+
| PARTITION_NAME | TABLE_ROWS | PARTITION_EXPRESSION | PARTITION_DESCRIPTION |
+----------------+------------+----------------------+-----------------------+
| feb21          |          0 | to_days(`ts`)        | 738215                |
| future         |          0 | to_days(`ts`)        | MAXVALUE              |
| jan21          |      69247 | to_days(`ts`)        | 738187                |
| past           |          0 | to_days(`ts`)        | 738156                |
+----------------+------------+----------------------+-----------------------+
4 rows in set (0.00 sec)
```

* * * 

#### Partition management

##### ANALYZE PARTITION

This reads and stores the key distributions for partitions.

```sql
ALTER TABLE bse_daily_part ANALYZE PARTITION feb21;
+---------------------+---------+----------+----------+
| Table               | Op      | Msg_type | Msg_text |
+---------------------+---------+----------+----------+
| test.bse_daily_part | analyze | status   | OK       |
+---------------------+---------+----------+----------+
1 row in set (0.25 sec)

mysql> SELECT PARTITION_NAME, TABLE_ROWS, PARTITION_EXPRESSION, PARTITION_DESCRIPTION
    -> FROM INFORMATION_SCHEMA.PARTITIONS WHERE TABLE_NAME = 'bse_daily_part'
    -> ;
+----------------+------------+----------------------+-----------------------+
| PARTITION_NAME | TABLE_ROWS | PARTITION_EXPRESSION | PARTITION_DESCRIPTION |
+----------------+------------+----------------------+-----------------------+
| feb21          |      68347 | to_days(`ts`)        | 738215                |
| future         |          0 | to_days(`ts`)        | MAXVALUE              |
| jan21          |      69247 | to_days(`ts`)        | 738187                |
| past           |          0 | to_days(`ts`)        | 738156                |
+----------------+------------+----------------------+-----------------------+
4 rows in set (0.01 sec)
```

##### Empty a partition 
```sql
ALTER TABLE bse_daily_part TRUNCATE PARTITION future;
```

##### Dropping a partition
```sql
ALTER TABLE bse_daily_part DROP PARTITION feb21;
```


##### OPTIMIZE PARTITION

If you have deleted a large number of rows from a partition or if you have made many changes to a partitioned table with variable-length rows (that is, having VARCHAR, BLOB, or TEXT columns), you can use ALTER TABLE ... OPTIMIZE PARTITION to reclaim any unused space and to defragment the partition data file.

```sql
ALTER TABLE bse_daily_part OPTIMIZE PARTITION past, jan21;
```

OPTIMIZE PARTITION = Equivalent to running CHECK PARTITION + ANALYZE PARTITION + REPAIR PARTITION on those specific partitions

#### Advantages of partitioning

##### Querying specific partition 
```sql
select * from bse_daily_part partition(feb21) limit 10;
```

##### Query Pruning 

Below query accesses the specific partition jan21
```sql
explain select * from bse_daily_part where ts = '2021-01-05' limit 5;
+----+-------------+----------------+------------+------+---------------+------+---------+-------+------+----------+-------+
| id | select_type | table          | partitions | type | possible_keys | key  | key_len | ref   | rows | filtered | Extra |
+----+-------------+----------------+------------+------+---------------+------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | bse_daily_part | jan21      | ref  | uix1          | uix1 | 5       | const | 7120 |   100.00 | NULL  |
+----+-------------+----------------+------------+------+---------------+------+---------+-------+------+----------+-------+
1 row in set, 1 warning (0.27 sec)
```


### References

* [Rick James - PARTITION Maintenance in MySQL](http://mysql.rjweb.org/doc.php/partitionmaint)

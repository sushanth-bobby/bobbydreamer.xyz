---
title: mySQL - Housekeeping basics
date: 2021-05-19
description: Basics on mySQL table maintenance
tags: ['mysql']
slug: "/97-mysql-housekeeping"
---

Being a Db2 DBA, i know the importance of regular housekeeping. In mySQL test tables, most of the time there won't be any maintenance scenarios due to less data. Sometimes when they do need maintaining, below are the things i do. 

Run the below query to check the current sizes

```sql
SELECT engine, table_name
  ,ROUND(( data_length + index_length ) / ( 1024 * 1024 ), 2) "TOTAL_SIZE(MB)"
  ,ROUND(( data_free ) / ( 1024 * 1024 ), 2) "DATA_FREE(MB)"
  ,(data_free/(index_length+data_length)) AS FRAG_RATIO
  ,ROUND(((Data_length - (table_rows * avg_row_length))/data_length) * 100, 2) "FRAG%"
FROM information_schema.tables
WHERE table_schema = DATABASE() AND data_free > 0
ORDER BY FRAG_RATIO DESC LIMIT 10;

+--------+-----------------+----------------+---------------+------------+-------+
| ENGINE | TABLE_NAME      | TOTAL_SIZE(MB) | DATA_FREE(MB) | FRAG_RATIO | FRAG% |
+--------+-----------------+----------------+---------------+------------+-------+
| InnoDB | batch_status    |           0.36 |          5.00 |    13.9130 |  1.01 |
| InnoDB | messages        |           4.20 |         12.00 |     2.8550 |  0.05 |
| InnoDB | rating          |           1.47 |          4.00 |     2.7234 |  0.22 |
| InnoDB | bti             |           1.52 |          4.00 |     2.6392 |  0.02 |
| InnoDB | ntopnhigh       |           1.52 |          4.00 |     2.6392 |  0.19 |
| InnoDB | ntopnlow        |           1.52 |          4.00 |     2.6392 |  0.16 |
| InnoDB | dndata          |           1.52 |          4.00 |     2.6392 |  0.19 |
| InnoDB | ntv             |           1.52 |          4.00 |     2.6392 |  0.14 |
| InnoDB | bclose          |           1.52 |          4.00 |     2.6392 |  0.09 |
| InnoDB | nclose          |           1.63 |          4.00 |     2.4615 |  0.15 |
+--------+-----------------+----------------+---------------+------------+-------+
10 rows in set (0.02 sec)
```

If FRAG% is > 2 then we can take below actions when its less than that you can consider the fragmentation is low. 

##### OPTIMIZE TABLE

This reorganizes the physical storage of table data and associated index data, to reduce storage space and improve I/O efficiency when accessing the table.

```sql
mysql> optimize table links;
+---------------+----------+----------+-------------------------------------------------------------------+
| Table         | Op       | Msg_type | Msg_text                                                          |
+---------------+----------+----------+-------------------------------------------------------------------+
| test.links    | optimize | note     | Table does not support optimize, doing recreate + analyze instead |
| test.links    | optimize | status   | OK                                                                |
+---------------+----------+----------+-------------------------------------------------------------------+
2 rows in set (29.24 sec)
```

When looking at the docs there were other alternative options recommended like, 
1. Use `ALTER TABLE tbl_name FORCE` to perform a “null” alter operation that rebuilds the table.

2. To speed up index scans, you can periodically perform a “null” ALTER TABLE operation, which causes MySQL to rebuild the table:
    ``` sql 
    ALTER TABLE tbl_name ENGINE=INNODB
    ```

Trying the first option, i didn't get much results. Second option worked for me. Below are the results

##### Test 1

```sql 
-- Before 
+--------+---------------------------+-------------+--------------+-----------+
| ENGINE | TABLE_NAME                | data_length | index_length | data_free |
+--------+---------------------------+-------------+--------------+-----------+
| InnoDB | metrics                   |          11 |           26 |        31 |
+--------+---------------------------+-------------+--------------+-----------+

alter table metrics engine=InnoDB;

-- After 
+--------+---------------------------+-------------+--------------+-----------+
| ENGINE | TABLE_NAME                | data_length | index_length | data_free |
+--------+---------------------------+-------------+--------------+-----------+
| InnoDB | metrics                   |           8 |            6 |         2 |
+--------+---------------------------+-------------+--------------+-----------+
```

##### Test 2
```sql 
-- Before 
+-------------------+----------------+---------------+
| TABLE_NAME        | TOTAL_SIZE(MB) | DATA_FREE(MB) |
+-------------------+----------------+---------------+
| links             |         156.77 |         17.00 |
+-------------------+----------------+---------------+
10 rows in set (0.01 sec)

mysql> alter table links engine=InnoDB;
Query OK, 0 rows affected (18.20 sec)
Records: 0  Duplicates: 0  Warnings: 0

-- After 
+-------------------+----------------+---------------+
| TABLE_NAME        | TOTAL_SIZE(MB) | DATA_FREE(MB) |
+-------------------+----------------+---------------+
| links             |          84.20 |          4.00 |
+-------------------+----------------+---------------+
```

##### ANALYZE TABLE 

ANALYZE TABLE performs a key distribution analysis and stores the distribution for the named table or tables.

```sql 
mysql> analyze table links;
+---------------+---------+----------+----------+
| Table         | Op      | Msg_type | Msg_text |
+---------------+---------+----------+----------+
| test.links    | analyze | status   | OK       |
+---------------+---------+----------+----------+
1 row in set (3.94 sec)

```

After the reorgs, you can run the statistics

#### Thanks
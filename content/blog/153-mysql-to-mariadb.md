---
title: Migrating from MySQL to MariaDB
date: 2024-11-04
description: Migrating from MySQL to MariaDB
tags:
  - mysql
  - mariadb
slug: /153-mysql-to-mariadb
---

Some of the mysql dump data files had
```
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
```

Due to this got the error
```
ERROR 1273 (HY000) at line 25: Unknown collation: 'utf8mb4_0900_ai_ci'
```

Few information, i had got is, 
* The "ai" in the collation name stands for "accent insensitive" and the "ci" stands for "case insensitive." This means that comparisons between characters are done without considering differences in case or accents.

* Also somehow, it seems latest MariaDB is somehow a bit older than MySQL version 8 which i was having. So, it doesn't have the required database collation.

Updated all the .sql files manually, 
```
from: CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
to  : CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_520_ci;
```

And i was able to run below commands for multiple tables without an issue, 
```
 mysql -h localhost -u%dbuser1% -p%dbpwd1% test < "D20241017 t_dates.sql" 
```

---

### References
* [StackOverflow - mysql to mariadb: unknown collation utf8mb4_0900_ai_ci](https://dba.stackexchange.com/questions/248904/mysql-to-mariadb-unknown-collation-utf8mb4-0900-ai-ci)
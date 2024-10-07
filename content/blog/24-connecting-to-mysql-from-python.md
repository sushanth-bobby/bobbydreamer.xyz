---
title: Connecting to mySQL from Python
date: 2020-04-13
description: Connecting to mySQL from Python
tags:
  - python
  - pandas
  - mysql
  - e&s
slug: "/24-connecting-to-mysql-from-python"
---

Connecting to database is mostly next step after playing with text/csv files. Here, i am trying to connect to mySQL which i have installed in my laptop using Jupyter Notebook and it seems i have not installed mysql package. 

Installed the following,    

1. Installed `mysql-connector-python-8.0.19-windows-x86-64bit.msi` which i had got from [dev.mysql.com](https://dev.mysql.com/downloads/)

1. Installing with pip as well,    
  ```sh
  pip install mysql-connector-python
  ```

1. Verifying installation,
  ```sh
  C:\Users\Sushanth>python
  Python 3.5.2 (v3.5.2:4def2a2901a5, Jun 25 2016, 22:01:18) [MSC v.1900 32 bit (Intel)] on win32
  Type "help", "copyright", "credits" or "license" for more information.
  >>> import mysql
  >>> exit()
  ```
  Note : Above step would fail, if there were any issues. 

Next, i tried to run the below code from Jupyter Notebook,
  ```py
  import mysql.connector

  cnx = mysql.connector.connect(user='test', password='test01',
                                host='localhost',
                                database='TEST')
  print(cnx)
  cnx.close()
  ```
This failed with below message, 
  ```
  NotSupportedError: Authentication plugin 'caching_sha2_password' is not supported
  ```

It seems from from MySQL 8.0, `caching_sha2_password` is the default authentication plugin rather than `mysql_native_password` and thats the issue. 

To resolve this, i created a new user with `mysql_native_password`, below are the steps,    

1. Login into mysql as admin user . `mysql -u root -p`

1. Create a new user 
  ```sql
  CREATE USER 'snake_charmer'@'localhost' IDENTIFIED BY 'pepe' PASSWORD EXPIRE NEVER;
  ```

1. Alter user to be identified with `mysql_native_password`
  ```sql
  ALTER USER 'snake_charmer'@'localhost' IDENTIFIED WITH mysql_native_password BY 'pepe';
  ```

1. Grant privileges to new user. Since this is test, i am giving everything. 
  ```sql
  GRANT ALL PRIVILEGES ON TEST.* To 'snake_charmer'@'localhost' ;
  ```

1. Check the grants
  ```sql
  mysql> show grants for 'snake_charmer'@'localhost';
  +-----------------------------------------------------------------+
  | Grants for snake_charmer@localhost                              |
  +-----------------------------------------------------------------+
  | GRANT USAGE ON *.* TO `snake_charmer`@`localhost`               |
  | GRANT ALL PRIVILEGES ON `test`.* TO `snake_charmer`@`localhost` |
  +-----------------------------------------------------------------+
  2 rows in set (0.10 sec)
  ```

Retry the python connection code in Jupyter again, it should work.

Python SELECT example,
```py
cnx = mysql.connector.connect(**config)
cursor = cnx.cursor()

query = ("SELECT actor_id, first_name, last_name, last_update FROM actor "
         "WHERE last_update BETWEEN %s AND %s")

hire_start = dt.date(2016, 12, 10)
hire_end = dt.date(2017, 12, 31)

cursor.execute(query, (hire_start, hire_end))

for (actor_id, first_name, last_name, last_update) in cursor:
    print("actorID={}, first_name={}, last_name={}, last_update={:%d %b %Y}" \
          .format(actor_id, first_name, last_name, last_update))

cursor.close()
cnx.close()
```

Output:    
```sh
actorID=4, first_name=Jenni, last_name=Lewis, last_update=07 Apr 2017
actorID=1000, first_name=Cruz, last_name=bluto, last_update=03 Apr 2017
actorID=1002, first_name=Hilary, last_name=SWAY, last_update=03 Apr 2017
```

More information
* [Authentication plugin 'caching_sha2_password' is not supported](https://stackoverflow.com/questions/50557234/authentication-plugin-caching-sha2-password-is-not-supported)
* [Querying Data Using Connector/Python](https://dev.mysql.com/doc/connector-python/en/connector-python-example-cursor-select.html)
* [Inserting Data Using Connector/Python](https://dev.mysql.com/doc/connector-python/en/connector-python-example-cursor-transaction.html)
* [Python - MySQL Database Access](https://www.tutorialspoint.com/python/python_database_access.htm)
* [Getting Started with MySQL in Python](https://www.datacamp.com/community/tutorials/mysql-python)
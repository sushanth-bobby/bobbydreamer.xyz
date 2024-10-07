---
title: Db2 - Beginners Guide to Locks, Latches, Claims and Drains
date: 2021-06-19
description: Db2 ABCs of Filter Factor by Joe Geller
tags: ['db2-notes', 'db2-locks']
slug: "/108-db2-a-beginners-guide-to-locks-latches-claims-and-drains"
---

**Presentation by**: Steve Thomas, CA Technologies       
**Date**: May 01, 2017, IDUG Db2 North American Tech Conference, Anaheim, California      
**Slides**: [A Beginners guide to Locks Latches Claims and Drains in DB2 for zOS](https://storage.googleapis.com/bobbydreamer-com-technicals/db2/Db2-A-Beginners-guide-to-Locks-Latches-Claims-and-Drains-in-DB2-for-zOS.pdf)       
**Actual Presentation:** [Youtube : A Beginners Guide to Locks, Latches, Claims and Drains in Db2 for zOS](https://youtu.be/6ldQ7NK9kXo)       

Locking ensures data integrity

One of the key requirements for ACID transactions       
* **Atomic:** Unit of Recovery should be atomic. *All or Nothing*
* **Consistent:** It should be consistent but only consistent after commit. Database in the middle of the transaction might not be consistent but in the end it will be. 
* **Isolation:** If there are two units of work they cant be dependent on each other as far as recovery is concerned otherwise you have one UoW not two. Concurrent transactions not inter-dependent
* **Durable:** Once you commit, that database is persistent. 

Every lock in Db2 costs around same in terms of resources(non-data sharing envirnoment)       
* Roughly same number of instructions
* 500-600 bytes of memory(V10 560 bytes)
* Cheapest lock is the table level lock but no one else will be able to do any work. 

> What you want to do in general is to hold smallest number of smallest locks you can for the shortest time. This will allow everybody else process as much as possible. 

* Db2 stores locks in IRLM(Internal Resource Lock Manager), its a separate address space(ssidIRLM). This IRLM concept is from IMS. 

* In data sharing environment, Db2 stores locks in Coupling Facility and each member has its own IRLM but there is a lock structure in the coupling facility that contains the locks for the data sharing system. 

* Db2 used to store locks in 64bit memory since V8.       
  - Single Db2 subsystem can hold 100m locks
  - Typical 2GB IRLM can hold just over 3M locks

### Four Essential locking concepts

* Scope
  - How much data is locked
* Mode
  - What type of lock has been requested
* Duration
  - How long the lock is held
* Isolation
  - Describes the impact of Units of Work(UOW) on each other
  - Works both ways - a UoW can impact and/or ignore others. 

### # Scope - how much data is locked

* Determined by `LOCKSIZE` in `CREATE/ALTER TABLESPACE`
  - Can be changed using `LOCK TABLE` SQL or by Lock Escalation
* Lock options
  - Tablespace
  - Partition - Not available in DDL - only DML or Lock Escalation
  - Table - Only for Segmented TS
  - Row or Page - Mutually exclusive - An object can be either be using row or page level locking and not both. Default is PAGE
* XML and LOB lcoks also used for specific datatypes
* DDL includes LOCKSIZE ANY clause but no such lock exists
  * PAGE lcoks are usually used
  * ROW locks used for implicit tablespaces(if you create tables without creating tablespaces those tables will be using ROW level locking). In data sharing environments that could cause some impacts. 
* There is no tablespace level lock for partitioned object. 

#### Lock Escalation

* Page or Row locks can escalate to higher scope locks
  - Segment tablespace will escalate to table
  - Partition tablespace will escalate to partition
* Controlled by LOCKMAX in DDL or NUMLKTS DSNZPARM
  - NUMLKTS defaults to 2k in Db2 11
* Only LOCKSIZE ANY defaults to LOCKMAX SYSTEM
  - Others settings all default to LOCKMAX 0 or no escalation
* Ensure frequent COMMIT to release locks. 

#### Maximum Lock Threshold for single UOW

* Maximum number of page or row locks a UoW may hold
  - Concurrently across all tablespaces
  - Note this does not include higher scope locks
  - But does include LOB locks as these are at same level 
* Controlled by DSNZPARM NUMLKUS
  - Default in Db2 11 is 10k
* If this is exceeded the application will abort
  - SQLCODE -904 with reason code 00C90096

### # Lock Modes for Page and Row Locks

3 Lock Modes are available at Page and Row level 

![Db2 Lock modes](assets/108-db2-locks-modes.png)

* S(Shared)
  - SELECT, FETCH, some OPEN CURSOR
* X(Exclusive)
  - Any SQL that modifies data
  - INSERT, UPDATE, DELETE, MERGE
* U(Update)
  - Added in 1986
  - Fetch for Update
  - Promoted to an X lock when the data is modified
  - Helps prevents deadlocks
    * Provided you tell Db2 of your intentions.

If you look at it, two U locks are not compatible with each other. If two people try to update the same page, second one is going to wait. 

![Db2 Lock hierarchy](assets/108-db2-locks-hierarchy.png)

Imagine a scenario, where user1 has an X lock on a row and user2 is trying to lock the table by issuing a LOCK TABLE statement or user2 application trying to escalate to higher level which is incompatible with X lock of user1. If Db2 didn't have other types of locks, they have look at every page on the object to determine whether there was a compatible on lock on it before it can take the lock escalation or the LOCK TABLE statement. So what Db2 does is, it takes intent locks. So you take X lock at the row level, Db2 takes IX lock one-up the hierarchy, now you issue a LOCK TABLE statement, Db2 can see somebody has X lock lower down because it can see intent lock higher-up. It has to check one lock, so its better for performance. 

You have IS(Intent Share) and IX(Intent Exclusive) to handle these scenarios. There is a SIX locks(Share with Intent Exclusive). This is a rare one, how you get this is, you take an IX lock and then issue LOCK TABLE for SHARE. So you have page or row lock locked at Exclusive level and then issue a LOCK TABLE at SHARE mode. 

![Db2 Locks Compatibility Matrix](assets/108-db2-locks-compat-matrix-higher-scope-locks.png)

#### Lock Contention and Timeout

* If Db2 encounters an incompatible lock, it will sit and wait for that lock to be released by whoever holds that lock to commit. 
* Db2 waits till defined wait time in DSNZPARM IRLMRWT
  - Default is 30 seconds 
* In data sharing, this is bit longer as in Db2 there is a deadlock detection cycle. 
  - IRLMRWT + Deadlock detection cycle time = the max time you can wait. 
* A timeout occurs when Db2 detects a wait exceeds threshold
  - SQLCODE -911 or -913 with reason code 00C9008E

#### Deadlocks

* Most lock contention is handled by waiting. 
* In deadlocks one application must be aborted to make progress

![Db2 Deadlocks](assets/108-db2-locks-deadlock.png)

1. T1 - Application A places a U-lock on PageA
2. T2 - Application B places a U-lock on PageB
3. T3 - Application A tries to place a X-lock on PageB which App B has got. So, it waits. 
  * If AppB commits, that lock is released and AppA carries on quiet happily. 
4. T4 - Application B tries to place a X-lock on PageA which App A has locked. Now neither application can continue. AppA is waiting for AppB and AppB is waiting for AppA. 

If Db2 spots these, its going to abort one of these applications. 

#### Deadlocks Detection and How to avoid them

* Db2 operates a Deadlock Detection Cycle
  - Managed by DSNZPARM DEADLOCK - default 1 second
* One application is *selected* to be aborted
  - You have no control over which one Db2 selects
  - If one of the objects is NOT LOGGED, Db2 will choose the other 
* How to avoid Deadlocks ? 
  - Ensure you access objects in the same order
  - Use FOR UPDATE clause when you know you are going to update 
  - Row locking can help but it causes increased locking. 

### # Duration

* Controlled by SQL **COMMIT** AND BIND option **RELEASE**
* BIND option ACQUIRE redundant since Db2 10
* Page and Row locks are always released at commit. 
* Bind parameters RELEASE account for only higher level locks. 
* RELEASE(COMMIT)
  - Releases Tablespace, Table and Partition locks at COMMIT
  - Exept those needed to maintain cursor position if WITH HOLD used 
    + If lock escalation had happened like started with Page/Row lock and got escalated to Tablespace lock in this case higher level locks will be downgraded back to intent locks and there won't be any escalation situation anymore. 
* RELEASE(DEALLOCATE)
  - Cheaper but naturally holds locks for longer. 
  - Saves releasing and re-acquiring locks when thread terminates
    + Most often *Intent Locks* and *Package Locks* (used internally by Db2)
  - It is required to use High Performance DBATs
  - Main Availability issue was the package locks
    + These prevented BIND, DDL and OLS Materializing REORGs
  - New DSNZPARM PkGREL_COMMIT option in Db2 V11
    + At COMMIT Db2 checks for waiters on the package lock
    + If any exist temporarily switches Package to RELEASE(COMMI)
    + Allows (RE)BIND, DDL or REORG to proceed

### # Isolation

This tells the behaviour that Db2 has to do     
  * What you do if you encounter locks taken by another UoW
  * What can others can do to data you've read but not updated
       
* Mainly controlled by BIND parameter ISOLATION

#### ISOLATION options

* **RR -- Repeatable Read**
  - You can read only fully committed updates, so data you read are consistent and persistent
  - All your locks are retained until COMMIT
  - Db2 locks anything it touches including any non-qualifying rows
    + Rows that are accessed during predicate evaluation
    + Even rows that was not returned to your program

* **RS -- Read Stability**
  - Similar to RR but locks are held only on qualifying rows
  - Others can read and update non-qualifying rows as well as INSERT data

* **CS -- Cursor Stability** 
  - You can only read fully committed updates
  - You take a lock only when you are *CURRENT of Cursor*
    + Released when you fetch the next row(depends on CURRENTDATA)
  - X-Locks are retained until COMMIT(S and U released when next row is fetched)
  - If you re-read the same row twice within a UoW it may have changed. 
  - This is commonly used by application to ensure data integrity

* **UR -- Uncommitted Read**
  - You can read any data, if it is uncommitted and locked
    + Data could be inconsistent and not persistent
  - You take no read locks but claims are still used along with Update, XML and LOB locks.

**CURRENTDATA**       

* BIND option which relates only to ISOLATION(CS)
* Determines locking for read only or ambiguous cursors
  - CURRENTDATA(YES) - Db2 doesn't release locks when using ISO(CS). So, locks are not released when you go on to next row. 
  - CURRENTDATA(NO) - Releases locks(default from V9)
    + Enables Block Fetch, High Performance DBATs
  - Use FOR UPDATE if updating data or Optimistic Locking instead

**Overriding Isolation at Statement level**       

* SKIP LOCKED DATA clause in DML
  - Supported for isolation CS & RS using Row and Page locks only 
* USE CURRENTLY COMMITTED
  - If a transaction has deleted rows and it hasn't committed and another program using USE CURRENTLY COMMITTED can read the deleted rows as it has not been committed. 
  - Provides similar benefits as ISO(UR) - no lock waits. But you ge an older commmitted and consistent version of the data. 
  - This is bit advanced have to set zParm(EVALUNC, SKIPUNCI) and bind option(CONCURRENTACCESSRESOLTION)

#### LOB Locks

* Mostly locks on base objects are used. 
* S-LOB lock is acquired and released immediately to ensure no partial LOBs are processed or LOB not matching base row.
* Db2 takes X-LOB lock on insert and released immediately on completion of operation not at COMMIT. 
  - Ensures page consistency - UoW protected by base lock
* No LOB lock is taken for DELETE - UoW protected by base lock
* LOB Update is a DELETE and an INSERT - so no U-LOB lock
* LOB tablespaces still use Gross and Intent locks

#### XML Locks

* Ensure readers don't process partially updated XML documents
* Prevent space being re-used while XML document being read

**XML S-Locks**     
* Prevents storage being re-used while XML data read
* If Versioning is used S-Locks only acquired for UR readers

**XML X-Locks**       
* For INSERT prevents others from reading partial data
* For DELETE prevents space from being re-used in case of rollback
* An UPDATE is a DELETE followed by an INSERT

#### Indexes

* Same way as LOBs and XML, Db2 doesn't lock indexes or index data. 
* Db2 uses Index Page Latches to guarantee the integrity of the page when updating the index. 
* If you see AP as index-only access but you see lock timeout on a row or a page thats because Db2 still takes locks on underlying data pages or rows thats how it guarantees integrity. 

#### Latches

* Locks are expensive and restrictive
* When Db2 needs exclusive access to internal objects to ensure consistency and serialization of critical resources like index page latch it uses **LATCH**. They are small in scope and very short in duration(microseconds). 
* Db2 doesn't need to go to IRLM to manage latches, its very cheap uses 1/3 of CPU cost compared to a lock. 
* If you have to update an index page, Db2 takes a latch that latch makes sure that two application don't update same index page at the same physical time as soon as it happens it releases the latch
* There is log latch, it is to make sure two people don't update the log at the same time.
* Over 30 classes of latch exist. 
* System programmers monitor latch waits

#### Claims and Drains

* Db2 uses Claims and Drains independently of locks to gain data access
* Claims and Drains cannot be explicitly issued 
* **Claims**: Consider a tablespace with million pages and you got page level locking, Db2 needs to know when a utility comes in whether there are locks on any of these pages and it doesn't want to read million pages in the object. So it maintains a thing called claim count. This says how many programs are using the object at any one time. There are 3 claim counts maintained for TS and IX at the partition level. Two for READ(CS and RR) and one for write. 

So when a program comes and accesses the object claim count is increased(includes WITH UR and LOCK AVOIDANCE using no locks) and when it commits the claim is released, except in the case of *CURSOR WITH HOLD*. Db2 doesn't have to look at the lock manager, it doesn't have to look at individual locks, it can just look at claim count to know how many people are using the object at one point. If the claim count is 0 meaning there is no interest in the object, so any utility or command can use it. 

* **Drains**: More disruptive than claims. Primarily used by utilities which requires exclusive access(ie., typically in SWITCH phase of Online reorg). 

When a drain is issued:       
* No new claims are allowed
* Applications requiring a claim, wait and may timeout 
* If claims on the objects are outstanding, the drainer waits. 
     
* Drain requests can be withdrawn. For example, if a utility takes a drain and if Db2 think that applications are about to timeout then that drain can be released. Unlike a STOP command, application sits and waits till the STOP command completes. This is sort of what causes problems to online reorg at switch phase. 

#### Data Sharing

* Each member of Db2 uses its own IRLM and local locks
* DS Group also maintains a Lock Structure in CF
  - Manages Global Locking where 2 members need same object. 
* CF is used to store 2 types of lock: 
  - L-Locks -- Logical or Application locks - the main topic this session
    + Local or Global are associated with transactions
  - P-Locks -- Physical locks are exclusive to data sharing
    + Used to maintain data coherency and always Global
* Propagating locks from local IRLM to CF is expensive. 
  - Db2 tries to avoid this whereever possible 
* When multiple members are updating the same object, Db2 tracks inter-Db2 Read Write Interest in each object. 
* If no inter-db2 interest only parent lock propagated to CF otherwise all locks are propagated. 

#### Lock Avoidance

* Basically means, i want to read a page and i know i don't event want to take a lock to start with. Db2 uses number of items used by lock avoidance. 
  - Possibly Uncommitted(PUNC) bit in the header of each row. It is set whenever a row is updated and reset on periodic basis using number of criteria(eg:- REORG). In each page header there is a PLOGRBA(page log RBA) which is last update happened on page. This could be RBA or LRSN it depends on whether you are in data sharing or single member. 

    Db2 also updated **URID** which is the start RBA/LRSN of the first update in a UoW. Db2 basically records the URID of the oldest uncommitted UoW in the subsystem. In non-data sharing its called **CLSN**(Commit Log Sequence Number) and in data sharing its the **GCLSN**(Global Commit Log Sequence Number), GCLSN is the oldest CLSN of all the members. 

This is how Lock Avoidance works     

* Whenever Db2 reads a row
  1. if PLOGRBA < CLSN / GCLSN
    - The data is guaranteed to be committed - no lock taken
  2. If not then Db2 checks the PUNC bits on the row
    - If PUNC bit OFF, Db2 knows data has not been updated - no lock taken
    - If PUNC bit ON then data may have been updated attempts to take a lock
* Key is if you have CLSN/GCLSN is high enough you really get good lock avoidance
  - So the key is to do frequent commits as they are are critical for Lock Avoidance

#### Optimistic Locking

* This is an application method / programming technique to prevent taking locks. 
* Add a column as `TIMESTAMP NOT NULL GENERATED ALWAYS FOR EACH ROW ON UPDATE AS ROW CHANGE TIMESTAMP`
  - Can use `GENERATED BY DEFAULT` as well
* Read this column when you read the row
  - Use `SELECT ... FOR READ ONLY` to avoid U locks
  - Save this timestamp column data in your program-variable.
* When you need to UPDATE
  - Perform a searched UPDATE adding a TIMESTAMP check to your WHERE clause
    + `WHERE RCT = :program-variable`. If its same, nothings updated otherwise something is updated. 

#### Hints and Tips

* Start with Page locks as a default
  - Use Row locks only if you need them. Row locks lead to lock escalation often.
* Specify the intent of your CURSORS
  - Code `FOR UPDATE` OR `FOR READ ONLY`
* Commit frequently
  - Improves Lock avoidance, releases locks which improves concurrency. 
* Access tables and rows within them in same order as this reduces the chance of deadlocks
* If possible do WITH UR
* Avoid lock escalation
* Consider optimistic locking
* Code RETRY logic in your error checking routines to handle lock timeouts and deadlocks(-911 or -913)

##### Bibliography

* Manage Performance
* Data Sharing Planning and Administration
* Redbook - Performance and Technical Overview
* Db2 for z/Os Best Practices - Locks and Latches, John Campbell
* Analyzing Db2 For z/Os Resource Serialization & Concurrency Problems, Bart Steegmans, EMEA 2013
* Lock out your locking problems Pt1, Peter Backlund, EMEA 2008
* Keys to Understanding locking for Db2 for z/OS, Karelle Cornwell, SHARE 2014

### References
* [Db2 Notes](105-db2-notes)
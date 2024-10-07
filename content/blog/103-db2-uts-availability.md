---
title: Db2 - Achieving Optimal Availability, Usability and Performance with UTS
date: 2021-06-07
description: Presentation by John Campbell and Frances Villafuerte on Db2 UTS
tags: ['db2-notes', 'db2-tablespace']
slug: "/103-db2-uts-availability"
---

**Presentation by**: John Campbell and Frances Villafuerte      
**Date**: 12/May/2021      
**Slides**: [Part 1](https://storage.googleapis.com/bobbydreamer-com-technicals/db2/Db2-strategies%20ofmanaginguniversaltablespacesutsforoptimalperformancepart1.pdf), [Part 2](https://storage.googleapis.com/bobbydreamer-com-technicals/db2/Db2-strategies%20ofmanaginguniversaltablespacesutsforoptimalperformancepart2.pdf)     
**Actual Presentation**: [Google - Achieving Optimal Availability, Usability and Performance with Universal Table Space](https://www.google.com/search?q=Achieving+Optimal+Availability%2C+Usability+and+Performance+with+Universal+Table+Space&oq=Achieving+Optimal+Availability%2C+Usability+and+Performance+with+Universal+Table+Space) and click on link with *https://event.on24.com*

### Part 1

#### Deprecated

* Simple tablespaces cannot be created after V9, but its supported
* Segmented, Classic partitioned by range, has organized UTS are deprecated starting with V10 and cannot create/alter at V12M504 or later like SQL DDL cannot be run by a package with APPLCOMPAT >= M504 or package with CURRENT APPLICATION COMPATIBILITY register set >=M504. 
  - To run SQL DDL against these object, you need to downgrade application compatibility level which can be toggled(up or down) either in APPLCOMPAT bind option or via special register CURRENT APPLICATION COMPATIBILITY. 
* **Note:** All new tablespaces should be either UTS (PBR or PBG)

#### Transition to PBR UTS

```
ALTER TABLESPACE … SEGSIZE n
ALTER TABLESPACE DB1.MyTS SEGSIZE 32
```

* Having a high *segsize* is good thing. It encourages clustering of datarows. 
* This converts Classic partition to UTS PBR
* Subsequent REORG Materializes the conversion

##### Benefits

* DPSI 
  - Index partitioning capability with less index levels which improves performance 
  - Partition pruning
  - Utility parallelism

##### Transition from PBR UTS to PBR UTS Relative Page number (RPN)

```
ALTER TABLESPACE DB1.MyTS PAGENUM RELATIVE
```

* Only UTS PBR can be converted to use *Relative Page Numbering*
* Subsequent REORG Materializes the conversion
* If table also has XML column
  - Base and XML table space can be migrated separately
  - Can coexist running with mix of RELATIVE/ABSOLUTE attributes across base and XML table spaces

##### Whats PBR RPN

* Introduced to lift partition sizes up to 1TB from 256G
* DSSIZE is no longer set at the tablespace level.
* Alter to increase in DSSIZE will be an immediate alter on PBR Relative and NO REORG NEEDED.
* Alter to decrease is a pending alter followed by REORG to materialize. 
* zParm option available to set at system level. 

#### Transition to PBG UTS
```
# Converts simple/segmented to PBG UTS
ALTER TABLESPACE DB1.MyTS MAXPARTITIONS 4
```
* Its a pending alter, so subsequent REORG will materialize the tablespace. 
* Don't over define MAXPARTITIONS like 1024 

#### Db2 12 FL508(V12R1M508)
* Supports ability to move a single table or set of tables from one single source table space to a set
of target PBG UTS table spaces
* Migration plan is like earlier, its a pending alter then materialized by REORG
  - Pending DDL is stored in SYSIBM.SYSPENDINGDDL (can be dropped, when you decide you don't need it)
  - Source table will be placed in AREOR
* Targets must be explicitly created as new PBG UTS. Must have following properties
  - Same database, DEFINE NO, MAXPARTITIONS 1
  - These properties should match source(LOGGED/NOT LOGGED, CCSID)

![CREATES and ALTERS](assets/103-db2-multitable-move.png)

* During the REORG, shadow datasets will be created for PBG tablespaces and all indexes. 
  - Space will be taken up by only the shadows during reorg. 
  - This is considered as a MOVE, so after reorg and migration, all tables in source would have moved and source tablespace would be empty and it needs to be manually dropped. 
  - Statistics : Inline statistics not supported, no statistics will be gathered for target tablespace, table and column statistics will be preserved, RTS will be accurate for all tablespaces. 
  - Execute RUNSTATS after the move
* Use REBIND APREUSE(WARN) to minimize access path changes on REBIND
* REORG will create inline IC of all the affected objects(Source & Target tablespaces)

* On RECOVER
  - Target tablespace can be recovered to PIT before REORG materialized it. It will result in empty tablespace. 
  - Source tablespace cannot be recovered PIT to state before the REORG moved the tables but DSN1COPY or UNLOAD could be used to unload from IC as original source tablespace is not dropped. 

#### Default behaviour of UTS - Pseudo deleted(PD) free space
* Introduced in Db2 V10
* Its used for lock avoidance and purely used for querying, transactions meaning this technique allows a query to access commited row that is locked by insert or delete but not update. Committed in-progress transaction data can be read. This avoid timeouts and waits for locks. 
* PD freespace is created for every deleted row. 
* PD freespace is cleaned by page compaction process triggered by insert, update, redo insert, undo delete/update later when a set of conditions are met(page is committed, PD data rows PUNC bit is OFF)

#### Default behaviour of UTS - Locking

##### SELECTIVE PARTITION LOCKING SCHEME is used for UTS
* There is no table lock
* Same locking protocol used for partitioned tablespace
* Partition lock is acquired as it is accessed. If the page being accessed is committed even partition lock is acquired(lock avoidance). 
* Locking hierarchy 
  - Segmented : Row/Page -> Table -> Segmented TS
  - Partitioned/UTS : Row/Page -> Partition
* Applications using LOCK TABLE statement when migrating from Segmented to UTS PBG will not see same behaviour due to *Selective partition locking scheme* and *Lock avoidance*

##### Lock Escalation
* Locks are escalated to partition level but only the partitions that UoW touches. This behaviour is same in Classic Partitioned and PBR

##### How locking affects INSERT transaction in PBG
* Insert transaction requests conditional IX(Intent eXclusive) partition lock to access data in the partition
  - This is introduced to skip lock wait, if there are multiple partitions. 

* To avoid insert failure, Db2 will go on and try to take Conditional IX Partition Lock on all existing parititions in forward ascending order if it reaches the last partition, it will go back to the first partition and try all partitions it had not tried earlier. This concept is called *Cross Partitioned Search*. 

![Lock, Insert and PBG](assets/103-db2-lock-insert-pbg.png)

* If Conditional IX Partition Lock succeeds, row will inserted in that partition. 

* If Conditional lock fails, it will move on and try the next partition and if all partitions are exhausted then it will issue a -904 with 00C9009C. 

* If it is PBR UTS, or single part PBG, insert will wait behind the lock holder and eventually timeout with reason code 00C9008E

* No new partition will be added if insert can not access any partition

* Reasons why Conditional IX partition lock fails
  - IRLM rejects conditional lock request on a partition as Other thread already holding x-lock on the partition such as triggered by lock escalation, or incompatible lock state registered in CF
  - Locally there is already another thread ahead of the current insert thread that is waiting with higher lock state

* PBG crossed partition search algorithm
  - Generally it does ascending partition search but it can do descending partition search as well that is to to address space reuse left by delete in the prior partition
  - Which direction to go is a random decision by Db2 based on bit in system clock value
  - Descending search is not that useful. 


* * * 

#### Additional Information

##### Accesspath Information
* SYSTABLEPART is not used by Db2 Optimizer
* NACTIVEF in SYSTABLESPACE is important, but NACTIVEF is not touched by REORG and will remain -1 which means the Optimizer will use NPAGESF from SYSTABLES

* * * 

### Part 2

#### Case study: Common PBG Insert performance

* Problem Statement     
  - A workload consisting of almost 1000 concurrent threads inserting into the same partition based on clustering index key, resulting in concentrated contention **“hot spots”** around the end of partition such as: latches on pages, data page contention, space map pages, etc.
  - In multi-partition PBG, Cross partition search increases getpage count

* Possible Solutions     
  - Using *APPEND YES* with *Member Cluster*, *row level locking* to avoid excessive of space growth
    + Good candidate workload for using *Insert Algorithm 2* in Db2 12?
  - Reduce data page contention by distributing insert transactions more evenly across different partitions - using PBR UTS with *hidden ROWID*
  - More empty partitions at the end to elevate cross partition search? Smaller partition size with more partitions for the table space?

#### Managing Multiple partitions of PBG

More Partitions     

* Easier to manage if partitions are smaller
* Partition independence provides Utility flexibilities
* For spot clustering inserts, random insert, or frequent deleted objects, multiple smaller partitions easier to reduce insert hot spots
* Cloning object using DSN1COPY can be challenging 
  - Because inserting can increase partitions and reorg can delete partitions. So, number of partitions in one environment can be different than other. 

Less Partition     

* For some utility partition level operations it is not feasible
* Cloning object using DSN1COPY is more manageable with less partitions

> Keeping empty partitions at the end of tablespace can alleviate high page counts when you have cross partition space search. 

#### Simple Insert Flow with Clustering Key

![Insert Flow](assets/103-db2-pbg-insert-flow.png)

1. When you try to insert a row, Db2 will use clustering index to find appropriate data page to insert. 
2. Db2 will look at clustering index and find next key RID combination that means accessing index pages in indexes to point to target data page. 
3. Ofcourse, when you go to target data page, that page may be full or no holes for Db2 to use and therefore Db2 may start using spacemap pages to identify which pages have space to insert. This is an iterative process for each insert thread, looking at space map to find space then it may go to the data page and may not find any space and at that point it may be full. It will go back to the space map and try again. 
4. If insert is successful, Db2 will write log record associated to that insert and updated page may be pushed to coupling facility(CF) or they are going to be pushed out asynchronously if it is non-GBP independent to pageset. 

* When it comes to index and data pages, we may have *Read I/O waits*
* When it comes to space map, we may end up with *Page Latch or P-lock wait* contention. 
* *CPU time* may consume for space search between space map and data pages. 
* When writing logs, there can be *Deferred Write I/O Wait*

#### What influences Db2 Space search 

* Different workload patterns have different *hot spots*. 

Below are factors under our control to influence Db2 space map control. 
* Free space
  - Its distributed by LOAD REPLACE and REORG
  - Free space holes can be created by delete transactions.
  - More free space per page better for random insert or highly variable record updates. 

* SEGSIZE
  - Adequate SEGSIZE likely to keep data rows in better clustering order(default 32)
  - Large SEGSIZE provides better opportunity to find space near by candidate page and therefore maintain clustering, better chance to avoid longer space search. 
  - Small SEGSIZE, more space map pages, can reduce space page contention
    + But more chance of hitting **"searching threshold"**, looking for space at the end and kicking off a more extensive space search. 

* Page size
  - Adequate page size can avoid data page contention from DML
    + Think about it, if you have more rows, more chance of data page contention. 
    + Large page size can reduce no. of getpages, #lock requests, #CF requests and better space reuse. 

* Lock size
  - Page vs. Row level locking

#### Managing Lock Size

* If you are accessing by **Sequential Key Order**
  - Use Page lock
  - Effective if multiiple inserts within same commit scope. 
  - Default for partitioned and segmented


* ROW lock is default for implicit PBG
* ANY(same as page) lock for any explicitly defined UTS

* Random insert     
  - Cost of one row lock is same as cost of one page lock
  - Possibly better concurrency with ROW
  - In data sharing environment, the object is GBP dependent as well as having logical lock on the row, you are going to have P-Lock on the datapages
  - MAXROWS 1 with lock size PAGE can avoid additional data page p-locks in data sharing, however, it may cause increased space map page contention with high concurrent inserts 

#### APPEND table space attribute on UTS

* Provides fast relief of performance concern related to excessive space search
* Adding the new data rows to the end of partition / table space
  – Insert does not follow clustering key position
  – For PBR
    + Base on the limit key to determine the partition, then insert to the end of the partition
  – For PBG
    + No clustering key position or limit key range for partition
    + There will be a initial overhead when pageset is open to determine the last partition starting at part 1 then gradually increases the last partition
    + New partition will always be added to make sure insert will be successful

Suppose you are in 5th partition(last), when you specify append, Db2 will not look at the front(1-4) looking for free space/holes that was left by deletes. Its always append at the end. 

* APPEND can create hot spot on the last space map page
  - Possible page latch wait for that page and if its GBP dependent there will be P-lock contention on the space map page with high concurrent insert workload
    + Thats why its recommended to use the combination of LOCKSIZE ROW and MEMBER CLUSTER(aims to reduce inter member contention on space map page). 

* This is not optimal for better spae reuse as there is no backward space search to look for deleted free space. 
* Ideal for only sequential workload. 

#### Member-private space map and it's corresponding data pages
* Option for solving insert “hot spot”
* Most commonly used when high concurrent insert workloads in a data sharing environment
* Records are not inserted using clustering index
  - Rows are not clustered, needs REORG to restore clustering if it is necessary
* Distributes available space of table space across data sharing members
* In non-data sharing environment, initially not intended for non-DS but can be used. Smaller space map page can reduce the space map page interest between threads

![Member cluster 1](assets/103-db2-mc-1.png)

##### How MEMBER CLUSTER works
* Member-private space map and it's corresponding data pages
  - Buffer Manager serializes which space map page are owned by which member, its a form of affinity but a loose affinity thats determined by Buffer Manager at runtime and it uses that by Page P-Lock control mechanism. Page P-Locks is just a reminder that its applied on space map, index pages, data pages with row level locking. 
  – P-lock request is registered in IRLM XES hash bucket entries
  – Each member gets space map page p-lock conditionally for a quick check on the lock
  – P-locks are not released at commits, they are owned by the member. 

![Member cluster 2](assets/103-db2-mc-2.png)

##### MEMBER CLUSTER space comparison

**Classic Partitioned tablespace**    

![Member cluster classic](assets/103-db2-mc-classic.png)

In classic partitioned tablespace with MEMBER CLUSTER, each space map page can only point to 199 data pages(DataPage1 to DataPage199). So, there will be lots of space map pages and lot of growth. 

**Universal tablespace**     

![Member cluster UTS](assets/103-db2-mc-uts.png)

SEGSIZE controls number of pages covered by each space map page
* More pages per space map page, less contention on space map page with other data sharing members. 
* May want to combine with LOCKSIZE ROW and proper page size. 

#### Case study #1: Using Member Cluster to solve space map page contention

**User case study scenario**     
* PBG UTS, MAXPARTITIONS 2, no MEMBER CLUSTER, random insert, LOCKSIZE ROW, PCTFREE at 80%
  - Most of data contained in first partition
  - Leaving empty partition at the end of table space to improve PBG cross partition search
* Many concurrent insert threads
* Each application *commit scope has multiple inserts (10-15) and updates*
* Application groups multiple rows with similar key for related business transaction into single commit scope
* Data rows frequently archived out of the table
* Frequent REORG to re-establish PCTFREE to accommodate random insert and to avoid update creating relocated rows

**Everything working well …**     
* Until object is changed to use MEMBER CLUSTER to reduce space map page contention whilst still keeping PCTFREE at 80%, LOCKSIZE ROW and frequent REORG
  - Pre-production testing performed to prove the change, but not at production level stress in terms of concurrency

**What happens next …**     
* After REORG to introduce MEMBER CLUSTER, the table space grows into the 2nd partition
  - At this point, no more empty partition at the end of table space for PBG
* The workload is random insert, however, MEMBER CLUSTER does not place records using clustering index, therefore, all inserts goes to the same spot which is at the end of partition
  - Space reserved with PCTFREE 80 from REORG at the front of table space is still free
* During peak period, all new rows inserted go into partition 2 until partition 2 is full
* Once Partition 2 is full, then exhaustive search within the partition kick off for each insert transaction

**Exhaustive search for each thread within the partition …**     

* Space map page p-lock is serializing all insert threads across all data sharing members
  - Still potential for space map page contention within the individual member
* Since there is so much free space on each data page (PCTFREE at 80%), each data page is visited
* Page latch only allows one thread to use the page at a time even with LOCKSIZE ROW
* Because of latch contention on data page, each insert thread keeps searching and continuing to compete for same data pages
* With multiple inserts per commit scope and LOCKSIZE ROW
  - 1st row is inserted into a data page, but the data page is not secured to avoid it being used by other insert threads
  - 2nd row inserted in the same commit scope, visits the last inserted page, either gets rejected because of page latch contention or the page is already full, and moves on
* So the sad story continues with exhaustive space performed across many competing concurrent insert threads

**Lessons to be learned from this case study**     

1. Reserving high PCTFREE for each data page
  * Good for group of inserts where each commit scope has different random key inserts
  * Helps to spread data page contention across different spots in the table space
  * However, since MEMBER CLUSTER does not use clustering key to spread data page contention across different spots in the table space, saving high free space for each data page may have adverse effect when it comes to exhaustive search
2. If you want to use MEMBER CLUSTER, it is best to use PCTFREE 0
  * Each data page can fill up with REORG
  * Can reduce backward exhaustive search processing
3. Since multiple inserts in the same commit scope, should use LOKSIZE PAGE
  * Secure the data page for subsequent inserts within the same commit scope
4. If really want to eliminate backward search should use APPEND
  * Since there are some updates, there may be some holes so would like to not use APPEND
    - In this case there will be a small search on space map pages

**Immediate solution**     
* Removed MEMBER CLUSTER and things went back to running well again

#### Case study #2: Using Member Cluster with delete and update transactions

**User case study scenario**     
* PBG UTS, MAXPARTITIONS 2, MEMBER CLUSTER, sequential insert, LOCKSIZE ROW, single insert,
  - Most of data contains in one partition
* Many concurrent insert threads
* Each application *commit scope has small amount of inserts (1-2) records*
* Each record is updated or deleted shortly after it is inserted
* Frequent REORG to reclaim space

**Observation from high volume concurrency ...**     
* Space growth faster than expected

**Lessons to be learned from this case study**     
1. Space map page p-lock works well with insert threads when spreading insert to different spots within partition
2. However, delete and update transactions need to get space map page unconditionally
  * To make sure the space map page has true status of space usage of the data page
  * Delete and Update were done in different data sharing members
  * Force the ownership of space map page to be transferred from one member to the other
  * The subsequent insert needs to find the next space map page
3. MEMBER CLUSTER provides relief on the space map page contention when insert and delete/update are on different threads
4. Space growth is unavoidable
5. Smaller SEGSIZE can reduce the growth rate
  * If insert need to skip smaller SEGSIZE 4, you will skip only 40 data pages. 
  * If SEGSIZE 64, it will need to skip 640 data pages.  

#### Insert Algorithm 2(IAG2) Concepts

![Insert Algorithm 2](assets/103-db2-iag2.png)

Member Cluster is used for serialization and helping performance between all data sharing members(group). Within same data sharing member and high concurrent thread, we still have issue about space map page contention and data page contention as they are all in same data sharing member and they are all going to compete for the same space.

**IAG1**     

Every thread is going to look at space map page and say that data page is available and every thread will have interest in that data page and get Page-latch at Page A and thats the hot spot. Due to this contention we may get page-latch fail and move on to next page and same step will be followed by other threads as well. If its a Page level lock, once the thread get to that, it will get a lock and no one else can use it then other threads will other pages. 

**IAG2**     
Idea is to reduce data page contention within same data sharing member. Here data pages are grouped based on similar free space into a container called as *Pipe*. Now every thread that comes in, take one page out of that pipe depending on what kind of space is required for that row. Once that page is taken out of the pipe, that page is considered temporarily unavailable for other threads to use. By this technique, Thread 2 and Thread 3 will get different pages from different pipe may be. 

* There is an **Red Alert** at the moment on IAG2, its due to a customer having IAG2 activated in one member and uses IAG1 in another member. 
* `INSERT ALGORITHM 2` can be mentioned in `CREATE TABLESPACE` statement

* Intention is to improved performance and usability
  - By reducing data page and space map page contention
  - Increase concurrent insert throughput
  - Possible CPU time reduction
  - Does not help if insert performance bottleneck is log writes and/or index page splits

* Only for UTS with MEMBER CLUSTER after V12 FLM500
* Space is pre-allocated in order to fill up the pipes
  - Space allocation is evaluated at the beginning of physical open and real time when shortage of available pages in each individual pipe

* Plan for additional real memory for pipes
  - Approximately 32K per pipe for variable length, 16K for fixed length rows

* Plan for larger buffer pool to get better bufferpool hit ratio

* It is recommended to keep same ZPARM value among all members of data sharing group (ie., `DEFAULT_INSERT_ALGORITHM=1/2`)

* When IAG2 is disabled, insert process falls back to using Insert Algorithm 1. It can get disabled due to 
  - Pages are refilled to the pipe when it hits refill threshold
  - Table space is out of space
  - When there is a lock escalation or SQL LOCK TABLE

#### Case study #3: Alternative design to improve insert performance

For PBG clustered sequential insert, “hot spot” can occur within partition

![Db2 PBG to PBR using ROWID](assets/103-db2-pbg-pbr-rowid.png)

* Convert to a partition-by-range table space to distribute INSERTs more evenly
* Add a hidden ROWID column and partition using it. It doesn't impact application.
  - Db2 assigns a pseudo-random value to the first 8 bytes of generated ROWID values

![Table DDL](assets/103-db2-table-with-rowid.png)

* Rows are evenly distributed across when using structure like this. 
* Note : Clustering is not followed here. 

* * * 

#### Q&A Session

##### Db2 General Space Search using clustering index

* Db2 will identify using clustering index path of the next RID
* Look in the index, the key RID path and thats gonna identify the target data page. 
* If that target data page is full, non-enough space available or locked, its gonna search forward and backward inside the segment, its the easy search. 
* If it cant find, its going to go end of the tablespace without extending it. Now, from this point onwards your clustering is affected straight away. 
* Then also, if it cant find, then its going to do exhaustive search, smart exhaustive search. Db2 is going to look in the front for earliest segment with space and go upto 50 space maps then ultimately, if it reaches thrice the priqty or secqty then Db2 does the *exhaustive space search*. 
* Db2 is going to go to the front of the tablespace or first partition and search all space maps looking for holes to fill. 

* * * 
##### Additional Information

* Having a large SEGSIZE(32 or 64) helps in maintaining data row clustering. 
* When you do append, it going to latch the last spacemap looking for space and its going to have a window for looking for space here. 

* * * 

### References
* [Db2 Notes](105-db2-notes)
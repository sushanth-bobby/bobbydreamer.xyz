---
title: Db2 - PBR RPN explained(from IDUG)
date: 2021-05-12
description: Db2 PBR RPN explained by Haakon Roberts, DB2 for zOS Development
tags: ['db2-notes', 'db2-tablespace']
slug: "/104-db2-pbr-rpn"
---

**Post by**: Haakon Roberts, DB2 for z/OS Development      
**Date**: JUL 30, 2017 02:30 AM      
**Actual Article**: [PBR RPN explained](https://www.idug.org/browse/blogs/blogviewer?blogkey=548357ab-0a83-4e07-bff8-82de62ab079e)

#### Bit of history 

* Introduced to lift partition sizes up to 1TB from 256G
* As PBR table sizes continue to grow, it becomes harder and harder to REORG entire tablespace in one go for schema changes. For maintenance purposes, partition level REORG is available but for other scenarios where attributes changed are at tablespace level, REORG is required at tablespace level. 
* If a PBR tablespace runs out of space in a partition. The options available are 
  - Altering the limit key then running REORG to rebalance data across partitions  
  - `REORG with REBALANCE` keyword. But if some customers rely on partitioning scheme cant go with this approach. 
* It is possible to increase DSSIZE for partitions as there is a relationship between DSSIZE, number of partitions, page size. It is a tablespace level attribute which requires a REORG of the entire table space for it to take effect. The underlying reason for these issues is the format of the 5 byte RID in DB2. The RID uniquely identifies each row in a table space. For partitioned table spaces, the 4 byte page number includes a number of bits that identify the partition number. So the more partitions the fewer bits are left for the page number and vice versa. We say that the page number is “absolute” because it identifies the page number and partition within the table space.

#### Introducing PBR RPN

The solution to these issues is two-fold.

First of all, DB2 has separated the partition number from the page number. This means that now RIDs are 7 bytes instead of 5: A 2-byte partition number, a 4-byte page number and a 1-byte IDMAP value (as before). Since the page number no longer contains the partition number, the page number is relative to the start of a given partition. Hence this enhancement is called “Relative Page Numbering”, i.e. PBR RPN. The partition number doesn't need to be stored in each page, so one can no longer look at a data page and know which partition it belongs to. Note that this option applies to PBR table spaces only, not PBG or classic partitioned.

This means that now DB2 has broken the complex relationship between number of partitions, page size and DSSIZE. As a result, DB2 introduces a simple rule that individual partitions can now be up to 1Tb in size, regardless of number of partitions page size. Multiplied by 4096, this means that the maximum size of a PBR RPN table is 4Pb, and with a 4Kb page size and up to 255 rows per page, it equates to roughly 280 trillion rows.

The second piece of the PBR RPN solution is to start to drive some attributes from table space level down to partition level. In DB2 12 the primary focus is on DSSIZE. DSSIZE is now stored in SYSTABLEPART in addition to SYSTABLESPACE. An ALTER to increase DSSIZE for a PBR RPN table space is now possible for a single partition. Not only that, it is an immediate ALTER not even requiring a REORG to materialize. This represents a massive availability and usability improvement for PBR table spaces.

If you have LOB or XML columns in a table that is in a PBR RPN table space, then the XML table space will automatically be PBR RPN too and benefit from the same attributes. LOB table spaces are unaffected by PBR RPN.

Similarly, partitioned indexes (PI and DPSI) on PBR RPN table spaces now support DSSIZE on CREATE INDEX and ALTER INDEX, allowing you to manage index partition sizes independently of table space size.

#### Benefits

* The maximum size of a range partitioned table space and therefore the maximum size of a given table in DB2 increases to 4Pb, containing up to 280Tn rows.
* DSSIZE can now be increased up to 1Tb through an immediate ALTER at the partition level. No application impact, no need for a REORG at all and complex considerations regarding page size or number of partitions.
* Index partition sizes can now be up to 1Tb in size and managed independently of table space DSSIZE.
* Log records can now be processed by partition, simplifying DSN1LOGP processing.

#### Conversion and Exploitation

* It's available in DB2 12 from M500 onwards.
* DB2 12 introduces new zparm `PAGESET_PAGENUM`. The options are `ABSOLUTE` or `RELATIVE`.
* `CREATE TABLESPACE` has also been enhanced to support a PAGENUM attribute where the options are `ABSOLUTE` or `RELATIVE`. The CREATE TABLESPACE option, if specified, overrides the zparm.
* Conversion of existing range-partitioned table spaces is performed through `ALTER TABLESPACE` with `PAGENUM RELATIVE` parameter. Tablespace will be placed in AREOR state and it requires a REORG of the entire tablespace.
* There is no backout option available(ALTER back to ABSOLUTE). 

#### Usage considerations
* There is a new log record format to support 7 byte RIDs. This log record format is written from M100 onwards
* There is a new mapping table format for REORG SHRLEVEL CHANGE. Support for 7 byte RIDs follows the same method as for 10 byte log RBAs in V11. This means that in V12 M100 online REORG will support both V11 and V12 format mapping tables. Once function level M500 or above is activated, the REORG utility will only accept V12 format mapping tables. If a V11 format mapping table is given (or no mapping table at all), then the REORG utility will ignore it, create its own and drop it at the end of the REORG or at the end of a sequence of REORGs. Note that the new mapping table format is used irrespective of whether you are using PBR RPN or not.
* The conversion to PBR RPN requires a REORG of the entire table space.
* There is no support for recovering to a point in time prior to a REORG that converts to PBR RPN.

### References
* [Db2 Notes](105-db2-notes)
* [Original - PBR RPN explained](https://www.idug.org/browse/blogs/blogviewer?blogkey=548357ab-0a83-4e07-bff8-82de62ab079e)
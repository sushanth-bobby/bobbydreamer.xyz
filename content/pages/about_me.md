---
title: About me
slug: "/bio"
---

##### Hi

I am **Sushanth**. Full name is *Sushanth Bobby Lloyds*.

I am a Db2 DBA on z/OS platform with over 11 Years of work-experience living in Chennai, India. I specialise in reviewing Complex SQLs, accesspaths & setting up lots of Queue Replication in Db2 used to setup SQL Replication as well and i am well versed with Rexx scripts to automate repeatative tedious tasks.

I am insightful, creative, self-driven, result oriented IT professional with notable success in research, planning, analysis and implementation of solutions and have hands-on experience in all stages of project life cycle development. Besides my specialization in DB2, my current passion is in Big Data & Cloud and I am doing a lot of self-studies, courses to understand how it works and to improve my knowledge on the subject as well. Other than that, I am pretty cool to work with.

**Email** : sushanth.august@gmail.com
 
### # Education

#### Certifications

+ Udacity Data engineering Nano-degree
    - [Certificate](https://graduation.udacity.com/confirm/PDLGE9T5) issued on February 23, 2020
    - Skill acquired : Python, Jupyter Notebook, Pandas, AWS(S3, EC2, EMR, Redshift, Athena)    

+ Google Associate Cloud Engineer, issued on July 11, 2019 - **Expired**     
    - Skill learned to acquire this
        * Set up a cloud solution environment
        * Plan and configure a cloud solution
        * Deploy and implement a cloud solution
        * Ensure successful operation of a cloud solution
        * Configure access and security

+ IBM CV963G - Db2 11 for z/OS Application Performance & Tuning
    - Trained on October, 2018

+ Big Data
    - [Big Data Hadoop Foundations](https://www.youracclaim.com/badges/7930b82a-a92c-46dd-b660-1c0e5031069b/linked_in_profile)
    - [Big Data Foundations](https://www.youracclaim.com/badges/763933bc-3cfb-4dfd-ba21-a9fec3ce0eea/linked_in_profile)

+ IBM DB2 SQL Replication & SQL Replication : Advanced Topics & Using Queue Replication(CE221 & CE231 & CE243)
    - Trained on January, 2013

+ IBM Db2 9 for z/OS Database Administrator (Exam 732)
    - Certified on February, 2010

+ IBM Db2 9 Fundamental Associate
    - Certified on June, 2008 

#### College

+ **Masters in Computer Application**(2005-2008)    
    Madras Christian College    
    University of Madras    
    SCORE – 77.5%    

+ **Bachelor in Computer Applications**(2002-2005)    
    Pachaiyappa’s College    
    University of Madras    
    SCORE – 69.3%    
---
### # Work Experience

#### Royal Bank of Scotland(RBS) / Natwest Group | Sept 2011 - Present
**Roles**    
+ **Infrastructure Analyst - Db2 DBA** | Sept 2011 - Dec 2016
+ **Technical Lead - Db2 DBA** | Dec 2016 - Present 

**Work Activities**    

- Migrated entire Relationship Manager Platform from SQL Replication to Q Replication ( which includes 583 tables source tables ) without any issues/incidents. 
- Review 200+ programs for access path changes for every release(Quarterly) in RMP Banking Platform
- Setup and implement SQL Replication & Q Replication for large number of tables for each release
- Running EZ-DB2 Traces for analyzing online application performance
- Identified lots of worst performing queries in Development itself and suggested developers to modify them.
- Supported the bank during the critical RBS MAJOR RED ALERT in 2012( one of the world’s biggest technical failures )
- Db2 Driver installations

**Tools/Utilities which I created to improve work & performance**

1.	Advanced Explain Tool( REXX + ISPF Panels ) 

    Purpose :  To reduce the time taken to review lots of DB2 packages in development environment. Main functionality is to pick up the latest packages from the specified environment and generate Access Path Report. Two types of reports are available, 

    - Basic Explain Report – Generates AP report with data from PLAN_TABLE & DSN_STATEMNT_TABLE
    - Advanced Explain Report – Generates AP report with data from 5 Explain Tables with more details. 

    Other than AP report this tool also retrieves statistics information from DB2 catalogs on all the objects used by a particular package and this will reduce analysis time.

1.	Queue Replication SQL Generator(REXX + ISPF Panels)

    Purpose : Main purpose of the tool is to generate all necessary SQL’s to setup Q Replication including the jobs needed for implementation during migration from SQL Replication to Q Replication. The Tool takes care of all the standard naming conventions and thereby reducing lots of laborious manual work when ASNCLP is used.
    
    Other Features of the tool include,

    - Generating test SQLs to check whether replication works.
    - Performs Sanity checks, compares the SOURCE with CCD & AUDIT tables to see if the structure matches.

#### NTT Data / Keane / Caritor | May 2008 - August 2011 
**Roles**    
+ **Intern** | Dec 2007 - May 2008 
+ **Software Engineer - Db2 DBA** | May 5, 2008 - July 1, 2010
+ **Senior Software Engineer - Db2 DBA** | July 1, 2010 - June 1, 2011
+ **Team Lead - Db2 DBA** | June 1, 2011 - August, 2011 

**Work Activities**    

- Designed Database Analyzer strategies to reduce unnecessary Weekly REORG’s.
- Involved in all stages of Endevor SCM - DB2 implementation, which includes automating binds and developing mechanism to FREE-UP obsolete packages.
- Converted more than 16000 tablespaces from Simple to Segmented which includes converting multi-table simple tablespace to single-table segmented tablespace.
- Tuned a lot of web queries, which took more than 2 minutes to execute into a sub-second query.
- Providing extensive DB2 Support to Cobol Conversion Team; developing standard procedures for testing dynamic & static DB2 programs; data refreshes.
- Setting up Change Data Capture(CDC) for DB2 & SQL Server using Attunity Solutions.
- Setting up linked servers in SQL Server to access DB2.
- Supported critical applications like VANTAGE, TRAD, INET, FMG Datamart & Warehousing 

**Tools/Utilities created to improve work & performance**

1.	DB2 Utility Operation Tool(REXX + ISPF Panels based tool) 

    - Easy to clear multiple Restrictive Statuses at one-go for multiple tablespaces in multiple databases.
    - This tool reduces time taken to analyze and prepare utility jobs automatically based on their restrictive statuses.

1.	Automated Tablespace Space Reporting with Trend analysis( REXX, SAS-DB2 and Excel Macros) 

    - Space Report contains listing of tablespaces & indexspaces with extent details 
    - Storage Report contains listing of storage consumed by image copies & logs.
---
### # Home projects 
+ **[stash.bobbydreamer.com](https://stash.bobbydreamer.com)**
    - Simple Notes/References/Links saving app 
    - Technologies : NodeJS, Javascript, Firebase(Authentication, Data storage & Hosting), CSS Bootstrap for the menu
    - Users : Mostly me and other bunch of users who came from Stackoverflow & HackerNews for testing the site. 

+ **[bobbydreamer.xyz](https://bobbydreamer.xyz)**
    - Simple personal website / Sandbox for some cloud testing 
    - Technologies : Gatsby, CSS, Markdown 
---
### # Skills 

#### Skills developed @ Work

| Skill  | Used in                                  |
| ------ | ---------------------------------------- |
| OS      | Windows, Linux, z/OS  |
| Db2 z/OS | Everyday @ work, since Jan 2008. Started working from DB2 V8 |
| MS-SQL Server, SSIS, SSAS, SSRS | Used in Keane till August 2011 as i was a MS-SQL Server DBA as well handling Datamarts and Cognos |
| IBM Utilities | Everyday @ work, since 2008. Utilties include Unload, Load, Copy, Modify, Reorg, Runstats, Rebuild, Recovery, Quiesce, Repair, Report, DSN1PRNT and started used Admin Tool/CM from 2016 |
| CA Suite | Used in Keane till Aug 2011. Utilities used during work are CA Fast Check, Unload & Load and RC/Migrator, Database Analyzer, Detector, Partition Expert, Insight and Log Analyzer | 
| BMC Suite | Used in RBS till decommissioning in 2016. Utilities used at work are Unload, Load and Catalog Manager, Change Manager |
| Rexx + ISPF Panel | Using it since 2009 for all automations in Keane and RBS mentioned in Work Experience section above | 
| Db2-SAS | Used for specific task like joining datasets with table rows |
| COBOL | Limited experience. Used only once to try multi-row fetch/insert proof of concept |
| VB Scripting | Used till 2011 in Keane for automating Db2 Weekly report generation in Excel | 
| Postman | Testing Db2 REST APIs | 

#### Skills developed by working in some Home projects
| Skill  | Used in                                  |
| ------ | ---------------------------------------- |
| [mySQL](../tags/mysql) | Home projects, since 2017 |
| NodeJS | Used it to make couple of websites([stash](https://stash.bobbydreamer.com), [bobbydreamer.com](https://bobbydreamer.com)), Google Cloud Functions and Tiny Terminal Windows Scheduler to triggers programs in parallel |
| Java | Used for scrapping websites and processing data in mySQL |
| [Firebase](../tags/firebase) | Using firebase realtime database from 2017 and [stash](https://stash.bobbydreamer.com) uses firebase as backend storage. |
| [Python](../tags/python) | Started using it since 2019 for [Udacity Data engineering](https://github.com/bobbydreamer/Udacity-Nano_Degree_Data_Engineering) | 
| Github / Google Cloud Source Repositories | Used for saving Home projects data in both the repos. Feels Cloud Source much safer after losing keys in Github. Now Github supports private repositories for free | 
| AWS | Started using EMR, Athena, EC2 and Redshift for [Udacity Data engineering](https://github.com/bobbydreamer/Udacity-Nano_Degree_Data_Engineering) in 2019| 
| [GCP](../tags/gcp) | Using it since 2017, major products i use are Firebase, Compute Engine, Cloud Source Repositories, Cloud Functions(NodeJS), Cloud Storage, Container Registry & GKE |

#### Continous self-training

+ [Google Cloud using Qwiklabs - Check my profile](https://www.qwiklabs.com/public_profiles/ce5ee3f8-a0e8-4f4c-b6f8-2f4dc8fb948d)

 
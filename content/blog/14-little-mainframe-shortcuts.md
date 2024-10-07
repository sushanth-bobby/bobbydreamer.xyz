---
title: Little mainframe shortcuts
date: 2020-04-02
description: These shortcuts improve the way i work
tags: 
 - mainframe 
slug: "/little-mainframe-shortcuts"
---

### # 10x Productive Mainframe User Experience 
**Updated on** 02/April/2020    

**PF Keys**    
Its better when it is switched off
* PFSHOW OFF - Doesn't show function keys at the bottom of the screen. You get more two lines
* PFSHOW ON  - Shows the function keys

**F2**    
By default, splits the screen, not sure how many people would use it. Certainly, i don't use it, so i changed it to `SWAP LIST`, so when i press F2, i can see the all the panels, i had opened and i can switch among them. How to do this,    

1. Type KEYS in command
2. Update F2 key section from SPLIT to SWAP LIST

**SDSF Additional header**    
In SDSF, by default you know wont know whether display is filtered by PREFIX or OWNER. Sometimes you may go on to randomly set `PRE *; OWNER *` and then set `PRE SUSH*` something like this. 

There is a command to get an additional header above the SDSF header. That gives all this information.    
* SET DISPLAY ON - Turns ON the additional header 
* SET DISPLAY OFF - Turns off the additional header 

**SDSF more information**    
Usually when we submit a job, we can go and check the results in SPOOL and we are happy, when we see the RC as 0. If anything other than 0, we might want to inspect and to view more details we specify `?` in the line command and go in. Do you know SYSOUT datasets can be hidden from normal view and it can unhidden by entering command `input on` and turned off by `input off`

**SWAPBAR**    
If you give `SWAPBAR ON` multiple panels will be neatly lined up in the bottom of the screen, they are Point&Shoot fields so having cursor on it and press enter you can go into that panel. You can turn this off by giving `SWAPBAR OFF` 
---
### # Other mainframe commands
**Updated on** 09/April/2020    

**TSO LU** / **TSO LISTUSER**    
Shows what RACF groups are attached to your RACF ID

**TSO LG racf-groupname**    
Shows RACF IDs connected to this RACF group, they can be either CONNECT/USE

**TSO SHOWMSV**    
Generates interesting output with lots mainframe information from z/OS version, Last IPL date, Software versions of (TSO, RACF, HSM..). 

**TSO ISRDDN** / **DDLIST**    
To known what datasets are allocated to your ID. This helps to check if Rexx library is concatenated to  your RACF ID.Atleast thats where i most used it. 

**SAREA**    
This tells where you are mostly like which plex 

**TSO ISHELL**    
To get into Unix shell in mainframe

**Thanks**
---
title: Git - Detected dubious ownership in repository
description: Folder ownership conflicts in fit
date: 2024-11-23
tags:
  - git
slug: /169-detected-dubious-ownership-in-repository
---
Got the below error message for a simple `git status`. I pretty much know the reason, last week in my Windows 11 encountered *"blue screen of death"*, due to which i had to reinstall Windows and in the process i had changed system username.

```cmd
D:\20230422 - BigData\3. Java\Workspaces>git status
warning: safe.directory ''*'' not absolute
fatal: detected dubious ownership in repository at 'D:/20230422 - BigData/3. Java/Workspaces'
'D:/20230422 - BigData/3. Java/Workspaces' is owned by:
        (inconvertible) (S-1-5-21-1705801831-2303169435-1930423522-1001)
but the current user is:
        SUSHANTH/bobby (S-1-5-21-2182514462-352722902-1933051922-1001)
To add an exception for this directory, call:

        git config --global --add safe.directory 'D:/20230422 - BigData/3. Java/Workspaces'
```

You just have to change the ownership of all folders
* Go to the parent folder
* Right-click, Properties
* Select "Security" tab

* Click Advanced
![[169-Screenshot 2024-11-23-180539.png|400]]

* Click Change
![[169-Screenshot 2024-11-23 180606.png]]

* Enter the current System username and Click *Check Names*
* If you don't know the current username. In the command prompt enter `echo %USERNAME%`
![[169-Screenshot 2024-11-23 180640.png]]

* Click Checkbox then Apply
![[169-Screenshot 2024-11-23 180718.png]]

Now, click OK and close the properties. Open the Properties --> Security --> Advanced

* Now you can see the Owner name has changed
![[169-Screenshot 2024-11-23 181007.png]]

Now go back to Git and Retry
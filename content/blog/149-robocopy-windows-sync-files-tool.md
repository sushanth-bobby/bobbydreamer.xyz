--- 
title: ROBOCOPY - Windows Files Sync Tool
date: 2022-12-06
description: Sync windows folder for backups
tags: ['windows','file-sync']
slug: "/149-robocopy-windows-sync-files-tool"
---

This is a simple file Sync tool available in windows which is easy to use, it called *robocopy*. 

Below are the options

| Options                       | Description                                                                                  |
|-------------------------------|----------------------------------------------------------------------------------------------|
| /l                            | Test                                                                                         |
| /s                            | Sub directories                                                                              |
| /e                            | Copy including empty subdirectories                                                          |
| /copyall                      | Copy all file properties                                                                     |
| /mir                          | mirror source and destination directories                                                    |
| /purge                        | if you have deleted some files and directories in source and want to remove from destination |
| /log:d:\tmp\robocopy-logs.txt | Saving output to log file                                                                    |
| /mt:32                        | multi threaded copy to increase speed                                                        |
| /v                            | Verbose logging will show skipped files                                                      |

### Examples

```cmd
-- Below command will show a preview of what will be synched
robocopy branchTest G:\testgit\branchTest /l /e /s

-- It will sync target as it is in Source. If you have deleted files from source, it will be deleted it the target
robocopy D:\BigData "G:\20220824 - BigData" /e /s /mir /purge /mt:32 /log:d:\tmp\robocopy-bigdata.txt

-- Source and Destination will be synched. If there are additional files in target, it will not be deleted.
robocopy "D:\Bobby's" "G:\BOBB" /e /s /mir /mt:32 /log:d:\tmp\robocopy-bobbys.txt
```

* * * 

Thanks for reading
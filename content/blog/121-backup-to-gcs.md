---
title: Synchronizing files with Google Cloud Storage
date: 2021-08-09
description: Backing up files from your system
tags: ['notes','GCS','GCP']
slug: "/121-backup-to-gcs"
---

#### # Create bucket 

```sh
gsutil mb -p codes-20180829 -c standard -l us-central1 -b ON --pap enforced gs://sushanth-cs-test
```

#### # List bucket

Note : This is a Class A operation

```sh
gsutil ls -r -l gs://sushanth-cs-test/**
```

### # Copying from local to bucket

Below command initiates a parallel upload via rsync and recursively uploads all folder and sub-folders to GCS
```sh
gsutil -m rsync -r -d ./ gs://sushanth-cs-test
```

Below command initiates a parallel upload excluding the pattern via rsync and recursively uploads all folder and sub-folders to GCS. It excludes folders like *node_modules, .git, .cache and ...*

```sh
gsutil -m rsync -r -d -x ".*node_modules.*$|.*\.git.*$|.*\.cache.*$|.*Eclipse Java.*$" ./ gs://sushanth-cs-test/**
```

If you get `Caught non-retryable exception while listing...` error like below that because in windows MAX_PATH defaults to 260 characters. 
```sh
Caught non-retryable exception while listing file://.\: [WinError 3] The system cannot find the path specified: '.\\3. Java\\Eclipse Java\\eclipse-java-2021-06-R-win32-x86_64\\eclipse\\plugins\\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64_16.0.1.v20210528-1205\\META-INF\\maven\\org.eclipse.justj\\org.eclipse.justj.openjdk.hotspot.jre.full.win32.x86_64\\pom.properties'
CommandException: Caught non-retryable exception - aborting rsync
```

To increase that limit, you have two options,     

1. Update Windows Registry     
  ```
  Computer\HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\FileSystem\LongPathsEnabled
  Type: REG_DWORD
  Value: 1
  ```
  Tried this and it works. 

2. Specify UNC Paths. Prefix paths with "\\?\". This changes maximum path names to 32,767 characters.
  ```
  \\?\C:\Users\~~~~\Documents
  ```
  Did not experiment on this. Good to know there is another option. 

### # Copying from bucket to local

If you want to download the entire bucket, you can do like this. It will create a folder with the buckets name in the current folder. 
```sh
-- Parallel and Recursive flags are mentioned in below command
gsutil -m cp -r gs://sushanth-cs-test ./
```

If you want to download to a specific folder, that folder needs to exist in target. Here i have created a new folder called *t1*
```sh
-- Parallel and Recursive flags are mentioned in below command
gsutil -m cp -r gs://sushanth-cs-test ./t1
```

### # Related Articles
* [Google Cloud Storage](21-google-cloud-storage)
---
title: Google Cloud Storage
date: 2020-12-09
description: These are things to do 
tags:
  - notes 
  - GCP 
  - GCS 
slug: "/google-cloud-storage"
---
**Post created** : 10/April/2020    
**Last updated** : 04/August/2021    
 
I am a google fan. I been using gmail for nearly 15years and google is providing 15gb of free space in google drive. With freebies like this i am going to store my personal data as well in google storage and thats how everything started. 

> All the below information are copied from google's official documentation and reproduced here for my quick reference. I haven't copied all information, only commands & texts which i probably might use. 

Below are some basic fundamentals that one should know before starting to use Google Cloud Storage(GCS).

* [Overview of access control](#t1)
* [Storage class](#t2)
* [Storage Pricing](#t3)
* [GSUTIL commands](#t4)
* [Public Access](#t5)
* [My Take](#t6)

<a id="t1"></a>

### # Overview of access control    

Cloud storage offers two levels of access,      

1. Uniform(recommended)     

  Uses IAM and applies permissions to all the objects contained inside the bucket or groups of objects with common name prefixes. IAM has new features that are not available when working with ACLs, such as IAM Conditions and Cloud Audit Logs.

2. Fine-grained     

  The fine-grained option enables you to use IAM and Access Control Lists (ACLs) together to manage permissions. ACLs are a **legacy** access control system for Cloud Storage designed for interoperability with Amazon S3. You can specify access and apply permissions at both the bucket level and per individual object.

> **Note**: Once you enable uniform bucket-level access, you have 90 days to switch back to fine-grained access before uniform bucket-level access becomes permanent.

![Uniform Vs. Fine-Grain](assets/21-gcs-uniform-finegrain.png)

Currently Cloud Storage allows one to switch from *Fine-grained* to *Uniform*. But when switching to Uniform access control, one needs to remember, it removes object ACLs from this bucket. This will revoke object access for users who rely solely on ACLs for access unless you add their permissions to the bucket's IAM policy. There is a checkbox while performing the switch **Add project role ACLs to the bucket IAM policy** which ensures that users who rely on project owner, editor, and viewer roles to access the bucket's objects won't lose access. What happens is 

* Editors of the project get roles - *Storage Legacy Bucket Owner*, *Storage Legacy Object Owner*
* Owners of the project get roles - *Storage Legacy Bucket Owner*, *Storage Legacy Object Owner*
* Viewers of the project get roles - *Storage Legacy Bucket Reader*, *Storage Legacy Object Reader*

Below permission details might look like too much details for a beginner but you should know what legacy roles contain, 

* Storage Legacy Bucket Owner     
  - `roles/storage.legacyBucketOwner` : Grants permission to create, replace, and delete objects; list objects in a bucket; read object metadata when listing (excluding IAM policies); and read and edit bucket metadata, including IAM policies.
  - **Permissions** : storage.buckets.get, storage.buckets.update, storage.buckets.setIamPolicy, storage.buckets.getIamPolicy, storage.objects.list, storage.objects.create, storage.objects.delete, storage.multipartUploads.*

* Storage Legacy Object Owner     
  - `roles/storage.legacyObjectOwner` : Grants permission to view and edit objects and their metadata, including ACLs.
  - **Permissions** : storage.objects.get, storage.objects.update, storage.objects.setIamPolicy, storage.objects.getIamPolicy

* Storage Legacy Bucket Reader     
  - `roles/storage.legacyBucketReader` : Grants permission to list a bucket's contents and read bucket metadata, excluding IAM policies. Also grants permission to read object metadata when listing objects (excluding IAM policies).
  - **Permissions** : storage.buckets.get, storage.objects.list, storage.multipartUploads.list

* Storage Legacy Object Reader     
  - `roles/storage.legacyObjectReader` : Grants permission to view objects and their metadata, excluding ACLs.
  - **Permissions** : storage.objects.get

Recommendation is to go with **Uniform** as it has a lower chance of data exposure. Adding permissions at the bucket level whereas **Fine-grained** has higher chance of data exposure. If you do not set object permissions correctly as when new files are added to the bucket. 

> **Caution**: If you use Cloud IAM and ACLs on the same resource, Cloud Storage grants the broader permission set on the resource. For example, if your Cloud IAM permissions only allow a few users to access my-object, but your ACLs make my-object public, then my-object is exposed to the public. In general, Cloud IAM cannot detect permissions granted by ACLs, and ACLs cannot detect permissions granted by Cloud IAM.

ACLs control permissioning only for Cloud Storage resources and have limited permission options, but allow you to grant permissions per individual objects. You most likely want to use ACLs for the following use cases:

* Customize access to individual objects within a bucket.
* Migrate data from Amazon S3.
* When you think bucket-level IAM permission overexposes data. 

<a id="t2"></a>

### # Storage class 

First thing one needs to understand is everything stored in cloud storage is an object. Second thing one needs to understand about is storage class. These classes are categorized based on *How often you access these objects*. By default, everything gets stored in STANDARD class. 

| Class | Storage duration | Description |
| ----- | ---------------- | ----------- |
| STANDARD | None | Default. Best for data that is frequently accessed. | 
| NEARLINE | 30 days | Nearline Storage is ideal for data you plan to read or modify on average once per month or less. | 
| COLDLINE | 90 days | Coldline Storage is ideal for data you plan to read or modify at most once a quarter. | 
| ARCHIVE  | 365 days | Archive Storage is the best choice for data that you plan to access less than once a year. |

#### Additional classes    

* Multi-Regional Storage: Equivalent to Standard Storage, except Multi-Regional Storage can only be used for objects stored in multi-regions or dual-regions.

* Regional Storage: Equivalent to Standard Storage, except Regional Storage can only be used for objects stored in regions.

<a id="t3"></a>

### # Storage Pricing

Cloud Storage pricing is based on the following components:

* Data storage: the amount of data stored in your buckets. Storage rates vary depending on the storage class of your data and location of your buckets.
* Network usage: the amount of data read from or moved between your buckets.
* Operations usage: the actions you take in Cloud Storage, such as listing the objects in your buckets.
* Retrieval and early deletion fees: applicable for data stored in the Nearline Storage, Coldline Storage, and Archive Storage classes.

#### Location wise cost

All calculations are **per GB per Month**. Below are few locations based charges i refer to. 

| Location | Standard | Nearline | Coldline | Archive |
| -------- | -------- | -------- | -------- | ------- |
| Iowa (us-central1) | $0.020 | $0.010 | $0.004 | $0.0012 |
| US (multi-region) | $0.026 | $0.010 | $0.007 | $0.004 |
| Finland (europe-north1) | $0.020 | $0.010 | $0.004 | $0.0012 |
| EU (multi-region) | $0.026 | $0.010 | $0.007 | $0.004 |
| Mumbai (asia-south1) | $0.023 | $0.016 | $0.006 | $0.0025 |
| Asia (multi-region) | $0.026 | $0.010 | $0.007 | $0.004 |

#### Networks

| Operation | Description |
| ----- | ---------------- |
| *Egress* | represents data sent from Cloud Storage in HTTP responses. Data or metadata read from a Cloud Storage bucket is an example of egress. |
| *Ingress* | represents data sent to Cloud Storage in HTTP requests. Data or metadata written to a Cloud Storage bucket is an example of ingress. Ingress is free of charge. |

* Network egress within Google Cloud : One should check this again, at the time, when i was reading this. Data moving within Google Cloud Servies within same multi-region in same continent is Free of charge. 

**General Network Usage**     
* Egress to Asia Destinations (excluding China, but including Hong Kong) / GB
  - 0-1 TB : $0.12
  - 1-10 TB : $0.11

#### Operations     
An operation is an action that makes changes to or retrieves information about resources such as buckets and objects in Cloud Storage. These operations are divided into classes A and B

| Storage Class | Class A(per 10k operations) | Class B(per 10k operations) |
| ----- | ---------------- | ----------- |
| Standard | $0.05 | $0.004 |
| Nearline | $0.10 | $0.01 |
| Coldline | $0.10 | $0.05 |
| Archive  | $0.50 | $0.50 |

All the important operations fall in Class A like insert, update, listing, delete, copy, rewrite, accessControls and lot more. 

* **Class A** : storage.*.insert, storage.*.patch, storage.*.update, storage.*.setIamPolicy, storage.buckets.list, storage.buckets.lockRetentionPolicy, storage.notifications.delete, storage.objects.compose, storage.objects.copy, storage.objects.list, storage.objects.rewrite, storage.objects.watchAll, storage.projects.hmacKeys.create, storage.projects.hmacKeys.list, storage.*AccessControls.delete

* **Class B** : storage.*.get, storage.*.getIamPolicy, storage.*.testIamPermissions, storage.*AccessControls.list, storage.notifications.list, Each object change notification

#### Retrieval and early deletion     

Because Nearline Storage, Coldline Storage, and Archive Storage are intended for storing infrequently accessed data, there are additional costs associated with retrieving data or metadata stored in these classes, as well as minimum storage durations that you are charged for.

* A **retrieval cost** applies when you read, copy, or rewrite data or metadata that is stored using one of these storage classes. This cost is in addition to any network charges associated with reading the data.

* A **minimum storage duration** applies to data stored using one of these storage classes. You can delete the data before it has been stored for this duration, but at the time of deletion you are charged as if the data was stored for the minimum duration.

For example, suppose you store 1,000 GB of Coldline Storage data in the US multi-region. If you add the data on day 1 and then remove it on day 60, you are charged $14 ($0.007/GB/mo. * 1,000 GB * 2 mo.) for storage from day 1 to 60, and then $7 ($0.007/GB/mo. * 1,000 GB * 1 mo.) for 30 days of early deletion from day 61 to 90.

#### Monthly Pricing Examples

> **Note**: Network Egress and Retrieval cost wont apply till you do some operations to download the data. 

Cost of storing and retreiving 200GB of STANDARD data in Iowa (us-central1)

| Category | Calculations | Cost |
| -------- | ------------ | ----------- |
| Data Storage | 200gb * $0.020 | $4 |
| Network  | (0-1 TB tier): 200gb egress to asia destinations * $0.12 per GB | $24 | 
| Operations | 1,000,000 Class A operations * $0.05 per 10,000 operations | $5 |
| Operations | 10,000,000 Class B operations * $0.004 per 10,000 operations | $4 |
| Retrieval | $0 per GB | $0 |
| Total     | - | $37 | 

Cost of storing and retrieving 1TB of STANDARD data in Iowa (us-central1)

| Category | Calculations | Cost |
| -------- | ------------ | ----------- |
| Data Storage | 1TB(1024gb) * $0.020 | $20.48 |
| Network  | (0-1 TB tier): 1TB (1024GB) egress to asia destinations * $0.12 per GB | $122.88 | 
| Operations | 1,000,000 Class A operations * $0.05 per 10,000 operations | $5 |
| Operations | 10,000,000 Class B operations * $0.004 per 10,000 operations | $4 |
| Retrieval | $0 per GB | $0 |
| Total     | - | $152.36 | 


Cost of storing and retrieving 2TB of STANDARD data in Iowa (us-central1)

| Category | Calculations | Cost |
| -------- | ------------ | ----------- |
| Data Storage | 2TB(2048gb) * $0.020 | $40.96 |
| Network  | (0-1 TB tier): 1TB (1024GB) egress to asia destinations * $0.12 per GB | $122.88 | 
| Network  | (1-10 TB tier): 1TB (1024GB) egress to asia destinations * $0.11 per GB | $112.64 | 
| Operations | 1,000,000 Class A operations * $0.05 per 10,000 operations | $5 |
| Operations | 10,000,000 Class B operations * $0.004 per 10,000 operations | $4 |
| Retrieval | $0 per GB | $0 |
| Total     | - | $285.48 | 

Cost of storing and retrieving 2TB of STANDARD data in Mumbai (asia-south1) just $7 more

| Category | Calculations | Cost |
| -------- | ------------ | ----------- |
| Data Storage | 2TB(2048gb) * $0.023 | $47.104 |


Cost of storing and retrieving 1TB of NEARLINE(min 30days) data in Iowa (us-central1)

| Category | Calculations | Cost |
| -------- | ------------ | ----------- |
| Data Storage | 1TB(1024gb) * $0.010 | $10.24 |
| Network  | (0-1 TB tier): 1TB (1024GB) egress to asia destinations * $0.12 per GB | $122.88 | 
| Operations | 1,000,000 Class A operations * $0.10 per 10,000 operations | $10 |
| Operations | 10,000,000 Class B operations * $0.01 per 10,000 operations | $10 |
| Retrieval | $0.01 per GB | 10.24 |
| Total     | - | $163.36 | 

Cost of storing and retrieving 1TB of COLDLINE(min 90days) data in Iowa (us-central1)

| Category | Calculations | Cost |
| -------- | ------------ | ----------- |
| Data Storage | 1TB(1024gb) * $0.004 | $4.096 |
| Network  | (0-1 TB tier): 1TB (1024GB) egress to asia destinations * $0.12 per GB | $122.88 | 
| Operations | 1,000,000 Class A operations * $0.10 per 10,000 operations | $10 |
| Operations | 10,000,000 Class B operations * $0.05 per 10,000 operations | $50 |
| Retrieval | $0.02 per GB | $20.48 |
| Total     | - | $207.456 | 

Cost of storing and retrieving 1TB of ARCHIVE(min 365days) data in Iowa (us-central1)

| Category | Calculations | Cost |
| -------- | ------------ | ----------- |
| Data Storage | 1TB(1024gb) * $0.0012 | $1.2288 |
| Network  | (0-1 TB tier): 1TB (1024GB) egress to asia destinations * $0.12 per GB | $122.88 | 
| Operations | 1,000,000 Class A operations * $0.50 per 10,000 operations | $50 |
| Operations | 10,000,000 Class B operations * $0.50 per 10,000 operations | $500 |
| Retrieval | $0.05 per GB | $51.2 |
| Total     | - | $922.5248 | 

You can verify the above calculation in the [Google Pricing Calculator](https://cloud.google.com/products/calculator) and do remember to update the Cloud Storage and Networking Egress tab. 

<a id="t4"></a>

### # GSUTIL commands 

#### Creating Storage Buckets    

```sh
-- Full syntax
gsutil mb -p [PROJECT_ID] -c [STORAGE_CLASS] -l [BUCKET_LOCATION] -b [ON/OFF] gs://[BUCKET_NAME]/

-- Example
gsutil mb -p codes-20180829 -c standard -l us-central1 -b ON --pap enforced gs://sushanth-7885-test-bucket1
```

| Option | Description |
| -------- | ------------ | ----------- |
| `-p` | Specifies the project ID or project number to create the bucket under | 
| `-c` | Storage class. Default is "Standard" | 
| `-l` | Storage Location. Here us-central1 is Iowa. Default is US | 
| `-b` | Uniform bucket-level access setting(ON/OFF). Default is "off" | 
| `-pap` | Public access prevention setting. Options are *enforced* or *unspecified*. Default is "unspecified" | 


**Changing the default storage class of a bucket**    

When you upload an object to the bucket, if you don't specify a storage class for the object, the object is assigned the bucket's default storage class.

```sh
gsutil defstorageclass set [STORAGE_CLASS] gs://[BUCKET_NAME]
```

#### Listing Buckets & Objects    

```sh
-- Listing all buckets
gsutil ls

-- -r : recursively list entire directory tree 
gsutil ls -r gs://bucket/**

-- Output
D:\>gsutil ls -r gs://sushanth-mysql-backups/**
gs://sushanth-mysql-backups/Backup Database test.bat
gs://sushanth-mysql-backups/Input-dbDetails - Copy.txt
gs://sushanth-mysql-backups/Input-dbDetails.txt
gs://sushanth-mysql-backups/Java Command.txt
gs://sushanth-mysql-backups/zip/Backup 20210708 - test - V1.zip
gs://sushanth-mysql-backups/zip/Backup 20210802 - test - V1.zip


-- -l : You get additional information like object size, creation time stamp and along with the total count 
gsutil ls -l gs://bucket/*.txt

-- Output
D:\>gsutil ls -l -r gs://sushanth-mysql-backups/**
     33979  2021-08-02T04:28:40Z  gs://sushanth-mysql-backups/Backup Database test.bat
       197  2018-12-22T07:36:10Z  gs://sushanth-mysql-backups/Input-dbDetails - Copy.txt
       197  2018-12-22T07:36:10Z  gs://sushanth-mysql-backups/Input-dbDetails.txt
      1689  2019-09-14T14:34:57Z  gs://sushanth-mysql-backups/Java Command.txt
 893165065  2021-07-08T11:56:20Z  gs://sushanth-mysql-backups/zip/Backup 20210708 - test - V1.zip
 901083990  2021-08-02T04:39:04Z  gs://sushanth-mysql-backups/zip/Backup 20210802 - test - V1.zip
TOTAL: 6 objects, 1794285117 bytes (1.67 GiB)

-- Adding flag -h to -l as it will show sizes in readable form like MB, GB.
-- Output
D:\>gsutil ls -lh -r gs://sushanth-mysql-backups/**
 33.18 KiB  2021-08-02T04:28:40Z  gs://sushanth-mysql-backups/Backup Database test.bat
     197 B  2018-12-22T07:36:10Z  gs://sushanth-mysql-backups/Input-dbDetails - Copy.txt
     197 B  2018-12-22T07:36:10Z  gs://sushanth-mysql-backups/Input-dbDetails.txt
  1.65 KiB  2019-09-14T14:34:57Z  gs://sushanth-mysql-backups/Java Command.txt
851.79 MiB  2021-07-08T11:56:20Z  gs://sushanth-mysql-backups/zip/Backup 20210708 - test - V1.zip
859.34 MiB  2021-08-02T04:39:04Z  gs://sushanth-mysql-backups/zip/Backup 20210802 - test - V1.zip
TOTAL: 6 objects, 1794285117 bytes (1.67 GiB)

-- -L : Will display with all metadata information for each object like storage-class, versioning and ACL info.(output will be big)
gsutil ls -L gs://[BUCKET_NAME]/

-- Output
D:\>gsutil ls -L -r gs://sushanth-mysql-backups/** | more
gs://sushanth-mysql-backups/Backup Database test.bat:
    Creation time:          Mon, 02 Aug 2021 04:28:40 GMT
    Update time:            Mon, 02 Aug 2021 04:28:40 GMT
    Storage class:          REGIONAL
    Content-Language:       en
    Content-Length:         33979
    Content-Type:           text/plain
    Metadata:
        goog-reserved-file-mtime:1627875347
    Hash (crc32c):          wrLHaQ==
    Hash (md5):             IlEkjU9McS/87tEQfpWrGA==
    ETag:                   COf00IfAkfICEAE=
    Generation:             1627878520535655
    Metageneration:         1
    ACL:                    []
...

```

#### Bucket size    

> **Caution** : This `storage.objects.list` is a Class A operation meaning its expensive. 

Displays the amount of space (in bytes) being used by the objects. If bucket is bigger might take lots of time
```sh
-- -s(only grand total) and -h(size in readable format)
D:\>gsutil du -sh gs://sushanth-mysql-backups
1.67 GiB     gs://sushanth-mysql-backups
```

#### Important Points

* Rename or Move is a copy operation followed by a delete operation of the original object because objects are immutable.
* Any type of moving, renaming and rewriting are a Class A operation and which may incur retrieval and early deletion charges if the data was originally stored as Nearline Storage, Coldline Storage, or Archive Storage.

#### Changing object storage classes   

```sh
> gsutil rewrite -O -s nearline gs://sushanth-cs-test/normalFile1.txt
NOTE: No encryption_key was specified in the boto configuration file,
so gsutil will not provide an encryption key in its rewrite API
requests. This will decrypt the objects unless they are in buckets
with a default KMS key set, in which case the service will
automatically encrypt the rewritten objects with that key.

- [1 files][   14.0 B/   14.0 B]                                                 0.0 B/   14.0 B]
Operation completed over 1 objects/14.0 B.
```

#### Copying objects    

GSUTIL has top-line and individual commands and most commonly used top-level command is `-m` supported in (acl ch, acl set, cp, mv, rm, rsync, and setmeta), this causes operations to run in parallel which improves performance over a reasonably fast network connection. 

The number of threads and processors are determined by parallel_thread_count and parallel_process_count, respectively. These values are set in the .boto configuration file or specified in individual requests with another -o top-level flag.

| Flags | Description |
| -------- | ------------ | ----------- |
| `-m` | Top-level flag - performs a parallel (multi-threaded/multi-processing) copy from local directory to bucket | 
| `-r` | copies entire directory tree | 

Below in cloud storage it automatically created a folder called *concepts* and copied the files. 

```sh
D:\BigData\16.GCP\Docs\Printed\GCP - VPC - Concepts>gsutil -m cp -r ./ gs://sushanth-cs-test/concepts

Copying file://.\Multiple Network Interfaces Overview and Examples  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Private Access Options for Services  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Firewall Rules Logging Overview  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\GCP - Virtual Private Cloud - Concepts.pdf [Content-Type=application/pdf]...
Copying file://.\Legacy Networks  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Routes Overview  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Overview of Virtual Private Cloud  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Virtual Private Cloud (VPC) Network Overview  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Alias IP Ranges Overview  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\VPC Network Peering  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Firewall Rules Overview  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\IP Addresses  _  Compute Engine Documentation  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Advanced VPC Concepts  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\Shared VPC Overview  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
Copying file://.\GCP - Virtual Private Cloud - Concepts - Combined.pdf [Content-Type=application/pdf]...
Copying file://.\Special Configurations for VM Instances  _  VPC  _  Google Cloud.pdf [Content-Type=application/pdf]...
- [16/16 files][ 10.3 MiB/ 10.3 MiB] 100% Done
Operation completed over 16 objects/10.3 MiB.
```

#### Copying list of files specified in a file     

| Flags | Description |
| -------- | ------------ | ----------- |
| `-I` | You can pass a list of URLs (one per line) to copy on stdin instead of as command line arguments by using the -I option | 

```sh
-- /B : Uses bare format (no heading information or summary).
dir /B >filename.txt

> cat filename.txt
GCP - Virtual Private Cloud - Concepts - Combined.pdf
GCP - Virtual Private Cloud - Concepts.pdf

> cat filename.txt | gsutil -m cp -I gs://sushanth-cs-test/concepts
Copying file://GCP - Virtual Private Cloud - Concepts - Combined.pdf [Content-Type=application/pdf]...
Copying file://GCP - Virtual Private Cloud - Concepts.pdf [Content-Type=application/pdf]...
| [2/2 files][  5.6 MiB/  5.6 MiB] 100% Done
Operation completed over 2 objects/5.6 MiB.
```

Suppose i want to copy `.\3. Java\new2` folder
```sh
tree /f
D:.
├───3. Java
│   ├───new2
│   │   │   normalFile1.txt
```

File `lupin.txt` contains below, 

```sh:title=lupin.txt
D:\BigData\16.GCP\GCS\TestFolder\.git
D:\BigData\16.GCP\GCS\TestFolder\3. Java\new2
```

This is the execution output, 

```sh
cat lupin.txt | gsutil -m cp -Ir gs://sushanth-cs-test/

# Output
Copying file://D:\BigData\16.GCP\GCS\TestFolder\.git\hello.txt [Content-Type=text/plain]...
Copying file://D:\BigData\16.GCP\GCS\TestFolder\.git\inGit.txt [Content-Type=text/plain]...
Copying file://D:\BigData\16.GCP\GCS\TestFolder\3. Java\new2\normalFile1.txt [Content-Type=text/plain]...
Copying file://D:\BigData\16.GCP\GCS\TestFolder\3. Java\new2\node_modules\inNode.txt [Content-Type=text/plain]...
/ [4/4 files][    0.0 B/    0.0 B]
Operation completed over 4 objects.
```

![Creates the folder in the root of the bucket itself](assets/21-gcs-no-path.png)

Creates the folder *new2* in the root of the bucket itself not in the path `3.Java\new2`. 

#### Copying a file with different storage class than buckets default storage class     

```sh
-- -s : Storage class of destination 
>gsutil -m cp -s nearline ./filename.txt gs://sushanth-cs-test/concepts
Copying file://.\filename.txt [Content-Type=text/plain]...
- [1/1 files][   97.0 B/   97.0 B] 100% Done
Operation completed over 1 objects/97.0 B.
```

![File stored in Nearline storage class](assets/21-gcs-nearline.png)


Some dos commands that can help to generate file listing
```sh
# Lists only files
dir /b /s /a-d > lupin.txt 

# Lists only directories
dir /b /s /a-a > lupin.txt 
```

#### Parallel Downloads

```sh
> mkdir GCPBooks

> gsutil -m cp -r gs://sushanth-cs-test/concepts/GCP* ./GCPBooks
Copying gs://sushanth-cs-test/concepts/GCP - Virtual Private Cloud - Concepts - Combined.pdf...
Copying gs://sushanth-cs-test/concepts/GCP - Virtual Private Cloud - Concepts.pdf...
\ [2/2 files][  5.6 MiB/  5.6 MiB] 100% Done
Operation completed over 2 objects/5.6 MiB.

> gsutil -m cp -r gs://sushanth-cs-test/concepts/f* ./
Copying gs://sushanth-cs-test/concepts/filename.txt...
- [1/1 files][   97.0 B/   97.0 B] 100% Done
Operation completed over 1 objects/97.0 B.
```    

Suppose there are folders like this in cloud, you can run like this to download parallely(this can run on multiple machines & dir could be a shared directory as well)

```sh 
-- gs://my-bucket/data/result_set_01/
-- gs://my-bucket/data/result_set_02/
-- ...
-- gs://my-bucket/data/result_set_99/

gsutil -m cp -r gs://my-bucket/data/result_set_[0-3]* dir
gsutil -m cp -r gs://my-bucket/data/result_set_[4-6]* dir
gsutil -m cp -r gs://my-bucket/data/result_set_[7-9]* dir
```

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

Below command will copy all files even in the sub-folders to the root of the folder *t1*. 
```sh
-- Parallel and Recursive flags are mentioned in below command. Even if you dont specify -r flag it does the same thing. 
> gsutil -m cp -r gs://sushanth-cs-test/** ./t1
Copying gs://sushanth-cs-test/new3/new3sub/normalFile1.txt...
Copying gs://sushanth-cs-test/normalFile1.txt...
Copying gs://sushanth-cs-test/3. Java/.git/inGit2.txt...
Copying gs://sushanth-cs-test/.git/inGit.txt...
Copying gs://sushanth-cs-test/3. Java/normalFile2.txt...
Copying gs://sushanth-cs-test/concepts/GCP - Virtual Private Cloud - Concepts - Combined.pdf...
Copying gs://sushanth-cs-test/.git/hello.txt...
Copying gs://sushanth-cs-test/concepts/GCP - Virtual Private Cloud - Concepts.pdf...
Copying gs://sushanth-cs-test/concepts/filename.txt...
Copying gs://sushanth-cs-test/3. Java/new2/normalFile1.txt...
Copying gs://sushanth-cs-test/new3/normalFile1.txt...
Skipping copy of source URL gs://sushanth-cs-test/** because destination URL file://.\t1\normalFile1.txt is already being copied by another gsutil process or thread (did you specify the same source URL twice?)
Skipping copy of source URL gs://sushanth-cs-test/** because destination URL file://.\t1\normalFile1.txt is already being copied by another gsutil process or thread (did you specify the same source URL twice?)
Skipping copy of source URL gs://sushanth-cs-test/** because destination URL file://.\t1\normalFile1.txt is already being copied by another gsutil process or thread (did you specify the same source URL twice?)
| [8/11 files][  5.6 MiB/  5.6 MiB]  99% Done
```

If you want to copy only the files in root of the path you mention and not the sub-folders. Try this, single '*', just matches names one level deep. In the below scenario only one file was in the root normalFile1.txt only that was copied. 
```sh
gsutil -m cp gs://sushanth-cs-test/* ./t1
```

#### Delete objects    

```sh
D:\BigData\16.GCP\Docs\Printed\GCP - VPC - Concepts>gsutil -m rm -r gs://sushanth-cs-test/concepts
Removing gs://sushanth-cs-test/concepts/Advanced VPC Concepts  _  VPC  _  Google Cloud.pdf#1628402442014145...
Removing gs://sushanth-cs-test/concepts/Alias IP Ranges Overview  _  VPC  _  Google Cloud.pdf#1628402441841734...
...
/ [16/16 objects] 100% Done
Operation completed over 16 objects.
```

#### Deleting buckets  

Buckets can be deleted only if it is empty
```sh 
> gsutil rb gs://sushanth-cs-test
Removing gs://sushanth-cs-test/...
NotEmptyException: 409 BucketNotEmpty (sushanth-cs-test)
```

**Caution** : Below command will delete all the objects in the bucket and finally deletes the bucket
```sh
gsutil -m rm -r gs://sushanth-cs-test
```

If you want to delete all objects in the bucket, but not the bucket itself
```sh
gsutil -m rm -r gs://sushanth-cs-test/**
```

Input file can be used to pass files that need to be deleted from the cloud storage
```sh
cat lupin.txt | gsutil -m rm -I
```

#### Moving & Renaming object    

This can be used for renaming objects as well. The gsutil mv command does not perform a single atomic operation. Rather, it performs a copy from source to destination followed by removing the source for each object.

```sh 
gsutil mv gs://[SOURCE_BUCKET_NAME]/[SOURCE_OBJECT_NAME] gs://[DESTINATION_BUCKET_NAME]/[DESTINATION_OBJECT_NAME]
```

#### rsync

Synchronize local changes with the bucket    

| Flag | Description |
| ----- | ---------------- |
| -m | To perform a parallel (multi-threaded/multi-processing) copy |
| -r | recurse into directories |
| -d | (caution) It mirrors target like source. If any files are deleted in the source, it will be deleted in the target as well |
| -n | dry run. Its recommended if you are using -d, try running -n first, to know which files are going to be deleted |
| -x | Followed by a pattern causes files/objects matching pattern to be excluded. This pattern is a python regular expression |

**Note**    
* Wont copy empty folders


```sh 
gsutil -m rsync -r -d -x ".*node_modules.*$|.*\.git.*$|.*\.cache.*$|.*Eclipse\sJava.*$" ./ gs://sushanth-cs-test
```

Dry run example
```sh
> gsutil -m rsync -n -r -d -x ".*node_modules.*$|.*Eclipse\sJava.*$" ./ gs://sushanth-cs-test
Building synchronization state...
Starting synchronization...
Would copy file://.\.git\hello.txt to gs://sushanth-cs-test/.git/hello.txt
Would copy file://.\.git\inGit.txt to gs://sushanth-cs-test/.git/inGit.txt
Would copy file://.\3. Java\new2\normalFile1.txt to gs://sushanth-cs-test/3. Java/new2/normalFile1.txt
Would copy file://.\3. Java\.git\inGit2.txt to gs://sushanth-cs-test/3. Java/.git/inGit2.txt
Would copy file://.\3. Java\normalFile2.txt to gs://sushanth-cs-test/3. Java/normalFile2.txt
Would copy file://.\new3\new3sub\normalFile1.txt to gs://sushanth-cs-test/new3/new3sub/normalFile1.txt
Would copy file://.\new3\normalFile1.txt to gs://sushanth-cs-test/new3/normalFile1.txt
Would copy file://.\normalFile1.txt to gs://sushanth-cs-test/normalFile1.txt
```

**Note** : If you have added a file/folder to cloud storage and later you exclude it. Next time when you sync, it wont get deleted automatically, it has to be deleted manually. So first, trying writing a simple python regular expression program like below to see whats selected for exclusion. 

Generate input for the program using this command

```sh
dir /s /B > lupin.txt
```

```python
import re

data_lines = []
r = re.compile(".*node_modules.*$|.*\.git.*$|.*\.cache.*$|.*Eclipse\sJava.*")
with open("files/lupin.txt") as f:
    for line in f:
        if not r.match(line):
            data_lines.append(line.strip())

for i in range(100):
    print(data_lines[i])

print(len(data_lines))
```

#### Moving files from one project to another    

If you try to copy from one project to another project from your local system. You should have access to do that otherwise you will get error like below, 
```sh
> gsutil cp -r gs://sushanth-cs-test gs://test-20210809
Copying gs://sushanth-cs-test/.git/hello.txt [Content-Type=text/plain]...
AccessDeniedException: 403 abc-dd-gsutil4@dido-20140830.iam.gserviceaccount.com does not have storage.objects.create access to the Google Cloud Storage object.
```

There are two approaches and first one is the direct and easiest approach. 

Open Google Cloud Shell and do the copy(cp) or rsync
```
# syntax
gsutil -m rsync -r gs://[SOURCE-PROJECT-BUCKET_NAME] gs://[TARGET-PROJECT-BUCKET_NAME]
# or
gsutil -m cp -r gs://[SOURCE-PROJECT-BUCKET_NAME] gs://[TARGET-PROJECT-BUCKET_NAME]
```

![Cloud Shell](assets/21-gcs-cloud-shell.png)

Next option is to use **GCSFUSE**. Don't need to install this in Cloud Shell, its available there. 

> Cloud Storage FUSE is an open source FUSE adapter that allows you to mount Cloud Storage buckets as file systems on Linux or macOS systems. It also provides a way for applications to upload and download Cloud Storage objects using standard file system semantics. Cloud Storage FUSE can be run anywhere with connectivity to Cloud Storage, including Google Compute Engine VMs or on-premises systems

```sh
gcloud config set project codes-20180829
Updated property [core/project].

mkdir cs-test

gcloud config set project bobbydreamer-196820
Updated property [core/project].

gcsfuse -implicit-dirs sushanth-cs-test cs-test
2021/08/09 11:52:35.940781 Using mount point: /home/bobby_dreamer/cs-test
2021/08/09 11:52:35.951795 Opening GCS connection...
2021/08/09 11:52:36.473619 Mounting file system "sushanth-cs-test"...
2021/08/09 11:52:36.477365 File system has been successfully mounted.

cd cs-test

ls -la
total 0
drwxr-xr-x 1 bobby_dreamer bobby_dreamer 0 Aug  9 11:53 .git
-rw-r--r-- 1 bobby_dreamer bobby_dreamer 0 Aug  9 11:48 hello.txt
drwxr-xr-x 1 bobby_dreamer bobby_dreamer 0 Aug  9 11:53 new2

gsutil cp -r . gs://test-20210809
Copying file://./hello.txt [Content-Type=text/plain]...
Copying file://./.git/hello.txt [Content-Type=text/plain]...
Copying file://./.git/inGit.txt [Content-Type=text/plain]...
Copying file://./new2/normalFile1.txt [Content-Type=text/plain]...
/ [4 files][    0.0 B/    0.0 B]
Copying file://./new2/node_modules/inNode.txt [Content-Type=text/plain]...
/ [5 files][    0.0 B/    0.0 B]
Operation completed over 5 objects.

fusermount -u cs-test
```

**Note** : Above when using gcsfuse command by default when you mount it shows only files, so you need to add `--implicit-dirs` flag to show  directories.

 
<a id="t5"></a>

### # Public accesses

#### Fine-Grained 

If you want to grant accesses to specific objects then you should use Fine-grained ACL access control

**Fine-grained ACL : Making individual objects publicly readable**    
> Note :  If you try this for uniform bucket-level, you get message like *legacy ACL for an object when uniform bucket-level access is enabled.*

```
gsutil acl ch -u AllUsers:R gs://[BUCKET_NAME]/[OBJECT_NAME]
```

#### Uniform Bucket

**Making all objects in a bucket publicly readable**    
```
# Note: roles/storage.objectViewer includes permission to list the objects in the bucket.
gsutil iam ch allUsers:objectViewer gs://[BUCKET_NAME]

# Note : If you don't want to grant listing publicly
gsutil iam ch allUsers:roles/storage.legacyObjectReader gs://[BUCKET_NAME]
```

#### Remove public access    
```
gsutil iam ch -d allUsers:objectViewer gs://[BUCKET_NAME]
gsutil iam ch -d allUsers:roles/storage.legacyObjectReader gs://[BUCKET_NAME]
```

#### Accessing public data    
In public datasets, you can usually list files and copy specific files to local(eg:- Google public bucket : `gcp-public-data-landsat`)
```
gsutil ls -r gs://gcp-public-data-landsat/LC08/PRE/063/046/LC80630462016*
gsutil cp gs://gcp-public-data-landsat/LC08/PRE/063/046/LC80630462016136LGN00/LC80630462016136LGN00_B11.TIF .
```

#### Using Cloud IAM permissions    

```sh
gsutil iam ch [MEMBER_TYPE]:[MEMBER_NAME]:[IAM_ROLE] gs://[BUCKET_NAME]
```
Where:    
* [MEMBER_TYPE] is the type of member to which you are granting bucket access. For example, user.
    Member types : 
    * Google accounts and Google groups represent two general types, while allAuthenticatedUsers and allUsers are two specialized types.
    * Cloud IAM supports the following member types, which can be applied specifically to your Cloud Storage bucket Cloud IAM policies:
        - projectOwner:[PROJECT_ID]
        - projectEditor:[PROJECT_ID]
        - projectViewer:[PROJECT_ID]
* [MEMBER_NAME] is the name of the member to which you are granting bucket access. For example, jane@gmail.com.
* [IAM_ROLE] is the IAM role you are granting to the member. For example, roles/storage.objectCreator.
* [BUCKET_NAME] is the name of the bucket you are granting the member access to. For example, my-bucket.

```sh 
-- Give a specific email address permission to read and write objects in your bucket
gsutil iam ch user:jane@gmail.com:objectCreator,objectViewer gs://my-awesome-bucket

-- Remove this permission, use the command
gsutil iam ch -d user:jane@gmail.com:objectCreator,objectViewer gs://my-awesome-bucket

-- Viewing the Cloud IAM policy for a bucket
gsutil iam get gs://[BUCKET_NAME]

-- Removing a member from a bucket-level policy
gsutil iam ch -d [MEMBER_TYPE]:[MEMBER_NAME] gs://[BUCKET_NAME]
```

> Note : Important: It typically takes about a minute for revoking access to take effect. In some cases it may take longer. If you remove a user's access, this change is immediately reflected in the metadata; however, the user may still have access to the object for a short period of time.

<a id="t6"></a>

### # My take

1. Keep it simple 
1. Keep a watch on the pricing 
1. Dont give too much public access 
1. Before starting, plan on setting some standards for buckets, naming conventions, file types, content types and etc..
1. You don't need to dump all the data to one single project or bucket, if you need you can have a separation there. 

### # How to's

**Create bucket and make it public**    

```sh
-- Create a public bucket
gsutil mb -c STANDARD -l us-west1 -b on gs://bobbydreamer-com-technicals

-----------------------------------------------------------------------------
-- Give public access as viewer and allows listing as well
gsutil iam ch allUsers:objectViewer gs://bobbydreamer-com-technicals
-- (OR) --
-- Give public access as viewer but restrict listing
gsutil iam ch allUsers:roles/storage.legacyObjectReader gs://[BUCKET_NAME]
-----------------------------------------------------------------------------

-- Copying file to bucket
bobby_dreamer@cloudshell:~ (bobbydreamer-196820)$ gsutil -m cp bse_daily_365d.csv gs://bobbydreamer-com-technicals
Copying file://bse_daily_365d.csv [Content-Type=text/csv]...
- [1/1 files][ 69.3 MiB/ 69.3 MiB] 100% Done
Operation completed over 1 objects/69.3 MiB.
```


### # Related Articles
1. [Synchronizing files with Google Cloud Storage](121-backup-to-gcs)

### # Resources 
* [How-to Guides](https://cloud.google.com/storage/docs/how-to#objects)
* [Google GSUTIL](https://cloud.google.com/storage/docs/gsutil)
* [Best practices for Cloud Storage](https://cloud.google.com/storage/docs/best-practices)
* [Cloud storage pricing](https://cloud.google.com/storage/pricing)
* [GCS Fuse](https://cloud.google.com/storage/docs/gcs-fuse)
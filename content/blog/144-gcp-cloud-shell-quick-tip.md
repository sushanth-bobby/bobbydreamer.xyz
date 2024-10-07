--- 
title: GCP - Cloud Shell Quick Tips
date: 2022-07-12
description: Cloud shell quick tips
tags: ['GCP']
slug: "/144-gcp-cloud-shell-quick-tip"
---

In GCP, for quick actions or tests, cloud shell will be the go to thing. Here are tips which i had learnt over period of time.

#### First commands to execute in cloud shell

**Date:** 12-07-2022 

```
gcloud auth list
gcloud config list project
gcloud config set project '<<project-name>>'
```

#### Starting shell in ephemeral mode

**Date:** 12-07-2022 

When you start the shell, click on the 3-dots symbol on the right and look for *Ephemeral mode* and select it. In Ephemeral mode disk storage is not persistent, so you don't have to worry of costs of storage of files being created in the VM as files will be deleted when the session ends. 

Default is not Ephemeral mode, Cloud Shell provisions 5 GB of free persistent disk storage on your temporarily allocated virtual machine and files in your home directory persist between sessions.

#### Deleting files in a cloud storage folder

```
gsutil -m rm gs://BUCKET_NAME/FOLDER/*.ext
```

* * * 

Thanks for reading
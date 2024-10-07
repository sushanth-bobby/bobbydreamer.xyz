---
title: Copying files from Google Cloud Storage to Local
date: 2020-03-18
description: Copying multiple files from GCS to Local 
tags:
  - GCS
  - gsutil
  - GCP
slug: "/gcs-2-local"
---

Trying to download multiple files from google cloud storage at times can be frustrating, when there is no option to download 
all files from bucket. You will have to download one file at a time. 

An idea popped in my head to solve this problem. 

### # The Plan
1. Open Cloud shell 
2. Create a folder and copy all the files from bucket to this folder. 
3. Zip the folder
4. Copy the zip file to Cloud storage 
5. Download the zip file. 

### # Code
1. Open Google Cloud Shell and set the GCP project and create a folder 
    ```sh noLineNumbers
    gcloud config set project bobbydreamer 

    mkdir V1-bobbydreamer.com 
    cd V1-bobbydreamer.com 
    ```
2. Copy all the files from bucket to the folder we are in 
    ```sh noLineNumbers
    gsutil -m cp -r gs://www.bobbydreamer.com/* .
    ```

3. Zip the folder . ```-r``` for recursive
    ```sh noLineNumbers
    cd ..

    zip -r V1-bobbydreamer.com.zip V1-bobbydreamer.com/
    ```

4. Moving files from shell to bucket
    ```sh noLineNumbers
    gsutil -m cp V1-bobbydreamer.com.zip gs://sushanth-personalfiles/
    ```

5. Go to cloud storage into the bucket and click on the 3-dots and select download. 


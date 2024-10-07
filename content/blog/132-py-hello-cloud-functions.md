---
title: Hello Cloud Functions(python)
date: 2021-10-10
description: Working with Google Cloud Functions using Python
tags: ['GCP', 'python']
slug: "/132-py-hello-cloud-functions"
---

Cloud Functions run in a fully-managed, serverless environment where Google handles infrastructure, operating systems, and runtime environments completely on your behalf. Each Cloud Function runs in its own isolated secure execution context, scales automatically, and has a lifecycle independent from other functions.


### Things to know before starting

* There are two types of Cloud Functions, 
  - Google Cloud Functions, which allow you to run snippets of code in Google's infrastructure in response to events.
  - Cloud Functions for Firebase, which triggers Google Cloud Functions based on events in Firebase (such as database or file writes, user creation, etc)

* Functions can be triggered by HTTP, publishing a message to Pub/Sub topic, based on events in Firebase/Firestore, Cloud Scheduler, Cloud Storage. Functions can be categorized as two types, i) HTTP triggers and  ii) Background functions. 
* Functions must be stateless -- one function invocation should not rely on in-memory state set by a previous invocation.
* Each instance of a function handles only one concurrent request at a time. 
* If there is extremely rapid increase in inbound traffic can intermittently cause some requests to fail with an HTTP code of 500. This is because the requests are timing out in the pending queue while waiting for new instances to be created.
* Cold starts may create latency problems this happens during new deployment and creating new instances during scaling. 
* Global Scope in a function is executed only once, when its first invoked. In a situation where the same funtion is reused for another execution, the variables you had set in global scope would not be set/triggered. So, write programs in such a way, it should not depend on global variables (or) reinitialize the variable at the end of execution.
* At certain times, functions might be triggered more than once, your application should be able to handle that. You functions should be *idempotent*, an identical request can be made once or several times in a row with the same effect while leaving the server in the same state.
* By default, a function times out after 1 minute, but you can extend this period up to 9 minutes(Add flag --timeout=540 during `gcloud functions deploy`)

* `/tmp/` path can be used for local storage during execution but be aware it takes up the space which you had allocated in memory default is 256MB. When CF completes its execution the files in /tmp/ are not deleted automatically. So, in a scenario where, if the same instance of the CF is used by the next request, memory can be used up by the files you had created in the previous innovation. Have a practice of cleaning up /tmp/ before program completion. To increase memory add flag `--memory=512MB` during *gcloud functions deploy*.

* To share data between functions, use Firebase, Cloud Storage and Datastore do not use /tmp/. 

* When there is a version migration of any languages, you will be notified about it in a mail and there will be a mention of whether its going to be *minor* or *major* and a deadline will be given past that deadline, your function may be redeployed. If alls well, it will work, otherwise it will fail. So recommendation is, when you get a mail prepare for it. See the features of newer versions and google with keywords like "*Migrating Cloud Functions Runtimes*" and know the differences as some things might not be backward compatible. 

  - For NodeJS, GCP version migration happens in *even number* like NodeJS 12 -> NodeJS 14 -> NodeJS 16

* Timestamps and Timezone used in Cloud Function is UTC. So if your program uses datetime, you need to make your program timezone aware. 


### Writing a Python Cloud Function 

> Python and Go Admin SDKs, all write methods are blocking. That is, the write methods do not return until the writes are committed to the database.

This reduces a lot of my code. Seriously, i was doing a lot to make things synchronous in my NodeJS Firebase CF's earlier. 

#### Structuring your folder path

Below is the recommended folder path structure to create cloud function 

```
fn-function_name
├── main.py             <-- Your cloud function's entrypoint should be defined in this file
├── requirements.txt    <-- Specifies all the program dependencies
└── localPkg/
    ├── __init__.py     <-- adding this file turns localPkg folder into a module
    └── myFunctions.py  <-- Contains your helper functions which is called from main.py in root directory. 
```  

#### Python Environment Setup

```sh
# Environment Setup
python3 -m venv env

# Run everyday
.\env\Scripts\activate
set GOOGLE_APPLICATION_CREDENTIALS=<<path of the service account json file>>

# Generate requirement.txt using below command
pip3 freeze --all > requirements.txt
```

#### Simple Python Program Template

```py:title=main.py
# Imports from localPkg
from localPkg.myFunctions import *

import os
import json
import csv
import sys, traceback
from datetime import datetime
from flask import escape

# Imports Google Cloud Libraries
# ....

# [START hello-cf]
def hello-cf(request):
    """
    This is a template for python cloud function with logging and global variables
    Args:
        request (flask.Request): The request object.
    Returns:
        The response text
    """

    # ---- Initializations ----
    global global_arr

    try:
        # Extract value from queryString if any is passed
        request_json = request.get_json(silent=True)
        request_args = request.args

    	#date is queryString in http request
        if request_json and 'date' in request_json:
            paramDate = request_json['date']
        elif request_args and 'date' in request_args:
            paramDate = request_args['date']
        else:
            #Logic if no queryString is provided
            # ....
            print("")
            
    except ValueError as ve:        
        # Structured Log Entry using print
        entry = dict(
            severity="INFO",
            message='All done',
            # Log viewer accesses 'component' as jsonPayload.component'
            log_entries={ index : item for index,item in enumerate(global_arr) },
        )
        print(json.dumps(entry))
        global_arr = []

        return str(ve)

    except Exception as e:
        print("Unexpected ERROR: ", sys.exc_info())        
        er_str = ''
        for el in traceback.format_exc().splitlines():
            print(el)
            er_str=er_str+'::'+el
        global_arr.append(er_str)
        global_arr.append("return=no data")

        # Structured Log Entry using print
        entry = dict(severity="ERROR", message=er_str 
                    , log_entries={ index : item for index,item in enumerate(global_arr) }, )
        print(json.dumps(entry))
        
        global_arr = []
        return 'no data'
    else:
        # Structured Log Entry using print
        entry = dict( severity="INFO", message='All done'
                    , log_entries={ index : item for index,item in enumerate(global_arr) }, )
        print(json.dumps(entry))
        global_arr = []

        return 'success'
# [END hello-cf]        
```

Below is the code in sub-folder *localPkg* 

```py:title=./localPkg/__init__.py
from .myFunctions import *
```

This is the myFunctions module

```py:title=./localPkg/myFunctions.py
# Imports
#...

# Initialize Global Variables
global_arr = []

#...

```

### Sample Python Cloud Function Program

This cloud function does the following, 
1. Download the bhavcopy file from Bombay Stock Exchange to cloud functions local folder /tmp/ 
2. Unzips the file and extracts the .CSV file 
3. Uploads both the files to Google Cloud Storage

Folder structure

```sh
fn-function_name
├── main.py
├── requirements.txt
└── localPkg/
    ├── __init__.py
    └── myFunctions.py
```


```py:title=main.py
# Imports from localPkg
from localPkg.myFunctions import *

import os
import json
import csv
import sys, traceback
from datetime import datetime
from flask import escape

# [START download_bhavcopy]
# def download_bhavcopy():
def download_bhavcopy(request):
    """
    This is a template for python cloud function with logging and global variables
    Args:
        request (flask.Request): The request object.
    Returns:
        The response text
    """

    # ---- Initializations ----
    global global_arr
    
    try:
        # ---- Getting Dates from QueryString ----
        request_json = request.get_json(silent=True)
        request_args = request.args

        if request_json and 'date' in request_json:
            fromDate = request_json['date']
        elif request_args and 'date' in request_args:
            fromDate = request_args['date']
        else:
            # If there is no queryString. Current date will be considered
            fromDate = datetime.date(datetime.now(timezone('UTC')).astimezone(timezone('Asia/Calcutta'))).strftime("%Y%m%d")

        global_arr.append('fromDate='+fromDate)

        # fromDate = '20210901'
        bucket = '<<bucket-name>>'
        csvPath = 'bse/bhavcopy_csv/'
        
        # ---- Cloud Functions temporary folder ---- 
        temp_folder = '/tmp/'

        bDate = convert_date(fromDate, '%d%m%y')
        url_bhavcopy = 'https://www.bseindia.com/download/BhavCopy/Equity/EQ_ISINCODE_<<date>>.ZIP'.replace('<<date>>',bDate)
        csvFile = 'EQ_ISINCODE_<<date>>.CSV'.replace('<<date>>',bDate)

        # ---- Download the bhavcopy ----
        bhav_file =  download_to_tmp(temp_folder, url_bhavcopy)
        if(bhav_file == ''):
            raise ValueError(bhav_file)

        # ---- Unzipping file in Cloud Functions /tmp/ folder ----
        bhav_file = temp_folder+bhav_file
        bhav_file = temp_folder+unzip_file(temp_folder, bhav_file, csvFile)

        # ---- PreProcess CSV save as new file ----
        ppCSV = temp_folder+'pp-'+csvFile
        with open(bhav_file, 'r') as inf, open(ppCSV, 'w', newline='') as of:
            r = csv.reader(inf, delimiter=',')
            w = csv.writer(of, delimiter=',')
            total_rows = 0
            for line in r:
                total_rows+=1
                trim = (field.strip() for field in line)
                w.writerow(trim)            

        # ---- Upload to GCS CSV & Preprocessed file ----
        temp = csvPath+bhav_file.split('/')[-1]
        upload_blob(bucket, bhav_file, temp)

        temp = csvPath+ppCSV.split('/')[-1]
        upload_blob(bucket, ppCSV, temp)

    except Exception as e:
        print("Unexpected ERROR: ", sys.exc_info())        
        er_str = ''
        for el in traceback.format_exc().splitlines():
            print(el)
            er_str=er_str+'::'+el
        global_arr.append(er_str)
        global_arr.append("return=no data")

        # Structured Log Entry using print
        entry = dict(severity="ERROR", message=er_str
                    , log_entries={ index : item for index,item in enumerate(global_arr) }, )
        print(json.dumps(entry))
        
        global_arr = []
        return 'no data'

    else:

        # Structured Log Entry using print
        entry = dict( severity="INFO", message='All done'
                    , log_entries={ index : item for index,item in enumerate(global_arr) }, )
        print(json.dumps(entry))
        global_arr = []
        return 'success'
# [END download_bhavcopy]


# if __name__ == "__main__":
#     download_bhavcopy()
```

```py:title=__init__.py
# Added . as python not able to find the myFunctions file
from .myFunctions import *
```

```py:title=./localPkg/myFunctions.py
import os
import sys
import urllib.request 
import socket
import zipfile
import time
from datetime import datetime
from pytz import timezone

# Importing Google libraries
from google.cloud import storage 

# Global Variables
global_arr = []

### Functions
# Download the file in the URL to the specified folder path 
def download_to_tmp(temp_folder, url):
    global global_arr
    # print('Entry', global_arr)

    try:        
        socket.setdefaulttimeout(20)
        opener = urllib.request.build_opener()
        opener.addheaders = [('User-agent', 'Mozilla/5.0')]
        urllib.request.install_opener(opener)

        os.makedirs(os.path.dirname(temp_folder), exist_ok=True)
        osfp_folder = os.path.join(temp_folder)
        temp = 'Downloading '+ url + ' --> ' + osfp_folder+url.split('/')[-1]
        global_arr.append(temp)
        print(temp)

        filename = url.split('/')[-1]
        print(osfp_folder + filename)
        resultFilePath, responseHeaders = urllib.request.urlretrieve(url, osfp_folder + filename)

    except Exception as e:
        filename = ''

    return filename

# Unzips the file
def unzip_file(temp_folder, fp, fn):
    with zipfile.ZipFile(fp) as z:
        with open(temp_folder + fn, 'wb') as f:
            f.write(z.read(fn))
    return fn

# Standard function to upload file to GCS
def upload_blob(bucket_name, source_file_name, destination_blob_name):    
    global global_arr

    # If you don't specify credentials when constructing the client, the
    # client library will look for credentials in the environment.
    storage_client = storage.Client() 
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)
 
    blob.upload_from_filename(source_file_name)
 
    temp = "Uploaded {} to {} successfully.".format(source_file_name, destination_blob_name)
    # print(temp)
    global_arr.append(temp)
    return None

# Converts date to the format specified in the parameter
def convert_date(parmDate, dtFormat):
    return datetime.strptime(parmDate, '%Y%m%d').strftime(dtFormat)
```

Deploying the Cloud Function
```sh
gcloud config set project <<project-name>>

# Using ^ as i am submitting from Windows
gcloud functions deploy download_bhavcopy ^
     --runtime python39 ^
     --trigger-http ^
     --allow-unauthenticated ^
     --timeout=540s

# Following is the output
Deploying function (may take a while - up to 2 minutes).../
For Cloud Build Logs, visit: https://console.cloud.google.com/cloud-build/builds;region=us-central1/9cd4f07f-3b73-4f2e-9c2e?project=254912435
Deploying function (may take a while - up to 2 minutes)...done.
availableMemoryMb: 256
buildId: 9cd4f07f-3b73-4f2e-9c2e
buildName: projects/254912435/locations/us-central1/builds/<<some-hash>>
entryPoint: download_bhavcopy
httpsTrigger:
  securityLevel: SECURE_OPTIONAL
  url: https://us-central1-<<project-name>>.cloudfunctions.net/download_bhavcopy
ingressSettings: ALLOW_ALL
labels:
  deployment-tool: cli-gcloud
name: projects/<<project-name>>/locations/us-central1/functions/download_bhavcopy
runtime: python39
serviceAccountEmail: <<project-name>>@appspot.gserviceaccount.com
sourceUploadUrl: https://storage.googleapis.com/gcf-upload-us-central1-<<some-hash>>/57467b94-d75a-4f74-bb26-b22be872ae72.zip
status: ACTIVE
timeout: 540s
updateTime: '2021-10-12T15:06:55.539Z'
versionId: '1'
```

Above CF can be trigged like from the browser
```
https://us-central1-<<project-name>>.cloudfunctions.net/download_bhavcopy?date=20210902
(or
https://us-central1-<<project-name>>.cloudfunctions.net/download_bhavcopy
```

### References

* [Cloud functions concepts](https://cloud.google.com/functions/docs/concepts/exec)
* [Migrating Cloud Functions to newer Node.js runtimes](https://cloud.google.com/functions/docs/migrating/nodejs-runtimes)
* [GoogleCloudPlatform/python-docs-samples](https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/functions)
* [googleapis/google-cloud-python - All BQ Examples](https://github.com/googleapis/google-cloud-python/tree/851ed7028d0d34f88f0cdf2c0fefeb0873dba484/docs/bigquery)
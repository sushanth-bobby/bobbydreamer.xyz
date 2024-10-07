--- 
title: Sinking logs to BigQuery
date: 2022-04-23
description: Transfering GCP logs to BigQuery
tags: ['GCP', 'bigquery']
slug: "/143-gcp-sinking-logs-bq"
---

I wanted to know how many times cloud functions are getting triggered in my project.

1. Go to Google Cloud Console and open the Logs explorer

2. Click *Show query*. By default it showed the below logging query

```
resource.type="cloud_function" 
resource.labels.function_name="test_function1" 
resource.labels.region="asia-south1"
```

Since i was to transfer all the logs related to Cloud Functions, i keep only the below condition
```
resource.type="cloud_function" 
```

3. Click *More Actions* or *Actions* and select *Create Sink*

![Create Sink](assets/143-sink1.png "Create Sink")

4. It takes to Logging -> Logs Router. Here i fill following information

![Create BigQuery Dataset](assets/143-sink3.png "Create BigQuery Dataset")

![Create Sink](assets/143-sink3.png "Create Sink")

5. Click Create Sink

6. Go to bigQuery and execute a sample query like below to know how many times Cloud Functions were triggered in a day

```
select count(resource.labels.function_name) as invocation_total, 
resource.labels.function_name, 
resource.labels.region
from `<<project-name>>.gcp_logging.cloudfunctions_googleapis_com_cloud_functions_20220423`
where textPayload = 'Function execution started' 
group by resource.labels.region, resource.labels.function_name
```

**Note:** There will be one new table each day.

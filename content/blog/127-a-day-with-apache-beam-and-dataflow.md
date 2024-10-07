---
title: A Day with Apache Beam and Dataflow
date: 2021-09-20
description: Testing Apache Beam and Dataflow
tags: ['notes', 'python', 'time-wasted', 'GCP']
slug: "/127-a-day-with-apache-beam-and-dataflow"
---

I wanted to build a pipeline move data from Cloud Storage to BigQuery. There are couple of options to do it. 

1. Elite way is doing it via Dataflow and Apache Beam
2. Professional way is doing it via Cloud Functions

At first, i thought of doing it via Dataflow, i understand there is going to be a bit of learning in Apache Beam but if its the recommended approach in long term view then why not go with it. Here are some of the learnings and attempts i didn't for couple of days, 

1. Apache Beam can be coded via Java and Python
2. Same code with little tweakings can be used locally and in cloud.
3. When used in Cloud, it will start a VM Worker instance automatically and stop it when work is done, so there will be a bit of cost attached to this. 

> NOTE : There were lots of errors while trying to install using `Python 3.5.2`, but it worked flawlessly when tried with `Python 3.9.7`

```sh 
python3 -m venv env
.\env\Scripts\activate

pip3 install google-cloud-storage
pip3 install --upgrade google-cloud-storage

pip3 install wheel
pip3 install apache-beam[gcp]
```

```sh
(env) D:\BigData\12. Python\1. Tryouts\Beam>pip3 list
Package                         Version
------------------------------- ---------
apache-beam                     2.32.0
avro-python3                    1.9.2.1
cachetools                      4.2.2
certifi                         2021.5.30
charset-normalizer              2.0.6
crcmod                          1.7
dill                            0.3.1.1
docopt                          0.6.2
fastavro                        1.4.5
fasteners                       0.16.3
future                          0.18.2
google-api-core                 1.31.3
google-apitools                 0.5.31
google-auth                     1.35.0
google-cloud-bigquery           2.26.0
google-cloud-bigtable           1.7.0
google-cloud-core               1.7.2
google-cloud-datastore          1.15.3
google-cloud-dlp                1.0.0
google-cloud-language           1.3.0
google-cloud-pubsub             1.7.0
google-cloud-recommendations-ai 0.2.0
google-cloud-spanner            1.19.1
google-cloud-storage            1.42.2
google-cloud-videointelligence  1.16.1
google-cloud-vision             1.0.0
google-crc32c                   1.2.0
google-resumable-media          2.0.3
googleapis-common-protos        1.53.0
grpc-google-iam-v1              0.12.3
grpcio                          1.40.0
grpcio-gcp                      0.2.2
hdfs                            2.6.0
httplib2                        0.19.1
idna                            3.2
numpy                           1.20.3
oauth2client                    4.1.3
orjson                          3.6.3
packaging                       21.0
pip                             21.2.3
proto-plus                      1.19.0
protobuf                        3.17.3
pyarrow                         4.0.1
pyasn1                          0.4.8
pyasn1-modules                  0.2.8
pydot                           1.4.2
pymongo                         3.12.0
pyparsing                       2.4.7
python-dateutil                 2.8.2
pytz                            2021.1
requests                        2.26.0
rsa                             4.7.2
setuptools                      57.4.0
six                             1.16.0
typing-extensions               3.7.4.3
urllib3                         1.26.7
wheel                           0.37.0
WARNING: You are using pip version 21.2.3; however, version 21.2.4 is available.
You should consider upgrading via the 'D:\BigData\12. Python\1. Tryouts\Beam\env\Scripts\python.exe -m pip install --upgrade pip' command.
```

#### Enabling APIs and Creating a GCP Service Account

**Enabled APIs** : There was a link to enable all this at one-go and went on with it. Dataflow API, Compute Engine API, Cloud Logging API, Cloud Storage, Google Cloud Storage JSON API, BigQuery API, Cloud Pub/Sub API, Cloud Datastore API, Cloud Resource Manager API in Google Cloud Platform

**Creating Service Account**     

1. Created a new IAM Service Account `dataflow-btd-in3@<<project-id>>.iam.gserviceaccount.com` with Role (Quick Access 🡪 Basic 🡪 Owner)
2. After creating the account, go in to the *Keys* section and click *ADD KEY* 🡪 *Create new key* and download the key as JSON. 

This you will use while running the Apache Beam

#### Running the sample wordcount Apache Beam program locally

Below is the wordcount program which reads a text file from Cloud Storage and counts number of words

```py:title=wordcount-local.py
"""A word-counting workflow."""
import argparse
import logging
import re

import apache_beam as beam
from apache_beam.io import ReadFromText
from apache_beam.io import WriteToText
from apache_beam.options.pipeline_options import PipelineOptions
from apache_beam.options.pipeline_options import SetupOptions


class WordExtractingDoFn(beam.DoFn):
  """Parse each line of input text into words."""
  def process(self, element):
    """Returns an iterator over the words of this element.

    The element is a line of text.  If the line is blank, note that, too.

    Args:
      element: the element being processed

    Returns:
      The processed element.
    """
    return re.findall(r'[\w\']+', element, re.UNICODE)


def run(argv=None, save_main_session=True):
  """Main entry point; defines and runs the wordcount pipeline."""
  parser = argparse.ArgumentParser()
  parser.add_argument(
      '--input',
      dest='input',
      default='gs://dataflow-samples/shakespeare/kinglear.txt',
      help='Input file to process.')
  parser.add_argument(
      '--output',
      dest='output',
      required=True,
      help='Output file to write results to.')
  known_args, pipeline_args = parser.parse_known_args(argv)

  # We use the save_main_session option because one or more DoFn's in this
  # workflow rely on global context (e.g., a module imported at module level).
  pipeline_options = PipelineOptions(pipeline_args)
  pipeline_options.view_as(SetupOptions).save_main_session = save_main_session

  # The pipeline will be run on exiting the with block.
  with beam.Pipeline(options=pipeline_options) as p:

    # Read the text file[pattern] into a PCollection.
    lines = p | 'Read' >> ReadFromText(known_args.input)

    counts = (
        lines
        | 'Split' >> (beam.ParDo(WordExtractingDoFn()).with_output_types(str))
        | 'PairWIthOne' >> beam.Map(lambda x: (x, 1))
        | 'GroupAndSum' >> beam.CombinePerKey(sum))

    # Format the counts into a PCollection of strings.
    def format_result(word, count):
      return '%s: %d' % (word, count)

    output = counts | 'Format' >> beam.MapTuple(format_result)

    # Write the output using a "Write" transform that has side effects.
    # pylint: disable=expression-not-assigned
    output | 'Write' >> WriteToText(known_args.output)


if __name__ == '__main__':
  logging.getLogger().setLevel(logging.INFO)
  run()
```

Before running the program set the PATH of the Service Account JSON file
```sh
set GOOGLE_APPLICATION_CREDENTIALS=D:\BigData\12. Python\1. Tryouts\private\beam-test-abb6f7f2eb46-owner-role.json
```

Now run the program

```sh {1}
(env) D:\BigData\12. Python\1. Tryouts\Beam>python -m wordcount-local --output outputs
D:\BigData\12. Python\1. Tryouts\Beam\env\lib\site-packages\apache_beam\__init__.py:79: UserWarning: This version of Apache Beam has not been sufficiently tested on Python 3.9. You may encounter bugs or missing features.
  warnings.warn(
INFO:root:Missing pipeline option (runner). Executing pipeline using the default runner: DirectRunner.
INFO:apache_beam.internal.gcp.auth:Setting socket default timeout to 60 seconds.
INFO:apache_beam.internal.gcp.auth:socket default timeout is 60.0 seconds.
INFO:oauth2client.transport:Attempting refresh to obtain initial access_token
INFO:oauth2client.client:Refreshing access_token
WARNING:root:Make sure that locally built Python SDK docker image has Python 3.9 interpreter.
INFO:root:Default Python SDK image for environment is apache/beam_python3.9_sdk:2.32.0
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function annotate_downstream_side_inputs at 0x00000206033A4F70> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function fix_side_input_pcoll_coders at 0x00000206033A90D0> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function pack_combiners at 0x00000206033A9550> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function lift_combiners at 0x00000206033A95E0> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function expand_sdf at 0x00000206033A9790> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function expand_gbk at 0x00000206033A9820> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function sink_flattens at 0x00000206033A9940> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function greedily_fuse at 0x00000206033A99D0> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function read_to_impulse at 0x00000206033A9A60> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function impulse_to_input at 0x00000206033A9AF0> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function sort_stages at 0x00000206033A9D30> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function setup_timer_mapping at 0x00000206033A9CA0> ====================
INFO:apache_beam.runners.portability.fn_api_runner.translations:==================== <function populate_data_channel_coders at 0x00000206033A9DC0> ====================
INFO:apache_beam.runners.worker.statecache:Creating state cache with size 100
INFO:apache_beam.runners.portability.fn_api_runner.worker_handlers:Created Worker handler <apache_beam.runners.portability.fn_api_runner.worker_handlers.EmbeddedWorkerHandler object at 0x000002060367C6A0> for environment ref_Environment_default_environment_1 (beam:env:embedded_python:v1, b'')
INFO:apache_beam.runners.portability.fn_api_runner.fn_runner:Running ((((ref_AppliedPTransform_Read-Read-Impulse_4)+(ref_AppliedPTransform_Read-Read-Map-lambda-at-iobase-py-894-_5))+(Read/Read/SDFBoundedSourceReader/ParDo(SDFBoundedSourceDoFn)/PairWithRestriction))+(Read/Read/SDFBoundedSourceReader/ParDo(SDFBoundedSourceDoFn)/SplitAndSizeRestriction))+(ref_PCollection_PCollection_2_split/Write)
INFO:apache_beam.runners.portability.fn_api_runner.fn_runner:Running (((((ref_PCollection_PCollection_2_split/Read)+(Read/Read/SDFBoundedSourceReader/ParDo(SDFBoundedSourceDoFn)/Process))+(ref_AppliedPTransform_Split_8))+(ref_AppliedPTransform_PairWIthOne_9))+(GroupAndSum/Precombine))+(GroupAndSum/Group/Write)
INFO:apache_beam.runners.portability.fn_api_runner.fn_runner:Running (((((ref_AppliedPTransform_Write-Write-WriteImpl-DoOnce-Impulse_19)+(ref_AppliedPTransform_Write-Write-WriteImpl-DoOnce-FlatMap-lambda-at-core-py-2968-_20))+(ref_AppliedPTransform_Write-Write-WriteImpl-DoOnce-Map-decode-_22))+(ref_AppliedPTransform_Write-Write-WriteImpl-InitializeWrite_23))+(ref_PCollection_PCollection_11/Write))+(ref_PCollection_PCollection_12/Write)
INFO:apache_beam.runners.portability.fn_api_runner.fn_runner:Running (((((((GroupAndSum/Group/Read)+(GroupAndSum/Merge))+(GroupAndSum/ExtractOutputs))+(ref_AppliedPTransform_Format_14))+(ref_AppliedPTransform_Write-Write-WriteImpl-WindowInto-WindowIntoFn-_24))+(ref_AppliedPTransform_Write-Write-WriteImpl-WriteBundles_25))+(ref_AppliedPTransform_Write-Write-WriteImpl-Pair_26))+(Write/Write/WriteImpl/GroupByKey/Write)
INFO:apache_beam.runners.portability.fn_api_runner.fn_runner:Running ((Write/Write/WriteImpl/GroupByKey/Read)+(ref_AppliedPTransform_Write-Write-WriteImpl-Extract_28))+(ref_PCollection_PCollection_17/Write)
INFO:apache_beam.runners.portability.fn_api_runner.fn_runner:Running ((ref_PCollection_PCollection_11/Read)+(ref_AppliedPTransform_Write-Write-WriteImpl-PreFinalize_29))+(ref_PCollection_PCollection_18/Write)
INFO:apache_beam.runners.portability.fn_api_runner.fn_runner:Running (ref_PCollection_PCollection_11/Read)+(ref_AppliedPTransform_Write-Write-WriteImpl-FinalizeWrite_30)
INFO:apache_beam.io.filebasedsink:Starting finalize_write threads with num_shards: 1 (skipped: 0), batches: 1, num_threads: 1
INFO:apache_beam.io.filebasedsink:Renamed 1 shards in 0.08 seconds.
```

Outputs
```sh {1}
(env) D:\BigData\12. Python\1. Tryouts\Beam>more outputs-00000-of-00001
KING: 243
LEAR: 236
DRAMATIS: 1
PERSONAE: 1
king: 65
of: 447
Britain: 2
OF: 15
```

#### Running the sample wordcount Apache Beam program on GCP

##### Error 1 : Permissions verification for controller service account failed. IAM role roles/dataflow.worker should be granted to controller service account

Below is the command
```sh
python -m wordcount-local ^
    --region us-central1 ^
    --input gs://dataflow-samples/shakespeare/kinglear.txt ^
    --output btd-in3-bse-nse-dailys/outputs ^
    --runner DataflowRunner ^
    --project <<project-name>> ^
    --temp_location btd-in3-bse-nse-dailys/temp/ ^
```

It failed with below message
```sh {4}
INFO:apache_beam.runners.dataflow.dataflow_runner:Job 2021-09-26_00_16_24-6802767166116217174 is in state JOB_STATE_PENDING
INFO:apache_beam.runners.dataflow.dataflow_runner:2021-09-26T07:16:28.455Z: JOB_MESSAGE_DETAILED: Autoscaling is enabled for job 2021-09-26_00_16_24-6802767166116217174. The number of workers will be between 1 and 1000.
INFO:apache_beam.runners.dataflow.dataflow_runner:2021-09-26T07:16:28.594Z: JOB_MESSAGE_DETAILED: Autoscaling was automatically enabled for job 2021-09-26_00_16_24-6802767166116217174.
INFO:apache_beam.runners.dataflow.dataflow_runner:2021-09-26T07:16:29.920Z: JOB_MESSAGE_ERROR: Workflow failed. Causes: Permissions verification for controller service account failed. IAM role roles/dataflow.worker should be granted to controller service account 25491243517-compute@developer.gserviceaccount.com.
INFO:apache_beam.runners.dataflow.dataflow_runner:2021-09-26T07:16:29.964Z: JOB_MESSAGE_DETAILED: Cleaning up.
INFO:apache_beam.runners.dataflow.dataflow_runner:2021-09-26T07:16:30.041Z: JOB_MESSAGE_BASIC: Worker pool stopped.
```

Solution was to add `` to the command
```sh
python -m wordcount-local ^
    --region us-central1 ^
    --input gs://dataflow-samples/shakespeare/kinglear.txt ^
    --output btd-in3-bse-nse-dailys/outputs ^
    --runner DataflowRunner ^
    --project <<project-name>> ^
    --temp_location btd-in3-bse-nse-dailys/temp/ ^
    --service_account_email dataflow-btd-in3@<<project-id>>.iam.gserviceaccount.com
```

##### Error 2 : Dataflow runner currently supports Python versions ['3.6', '3.7', '3.8'], got 3.9.7

```sh
Exception: Dataflow runner currently supports Python versions ['3.6', '3.7', '3.8'], got 3.9.7 (tags/v3.9.7:1016ef3, Aug 30 2021, 20:19:38) [MSC v.1929 64 bit (AMD64)].
To ignore this requirement and start a job using an unsupported version of Python interpreter, pass --experiment use_unsupported_python_version pipeline option.
```

Tried running with 
```sh {8}
python -m wordcount-local ^
    --region us-central1 ^
    --input gs://dataflow-samples/shakespeare/kinglear.txt ^
    --output btd-in3-bse-nse-dailys/outputs ^
    --runner DataflowRunner ^
    --project btd-in2-20180718 ^
    --temp_location btd-in3-bse-nse-dailys/temp/ ^
    --experiment use_unsupported_python_version ^
    --service_account_email dataflow-btd-in3@<<project-id>>.iam.gserviceaccount.com
```

This kickstarted the Dataflow and i could see Pipeline in Dataflow console and Worker-VM created but it just kept running. In my local system it took less than 10sec to finish and it was taking around 15mins in GCP and no-progress. Later when into StackDriver to check whats happening found there were 73retries

##### Error 3 : Showstopper

Dataflow doesn't work with Python 3.9 yet and this is where is stop.

* * * 

#### Cleanups

1. Deleting the IAM and Service Account
2. Disabling APIs
3. Delete staging buckets in Cloud Storage

* * * 

**Total days wasted = 12 Days**

* 10 Days thinking, reading and watching youtube videos basically preparing and basically deciding to go with Dataflow or Cloud Functions
* 2 days of testing

* * * 

Thank you for reading


#### References (if i ever come back)

* [Github - Apache Beam Python Examples](https://github.com/apache/beam/tree/master/sdks/python/apache_beam/examples)
* [Yt - GCP, Apache Beam, DataFlow as Runner and BigQuery](https://youtu.be/xpx_MYAH53c)
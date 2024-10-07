---
title: Hello Firebase from Python
date: 2021-10-02
description: Testing firebase using python
tags: ['notes', 'python', 'GCP', 'firebase']
slug: "/129-hello-firebase-from-python"
---

This is the first time, i am testing Firebase Admin SDK using Python. I have written programs using NodeJS. Since, i am into learning Python recently wanted to try Firebase and Python.  What really interested me is

> Python and Go Admin SDKs, all write methods are **blocking**. That is, the write methods do not return until the writes are committed to the database.

This seriously reduces my code a lot. Earlier i used to write a ton of code to make things synchronous, yeah, NodeJS/Javascript is not for that but at that time, it was the only option i had for things i was working on. I am very much happy reading this. 

Lets divide this post into two parts, 

1. Adding/Updating data to firebase

2. Querying data


### Adding/Updating data to firebase

This is a simple Python Firebase Program to add data to realtime database, its taken from the sample Google Firebase documentation only. 

```py
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

# Fetch the service account key JSON file contents
cred = credentials.Certificate("D:/BigData/13. Firebase/FB-Authentication3/functions/secrets/api-project-testing.json")

# Initialize the app with a service account, granting admin privileges
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://api-project-testing.firebaseio.com"
})

# As an admin, the app has access to read and write all data, regradless of Security Rules
ref = db.reference('python-testing')
# print(ref.get())

# Pretty Print
print(json.dumps(ref.get(), indent=4, sort_keys=True))

# Set Data
print('1. Setting Data')
ref = db.reference('python-testing')
users_ref = ref.child('users')
users_ref.set({
    'alanisawesome': {
        'date_of_birth': 'June 23, 1912',
        'full_name': 'Alan Turing'
    },
    'gracehop': {
        'date_of_birth': 'December 9, 1906',
        'full_name': 'Grace Hopper'
    }
})

# Update Data
print('2. Update Data')
hopper_ref = users_ref.child('gracehop')
hopper_ref.update({
    'nickname': 'Amazing Grace'
})

# Multi-path updates
print('3. Multi-path updates')
users_ref.update({
    'alanisawesome/nickname': 'Alan The Machine',
    'gracehop/nickname': 'Amazing Grace'
})

# Generating push keys
posts_ref = ref.child('posts')

new_post_ref = posts_ref.push()
print('Key = {}'.format(new_post_ref.key))
new_post_ref.set({
    'author': 'gracehop',
    'title': 'Announcing COBOL, a New Programming Language'
})

# We can also chain above two calls together ie., posts_ref + new_post_ref
posts_ref.push().set({
    'author': 'alanisawesome',
    'title': 'The Turing Machine'
})

# This is equivalent to the calls to push().set(...) above
posts_ref.push({
    'author': 'gracehop',
    'title': 'Announcing COBOL, a New Programming Language'
})

# Delete an entire node
ref = db.reference('python-testing')
ref.update({'posts':None})
```

Console Output
```sh
>py -m firebase-test1   
null
1. Setting Data
2. Update Data
3. Multi-path updates
Key = -MleNEJkc_ONcyBlac0B
```

Below is the output when you run it. 

![Snap taken while firebase is getting updated](assets/129-firebase1.png)

Things to notice in the above program, 

1. Service Account Specification, there are two ways
    * First method is as mentioned in the program pointing to the secret json file 
    * Second is updating the environment variable GOOGLE_APPLICATION_CREDENTIALS ( more details on this after the below program )

2. `.set()` will replace the data in that node path, if data already exists. So, you need to be careful with that. 

3. When adding data, either you can add it individually like below or combine them as in the program, 

```py
users_ref.child('alanisawesome').set({
    'date_of_birth': 'June 23, 1912',
    'full_name': 'Alan Turing'
})
users_ref.child('gracehop').set({
    'date_of_birth': 'December 9, 1906',
    'full_name': 'Grace Hopper'
})
```

4. Multi-path updates is the one i prefer, but you got to do a bit of planning for it.

5. Push keys `new_post_ref = posts_ref.push()`. They generate a unique key which contains an encoded timestamp value. So when you are generating it and add to firebase database, they are sort of chronologically sorted as these push-keys contain current time. The keys are also designed to be unguessable (they contain 72 random bits of entropy).

6. Deletes an entire node

#### Application Default Credentials (ADC)

  Google Cloud Client Libraries use a library called Application Default Credentials (ADC) to automatically find your service account credentials. ADC looks for service account credentials in the following order:

  If the environment variable GOOGLE_APPLICATION_CREDENTIALS is set, ADC uses the service account key or configuration file that the variable points to.

  If the environment variable GOOGLE_APPLICATION_CREDENTIALS isn't set, ADC uses the service account that is attached to the resource that is running your code.

  This service account might be a default service account provided by Compute Engine, Google Kubernetes Engine, App Engine, Cloud Run, or Cloud Functions. It might also be a user-managed service account that you created.

  Using the above technique, ADC can automatically find your credentials. Its recommended using ADC because it requires less code and your code is portable in different environments.

Basically run the below command to set the environment variable
```sh
set GOOGLE_APPLICATION_CREDENTIALS=D:\BigData\13. Firebase\FB-Authentication3\functions\secrets\api-project-testing.json
```

Any GCP Client will look for `GOOGLE_APPLICATION_CREDENTIALS`, if its set it will use it and no need any code related to pointing to the secret json file. See below firebase admin initialization there is no mention of `cred` which is mentioned in above program. Also take at look below querying example it uses ADC. 

```
firebase_admin.initialize_app(options={
    'databaseURL': "https://api-project-testing.firebaseio.com"
})
```

### Querying data


Below running the below program SET the environment variable `set GOOGLE_APPLICATION_CREDENTIALS`

```py
import json
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db

firebase_admin.initialize_app(options={
    'databaseURL': "https://api-project-testing.firebaseio.com"
})

ref = db.reference('python-testing')

# Setup Data
ref = db.reference('python-testing')
dino_ref = ref.child('dinosaurs')
dino_ref.set({
  "lambeosaurus": {
    "height" : 2.1,
    "length" : 12.5,
    "weight": 5000
  },
  "stegosaurus": {
    "height" : 4,
    "length" : 9,
    "weight" : 2500
  }
})
```

#### Sorting the data

First lets see `order_by_child()`, here *length* is the child of node *dinosaurs*

```py
# .order_by_child
# .indexOn setup for this to work 
ref = db.reference('python-testing/dinosaurs')
snapshot = ref.order_by_child('length').get()
for key, val in snapshot.items():
    print('{0} stats are {1}'.format(key, val))
```

If you don't add .indexOn to rules, you will get below error
```sh
firebase_admin.exceptions.InvalidArgumentError: Index not defined, add ".indexOn": "length", for path "/python-testing/dinosaurs", to the rules
```
Make the changes and publish

![Firebase Rules](assets/129-firebase4.png)

Now if you run, you will get result like below, 
```sh
stegosaurus stats are {'height': 4, 'length': 9, 'weight': 2500}
lambeosaurus stats are {'height': 2.1, 'length': 12.5, 'weight': 5000}
```

Next, we will see `order_by_value()`, setting up data. 

Here we are trying to sort by value of the scores. There is nothing nested like sub-nodes, so try to keep things this simple. 

```py
ref = db.reference('python-testing')
lb_ref = ref.child('leader-board')
lb_ref.set({
  "scores": {
    "bruhathkayosaurus" : 55,
    "lambeosaurus" : 21,
    "linhenykus" : 80,
    "pterodactyl" : 93,
    "stegosaurus" : 5,
    "triceratops" : 22
  }
})

lb_ref = db.reference('python-testing').child('leader-board/scores')
snapshot = lb_ref.order_by_value().get()
for key, val in snapshot.items():
    print('The {0} dinosaur\'s score is {1}'.format(key, val))
```

Before running this program, you should update the updates the rules to index the score. 

```
{
  "rules": {
    ".read": "auth.uid != null",
    ".write": "auth.uid != null",
    "python-testing":{
      "dinosaurs": {
        ".indexOn": ["height", "length"]
      },
      "leader-board":{
          "scores": {
            ".indexOn": ".value"
          }                
      }
    }
  }
}
```

After updating the index, if you execute, you will get output like below, 
```sh
The stegosaurus dinosaur's score is 5
The lambeosaurus dinosaur's score is 21
The triceratops dinosaur's score is 22
The bruhathkayosaurus dinosaur's score is 55
The linhenykus dinosaur's score is 80
The pterodactyl dinosaur's score is 93
```

Next, we will see `order_by_key()` and there is no need to define index explicitly as node's key is indexed automatically

```py
ref = db.reference('python-testing').child('dinosaurs')
snapshot = ref.order_by_key().get()
for key, val in snapshot.items():
  print('{0} : {1}'.format(key, val))
```

Output is
```sh
lambeosaurus : {'height': 2.1, 'length': 12.5, 'weight': 5000}
stegosaurus : {'height': 4, 'length': 9, 'weight': 2500}
```

Order is always ascending, there is no function to get it descending, you have to do that in client side. 
```py
ref = db.reference('python-testing').child('dinosaurs')
snapshot = ref.order_by_key().get()
#for key, val in snapshot.items():
for key, val in reversed(snapshot.items()):
# for key, val in sorted(snapshot.items(), reverse=True):  
  print('{0} : {1}'.format(key, val))
```

Both the above reverse techniques work. Now the output is,
```sh
stegosaurus : {'height': 4, 'length': 9, 'weight': 2500}
lambeosaurus : {'height': 2.1, 'length': 12.5, 'weight': 5000}
```

#### Checking if data exists

This should have been the first in querying section, but here it is
```py
ref = db.reference('python-testing').child('anime')
if ref.get() is None:
  print('None - No Data')
else:
  print(ref.get())

# Output
None - No Data
```

* * * 

Thank you for reading

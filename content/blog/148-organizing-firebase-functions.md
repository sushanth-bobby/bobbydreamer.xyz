--- 
title: Organizing Firebase Functions
date: 2022-10-08
description: Organizing Firebase Functions
tags: ['nodejs','firebase']
slug: "/148-organizing-firebase-functions"
---

We are going to just get on setting new firebase project using *Functions*. 

```
firebase login

firebase projects:list

firebase init
-- You can select the project here
(or)
firebase use --add
-- You can add project later by this technique
```

This should create a functions folder in the current folder

Now, there are multiple ways to organize firebase functions as per Google Firebase Docs

1. Managing multiple repositories
2. Managing multiple source packages (monorepo)
3. Write functions in multiple files ( you can also group functions )

I am going with the 3rd option as it doesn't need `node_modules` folder under each function/repo folder. Its just centralized. 

### Write functions in multiple files ( you can also group functions )

Main index.js file
```js:title=index.js
const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

// Local Requires
const hello = require('./helloWorld');
exports.helloWorld = hello.World;
```

Local file
```js:title=helloWorld.js
const functions = require("firebase-functions");

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.World = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", {structuredData: true});
    response.send("Hello from Firebase!");
});
```

Firebase commands
```cmd
-- #Testing
firebase emulators:start
-- Wait for 2-3 minutes. It should the link for function like below
-- http://localhost:5001/btd-in3-20220830/us-central1/helloWorld

-- (or)

firebase serve --only functions

-- #Deploying
firebase deploy --only functions:helloWorld
```

* * * 

#### Thanks for reading
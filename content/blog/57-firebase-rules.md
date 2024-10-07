---
title: Firebase security and rules
date: 2020-12-29
description: Setting up basic firebase security and rules
tags:
  - javascript
  - web-development
  - firebase
slug: "/57-firebase-rules"
---

Firebase is bit weird in perspective of security at first glance. For instance, when you first add firebase to your app, you get to the below screen and the first thing that should catch your eye is **apiKey**, its exposed, shouldn't it be somewhere secured. 

  ![Adding firebase to your app](assets/57-fbc2.png "Adding firebase to your app")  

Thing you should know about this `apiKey` in firebase config is, it just identifies your Firebase project on the Google servers. So, its 0.K for it to be exposed. Think of it as a bad name given to a key. 

Thinking in security perspective, there are two levels of security available to you,

1. Firebase rules (recommended : This is the only way to protect your data. So set it up)
2. Restricting app to work with specific domain


### # Firebase rules
Firebase encourages to use server side security rules to ensure only authorized users can access the data and rules are designed in such a way that accesses are node-based. If a user has access to parent nodes, that user will be able to access child nodes as well. 

> These rules control access to file storage and database access, and are enforced on the Firebase servers. So no matter if it's your code, or somebody else's code that uses you configuration data, it can only do what the security rules allow it to do.
> -- [Frank van Puffelen](https://stackoverflow.com/questions/37482366/is-it-safe-to-expose-firebase-apikey-to-the-public)

Firebase rules are nodes-based meaning they sort of look like json key:values. As a general rule, keep your security rules simple. Because if your data is not well structured, rules can get complex. Try not to get into that zone. 

In firebase, default rule in Realtime database is **Locked mode**(deny access to all users). This could be really useful in emergency cases, all you have to do is update the *Rules* tab in *Realtime Database* menu option as below,
```json {3,4}
{
  "rules": {
    ".read": false,
    ".write": false
  }
}
```

Below one, you can call it as **Development mode**(allow access to all users -- No Security)

  ![Firebase rules](assets/57-fb-rule1.png "Firebase rules")  

As said in the warning    

> Your security rules are defined as public, so anyone can steal, modify, or delete data in your database

#### # Development rules

Simplest way of upgrading the rule is to set only authenticated users are allowed to do any DML Operations like below, 

```
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

After updating the rule, its always good to test the rule in the **Rules Playground** as that seem to be one of the quickest way to test rules and then publish it. Do remember, this rule is OK for development not for production as here all authenticated users have access to all the data to read and write everyone elses data.

#### # Production rules
Little planning is required from the beginning, that is from the time of *Structuring the data* as security and data structure are connected in Firebase. 

Production can have below types of data,    
* Authenticated users can access all data
  + We have seen this above in development
* Authenticated users allowed to access only their data
* Authenticated users allowed to access common data


#### # Authenticated users allowed to access only their data

Here we have three nodes, *categories*, *stash* and *users*

  ![Firebase : Data](assets/57-fb-rule3.png "Firebase : Data")  

Under the parent nodes, lies the userIDs(UID) as keys as in key:value to the specific user data.
  ![Firebase : Data 2](assets/57-fb-rule4.png "Firebase : Data 2")  

Here you can see/understand how the userID(UID) is tied to the rules
  ![Firebase : User listing](assets/57-fb-rule6.png "Firebase : User listing")  

In this application, data is stored under the specific userIDs and by the below rules, we are making sure only that specific user has access to it. 
  ![Firebase : Stash rules](assets/57-fb-rule5.png "Firebase : Stash rules")  


#### # Authenticated users allowed to access common data

Here `.read` is set in such a way, all authenticated users can read any other users data and users can only update their own data 
```json {5,6}
{
  "rules": {
    "some_path": {
      "$uid": {
        ".read": "auth.uid != null",        
        ".write": "auth.uid == $uid"
      }
    }
  }
}
```

If you set it as below, it means reading is public. 
```json
        ".read": true, 
```

This is taking things to next level like 
```json
// Allows moderator to update user posts
{
  "rules": {
    "posts": {
       "$uid": {
         ".write": "root.child('users').child('moderator').val() === true"
       }
     }
   }
}
```

**Things to remember,**    

* Firebase rules generally cascades, granting a read or write privilege to a parent node always grants that read/write access to all child nodes.
* Code running in Cloud Functions uses the Admin SDK to access Firebase/Firestore. The Admin SDK by default runs with administrative privileges that bypass your security rules. This is by design so that your administrative code can do things that regular user-code can not do, without complicating your security rules.


### # Restricting app to work with specific domain

Why do you want to do this ? Well, whats possible is, since entire firebase config is avaiable in the web application. Someone can clone your application entirely say from GitHub and have users sign-in from their app instead of yours and start accessing the data as a authentic user or use your users data which they are receiving from your backend and their frontend. Whats happening here is **Phishing**. 

Additionally from setting up rules, you can control the domain which can access your data as well. 

**Google API key restrictions**    
1. Go to `Google console 🡪 Select the project`
2. From `left side menu select API & Services 🡪 left side menu select Credentials` and you will see something like this. 

  ![Google APIs and Services](assets/57-APIServices1.png "Google APIs and Services")  

3. One of the keys appearing above should match up with the **apiKey** in firebase config. Click that. 

4. Under `Application restrictions` SELECT 
  * `HTTP referrers (web sites)` 🡪 Once you select `Website restrictions` option should appear. 
  * Here you can add the urls and do note, if your domain supports both HTTP and HTTPS, both restrictions must be added separately.

    + A specific URL with an exact path: https://www.example.com/path , http://www.example.com/path
    + Any URL in a single domain with no subdomains, using a wildcard asterisk (*): example.com/*
    + Any URL in a single subdomain, using a wildcard asterisk (*): sub.example.com/*
    + Any subdomain or path URLs in a single domain, using wildcard asterisks (*): *.example.com/*
    + A URL with a non-standard port: www.example.com:8000/*
    + **Do not add** `localhost` if you are planning to use the same project in production. 

5. Click SAVE. Once you are done with this no other site will be able to use your **apiKey**. Also do note you cannot do any local development testing as well in this project like `localhost:5000` as you have not added that, if you do add, there is a probability that a phisher can use that and that defeats the entire purpose of doing this. See the code snippet below to swap project during testing. 

6. You can go still further as your API still has access to many resources, so you can proceed to isolate to specific resource, you want your API to access by selecting *Restrict key* in **API restrictions**. Once you are done you can click SAVE. 

Code snippet to swap projects during testing(non tested). 
```js {2,12,22,26}
// Production Firebase configuration
const prod_firebaseConfig = {
    apiKey: "< Production apiKey>",
    authDomain: "< Production keys and urls>",
    databaseURL: "< Production keys and urls>",
    projectId: "< Production keys and urls>",
    storageBucket: "< Production keys and urls>",
    messagingSenderId: "< Production keys and urls>",
    appId: "< Production keys and urls>"
};

const dev_firebaseConfig = {
    apiKey: "< Development keys and urls>",
    authDomain: "< Development keys and urls>",
    databaseURL: "< Development keys and urls>",
    projectId: "< Development keys and urls>",
    storageBucket: "< Development keys and urls>",
    messagingSenderId: "< Development keys and urls>",
    appId: "< Development keys and urls>"
};

const config = process.env.NODE_ENV === 'production' ? prod_firebaseConfig : dev_firebaseConfig;

// Initialize Firebase	    
if(!firebase.apps.length){
  firebase.initializeApp(config);
}

# When running the program in development
NODE_ENV='dev' node index.js
```

Do note when saving the files in GitHub, you might get mails from Google or Github for storing apiKey like below and this can be ignored as you know now. `apiKey` is just firebase way of finding project on Google servers. Common safeguardig way is to privatize the git repo.

![Suspicious Activity Alert](assets/57-suspicious-activity-alert.png "Suspicious Activity Alert")  

*This page will be updated as i come to use more firebase rules feature*

### # Other firebase posts
* [Firebase basics and events](58-firebase-basics-to-events)
* [Firebase email verification](56-firebase-email-verification)


### # References
* [Firebase : Basic Security Rules](https://firebase.google.com/docs/rules/basics)
* [Firebase : Rules language](https://firebase.google.com/docs/rules/rules-language)
* [Firebase : Avoid insecure rules](https://firebase.google.com/docs/rules/insecure-rules)
* [Google API Key Restrictions](https://cloud.google.com/docs/authentication/api-keys)
* [Firebase : Launch checklist - Must read before going production](https://firebase.google.com/support/guides/launch-checklist)
* [Chris Esplin : Firebase security rules ](https://howtofirebase.com/firebase-security-rules-88d94606ce4a)
--- 
title: Hosting Quartz in Firebase
date: 2024-10-07
description: Hosting Quartz SSG in Firebase
tags: ['firebase', 'web-development', 'deployment']
slug: "/152-quartz-firebase-hosting"
---

There's just one difference when preparing for hosting using Gatsby and Quartz
* No need to replace generated firebase.json

Below are the generals steps for firebase hosting
1. Install NPM tools - `npm install -g firebase-tools`

2. Firebase CLI Login - `firebase login`
   - if already logged in, you can `firebase logout` and login for reauthentication

3. List the existing projects to verify name - `firebase projects:list`

```shell
√ Preparing the list of your Firebase projects
┌──────────────────────┬──────────────┬────────────────┬──────────────────────┐
│ Project Display Name │ Project ID   │ Project Number │ Resource Location ID │
├──────────────────────┼──────────────┼────────────────┼──────────────────────┤
│ bdxyz                │ bdxyz-361015 │ 319373831080   │ us-central           │
└──────────────────────┴──────────────┴────────────────┴──────────────────────┘

1 project(s) total.
```

4. Initialize Firebase
```shell {24, 33-36}
D:\BigData\08. HTML\quartz\bdv4q1>firebase init

     ######## #### ########  ######## ########     ###     ######  ########
     ##        ##  ##     ## ##       ##     ##  ##   ##  ##       ##
     ######    ##  ########  ######   ########  #########  ######  ######
     ##        ##  ##    ##  ##       ##     ## ##     ##       ## ##
     ##       #### ##     ## ######## ########  ##     ##  ######  ########

You're about to initialize a Firebase project in this directory:

  D:\BigData\08. HTML\quartz\bdv4q1

? Are you ready to proceed? Yes
? Which Firebase features do you want to set up for this directory? Press Space to select features, then Enter to confirm your choices. Hosting: Configure files for Firebase
Hosting and (optionally) set up GitHub Action deploys

=== Project Setup

First, let's associate this project directory with a Firebase project.
You can create multiple project aliases by running firebase use --add,
but for now we'll just set up a default project.

? Please select an option: Use an existing project
? Select a default Firebase project for this directory: bdxyz-361015 (bdxyz)
i  Using project bdxyz-361015 (bdxyz)

=== Hosting Setup

Your public directory is the folder (relative to your project directory) that
will contain Hosting assets to be uploaded with firebase deploy. If you
have a build process for your assets, use your build's output directory.

? What do you want to use as your public directory? public
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? No
? File public/index.html already exists. Overwrite? No
i  Skipping write of public/index.html

i  Writing configuration info to firebase.json...
i  Writing project information to .firebaserc...

+  Firebase initialization complete!
```

5. `firebase.json` is generated
```json
{
  "hosting": {
    "public": "public",
    "ignore": [ "firebase.json", "**/.*", "**/node_modules/**" ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

6. Test the site locally by executing command `firebase serve --only hosting`

7. Deploy to firebase - `firebase deploy -m "Quartz - Initial Site"`

---

### References
* [Deploying Gatsby & Hosting in Firebase](11-deploying-and-hosting-gatsby-site-in-firebase)
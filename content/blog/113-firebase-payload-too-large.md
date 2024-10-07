---
title: Firebase - Server Error the specified payload is too large
date: 2021-07-23
description: New error is firebase payload is too large
tags: ['nodejs', 'firebase', 'time-wasted']
slug: "/113-firebase-payload-too-large"
---

![Firebase Storage and Downloads space](assets/113-fbStorageDownloads.png)

Initially, When i started to have a look at this, the storage was at 2.2Gb. You can see that in the *Before Storage Graph in the left-bottom* image. That seemed to be high, i know why and which node in the firebase RTDB contributed to it. So basically my idea is to download all the data in that down and cleared it down. 

Failed attempts are     

1. Export options. Failed to work as from a single location you cannot export data exceeding 256 MB. 
2. V1 - Since i had the keys, programmatically tried to retreive data via NodeJS and approach used is and got the below error.    
    * Using .every() loop method and pushing promises to array
    * Using bluebird Promise.map to process the promises with concurrency(2)

```sh
[2021-07-19T17:25:02.560Z]  @firebase/database: FIREBASE INTERNAL ERROR: Server Error: The specified payload is too large, please request a location with less data. 
```

Successful approach that worked is,     
1. Created an outer loop using .slice() so that rest of the program processes around 10 chunks
2. Using .every() loop method and pushing promises to array
3. Using bluebird Promise.map to process the promises with concurrency 2

Below is the code, 

```js
const firebase = require('firebase-admin');
const fs = require("fs")
var Promise = require('bluebird');

var initializeFirebase = () => {
    var serviceAccount = require("./private/SA-firebase-adminsdk.json");
    firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: "https://<<fdb>>.firebaseio.com"  
    });
};

//Functions
const writeFile = (filename, data) =>{
    return new Promise(function(resolve, reject) {
        fs.writeFile(filename, JSON.stringify(data, null, 4), function(err) {
            if (err) reject(err);
            else resolve("Written filename "+filename);
        });
    });            
};

var readFB = (fbPath, scCode) =>{
    return new Promise( (resolve, reject) => {
        return firebase.database().ref().child(fbPath).once('value').then(function(snapshot) {
            // console.log(snapshot.val());
            var obj = {[scCode] : snapshot.val()};
            resolve(obj) ;
        })        
    });
}

 var start = async () =>{

    if (!firebase.apps.length) {
        initializeFirebase();
    }

    var codes = fs.readFileSync('./data/code_list.txt', 'utf8').replace(/\r/g, '') .split('\n');
    console.log('Total sc_code list = '+codes.length);
    
    var promises = [];
    var i,j,temp_arr, chunk = 10;
    for(i=0, j=codes.length;i<j;i+=chunk){
        temp_arr = codes.slice(i, i+chunk);

        await temp_arr.every(async code => {        
            console.log(code);
            let fbPath = 'BTD_AnnouncementsByCode/'+code;
            await promises.push(readFB(fbPath, code))
        });
    
        var outPath = './data/Announcements/'

        //Using Promise.map to control concurrency
        await Promise.map(promises, async (result)=>{
            let [key, value] = Object.entries(result)[0]; 
            // console.log(value);
            if(!value){
                console.log('Null value '+key);
                return;
            }
            let [key2, value2] = Object.entries(value)[0]; 
            console.log('Key:'+key+' ; Value:'+value2.SLONGNAME);

            let fName = key+' - '+value2.SLONGNAME.replace(/\.+$/, "")+'.json';
            await writeFile(outPath+fName, value).then( response =>{
                console.log(response);
            }).catch( err => {
                console.log('ERROR : START : '+err);    
                if (firebase.apps.length) { firebase.app().delete(); }
            });   
        }, {concurrency: 10});

    }
            
    if (firebase.apps.length) { firebase.app().delete(); }

    process.exit();  //Added this as NodeJS application doesn't exit properly
        
};

start();
```

After doing this, still there were more data and keys of those i didn't have and this is where *Firebase Database REST API* came to help.     

```sh
curl "https://btd-in2.firebaseio.com/BTD_AnnouncementsByCode.json?shallow=true&print=pretty" > code_list4.txt
```

By executing this command, i got just the keys without the data underlying it, thats the `shallow` trick. 

> **shallow** : This is an advanced feature, designed to help you work with large datasets without needing to download everything. Set this to true to limit the depth of the data returned at a location. If the data at the location is a JSON primitive (string, number or boolean), its value will simply be returned. If the data snapshot at the location is a JSON object, the values for each key will be truncated to true.


Plan for future clean-ups is to incorporate the firebase rest api into the above program like,      
1. Execute the Firebase REST API with Shallow via nodejs and retreive the keys
2. Create an outer loop using .slice() so that rest of the program processes around 10 chunks
3. Using .every() loop method and pushing promises to array
4. Using bluebird Promise.map to process the promises with concurrency 2


**Why in the first place ended up in this activity**     

1. Assumption, i will be able to retreive using program or export via firebase feature
2. Didn't plan for archieving or decommissioning while creating it initially. 

* * * 

**Thank you for reading**
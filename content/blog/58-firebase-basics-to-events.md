---
title: Firebase basics and events
date: 2020-12-10
description: Setting up a simple firebase project to understanding about firebase events. 
tags:
  - javascript
  - web-development
  - firebase
slug: "/58-firebase-basics-to-events"
---

In the beginning 2017 or 2018, when i first started to learn and use firebase. My perspective on certain things changed. Usually, when i get an idea or concept, i start to write the structure of the table and how the data is going to be stored and in parallel, i draw a simple sketch of the application and write out what data its going to access from which table. For me, it sort given an idea of the flow. 

Firebase sort of takes this to the next level and makes you say, **Dont start with the data structure design at all**. First design the UI and work on the  *User Journey* and then based on the user journey build the structure of data. 

Relational database users or DBA may think in a way 
Responsibility of the database is to store the data in the most effective way – it shouldn't be affected by how the UX will work.

But when using firebase type of database, thinking like relational database designer will affect the performance of the application as firebase doesn't have any SQL or JOINS. So, designing the application should start from UI to Backend not the other way around. 

Here i am building a simple application to illustrate various firebase events in a simple HTML page. 

**Working example** is available here in [Firebase Experiments : Firebase Events](https://tests.bobbydreamer.com/firebase-events). To test it out, first you will have to [register here](https://tests.bobbydreamer.com/firebase-authentication). Once you finish testing, you can delete the user yourself, option is available in the page. I would be really grateful, if you do that. 

  ![Firebase Events sample application](assets/58-firebase-events.png "Firebase Events sample application")  

Firebase also known as Realtime Database as it can synchronize data across multiple devices and data is stored in Cloud(since its acquired by Google, data is stored in Google Cloud). Firebase has multiple products, 

* Firebase Realtime database, this is their first product 
* Firebase Authentication
* Firebase Hosting
* Firestore
* and there are many more like Crashlytics...

Interesting thing about firebase is, its a database but you don't need any drivers or anything else installed in your machine to connect to it or use it. Here are we are building a simple HTML Application, so we will be using SDKs from CDN. 

Main firebase products & features, i will be using is,     

* Firebase Authentication
* Firebase Realtime Database

### # Setting up firebase app

1. Go to `firebase console -> Project Overview -> Project settings`
1. In General tab, in "Your apps" click WEB `</>` icon . 
  ![Firebase console](assets/58-fbc1.png "Firebase console")  

1. Copy the Firebase SDK snippet. If you don't copy no problem, same script is available in this page `firebase console -> Project Overview -> Project settings`
  ![Firebase](assets/58-fbc2.png "Firebase")  

1. Add the following scripts to the bottom of your `<body>` tag. Highlighted are the services, we will be using this example app. 
  ```html {11,12}
  <body>
    ...
    <!-- Insert these scripts at the bottom of the HTML, but before you use any Firebase services -->
  
    <!-- Firebase App (the core Firebase SDK) is always required and must be listed first -->
    <script src="https://www.gstatic.com/firebasejs/8.1.2/firebase-app.js"></script>
  
    <!-- TODO: Add SDKs for Firebase products that you want to use
    	   https://firebase.google.com/docs/web/setup#available-libraries -->
    <!-- Add Firebase products that you want to use -->
    <script src="https://www.gstatic.com/firebasejs/8.1.2/firebase-auth.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.1.2/firebase-database.js"></script>
  </body>
  ```
1. Since its development, you can set the firebase rules like below and default is `false` meaning deny all users by setting as below you are allowing all users. Since this is test, you are the only user. So its fine. Rules are in `Firebase Console --> click left side Realtime Database --> on the right side click Rules tab`

```
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

Now firebase is setup and ready for coding. 

### # Building the sample application

This sample application is sort of like a chat application consists of two main things.
1. Authentication
2. Firebase Operations

Without authentication, it could work but that would make everything public. So having authentication, gives you a little control on things. 

#### # Authentication
One of the best things about Firebase is you don't have to build your authentication system, its readily available(Backend & UI for federated). Firebase supports federated identity providers like Google, Facebook, Twitter, Apple, GitHub, Microsoft and Yahoo. Other authentication types available are email link(email verified), email password(email unverified), Anonymous and Phone number.

**Working example** : [Firebase Experiments : Authentication](https://tests.bobbydreamer.com/firebase-authentication)

For Authentication system to work, it needs to be executed in a local server, if its execute from a .html file, you will get below error message. 
```
code: "auth/operation-not-supported-in-this-environment"
message: "This operation is not supported in the environment this application is running on. 
"location.protocol" must be http, https or chrome-extension and web storage must be enabled."

# Solution 
Authentication wont work, when file is directly opened in browser as a `.html` file. 
File needs to be loaded via web server as authentication services will use Web Storage. 
At the minimum nodejs expressjs should resolve the problem. 
```

Here, i have setup three types of authentication examples,    

**Google Authentication** : Once you click the SignIn with Google button(btnSIG), below code will get triggered. This can handle registration and login. 

![Google Sign in](assets/58-fb-gsin.png "Google Sign in")  

```js {4}
/* Google Authentication
––––––––––––––––––––––––––––––––––––––––––––––––––------------------------------------ */
btnSIG.addEventListener("click", e =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });          
    firebase.auth().signInWithPopup(provider);                
});
```

**Email Password Authentication** : In this example, i have written two separate functions, one for Registration and other for login. 

![Email Password Authentication](assets/58-fb-epsin.png "Email Password Authentication")  

```js {5,27}
/* Email Password Register
––––––––––––––––––––––––––––––––––––––––––––––––––------------------------------------ */
btnRaL.addEventListener("click", e =>{
const auth = firebase.auth();
const promise = auth.createUserWithEmailAndPassword(txtEmail.value, txtPassword.value);
promise.catch(e => {
    if(e.code == 'auth/email-already-in-use'){
        txtMessage.innerHTML = 'Hello,  '+e.message;
    }else if(e.code == 'auth/weak-password'){
        txtMessage.innerHTML = e.message;
    }else
        txtMessage.innerHTML = e.code, ' ',e.message;
});
    promise.then(e => console.log(e.user, ' ', e.email));
});


/* Email Password Login
––––––––––––––––––––––––––––––––––––––––––––––––––------------------------------------ */
btnARL.addEventListener("click", e =>{
    
    if(txtEmail.value.length == 0 || txtPassword.value.length == 0){
        return console.log('email & password required');
    }

    const auth = firebase.auth();
    const promise = auth.signInWithEmailAndPassword(txtEmail.value, txtPassword.value);
    promise.then( firebaseUser => {
        // console.log('Trying to go to success.html');
    });
    promise.catch(e => {
        console.log(e.code, ' ',e.message)
        if(e.code == 'auth/user-not-found'){                        
            txtMessage.innerHTML = 'Register first to login';
        }
    });
});
```

**Anonymous Authentication** : This just creates user, thats it. Best one for users who don't like giving out their email IDs and later worrying about spams and follow-up mails. On the downside, there could be a lot of Anonymous registrations. Automated cleanup might be required that would endup as a Cloud function probably thinking about it. 

![Anonymous Authentication](assets/58-fb-anon.png "Anonymous Authentication")  

```js {6}
/* Anonymous Authentication
––––––––––––––––––––––––––––––––––––––––––––––––––------------------------------------ */
btnAnon.addEventListener("click", e =>{
    
    const auth = firebase.auth();
    const promise = auth.signInAnonymously();
    promise.then( firebaseUser => {
        // console.log('Trying to go to success.html');
    });
    promise.catch(e => {
        console.log(e.code, ' ',e.message)
    });
});
```

Once user is signed in or registered, below code will get notified about the change in authorization and run accordingly which is to get the user details, its interesting when the user is a federated one like google(only i had tried so far), it shows user profile pic. 

```js {3}
/* When AUTH state changs execute this
  ––––––––––––––––––––––––––––––––––––––––––––––––––------------------------------------ */       
  firebase.auth().onAuthStateChanged(firebaseUser => {        
                      
          if(firebaseUser){                        
              tdUID.innerText = firebaseUser.uid;
              console.log(firebaseUser.providerData);
              if(firebaseUser.providerData.length>0){
                  tdProvider.innerText = firebaseUser.providerData[0].providerId;
                  tdName.innerText = firebaseUser.displayName;
                  tdEmail.innerText = firebaseUser.email;
                  imgURL.src = firebaseUser.photoURL;
                  imgURL.width = 150;
                  imgURL.height = 150;
                  
                  tdEv.innerText = firebaseUser.emailVerified;
                  tdCt.innerText = firebaseUser.metadata.creationTime;
                  tdLlt.innerText = firebaseUser.metadata.lastSignInTime;

                  txtVEA.innerHTML = firebaseUser.email + '(' + firebaseUser.emailVerified + ')';
              }
          }else{
              tdUID.innerText = "-";
              tdProvider.innerText = "-";
              tdName.innerText = "-";
              tdEmail.innerText = "-";
              imgURL.src = "";
              imgURL.width = 0;
              imgURL.height = 0;
              tdEv.innerText = "-";
              tdCt.innerText = "-";
              tdLlt.innerText = "-";
          }
  });
```

Below is for the signout 
```js {7}
/* Signout
––––––––––––––––––––––––––––––––––––––––––––––––––------------------------------------ */
btnSO.addEventListener('click', e => {
    const auth = firebase.auth();
    // console.log('Current user : ',firebase.User);
    // console.log('BEfore Signout - ', auth);
    auth.signOut();
    // console.log('After Signout - ', auth);
    // console.log('Current user : ',firebase.User);
});
```

Code above is pretty much straight forward, not much of explanations are required, i thought and firebase documentation on this also pretty neat. 

#### # Firebase operations

Firebase data is node-based meaning its like a JSON key:value structure in a deep nested way. When planning the structure of the data on the side one needs to also think about security. Data structure totally depends on how the application UI looks or interacts. Here rules of relational database does not apply. So, think structuring the database like that. Being a Db2 DBA, that was bit of a learning curve for me, when working with firebase. Here, its all about denormalization and maintaining data integrity. Its all about multiple batched updates or creating a cloud function to update asynchronously(fun stuff). 

Data synchronization is the heart of firebase, once you connect your realtime application to firebase, it starts listening for changes in the database and once the change is made, it pulls the changes even if you are not asking for it. There is no need to query and get the data, thats the special thing about firebase. Firebase doesn't use HTTP, it uses WebSocket, it is much faster than HTTP(they say). 

Technically to say, 
> Data stored in a Firebase Realtime Database is retrieved by attaching an asynchronous listener to a database reference. The listener is triggered once for the initial state of the data and again anytime the data changes.

I can think of only one negative point about firebase being a database, there is no query language like SQL to fetch or do any data manipulation, but thats OK. 

Changes to data are refered to as events. Here we will be explore one-by-one. 

1. **VALUE event** : It is triggered once with the initial data and again every time the data changes, it will return all the data not just changed or new one. 
```js {5}
//Create referencecs
const dbRefObject = firebase.database().ref().child('chat-test');

// Sync object changes - .on(value)
dbRefObject.on('value', snap => {
    let allData = snap.val();
    // console.log(allData);
    let keys = Object.keys(allData)
    // console.log(keys);
    for(k in keys){
        k = keys[k];
        let data = allData[k];         
        let msgClone = makeMessage2(k, data['time'], data['username'], data['message']);
        msgBox1.insertBefore(msgClone, anchor1);
    }
});
```

2. **VALUE event with ONCE method** : Retreives data once in the beginning or whenever page is refreshed
```js {1}
dbRefObject.once('value', snap => {
    let allData = snap.val();
    // console.log(allData);
    let keys = Object.keys(allData)
    // console.log(keys);
    for(k in keys){
        k = keys[k];
        let data = allData[k];         
        let msgClone = makeMessage2(k, data['time'], data['username'], data['message']);
        msgBox2.insertBefore(msgClone, anchor2);
    }
});
```

3. Child event - **child_added** : Retreives data whenever a new child is added to the node its listening to.
```js {1}
dbRefObject.on('child_added', (snap, prevChildKey) => {
    let data = snap.val();
    let key = snap.key;    //child_added doesn't give key by default
    // console.log(data);
    console.log('child_added : key=' + key + ', prevChildKey=' + prevChildKey);
    let msgClone = makeMessage2(key, data['time'], data['username'], data['message']);
    msgBox3.insertBefore(msgClone, anchor3);
});
```

4. Child event - **child_changed** : Retreives child node whenever it is updated
```js {1}
dbRefObject.on('child_changed', (snap, prevChildKey) => {
    let data = snap.val();
    let key = snap.key;    //child_added doesn't give key by default
    console.log(data);
    console.log('child_changed : key=' + key + ', prevChildKey=' + prevChildKey);
    let msgClone = makeMessage2(key, data['time'], data['username'], data['message']);
    msgBox4.insertBefore(msgClone, anchor4);
});
```

5. Child event - **child_removed** : Retreives data whenever a child node is deleted
```js {1}
dbRefObject.on('child_removed', (snap) => {
    let data = snap.val();
    let key = snap.key;    //child_added doesn't give key by default
    console.log(data);
    console.log('child_removed : key=' + key);
    let msgClone = makeMessage2(key, data['time'], data['username'], data['message']);
    msgBox5.insertBefore(msgClone, anchor5);
});
```

6. Child event - **child_moved** : Retreives data whenever the order of data is changed. ie., when someone moves from rank 5 to rank 4. Here in the example, when the datetime is changes, the order is changed. 
```js {1}
dbRefObject.orderByChild("time").on('child_moved', (snap) => {
    let data = snap.val();
    let key = snap.key;    //child_added doesn't give key by default
    console.log(data);
    console.log('child_removed : key=' + key);
    let msgClone = makeMessage2(key, data['time'], data['username'], data['message']);
    msgBox6.insertBefore(msgClone, anchor6);
});
```

7. **Update** : Using this function, i insert/add data to the firebase database. Here, 

* Line(2) - Generates a pushkey, its sort of a unqiue key. 
* Line(5) - Update node path where i want to add the key. If the key doesn't exist, it adds and if it exists, it updates. Multiple data can be batched into `updates` variable and executed in Line(6)

```js {6}
function addMessage(time, username, message){
    var key = dbRefObject.push().key;
    var temp = {time, username, message};
    var updates = {};
    updates['/chat-test/' + key] = temp;
    firebase.database().ref().update(updates);
}
```

8. **Delete using update** : Deleting a node is just nullifying it like below. 
```js {2}
    updates['/chat-test/' + key] = null;
    firebase.database().ref().update(updates);
```
If it goes, it goes, no way to retreive deleted data back. 


### # Other firebase posts
* [Firebase security and rules](57-firebase-rules)
* [Firebase email verification](56-firebase-email-verification)


### # References
* [Firebase : Basic Security Rules](https://firebase.google.com/docs/rules/basics)
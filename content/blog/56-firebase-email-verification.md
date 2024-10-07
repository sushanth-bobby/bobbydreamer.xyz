---
title: Firebase email verification
date: 2020-12-29
description: How to send verification emails via Firebase
tags:
  - javascript
  - web-development
  - firebase
slug: "/56-firebase-email-verification"
---

There are couple of methods for sending verification emails in firebase 
1. Calling `sendEmailVerification()` from the Firebase client
2. Calling `generateEmailVerificationLink()` to generate link from Admin SDK(Server side) and send email using any Email Delivery Service of your choice. (e.g., SendGrid)

Here we are going to have a look at the first method.

Working example can be found in [Firebase Experiments : Authentication](https://tests.bobbydreamer.com/firebase-authentication) and its a single page example, so source code is just there.

### # Sending verification emails via Firebase

1. Email verification template can be found by following path 
   ```
   Firebase console --> Authentication(In Build left sidebar) 
                    --> Templates ( Tab on right next to Sign-in method)
   ```

2. Currently i am making no changes to the format. 

  ![Firebase Console : Authentication Template](assets/56-fb-ev1.png "Firebase Console : Authentication Template")

3. Here for testing purposes, i have logged in gmail using Email Password mechanism, if i login via gmail, it will be automatically verified. So i am going for this approach. 

  * Typing the email and password(doesn't have to be the actual gmail password) and click *Register & Login*
  ![Application UI](assets/56-fb-ev2.png "Application UI")

  * In Firebase Authentication Users tabs you can see the new user added with provider as email
  ![Firebase Authentication Users Tab](assets/56-fb-ev3.png "Firebase Authentication Users Tab")

4. Sending verification email. Notice the **false**, thats the value in emailVerified field
  ![Application UI](assets/56-fb-ev4.png "Application UI")

  Here is the code behind the *Send verification mail* button

  ```js
  btnSVE.addEventListener("click", fbSendVerificationEmail, false);
 
  /* Send verification email
  ––––––––––––––––––––––––––––––––––––––––––––––––––----------------------- */
  function fbSendVerificationEmail(){
      const auth = firebase.auth().currentUser;
      auth.sendEmailVerification().then(function() {
          // Email sent.                    
          txtVEA.innerHTML = 'Verification email sent to ' + auth.email;                    
      }).catch(function(error) {
          // An error happened.
          txtVEA.innerHTML = 'Error occured';                
      });
  }
  ```

Once i click the button, i get the following output when the functione executed successfully

  ![Application UI](assets/56-fb-ev5.png "Application UI")

5. Received the verification email as below, 
  ![Gmail](assets/56-fb-ev6.png "Gmail")

6. On clicking the link
  ![Click the verification link](assets/56-fb-ev7.png "Clicking verification link")  

7. On refreshing the page again. Notice the **true**, thats the value in emailVerified field now.
  ![Application UI](assets/56-fb-ev8.png "Application UI")  


### # Other firebase posts
* [Firebase basics and events](58-firebase-basics-to-events)
* [Firebase security and rules](57-firebase-rules)


### # References
* [Firebase : Manage users](https://firebase.google.com/docs/auth/web/manage-users)
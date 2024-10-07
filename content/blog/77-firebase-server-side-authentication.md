---
title: Firebase Server side authentication
date: 2021-01-15
description: Basics on Firebase Authentication
tags: ['firebase', 'nodejs', 'javascript']
slug: "/77-firebase-server-side-authentication"
---

I am so much comfortable with using firebase client side authentication and doing things on the client side basically because i haven't tried much on the server side. My server side is very simple. After a while, when looking at the code, i found out, there are a few disadvantages i have found in having code at the Firebase client-side, 

1. All the application logic is in the client side and its public
2. Even the templating is being done in client side because its possible with handlebars or pure javascript but too much coding but got used with it. 

Here, i will be building a simple firebase app which will be doing majority of work at the server side like SSR(Server Side Rendering) and SSA(Server Side Authentication) and below are some of the items, i am planning to explore,

1. Setup firebase authentication. 
    * Email and Password 
    * Google
2. Public and Authenticated Routes
    * Authenticated routes (If not logged in, page will be redirected to login page)
    * Public routes available to all users(unregistered users as well)
3. Premium content will be showed only to certain registered users this is using custom claims. 

#### # 1. Setup firebase authentication. 

Here is the flow, 

1. In the client side javascript add the below. This *indicates that the state will only be stored in memory and will be cleared when the window or activity is refreshed.* We are going to be using `httpOnly` cookies which do not persist any state client side.
  ```js
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);
  ```
2. User signs-in and once the authentication is successful, the auth state will change and this function `firebase.auth().onAuthStateChanged` gets triggered, here we will be able to generate the ID Tokens via `firebaseUser.getIdToken()`
3. Pass the generated ID Token in the body of the POST method to route `/sessionLogin`
4. In the route, generate the session cookie `__session` via `admin.auth().createSessionCookie` 
  > [Managing Cache]((https://firebase.google.com/docs/hosting/manage-cache))     
  > * When using Firebase Hosting together with Cloud Functions or Cloud Run, cookies are generally stripped from incoming requests.    
  > * Only the specially-named __session cookie is permitted to pass through to the execution of your app.     
5. Going forward on each request to authenticated route, cookie `__session` verified and appropriate content will be rendered. 

![Login](assets/77-fbssr1.png "Login")

Once we are successfully logged-in via Firebase Client side authentication, we generate the ID Token as highlighted beblow and make a POST request to server to route `/sessionLogin` with ID Token in the body. 

```js:title=FBAuth.js - Client-Side - This is not full code, but main parts are shown here {6,9}
  firebase.auth().onAuthStateChanged(firebaseUser => {
      
    $("body").fadeIn("fast");            
              
    if(firebaseUser){
        firebaseUser.getIdToken().then(function(idToken) {  
            console.log(idToken); // It shows the Firebase token now

            return fetch("/sessionLogin", {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ idToken }),
            });                    
        }).then( response => {
            // No longer need to be logged in from client side as authentication is handled at server side 
            firebase.auth().signOut(); 
            if(!response.ok){
              console.log(response);
              throw new Error(response.status+", "+response.statusText);
            }else{
              window.location.assign("/");    
            }
        }).catch( error => {
          // window.location.assign("/login");          
          console.log(error);
        });                        
    }
  });
```

In the server, we receive the ID Token in the request body and we create a firebase `__session` cookie and set it. 

```js:title=index.js - Server-Side {2,11,14}
app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    console.log(`In ${req.path}, idToken=${idToken}`);
    console.log(`In ${req.path}, req.cookies=${JSON.stringify(req.cookies)}=`);
    console.log(`In ${req.path}, req.headers=${JSON.stringify(req.headers)}=`);
    // console.log(`In ${req.path}, req.body=${JSON.stringify(req.body)}=`);

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;  

    admin.auth().createSessionCookie(idToken, { expiresIn }).then( (sessionCookie) => {
        console.log(`In ${req.path} : And in createSessionCookie()` );
        const options = { maxAge: expiresIn, httpOnly: true, secure: true };
        res.cookie("__session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
    }, (error) => {
          console.log(`Error=${error}`);
          res.status(403).send("UNAUTHORIZED REQUEST!");
        }
    );
});
```

In the below picture, you can see a check mark under `httpOnly` for `__session`. 

![__session cookie](assets/77-fbssr4.png "__session cookie")

> When the HttpOnly flag is used, JavaScript will not be able to read the cookie in case of XSS exploitation

In the above image, we see 3 cookies and only `__session` has `httpOnly` attribute checked. When we try to display all the cookies below, you can notice only `__session` is not displayed. 

![displaying all the cookies](assets/77-fbssr5.png "displaying all the cookies")


#### # 2. Public and Authenticated Routes

##### Handling Authenticated routes
The function `isAuthenticated` checks whether the user is authenticated or not by retreiving the `__session` cookie. This function behaves as a middleware but in ExpressJS, its a [route handler](https://expressjs.com/en/guide/routing.html) which is executed before the route.  

One additional thing being done in the below code is `res.locals.fbUser = fbUser`. By doing this we are able to pass the fbUser data to the route.

```js:title=fn_isAuthenticated.js
const admin = require('firebase-admin');

/**  Initializations
**********************************************************/
/* Adding the if(condition) as i got the below error, after separating this function from index.js,
 * !  Error: The default Firebase app already exists. This means you called initializeApp() more than once without providing an app name as the 
 * second argument. In most cases you only need to call initializeApp() once. But if you do want to initialize multiple apps, pass a second argument to initializeApp() to give each app a unique name.
 * -- initializeApp() is called in the index.js first and its initialized there first. 
*/  
var serviceAccount = require("../secrets/api-project-333122111111-testing-server-authentication.json");
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://api-project-333122111111.firebaseio.com"
      });      
}

/**  Functions
**********************************************************/

/**
 * checks whether the user is authenticated or not
 * @param {!Object} req The expressjs request.
 * @param {!Object} res The expressjs response.
 * @param {!Object} next calls the next route handler in line to handle the request
 */
function isAuthenticated(req, res, next){
    try {
            var sessionCookie = req.cookies.__session || "";
            console.log(`In isAuthenticated() : sessionCookie=${sessionCookie}`);
            admin.auth().verifySessionCookie(sessionCookie, true/** checkRevoked **/).then( (fbUser) =>{
                    console.log(`In isAuthenticated() : token verified`);
                    console.log(`In isAuthenticated() : ${fbUser.uid}, ${fbUser.email}, ${fbUser.auth_time}`);
                    console.log(`In isAuthenticated() : ${JSON.stringify(fbUser)}`);
                    res.locals.fbUser = fbUser; //Passing variables
                    next();
            }).catch(function(error){
                    console.log("In isAuthenticated() ------------------------------------------------");
                    console.log(error);
                    res.clearCookie('__session');
                    console.log("In isAuthenticated() : Will be redirected to /login -----------------")
                    res.redirect('/login');
            });
        }catch (err)
        {
            console.log(err);
        }  
};

module.exports = {isAuthenticated} ;
```

In routes, `isAuthenticated` is called like below 
```js {3}
const fn = require('./helper-functions/fn_isAuthenticated.js');

app.get('/feedback', fn.isAuthenticated, async function(req, res){
    console.log(`In ${req.path}, user=${res.locals.fbUser.uid}`);

    let fbUser = res.locals.fbUser;
    res.render('feedback.ejs', { title: "feedback - Sushanth Tests", uid:fbUser.uid, email:fbUser.email})
});
```

##### Handling Public routes

Here actually, there is nothing being done. When this route is called `public.ejs` will be rendered and shown.    
```js
app.get('/public', function(req, res){
    console.log(`In ${req.path}`);
    res.render('public.ejs', { title: "public - Sushanth Tests"})
});
```

#### # 3. Premium content
Here, basically we are going to use *custom claims* which are attributes that can be added to user accounts in Firebase. So, whenever we enquire about user account details from Firebase, along with user details, you will also get these custom claims details. You might think instead of creating a new code called `users` in firebase, we can use custom claims to add all the necessary user data like name, address, mobile-no, email, image-url, etc... But, you see custom claims data cannot exceed 1k bytes. So, its recommended to use it for user access controls. Also firebase security rules can access these custom claims, so by using the combination of firebase security rules and custom claims, you can restrict specific content to users. 

In my example, i am adding two custom attributes having boolean values and in the route, i check the custom claims, what role user has and render page based on that. 

* admin : True, means user has admin rights
* premium : True, means user can view premium content

In this example, i am not doing anything in the *firebase security rules* 

Here, i am setting up the initial values to work on(one time run). Its just a simple route by calling it, it updates custom claims to the user details. 

```js {6-8}
app.get('/usermanagement', fn.isAuthenticated, async function(req, res){
    console.log(`In ${req.path}, user=${res.locals.fbUser.uid}`);
    console.log(`In ${req.path}, uid=${res.locals.fbUser.uid}, email=${res.locals.fbUser.email}, auth_time=${res.locals.fbUser.auth_time}`);

    //First Claim test
    admin.auth().setCustomUserClaims(fbUser.uid, {admin:true, premium:true}).then(()=> {
        console.log(`In ${req.path}, Setting claims success`);
    });

    res.render('usermanagement.ejs', { title: "User Management - Sushanth Tests", allUsers})
});
```

Next time, when you refresh any authenticated page or viewing user details, you can see the custom claim values. Here i have added below line in `fn_isAuthenticated.js` to see the user details. So, when `isAuthenticated()` middleware function is executed, it shows the user details in the console. 
```js:title=From fn_isAuthenticated.js {4-5}
console.log(`In isAuthenticated() : ${JSON.stringify(fbUser)}`);

# Output (end of first line, you can see the claims)
In isAuthenticated() : {"iss":"https://session.firebase.google.com/api-project-333122111111","admin":true,"premium":true,"aud":"api-project-333122111111","auth_time":1610715739,"user_id":"Xygc22eGS2VlaruxiqWJ5UUggsz2","sub":"Xygc22eGS2VlaruxiqWJ5UUggsz2","iat":1610715742,"exp":1611147742,"email":"x@y.com","email_verified":false,"firebase":{"identities":{"email":["x@y.com"]},"sign_in_provider":"password"},"uid":"Xygc22eGS2VlaruxiqWJ5UUggsz2"}
```

To work custom claims in managing users, i have created a page like below and here using the toggle button we can grant and revoke access to users. 

![User Management](assets/77-um1.png "User Management")

Below is the route for the user management page. Function `getAllUsers()` gets all the users, their details with claims and displayed as in above image. Later user you see the route `/usermanagement` which calls this function. 

```js {1,7-11,18,22,29}
/* Filename : fb_functions.js */
/** Gets all the users (1000 MAX) from Firebase auth.
***************************************************************/
const getAllUsers = () => {
    const maxResults = 20; // optional arg.
  
    return admin.auth().listUsers(maxResults).then((userRecords) => {
      let allUsers = [];
      console.log(JSON.stringify(userRecords));
      userRecords.users.forEach((user) => allUsers.push(user));
      return allUsers;
    }).catch((error) => {
        console.log(`In getAllUsers(), ${error}`);
        return [];
    })
};

/* Filename : index.js */
const fn = require('./helper-functions/fn_isAuthenticated.js');
const fb = require('./helper-functions/fb_functions.js');

app.get('/usermanagement', fn.isAuthenticated, async function(req, res){
    console.log(`In ${req.path}, user=${res.locals.fbUser.uid}`);
    console.log(`In ${req.path}, uid=${res.locals.fbUser.uid}, email=${res.locals.fbUser.email}, auth_time=${res.locals.fbUser.auth_time}`);

    let allUsers = await fb.getAllUsers();
    console.log(`In ${req.path}, allUsers=${JSON.stringify(allUsers)}`);

    res.render('usermanagement.ejs', { title: "User Management - Sushanth Tests", allUsers})
});
```

This is the client side script of the user management page. 
```js:title=um.js {9,28,48,52,53}
document.addEventListener('DOMContentLoaded', event => {

    /* Initializations
    ***************************************************************/
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

    /* Functions
    ***************************************************************/
    async function updateClaims(uid, adminSwitch, premiumSwitch){

        let response = await fetch("/updateClaims", {
            method: "POST",
            headers: {Accept: "application/json", "Content-Type": "application/json"},
            body: JSON.stringify({uid, adminSwitch, premiumSwitch }),
            
          }).then(response => {
            if (!response.ok) {
              throw new Error(response.message);
            }
            return response.json();
          }).then(data => {
            console.log("Response : ",data);
          }).catch((error) => {
            console.error('Error:', error);
          });
    }

    function getSwitchValues(){
      let classname = $(this).attr('class');
      console.log(classname);

      let uid = $(this).attr('content');
      console.log(uid);

      let cbAdminSwitch=null, cbPremiumSwitch=null;
      if(classname =="adminSwitch"){
        cbAdminSwitch = $(this).prop('checked');
        //This goes up(closest) and next() and finds the class and checks the property
        cbPremiumSwitch = $(this).closest('td').next().find('.premiumSwitch').prop('checked');  
      }else{
        cbPremiumSwitch = $(this).prop('checked');
        //This goes up(closest) and next() and finds the class and checks the property
        cbAdminSwitch = $(this).closest('td').prev().find('.adminSwitch').prop('checked');
      }

      console.log(cbAdminSwitch);
      console.log(cbPremiumSwitch);
      updateClaims(uid, cbAdminSwitch, cbPremiumSwitch);
    }

    //jQuery will automatically invoke function with the proper context set meaning no need to pass $(this).
    $('.page').on('click', '.adminSwitch',  getSwitchValues);
    $('.page').on('click', '.premiumSwitch', getSwitchValues);

});
```

Below is the route that handles the POST request and updates the firebase custom claims, when switch is toggled, 
```js:title=index.js {12}
app.post("/updateClaims", fn.isAuthenticated, async (req, res) => {
    console.log(`In ${req.path}, req.headers=${JSON.stringify(req.headers)}=`);
    console.log(`In ${req.path}, user=${res.locals.fbUser.uid}`);

    const uid = req.body.uid.toString();
    const adminSwitch = (req.body.adminSwitch.toString()) == "true" ? true : false;
    const premiumSwitch = (req.body.premiumSwitch.toString()) == "true" ? true : false;
    console.log(`In ${req.path}, uid=${uid}, adminSwitch=${adminSwitch}, premiumSwitch=${premiumSwitch}`);    

    let claims = {admin:adminSwitch, premium:premiumSwitch};
    console.log(claims);
    await admin.auth().setCustomUserClaims(uid, claims).then(()=> {
        console.log(`In ${req.path}, Setting claims success`);
    });
    
    res.writeHead(200, {"Content-Type": "application/json"});
    // res.json({status:200,redirect:'Success! Updated Claims'});
    res.end(JSON.stringify({ ok:true, status:200,message:'Success! Updated Claims' }));
});
```

One of the main things to remember here is, there is a relationship between Firebase ID Token and Custom claims. So when you are signing-in to the app, a ID Token is generated via `firebaseUser.getIdToken()` and using the token `__session` cookie is created and for all authenticated routes, this cookie is used for verification. ID Token and `__session` has the same value. 

When your custom claims change, it doesn't get reflected/propagated right away as this ID Tokens and claims are connected. So to propagate the change, user needs to refresh the token, which can be done by one of the following methods, 

* Logout and Login (reAuthenticate)
* Refresh the ID Token forcefully by `currentUser.getIdToken(true)` in the client side
  + In my case, this is not possible as i am signing-out after successful login from the client side. 

Option left is to **reAuthenticate**
```js:title=index.js
app.get('/signout', fn.isAuthenticated, async function(req, res){
    console.log(`In ${req.path}, user=${res.locals.fbUser.uid}`);

    await fb.refreshToken(req, res);
    res.redirect('/login');
});
```

Main code here is just the highlighted one. 
```js:title=fb_functions.js {29}
/** Calls the revocation API to revoke all user sessions nd force new login.
***************************************************************************/
/**
 * @param {!Object} req The expressjs request.
 * @param {!Object} res The expressjs response.
 */
async function refreshToken(req, res){
    try {
            var sessionCookie = req.cookies.__session || "";
            console.log(`In refreshToken() : sessionCookie=${sessionCookie}`);

            let fbUser = await admin.auth().verifySessionCookie(sessionCookie, true/** checkRevoked **/).then((fbUser) =>{
                console.log(`In refreshToken() : verifySessionCookie : cookie verified`);
                console.log(`In refreshToken() : verifySessionCookie : ${fbUser.uid}, ${fbUser.email}, ${fbUser.auth_time}`);
                console.log(`In refreshToken() : verifySessionCookie : ${JSON.stringify(fbUser)}`);
                return fbUser; 
            }).catch(function(error){
                console.log("In refreshToken() ------------------------------------------------");
                console.log(error);
                res.clearCookie('__session');
                console.log("In refreshToken() : Will be redirected to /login -----------------")
                res.redirect('/login');
            });
            let uid = fbUser.uid;
            console.log(`In refreshToken() : uid=${uid}`);

            // Revoke all refresh tokens for a specified user for whatever reason.
            // Retrieve the timestamp of the revocation, in seconds since the epoch.
            await admin.auth().revokeRefreshTokens(uid);

            fbUser = await admin.auth().getUser(uid).then( fbUser =>{
                        let rt = new Date(fbUser.tokensValidAfterTime).getTime() / 1000;
                        console.log(`In refreshToken() : revokeRefreshTokens : Tokens revoked at ${rt}`);
                        return fbUser; 
            });
        }catch (err)
        {
            console.log("In refreshToken() ------------------------------------------------");
            console.log(err);
            res.clearCookie('__session');
            console.log("In refreshToken() : Will be redirected to /login -----------------")
            res.redirect('/login');
        }  
};
```

So far what we have seen is, 
1. How to setup custom claims ? 
2. How to refresh the ID Token to propagate the claim change ? 

Now, on displaying the premium content, all one have to do is this, 
```js:title=index.js {5}
app.get('/premium', fn.isAuthenticated, async function(req, res){
    console.log(`In ${req.path}, user=${res.locals.fbUser.uid}`);

    let fbUser = res.locals.fbUser;
    if(fbUser.premium)
        res.render('premium.ejs', { title: "premium - Sushanth Tests"})
    else
        res.render('non-premium.ejs', { title: "signup for premium - Sushanth Tests"})    
});
```

**Non-Premium user view**    

![non-premium.ejs - Non-Premium user view](assets/77-fbssr2.png "non-premium.ejs - Non-Premium user view")

**Premium user view**    

![premium.ejs - Premium user view](assets/77-fbssr3.png "premium.ejs - Premium user view")

Here we are using simple approach to revoke the token asking user to reAuthenticate themselves by click logout. We can do this automatically as well, by setting up some logics like, 
1. Having a node `user` node in firebase and update it whenever a claim is updated. 
2. Have a listener at client which listens to `user` node or in middleware like `isAuthenticated()` which check if the ID token is revoked and redirect the user to login screen or open up a modal box asking userid and password again to reAuthenticate. Its all upto to the implementer. 


### # References
* [Firebase - Manage cache behavior : About __session](https://firebase.google.com/docs/hosting/manage-cache)
* [Firebase - Manage Session Cookies: Contains sample code](https://firebase.google.com/docs/auth/admin/manage-cookies)
* [Firebase - Verify ID Tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens#web)
* [Firebase - Control Access with Custom Claims and Security Rules](https://firebase.google.com/docs/auth/admin/custom-claims)
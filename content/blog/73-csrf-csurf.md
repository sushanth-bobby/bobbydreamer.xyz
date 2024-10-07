---
title: Cross-Site Request Forgery (CSRF) and CSURF module
date: 2021-01-09
description: Success and failures on working with CSRF
tags: ['firebase', 'nodejs', 'javascript', 'time-wasted']
slug: "/73-csrf-csurf"
---

**Bottom-line**. Wasted a week(4/Jan/2021 - 9/Jan/2021) on Cross-Site Request Forgery (CSRF). It all started with me working on Firebase server-side authentication and in the example i was following, it had CSRF setup. So, i started investigating and studying CSRF and found it interesting wanted to try it out. So, i'd setup `firebase hosting`, `csurf` and finally got it work for all GET requests. But, when i introduced POST requests, it started failing with `invalid csrf token` errors. Did a lot of attempts with solutions posted in S.O, nothing worked. So finally, i came across a post in S.O and decided CSRF is not required for firebase hosting. I proceeded to try out `csurf` without using firebase hosting and finally gave up. 

Hmmm... Curiosity kills time. 

This is how it all started. 

#### # So, [what is CSRF](https://owasp.org/www-community/attacks/csrf) ? 
Cross-Site Request Forgery (CSRF) is an attack that forces an end user to execute unwanted actions on a web application in which they're currently authenticated. With a little help of social engineering (such as sending a link via email or chat), an attacker may trick the users of a web application into executing actions of the attacker's choosing. If the victim is a normal user, a successful CSRF attack can force the user to perform state changing requests like transferring funds, changing their email address, and so forth. If the victim is an administrative account, CSRF can compromise the entire web application.

### # Prevention measures that do NOT work
* Using a secret cookie
* Only accepting POST requests
* Multi-Step Transactions
* URL Rewriting
* HTTPS

#### # What is `csurf` ? 
`csurf` is a middleware which creates token via `req.csrfToken()` and this token will be generated and added to all requests and makes sure that the request comes from a legitimate client. This generated token can be added as a Cookie or via templating in `meta` tags or `form` hidden fields whichever suits your needs. Here, i am storing it in a cookie, so additionally i am using `cookie-parser`, another middleware. Why this choice, if you ask, basically i am using firebase and i am developing this based on examples from [Firebase : Managing Cookies](https://firebase.google.com/docs/auth/admin/manage-cookies). 

How CSRF works ? 
When the server sends a form/page to the client, it attaches a unique random value (the CSRF token) to it that the client needs to send back. When the server receives the request from the client, it compares the received token value with the previously generated value. If they match, it assumes that the request is valid.

Here are the steps to implement, this has nothing to do with actual firebase, here we are just makingt the site more secure. 

1. Install both the modules  `npm install cookie-parser csurf --save`
2. In the `index.js` add the below code in the middleware section. In line 5, we are just stating we will be using cookie object to store the secret for the user. Other notable default value is name of the cookie will be `_csrf`
```js
...
const cookieParser = require("cookie-parser");
const csrf = require("csurf");                     // protect from Cross site forgery attacks 
...
app.use(cookieParser());
const csrfMiddleware = csrf({ cookie: true });
app.use(csrfMiddleware);
```

3. Here, line 4 gets executed before executing the specific route code and we are setting the cookie `XSRF_TOKEN`. In our example, just triggered the route `/login` from the browser.

```js
/**  Routes
**********************************************************/
//This executes first and set the cookie to XSRF-TOKEN
app.all("*", (req, res, next) => {
    const XSRF_TOKEN = req.csrfToken();
    console.log(`In (*), XSRF_TOKEN=${XSRF_TOKEN}`);
    res.cookie("XSRF-TOKEN", XSRF_TOKEN);
    next();
});

app.get('/login', function(req, res){
    console.log(`In ${req.path}, req.cookies=${JSON.stringify(req.cookies)}`);
    res.clearCookie('__session');
    res.render('login.ejs', { title: "login - Sushanth Tests", pageID: "login"})
});
```
![CSURF1](assets/73-csurf1.png "CSURF1")

4. You can see the same `XSRF_TOKEN` and `_crsf` cookies in the browser. 
![CSURF2](assets/73-csurf2.png "CSURF2")

5. In the browser, when i enter the email and password and click login following code in firebase gets triggered. Here i am doing following things, 
* In firebase onAuthStateChanged() method will be triggered whenever state of the user is changed. So, when the state changes from logged off to logged in, we can generate ID token via `getIdToken()` method. 
* We retreive the cookie and post it back via headers and firebase ID Token in the body. 
* We are signing out because, we don't need to be logged in the client side any more as we have generated the ID Token using which we can retreive the UserID for further processing from the server side. 

```js
    // Check AUTH state change
    firebase.auth().onAuthStateChanged(firebaseUser => {                
        if(firebaseUser){            
            setUserDetails(firebaseUser).then( (results) => {
               firebaseUser.getIdToken().then(function(idToken) {  
                    console.log(idToken); // It shows the Firebase token now

                    const csrfToken = Cookies.get("XSRF-TOKEN");
                    console.log("Cookie Get : ",csrfToken);

                    return fetch("/sessionLogin", {
                        method: "POST",
                        headers: {
                          Accept: "application/json",
                          "Content-Type": "application/json",
                          "CSRF-Token": Cookies.get("XSRF-TOKEN"),
                        },
                        body: JSON.stringify({ idToken }),
                      });                    
               }).then( response => {
                   firebase.auth().signOut();
                   if(!response.ok){
                    console.log(response);
                    throw new Error(response.status+", "+response.statusText);
                   }else{
                    window.location.assign("/");    
                   }
              }).catch( error => {
                window.location.assign("/login");          
              });
                        
            }).catch( (error) => { 
                
                console.log('Status : ',error);
                setTimeout( () => {
                    const auth = firebase.auth();
                    auth.signOut();            
                }, 5000);                
            });

        }
    });
```

6. In the server, when the post route `/sessionLogin` is called by fetch below code gets triggered. Before executing the code in the route, csurf validates the tokens automatically and once its successful only, route code is executed. In the first part of the code, i am just displaying the `idToken`, `req.cookies`, `req.headers` and `req.body` and in the second part of the code, we are create a firebase session cookie with the name `__session`. This is special because firebase hosting, functions and cloud run permits only this cookie to pass through to the execution of your app and rest are all stripped from incoming requests. This is mentioned in [Manage cache behavior](https://firebase.google.com/docs/hosting/manage-cache). 

```js
//Login Setup and Check
app.post("/sessionLogin", (req, res) => {
    const idToken = req.body.idToken.toString();
    console.log(`In ${req.path}, idToken=${idToken}`);
    console.log(`In ${req.path}, req.cookies=${JSON.stringify(req.cookies)}=`);
    console.log(`In ${req.path}, req.headers=${JSON.stringify(req.headers)}=`);
    // console.log(`In ${req.path}, req.body=${JSON.stringify(req.body)}=`);

    const expiresIn = 60 * 60 * 24 * 5 * 1000;  

    admin.auth().createSessionCookie(idToken, { expiresIn }).then( (sessionCookie) => {
        console.log(`In ${req.path} : And in createSessionCookie()` );
          const options = { maxAge: expiresIn, httpOnly: true };
          res.cookie("__session", sessionCookie, options);
          res.end(JSON.stringify({ status: "success" }));
        }, (error) => {
          res.status(403).send("UNAUTHORIZED REQUEST!");
        }
    );
});
```

When the route `/sessionLogin` is executed, we get the following output, 
```sh
i  functions: Beginning execution of "app"
>  In (*), XSRF_TOKEN=c8xlEuv3-I3Dc_dseJdNCgqLwVdy-ctrJ5r8
>  In /sessionLogin, idToken=eyJhbGciOiJSUzI1NiIsImtpZCI6ImUwOGI0NzM0YjYxNmE0...............VQ-g75TTw
>  In /sessionLogin, req.cookies={"_csrf":"_FKcfg_uQ3UCd8x2ct1iQp5c","XSRF-TOKEN":"KNneQQhf-H1roUFVXyP-80qUZk9IUqwyUdtM"}=
>  In /sessionLogin, req.headers={"x-forwarded-host":"localhost:5000","x-original-url":"/sessionLogin","pragma":"no-cache","cache-control":"no-cache, no-store","host":"localhost:5001","connection":"keep-alive","content-length":"930","sec-ch-ua":"\"Google Chrome\";v=\"87\", \" Not;A Brand\";v=\"99\", \"Chromium\";v=\"87\"","accept":"application/json","csrf-token":"KNneQQhf-H1roUFVXyP-80qUZk9IUqwyUdtM","sec-ch-ua-mobile":"?0","user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36","content-type":"application/json","origin":"http://localhost:5000","sec-fetch-site":"same-origin","sec-fetch-mode":"cors","sec-fetch-dest":"empty","referer":"http://localhost:5000/login","accept-encoding":"gzip, deflate, br","accept-language":"en-US,en;q=0.9","cookie":"_csrf=_FKcfg_uQ3UCd8x2ct1iQp5c; XSRF-TOKEN=KNneQQhf-H1roUFVXyP-80qUZk9IUqwyUdtM"}=
```

7. Let logout and test the `csrf` tokens. Below is the logout route and do note, if you don't clear the cookie `__session`, you sort of get `invalid csrf token` errors. So i am clearing that cookie in signout and login(it took two days to figure that out). 
```js
app.get('/signout', async function(req, res){
    var sessionCookie = req.cookies.__session;
    console.log(`In ${req.path}, sessionCookie=${sessionCookie}`);

    let fbUser = await admin.auth().verifySessionCookie(sessionCookie, true/** checkRevoked */);
    console.log(`In ${req.path}, uid=${fbUser.uid}, email=${fbUser.email}, auth_time=${fbUser.auth_time}`);

    res.clearCookie('__session');
    res.redirect('/login');
});
```

Below are the steps, i am performing. 
1. Click signout
2. Go to login page and clear storage
![CSURF3](assets/73-csurf3.png "CSURF3")

3. Enter the login route `http://localhost:5000/login` again to you will get the new tokens now. 
![CSURF4](assets/73-csurf4.png "CSURF4")

4. Entered email, password and manually updated the `XSRF-TOKEN`. Just added an extra `s`.
![CSURF5](assets/73-csurf5.png "CSURF5")

5. Click `SIGN-IN WITH EMAIL`  
6. Below are the responses, 
* In the server
```
[hosting] Rewriting /sessionLogin to http://localhost:5001/api-project-333122123186/us-central1/app for local Function app
i  functions: Beginning execution of "app"
>  EBADCSRFTOKEN invalid csrf token
i  functions: Finished "app" in ~1s
i  hosting: 127.0.0.1 - - [06/Jan/2021:07:30:20 +0000] "POST /sessionLogin HTTP/1.1" 403 42 "http://localhost:5000/login" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
```

* At the client 
![CSURF6](assets/73-csurf6.png "CSURF6")

You will be similar responses, if `_csrf` token is changed as well. 

##### Custom error handling
Two things are handled here, 
1. Bad csrf token
2. Checking request origin

```js 
app.use(function (err, req, res, next) {
    // res.clearCookie('__session');  //It is found that it is found that removing __session from cookie resolves
    // the EBADCSRFTOKEN error which kept reoccuring during testing 2 days wasted. After removing this __session cookie
    // was able to proceed.
    console.log(err.code, err.message);
    if (err.code !== 'EBADCSRFTOKEN'){

        //Checking the request origin
        const referer = (req.headers.referer? new URL(req.headers.referer).host : req.headers.host);
        const origin = (req.headers.origin? new URL(req.headers.origin).host : null);
        console.log("Orgin Checks");
        console.log(`req.headers.host=${req.headers.host}`);
        console.log(`req.headers.referer=${req.headers.referer}, ${new URL(req.headers.referer).host}`);
        console.log(`req.headers.origin=${req.headers.origin}, ${new URL(req.headers.origin).host}`);
      
        if (req.headers.host == (origin || referer)) {
          next();
        } else {
          return next(new Error('Unallowed origin'));
        }
        // return next(err);
    } 

    // handle CSRF token errors here
    res.status(403).send({message:"CSURF code has been tampered"});
});
```

Everything was fine till here and when i introduced POST requests, started getting `invalid csrf token` and after sometime, i found this [S.O response from bojeil](https://stackoverflow.com/questions/48505572/csrf-protection-with-firebase-email-password-authentication/48507846)

> CSRF becomes an issue when you are saving a session cookie. Firebase Auth currently persists the Auth State in web storage (localStorage/indexedDB) and are not transmitted along the requests. You are expected to run client side code to get the Firebase ID token and pass it along the request via header, or POST body, etc. On your backend, you would verify the ID token before serving restricted content or processing authenticated requests. This is why in its current form, CSRF is not a problem since Javascript is needed to get the ID token from local storage and local storage is single host origin making it not accessible from different origins.
> 
> If you plan to save the ID token in a cookie or set your own session cookie after Firebase Authentication, you should then look into guarding against CSRF attacks.

[bojeil response to another S.O question on same subject](https://stackoverflow.com/questions/50558607/managing-session-cookies-with-firebase-and-electron)
> getCookie is a basically a cookie getter. You can write it yourself or lookup the implementation online. As for the CSRF check, this is a basic defense against CSRF attacks. The CSRF token is set in a cookie and then returned back in the post body. The backend will confirm that the CSRF token in the cookie matches the token in the POST body. Basically the idea here is that only requests coming from your website can read the cookie and pass it in the request in the POST body. If the request is coming from another website, they will not be able to read the cookie and pass it in the POST body. While the CSRF token cookie will be always be passed along the request even when coming from other origins, the token will not be available in the POST body.

> It's unique per protocol://host:port combination.

After reading this, i decided not go with CSRF and Firebase combination but wanted to try out `csurf` in a regular ExpressJS app and i was getting the same error.

And at this point, i quit with `csurf`. Thinking about what it does, 
1. SERVER : You make a get request and csurf generates a unique token
2. SERVER : You set the token in a cookie and call it `_csrf` or `XSRF-TOKEN`
3. SERVER : You also render the same token to the webpage by passing it in a `input` hidden field in the form (or) pass it to a meta tag. 
4. CLIENT : When button is clicked which could be a submit or post, you pass the CSRF token via HEADER or BODY
5. SERVER : You retreive the token in the cookie and token which is passed in header (or) body and compare it. 
6. SERVER : if they are same, you process the request otherwise fail it as 401 Unauthorized request. 

Attempted to do the above without using csurf, just to have a little satisfaction that i didn't waste a entire week on this. 

```js:title=index.js
...
function attachCsrfToken(url, cookie, value) {
    return function(req, res, next) {
      console.log(`in attachCsrfToken(), cookie=${cookie}, value=${value}, req.url=${req.url}, url=${url}`);
      res.clearCookie(cookie);
      res.cookie(cookie, value);
      app.set(cookie, value);
        /*
      if (req.url == url) {
        res.cookie(cookie, value);
      }
      */
      next();
    }
}

...
/**  Middleware
**********************************************************/
...
app.use(cookieParser());

// Attach CSRF token on each request 
// - Funny thing about this Math.random() most of the time its the same value in a session
app.use(attachCsrfToken('/', 'csrfToken', (Math.random()* 100000000000000000).toString()));

app.post('/sessionLogin', function(req, res){
    console.log(`In ${req.path}`);
    const email = req.body.email.toString();
    const password = req.body.pass.toString();
    console.log(`In ${req.path}, ${email}, ${password}`);

    //If cookies.csrfToken not found, it will set as -1 otherwise it gets the value from cookie
    const csrfToken = !req.cookies.csrfToken ? -1 : req.body.csrfToken.toString();  

    // Guard against CSRF attacks.
    if (!req.cookies || csrfToken !== req.cookies.csrfToken) {
      console.log(`In ${req.path}, csrfToken=${csrfToken}, req.cookies.csrfToken=${req.cookies.csrfToken}`);    
      res.status(401).send('UNAUTHORIZED REQUEST!');
      return;
    }
      
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;  
    const options = { maxAge: expiresIn, httpOnly: true };

    if(email=="abc@xyz.com" && password=="123789"){                
        res.cookie("userpass", "authorized", options);

        res.writeHead(200, {"Content-Type": "application/json"});
        res.end(JSON.stringify({ ok:true, status:200,message:'Success' }));        
        // res.redirect("/");
    }else{
        res.cookie("userpass", "unauthorized", options);

        res.writeHead(401, {"Content-Type": "application/json"});
        res.end(JSON.stringify({ ok:false, status:401,message:'Unauthorized' }));        
    }
});

// - home
app.get('/', isAuthenticated, function(req, res){
    console.log(`In ${req.path}`);
    // console.log(`In ${req.path}, ${JSON.stringify(req.headers)}`);
    var csrfToken = req.app.get('csrfToken');
    res.render('home.ejs', { title: "home", csrfToken})
});

```

```html:title=login.ejs
    <meta name="csrf-token" content="<%= csrfToken %>">
```

Client side login.js script

```js:title=login.js
document.addEventListener('DOMContentLoaded', event => {

    /**** Elements
    **********************************************************/
    const txtEmail = document.getElementById('txtEmail');
    const txtPassword = document.getElementById('txtPassword');
    const btnLogin = document.getElementById('btnLogin');

    // Read the CSRF token from the <meta> tag
    var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

    /**** Event Listeners
    **********************************************************/
    btnLogin.addEventListener('click', async (e) => {
        let email = txtEmail.value;
        let pass = txtPassword.value;
        console.log(token);

        let url = '/sessionLogin';
        let options = {
                    method: 'POST',
                    url: url,
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json;charset=UTF-8' },
                    data: {email, pass, csrfToken: token }
                };        

        await axios(options).then((response) => {
            // Success
            if(response.status==200 && response.statusText=="OK"){
                console.log(response.config);
                console.log(response.data);
                window.location = '/';
            }else{
                console.log(response);
            }        
        }).catch((error) => {
            // Error
            console.log("Error=",error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                // console.log(error.response.data);
                // console.log(error.response.status);
                // console.log(error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the 
                // browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log('Error', error.message);
            }
            console.log("Error Config=",error.config);
        });        
        
    });

});
```


### # References    
* [What is CSRF](https://owasp.org/www-community/attacks/csrf)
* [Cheat Sheet : CSRF](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
* [bojeil Response 1](https://stackoverflow.com/questions/48505572/csrf-protection-with-firebase-email-password-authentication/48507846)
* [bojeil Response 2](https://stackoverflow.com/questions/50558607/managing-session-cookies-with-firebase-and-electron)
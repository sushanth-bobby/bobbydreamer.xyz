--- 
title: Modularizing ExpressJS Routes and Middlewares
date: 2022-08-08
description: Modular Patterns in ExpressJS Routes and Middleware
tags: ['nodejs']
slug: "/145-modularizing-expressjs-routes-and-middleware"
---

### As the title says, but what is the need of this ? 

Well i have `index.js` which is about 3000+ lines. I started building an app and at the same time I was learning NodeJS and didn't think about separating routes to external files as i did not think, it will end up this big, so all my routes code ended up in `index.js` and again at the same time I was also started learning and using Firebase functions, so that also ended up in `index.js`. 

Interestingly there is no problem with the code for last 4-5 years, thats the number of years, i havent touched it or reviewed it. It works perfectly. Currently i got plans to decommission some pages, functions and routes. Since its massive, i am little worried that i might break things unnecessarily. 

Looking at the WWW on the topics of Modularizing code in NodeJS came across few patterns which i will be following,

1. [Big Bang Pattern](#p1) - My current pattern, all in one file. You can call it index.js, app.js, server.js whatever you want but all your app code is in that one file.

2. [All routes are externalized to a separate route folder](#p2)

3. [tjholowaychuk's way of modularizing](#p3)

4. [Dynamically including all the routes](#p4)

**Code:** [Available in GitHub](https://github.com/bobbydreamer/modularizing-nodejs)

* * * 

<a id="p1"></a>

<br/>

## 1. Big Bang Pattern

Not going to explain on *Big Bang Pattern* much, it basically looks like below code. Middleware, Routes, 404 Invalid Route Handling all in one page. 

```js:title=index.js
const express = require('express');
const app = express();

/************************************************/
// Middleware

// Simple request time logger
app.use((req, res, next) => {
    console.log("A new request received at " + Date.now());
    next();  
});

/************************************************/
// Routes

app.get('/', (req, res) => res.send('Hello World!'));
 
app.get('/home', (req, res) => {
    res.send('Home Page');
});

app.get('/about', (req, res) => {
    res.send('About');
});

app.get('/books/:bookId', (req, res) => {
    res.send(req.params);
});

/************************************************/
// Final Invalid Route
app.get('*', (req, res) => {
    res.send('404! This is an invalid URL.');
});

/************************************************/
// Listener
app.listen(3000, () => console.log('Example app listening on port 3000!'));
```

We will be building upon this for the all pattern examples. 

<a id="p2"></a>

<br/>

## 2. All routes are externalized to a route folder

Here we have externalized routes to a separate folder `./routes` and created a separate .js file for each route and grouped some in a single file. 

Below i have highlighted some important lines

1. Requiring the files from ./routes folder
2. Using app.use(), mounting the routes in index.js
3. Using app.get()

#### Whats the different between app.use() and app.get() 
1. **app.use()** is intended for middleware. The path is a "mount" or "prefix" path and limits the middleware to only apply to any paths requested that begin with it. app.use() will respond to all the HTTP verbs(GET, POST, PUT)

2. **app.get()** is part of ExpressJS application routing and is intended for matching and handling a specific requested route. This allows you to align responses for requests more precisely than app.use(). When using app.use() for routing, you might require extra code to identify what type of HTTP request, routes and parameters passed.


```js:title=index.js {5,9,21,22,30}
const express = require('express');
const app = express();

// Routes
const books = require('./routes/books')
const number = require('./routes/number')
const posts = require('./routes/posts')
const user = require('./routes/user')
const wiki = require('./routes/wiki')

/************************************************/
// Routes
app.use(require('./routes/homepages'));          //http://localhost:3000/    http://localhost:3000/about
app.use("/main",require('./routes/homepages'));  //http://localhost:3000/main  http://localhost:3000/main/about

app.use(number);  //http://localhost:3000/number/12

app.use("/books",books);  //http://localhost:3000/books/12
app.use("/posts",posts);  //http://localhost:3000/posts/one
app.use("/user",user);    //http://localhost:3000/user/profile

app.get("/wiki", wiki.wikiData)

/************************************************/
// Final Invalid Route
app.get('*', (req, res) => {
    res.send('404! This is an invalid URL.');
});

/************************************************/
// Listener
let server = app.listen(3000, function () {
    console.log(`Example app listening at http://localhost:${server.address().port}`)  
});
```

Here we are using `express.Router` class to create modular, mountable route handlers. A Router instance is a complete middleware and routing system.

At the end, you export this module and you can import and consume by requiring it index.js

```js:title=./routes/homepages.js
var express = require('express');
var router = express.Router();

/************************************************/
// Routes
router.get('/', (req, res) => res.send('Hello World!'));

router.get('/home', (req, res, next) => {
  try{
    res.send('Home Page');
  } catch(error) {
    next(error) // calling next error handling middleware
  }  
});

router.get('/about', (req, res, next) => {
  try{
    res.send('About Page');
  } catch(error) {
    next(error) // calling next error handling middleware
  }  
});

router.get('/error', (req, res, next) => {
  try{
    console.log('Error Page');
    throw new Error("Error Page")
  } catch(error) {
    next(error) // calling next error handling middleware
  }  
});

module.exports = router;
```

For wiki, we are directly writing a function and exporting it to be consumed in index.js

```js:title=./routes/wiki.js
exports.wikiData = function(req, res){
    res.send('Wiki');
};
```

<a id="p3"></a>

<br/>

## 3. tjholowaychuk's way of modularizing

**Source:** [Modular web applications with Node.js and Express](https://vimeo.com/56166857)

In this technique, we are moving the routes to its own separate folder under routes. Main `index.js` is simple enough where we are just requiring and using app.use() to mount the routes. 

```js:title=index.js
const express = require('express');
const app = express();

const homepages = require('./routes/homepages')
const books = require('./routes/books')
const number = require('./routes/number')
const posts = require('./routes/posts')
const user = require('./routes/user')
const wiki = require('./routes/wiki')

/************************************************/
// Routes
app.use(homepages)
app.use(books)
app.use(number)
app.use(posts)
app.use(user)
app.use(wiki)

/************************************************/
// Final Invalid Route
app.get('*', (req, res) => {
    res.send('404! This is an invalid URL.');
});

/************************************************/
// Listener
app.listen(3000, () => console.log('Example app listening on port 3000!'));
```

Highlighted is how we are exporting the app to be used by Main `index.js`
```js:title=./routes/wiki/index.js {2}
var express = require('express');
var app = module.exports = express();

/************************************************/
// Routes
app.get('/wiki', (req, res, next) => {
    try{
        res.send('Wiki');
      } catch(error) {
        next(error) // calling next error handling middleware
    }      
});
```

<a id="p4"></a>

<br/>

## 4. Dynamically including all the routes

In this approach, routes are dynamically included meaning `./routes/index.js` will read all the .js files in the folder and export it.

```js:title=index.js {6}
const express = require('express');
const app = express();

/************************************************/
// Routes
require('./routes')(app);

/************************************************/
// Final Invalid Route
app.get('*', (req, res) => {
    res.send('404! This is an invalid URL.');
});

/************************************************/
// Listener
app.listen(3000, () => console.log('Example app listening on port 3000!'));
```

This file reads all .js files in the routes folder and requires it and creates an instance app and thats exported which is consumed by `index.js`. 
```js:title=./routes/index.js
var fs = require('fs');

module.exports = function(app){
    fs.readdirSync(__dirname).forEach(function(file) {
        if (file === "index.js" || file.substring(file.lastIndexOf('.') + 1) !== 'js') return;
        var name = file.substring(0, file.indexOf('.'));
        require('./' + name)(app);
    });
}
```

Below is the books.js routes file which exports one or more routes.
```js:title=./routes/books.js

module.exports = function(app){

  app.get('/books/:bookId', (req, res, next) => {
    try{
        console.log(req.params.bookId)
        res.send(req.params);
      } catch(error) {
        next(error) // calling next error handling middleware
    }      
  });

  //Other routes here
}
```

* * * 

Thanks for reading
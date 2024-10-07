--- 
title: Calling NodeJS Functions from external files
date: 2022-08-08
description: Notes on NodeJS Functions
tags: ['nodejs']
slug: "/147-nodejs-external-functions"
---

When you are modularizing your code in NodeJS, functions are the easiest one to move another file. Problem is there are multiple ways, patterns when externalizing functions there is nothing like a best practise. You will just have to pick a pattern that fits your need and go along with it. 

Here are few patterns i have come across and i haven't named the approaches. 

```js:title=index.js
const express = require('express');
const app = express();


// # Method 1
// module.exports in this case is exporting an object literal and the object has three functions and one variable.
// forces us to use a namespace
const foo = require("./local_functions/foo");

// # Method 2
require('./local_functions/bar')();

// # Method 3
const { add, sub, multiply, pi } = require('./local_functions/baz');

// # Method 4
const { divide } = require('./local_functions/qux');

/************************************************/
// Middleware - Simple request time logger
app.use((req, res, next) => {
    console.log("A new request received at " + Date.now());
    next();  
});

/************************************************/
// Routes

app.get('/', (req, res) => res.send('Hello World!'));

 
app.get('/add/:x/:y', (req, res) => {
    let x = req.params.x
    let y = req.params.y
    console.log(foo)
    console.log(typeof foo.addNumbers)
    console.log(typeof foo.pi)
    let result = foo.addNumbers(x,y)
    res.send(`Foo Add: ${x} + ${y} = ${result}`);
});

app.get('/sub/:x/:y', (req, res) => {
    let x = req.params.x
    let y = req.params.y
    console.log(typeof subtracting)
    console.log(typeof pii)
    let result = subtracting(x,y)
    res.send(`Bar Sub: ${x} - ${y} = ${result}`);
});

app.get('/multiply/:x/:y', (req, res) => {
    let x = req.params.x
    let y = req.params.y    
    console.log(typeof multiply)
    console.log(typeof pi)
    let result = multiply(x,y)
    res.send(`Baz Multiply: ${x} * ${y} = ${result}`);
});

app.get('/divide/:x/:y', (req, res) => {
    let x = req.params.x
    let y = req.params.y    
    console.log(typeof divide)
    console.log(typeof pi)
    let result = divide(x,y)
    res.send(`Qux divide: ${x} * ${y} = ${result}`);
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

### Method 1 - foo

```js:title=./local_functions/foo.js
function add(x, y) {
    inputs(x,y)
    return x + y;
}
  
function subtract(x, y) {
    inputs(x,y)
    return x - y;
}

function multiply(x, y) {
    inputs(x,y)
    return x * y;
}

function inputs(x, y) {
    console.log(`Inputs: x=${x}; y=${y}`)    
}

const pi = 3.14159;
  
module.exports = { addNumbers:add, subtract, multiply, pi };
```

### Method 2 - bar

```js:title=./local_functions/bar.js
// To require it as a function, it needs to be exported as a function
module.exports = function() { 
    this.adding = function(x, y) { 
        display(x,y)
        return x + y
    };
    this.subtracting = function(x, y) { 
        display(x,y)
        return x - y
    };
    this.multiplying = function(x, y) { 
        display(x,y)
        return x * y
    };
    this.display = function (x, y) {
        console.log(`Inputs: x=${x}; y=${y}`)    
    };      
    this.pii = 3.14159
}
```

### Method 3 - baz

```js:title=./local_functions/baz.js

module.exports.add = function (x, y) {
      return x + y;
    }
  
module.exports.subtract = function (x, y) {
      return x - y;
    }

module.exports.multiply = function (x, y) {
        return x * y;
    }

module.exports.inputs = function (x, y) {
        console.log(`Inputs: x=${x}; y=${y}`)    
    }
      
module.exports.pi = 3.14159
```

### Method 4 - qux

```js:title=./local_functions/qux.js
module.exports = {
    adding: function (x, y) {
        display(x,y)
        return x + y;
    },
  
    subtracting: function (x, y) {
        display(x,y)
        return x - y;
    },

    divide: function (x, y) {
        display(x,y)
        return x / y;
    },

    display: function (x, y) {
        console.log(`Inputs: x=${x}; y=${y}`)    
    },
      
    pii: 3.14159,
  };  
```

I sort of seem to like method 3 - baz approach.

* * * 

Thanks for reading
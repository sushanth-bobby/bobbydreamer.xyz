--- 
title: NodeJS Middlewares
date: 2022-08-08
description: Notes on Middlewares
tags: ['nodejs']
slug: "/146-nodejs-middlewares"
---

Middleware in ExpressJS are functions that come into play after the server receives the request and before the response is processed by the route and sent to the client. 

We can use middleware functions for different types of preprocessing tasks required for fulfilling the request like database querying, making API calls, preparing the response and also calling the next middleware function in the chain.

We call app.use() to add a middleware function to our Express application. Express executes middleware in the order they are added. 

#### Difference between Controllers Vs. Middleware ? 

1. Controllers - An entity that will actually respond to the requests.
2. Middleware  - A step in progression towards actioning your request. Middleware are often reused more than once in multiple routes and often they do not respond to request(respond by returning to client with some data). 

Middleware functions take three arguments: 
* the request object (request)
* the response object (response)
* optionally the next() middleware function. 

An exception to this rule is error handling middleware which takes an error object as the fourth parameter. The next() function is a function in the Express router that, when invoked, executes the next middleware in the middleware stack. If next() is not called, the request will be left hanging.

**Code:** [Available in GitHub](https://github.com/bobbydreamer/modularizing-nodejs/tree/routes-method1)

In the below example, we are adding a middleware which will be called for all routes
```js:title=index.js
/************************************************/
// Middleware - Simple request time logger
app.use((req, res, next) => {
    console.log(`${new Date().toLocaleString()} : ${request.method} url:: ${request.url}`);
    next();  
});
```

* * * 

In the below example, 
1. We are attaching the express.json() middleware by calling the app.use() function. It parses incoming requests with JSON payloads and is based on body-parser. We have also configured a maximum size of 100 bytes for the JSON request.
2. This middleware function will be called only for this route `/products`.

```js:title=index.js
// Attach the express.json middleware to route "/products"
app.use('/products', express.json({ limit: 100 }))

// handle post request for path /products
app.post('/products', (request, response) => {
  const products = []
  const name = request.body.name                
  const brand = request.body.brand
  const category = request.body.category
  
  console.log(name + " " + brand + " " + category)
  ...
})
```

You can make a POST request to http://localhost:3000/ with header set to *content-type: application/json* and body {"name":"furniture", "brand":"century", "price":1067.67}

* * * 

In the below example, the middleware checks if the request contains a json content

```js:title=index.js {5}
const requireJsonContent = (request, response, next) => {
  if (request.headers['content-type'] !== 'application/json') {
      response.status(400).send('Server requires application/json')
  } else {
    next()
  }
}

// handle post request for path /products
app.post('/products', requireJsonContent, (request, response) => {
  ...
  ...
  response.json(
    {productID: "12345", 
    result: "success")}
  );
})
```

* * * 

Another example, handle get request with 3 middleware functions
```js:title=index.js
app.get('/users', (request, response, next) => {
  console.log("Stage 1 processing ");
  next()
},
(request, response, next) => {
  console.log("Stage 2 processing ");
  next();
},
(request, response) => {
  response.send('response for GET request');
});
```

* * * 

In the next example, we can see multiple middleware functions are added to a route to preprocess in multiple stages. 
```js:title=index.js
// first function in the chain will check for JSON content
app.use('/products', requireJsonContent)

// second function will check for valid product category 
// in the request if the first function detects JSON 
app.use('/products',  (request, response) => {  
                           
     // Allow to add only products in the category "Electronics"
     const category = request.body.category
     if(category != "Electronics") {
      response.status(400).send('Server requires application/json')
     } else {
        next()
     }
   })

// handle post request for path /products
app.post('/products', 
  (request, response) => {  
                           
  ...
  ...
  response.json(
    {productID: "12345", 
    result: "success"})
  })
```

* * * 

In the below example, we add middleware for error handling
```js:title=index.js
/************************************************/
// Error handling Middleware functions
const errorLogger = (error, request, response, next) => {
  console.log( `error ${error.message}`) 
  next(error) // calling next middleware
}

const errorResponder = (error, request, response, next) => {
  response.header("Content-Type", 'application/json')
    
  const status = error.status || 400
  response.status(status).send(error.message)
}

const invalidPathHandler = (request, response, next) => {
  response.status(400)
  response.send('invalid path')
}

/************************************************/
// Routes
app.get('/products', async (request, response) => {
  try{
    const apiResponse = await axios.get("http://localhost:3001/products")
    const jsonResponse = apiResponse.data
    
    response.send(jsonResponse)
  }catch(error){
    next(error) // calling next error handling middleware
  }
})

// handle get request for path /
app.get('/', (request, response) => {
  response.send('response for GET request');
})

app.post('/products', requireJsonContent, (request, response) => {
  ...
})

app.get('/productswitherror', (request, response) => {
  let error = new Error(`processing error in request at ${request.url}`)
  error.statusCode = 400
  throw error
})

/************************************************/
// Error Handling
app.use(errorLogger)
app.use(errorResponder)

// Catch all invalid route middleware
app.use(invalidPathHandler)
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})
```

* * * 

Below is promise-based error handling
```js:title=index.js
app.get('/product',  (request, response, next) => {
 
    axios.get("http://localhost:3001/product")
    .then(response=>response.json)
    .then(jsonresponse=>response.send(jsonresponse))
    .catch(next)
})
```

* * * 

Thanks for reading
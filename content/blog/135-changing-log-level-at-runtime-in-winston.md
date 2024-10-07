---
title: Changing log level at runtime using Winston logger
date: 2021-12-13
description: Changing log level at runtime using Winston logger in NodeJS application
tags: ['nodejs']
slug: "/135-changing-log-level-at-runtime-in-winston"
---

Changing log level at runtime without restarting the node server is an interesting idea. Didn't see much posts on it but everywhere it was said, its doable. 

I am going to accomplish this using following techniques.     

1. Updates to the environment variables needs to be picked by Node Server
2. Changing the log level programatically in winston

### 1. Updating environment variables 

Below is the content of the environment file. We are going to change NEW_VALUE variable in this test, initially it has '*three*'.  

```sh:title=.env
PORT=4000
NEW_VALUE=three
```

Below is the simple Node Express program and '/' route has the code to update environment variables. Basically we are reading the .env file and initializing values to process.env variable in a loop. 

```js:title=app_envars.js {10-16}
// Express pickup updated environment variables
const express = require('express')
var dotenv = require('dotenv')

const app = express()

require('dotenv').config();

app.get('/', function (req, res) {
    const envConfig = dotenv.config().parsed;
    console.log(envConfig)
    for (let k in envConfig) {    
        process.env[k] = envConfig[k]  
    }    
    console.log(`Hello World ${process.env.PORT} - ${process.env.NEW_VALUE}`)
    res.send(`Hello World ${process.env.PORT} - ${process.env.NEW_VALUE}`)
})
 
app.listen(process.env.PORT)
```

Below is the console output
```sh
>node app_envars   
{ PORT: '4000', NEW_VALUE: 'three' }
Hello World 4000 - three
{ PORT: '4000', NEW_VALUE: 'four' }
Hello World 4000 - four
```

### 2. Changing the log level in Winston

Below is a simple NodeJS Winston program where log level is changed at runtime

```js:title=win1.js {20}
// Change the log level programatically
const winston = require('winston');

const transports = {
    console: new winston.transports.Console({ level: 'warn' }),
};

const logger = winston.createLogger({
    transports: [ 
        transports.console,
    ]
});

transports.console.level = 'info';
logger.info('Text Info');
logger.warn('Text Warn');
logger.error('Text error');
logger.debug('Text Debug 1');

transports.console.level = 'debug';
logger.debug('Text Debug 2');
```

Below is teh output, you can notice 'Text Debug 1' did not appear. But after changing log level to 'debug'. It shows up. 
```sh {5}
>node win1
{"level":"info","message":"Text Info"}
{"level":"warn","message":"Text Warn"}
{"level":"error","message":"Text error"}
{"level":"debug","message":"Text Debug 2"}
```

Logging levels in winston conform to the severity ordering specified by RFC5424: *severity of all levels is assumed to be numerically ascending from most important to least important.* When you set log level as *info*, you get all data above from *info* like error, warn and info. 

| Levels  | Numbers |
| ------- | --------|
| error   | 0 |
| warn    | 1 |
| info    | 2 |
| http    | 3 |
| verbose | 4 |
| debug   | 5 |
| silly   | 6 |

* * * 

In the below program, i am going to combine above two concepts together. 

Below is the main express program

```js:title=app.js
const express = require('express')
const dotenv = require('dotenv')
const path = require('path')

let {winston_logger, setLevel} = require('./winston-logger')
let logger = winston_logger();

dotenv.config({ path: path.resolve(__dirname, `./${process.env.NODE_ENV}.env`)});

if(process.env.NODE_ENV === 'development'){
    setLevel(process.env.LOG_LEVEL)
}else if(process.env.NODE_ENV === 'production'){
    setLevel(process.env.LOG_LEVEL)
}

// const dotenv = require('dotenv').config()

const app = express()
const port = 3000;

app.get('/', function (req, res) {
    res.send('Hello World '+process.env.LOG_LEVEL)
    console.log(`Started in ${process.env.NODE_ENV} mode`)

    logger.info('Text Info');
    logger.warn('Text Warn');
    logger.error('Text error');
    logger.debug('Text Debug');
});

app.get('/refresh', function (req, res) {
    // setLevel('debug')
    // const envConfig = dotenv.load().parsed;
    const envConfig = dotenv.config({ path: path.resolve(__dirname, `./${process.env.NODE_ENV}.env`)}).parsed;
    console.table(envConfig)
    for (let k in envConfig) {
        process.env[k] = envConfig[k]
        console.log(`Assigning : ${k} = ${envConfig[k]}`)
    }

    setLevel(process.env.LOG_LEVEL)
    res.send('Refreshed')
})


app.listen(port, () => {
    console.log(`Winston example app listening at http://localhost:${port}`)
})
```

Below program contains the funtions used in the above main program
```js:title=./winston-logger/index.js
const winston = require('winston')
const {format, createLogger} = require('winston');
const {timestamp, combine, printf, errors} = format;

const transports = {
    console: new winston.transports.Console({ level: 'info' }),
};

function setLevel(level){
    transports.console.level = level;
}

function winston_logger(){
    const logFormat = printf(({ level, message, label, timestamp, stack }) => {
    return `${timestamp} [${level}] ${stack || message}`;
});

return createLogger({
    // level: process.env.LOG_LEVEL,
    // format: winston.format.simple(),
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss'}),
        errors({ stack:true }),
        logFormat
    ),
    // defaultMeta: { service: 'user-service' },
    transports: [
        transports.console,
    ]
});

}

module.exports = {winston_logger, setLevel};
```

Data in environment files 
```sh
>cat development.env
LOG_LEVEL=debug
>cat production.env
LOG_LEVEL=info
```

Below is the output of the program and able to change the log level at runtime. 

![Express app execution](assets/135-app-js.png)


#### Thats all for now. Thanks for reading

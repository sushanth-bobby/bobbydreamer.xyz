--- 
title: Puppeteer - Most likely the page has been closed
date: 2023-08-23
description: Error - Session Closed. Most likely the page has been closed
tags: ['nodejs']
slug: "/151-puppeteer-headless-most-likely-the-page-has-been-closed-error"
---

Below is a small puppeteer program, it worked fine when `headless: false`. But it started failing when i changed `headless: 'new'`

```js:title=headless.js
const puppeteer = require('puppeteer');

(async () => {

    // Launch Puppeteer.
    const browser = await puppeteer.launch({
        headless: 'new',
    });
    const page = await browser.newPage();
    await page.goto('https://www.iana.org/help/example-domains');

    // Scrape all URLs 
    let linkObjs = await page.evaluate(() => {            
        let links = document.body.querySelectorAll('a')
        let linkArr = Object.values(links).map( x => {
            return {
                [x.innerText]: x.href
            }
        });
        return linkArr
    });
    console.log(linkObjs.length)
    console.log(linkObjs)

    await page.close();
    
    // Close browser.
    await browser.close();			

})();
```

Below is the error message
```sh
Protocol error (Network.setExtraHTTPHeaders): Session closed. Most likely the page has been closed.
```

Been trying to resolve this for nearly two days, looking into all the Github issues and stackoverlow. Man! resolving one error kept on leading to another error. 

Finally, went and asked **Bard**, couple of questions on this and it suggested to use xvfb. 

It gave a below simple program
```js:title=headless-.js
const puppeteer = require('puppeteer');
const Xvfb = require('xvfb');

(async () => {
    // Create an Xvfb instance.
    const xvfb = new Xvfb({
        width: 1024,
        height: 768,
    });
    await xvfb.start();

    // Launch Puppeteer.
    const browser = await puppeteer.launch({
        headless: 'new',
        xvfb: true,
    });
    const page = await browser.newPage();
    await page.goto('https://www.iana.org/help/example-domains');

    // Scrape all URLs 
    let linkObjs = await page.evaluate(() => {            
        let links = document.body.querySelectorAll('a')
        let linkArr = Object.values(links).map( x => {
            return {
                [x.innerText]: x.href 
            }
        });
        return linkArr
    });
    console.log(linkObjs.length)
    console.log(linkObjs)

    // Close Xvfb.
    await xvfb.stop();

    // Close browser.
    await browser.close();			

})();
```

Above code, first creates an Xvfb instance. Xvfb is a virtual X server that can be used to run headless browsers.

Once the Xvfb instance is started, Puppeteer can be launched with the xvfb: true option. This tells Puppeteer to use the Xvfb instance for rendering.

This resolved the issue, actually. 

* * *
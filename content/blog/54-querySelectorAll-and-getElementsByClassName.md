---
title: Difference between querySelectorAll and getElementsByClassName
date: 2020-12-23
description: Difference between querySelectorAll and getElementsByClassName
tags:
  - javascript
  - web-development
slug: "/54-querySelectorAll-and-getElementsByClassName"
---

From Javascript, both the methods can be used to return multiple elements in the document but the difference is in what it returns. 
* **.querySelectorAll** : **Non-Live node list** - Returns all the elements that matches the specified CSS selector(s) as a static NodeList object. 
* **.getElementsByClassName** : **Live node list** - Returns all the elements that matches the spcified CSS class name as a HTMLCollection. 

```js
var elements1 = document.querySelectorAll(".clickable"); 
var elements2 = document.getElementsByClassName("clickable"); 
```

`getElementsByClassName()` is useful when working with dynamic elements as its updated when the DOM changes. 

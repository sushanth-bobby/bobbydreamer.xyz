---
title: Add addEventListener on multiple elements with same class name
date: 2020-12-23
description: Adding EventListeners to multiple elements with same class name
tags:
  - javascript
  - web-development
slug: "/55-add-addEventListener-on-multiple-elements-with-same-class"
---

This is quite easy to understand in jQuery and works even if elements are dynamic. Here we are adding an common eventlistener to multiple elements having same class.

```js
    $('#contentHolder').on('click','.delete', function(){
        var temp = $(this).attr('id');
        let uid = temp.split(',')[0];
        let cat = temp.split(',')[1];
        let noteId = temp.split(',')[2];
        ...        
    });
```

There is a bit of hype going on using *pure* Javascript solutions. To do something similar like above in pure JS, you will have do something like this and here class name is `clickable`
```js {6}
    document.addEventListener('click',function(e){
        if(e.target && e.target.className== 'clickable'){
            //do something
            console.log('Hello '+e.target.id);
        }
    }, false);
```

* false meaning *bubble event propagation* will be used. Thats the default. 

There are two ways of event propagation in the HTML DOM, bubbling and capturing.

Event propagation is a way of defining the element order when an event occurs. If you have a `<p>` element inside a `<div>` element, and the user clicks on the `<p>` element, which element's "click" event should be handled first?

* In bubbling the inner most element's event is handled first and then the outer: the `<p>` element's click event is handled first, then the `<div>` element's click event.

* In capturing the outer most element's event is handled first and then the inner: the `<div>` element's click event will be handled first, then the `<p>` element's click event.

Syntax : `addEventListener(event, function, eventPropagationType);`    

Applicable values are
* false : Default. Uses bubbling propagation
* true (or) useCapture : Uses capturing propagation


### # References
* [JavaScript HTML DOM EventListener](https://www.w3schools.com/js/js_htmldom_eventlistener.asp)
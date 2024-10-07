---
title: JQuery - checkbox, calling functions and automatic passing of this
date: 2021-01-11
description: Snippet of calling function from jquery event listener and it automatically passes source of event using this
tags: ['jquery', 'javascript']
slug: "/75-jquery-checkbox-calling-functions"
---

Scenario : Say using JQuery, i am listening to events on a webpage under class `page > adminSwitch` and `page > premiumSwitch`. 

And whats new to me is, till this point i did'nt know with jQuery you can do something like this, say when we use `$(this)`, it means we are refering to the element that triggered the event. In that triggered function, we can use `$(this)` to refer to the element. What i didn't know is, we can call another function and don't have to pass `$(this)` to it as jQuery does this automatically and refer the element that triggered the event. 

```js
//jQuery will automatically invoke function with the proper context set 
//meaning no need to pass $(this).
$('.page').on('click', '.adminSwitch',  getSwitchValues);
$('.page').on('click', '.premiumSwitch', getSwitchValues);
```

This is the function `getSwitchValues` is defined before the above two statements. Notice the highlighted statement `$(this)` here refers to the toggle switch which triggered the event. 
```js {2,5}
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
```
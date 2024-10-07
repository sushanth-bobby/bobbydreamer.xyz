---
title: Adding Google Analytics to the site
date: 2020-03-16
description: Setting up Google Analytics for your website
tags:
  - gatsbyjs
  - web-development  
slug: "/google-analytics"
---

##### Note 
**Updated** : 2021-07-17    

This is outdated. This technique is pre-2021. New one is *gtag*. This [youtube video has clear instructions on setting up GatsbyJS & GA4](https://www.youtube.com/watch?v=Dwi99jtl3Fs) 

* * * 

Analytics, todays world is driven by it. People want to see graphs, beautiful dashboard, trendlines and from the look of it last decade is totally dedicated to evolution of Warehousing in IT, it went from Normal Data Warehousing to Data Lakes. Sort of looks like, purposefully all these Cloud providers and these startup developers, dumped their log data in their own format which only they can understand and they call it unstructured as there is no standard. Processing these logs itself is a business for many. 

Todays topic deals with the first part, sleepless nights and whats the purpose in life. Little analytics to know, is my website "Still a Ninja". I am expecting count of users to be 1(thats me). 

[Quote from wikipedia](https://en.wikipedia.org/wiki/Analytics)
> Analytics is the discovery, interpretation, and communication of meaningful patterns in data. It also entails applying data patterns towards effective decision making. In other words, analytics can be understood as the connection between data and effective decision making within an organization.


### Steps to setup Google Analytics

1. Go to [Google Analytics](https://analytics.google.com/) website

1. Click "Create account"
![](assets/05-GA1.png)

1. Enter account name
![](assets/05-GA2.png)

1. Choose "What do you want to measure ?" Web in my case as it a site. 
![](assets/05-GA3.png)

1. Enter property details like site name
![](assets/05-GA4.png)

1. Accept Google Analytics Terms of Service Agreement

1. Tracking ID can be seen on the right side of the screen. It can also be found in     
  `Admin -> Property section -> Tracking Info -> Tracking code`
![](assets/05-GA5.png)

1. Once you have the Tracking ID, you can add that to `gatsby-config.js` to get the statistics of your site. 
![](assets/05-GA6.png)

---
**Discovery mode ON**    

* *28/03/2020* : Till this point, i don't know what Google Analytics is and What kind of thing it does produce.

### # Resources 
1. [Gatsby - Adding Analytics](https://www.gatsbyjs.org/docs/adding-analytics/)

### # Related articles
1. [First set of custom changes made to this starter theme](23-shadowing-and-non-shadowing)
1. [Adding a Favicon](09-adding-favicon-to-gatsby)
1. [Changing default theme colors](19.changing-gatsby-colors-manually)
1. [Deploying & Hosting in Firebase](11-deploying-and-hosting-gatsby-site-in-firebase)

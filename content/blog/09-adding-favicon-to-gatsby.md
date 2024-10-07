---
title: Adding a favicon to gatsby site
date: 2020-03-20
description: Creating & Adding a logo to gatsby site
tags:
  - gatsbyjs
slug: "/adding-favicon-to-gatsby"
---

### # Making a logo

To setup logo, you need right know of tools. You will have those tools, if you are professional designer, but if you are not, you will be looking for online applications, where you can design online itself. One such application, i have found is [vectorpaint](https://vectorpaint.yaks.co.nz/). This is my logo, i have designed it completely in *vectorpaint*

![](assets/09-BD-Logo1.png)

Next thing to do is convert it to favicon, for that i used [favicon.io](https://favicon.io/favicon-converter/). Once you drag and drop the image, it will show you a small preview

![](assets/09-favicon0.png)

Click download, you will be getting a zip file with multiple files like below, 

![](assets/09-favicon1.png)

### # Setting up gatsby to display a favicon
1. Web app manifest is required to add favicon. Install gatsby-plugin-manifest, its not added by default in starter-blogs. Once installed verify it in ```package.json```
    ```sh
    npm install --save gatsby-plugin-manifest
    ```

1. Stop the development server, if its running. 

1. Update ```plugins:[]``` in gatsby-config.js to add the below, 
    ```js
        {
        resolve: `gatsby-plugin-manifest`,
        options: {
            name: `BobbyDreamer - Works of Sushanth Bobby Lloyds`,
            short_name: `bobby|dreamer`,
            description: `Sushanth Bobby Lloyds. Programming. Games. Music. Videos. Resume. Experiments.`,
            start_url: `/`,
            background_color: `#fff`,
            theme_color: `#6B46C1`,
            display: `standalone`,
            icons: [
            {
                src: `/favicon-32x32`,
                sizes: `32x32`,
                type: `image/png`,
            },
            {
                src: `/android-chrome-192x192.png`,
                sizes: `192x192`,
                type: `image/png`,
            },
            {
                src: `/android-chrome-512x512.png`,
                sizes: `512x512`,
                type: `image/png`,
            },
            ],
        }, 
        },
    ```
1. Restart the development server by ```gatsby develop```
1. Open the browser ```http://localhost:8000/``` and open inspect console and check for errors. For me i had wrong size mentioned in ```sizes:``` and updating and restarting it disappeared. 

![](assets/09-favicon2.png)

1. You see the favion by now. 

![](assets/09-favicon3.png)

### # Related articles
* [Changes to gatsby-config.js, hero and bottom](04-how-i-made-this-site)
* [Adding a Favicon](09-adding-favicon-to-gatsby)
* [Changing default theme colors](19.changing-gatsby-colors-manually)
* [Deploying & Hosting in Firebase](11-deploying-and-hosting-gatsby-site-in-firebase)

---
title: Migrating from GatsbyJS 2.16.2 to 3.9.0
date: 2021-07-16
description: Migration is a pain
tags: ['time-wasted', 'gatsbyjs']
slug: "/111-migrating-from-gatsbyjs3-to-gatsbyjs4"
---

**Update** : 2021/Oct/17    
1. Earlier title was misleading, it said *Migrating from GatsbyJS 3 to GatsbyJS4*, now i have corrected that and put in the right version. 

2. After upgrading Gatsby to 3.14.2 and [gatsby-theme-minimal-blog](https://github.com/LekoArts/gatsby-starter-minimal-blog) to commit `c40bd5e`, the slowness issue mentioned below is resolved. 

  **Note**: Not changing the link-name as it could lead to a 404. 
  
* * * 

Basically the intention was not to migrate but to add following features to the existing site and while executing Gatsby CLI commands saw there was a new version available. So why not ? thats how it started. 

1. Upgrade to Google Analytics 4 as i have been getting emails from Google - **Success**
2. Wanted to add Latex Support to the site as i wanted to showoff some math stuff - **Failed**
3. Add Table of Content plugin - **Failed**


#### What did i do

1. Upgraded NodeJS from v10.16.3 to v14.17.3 ( typical windows installation )
2. Upgraded NPM from 6.11.3 to 7.20.0
```
npm -g uninstall npm
npm -g i npm
```
3. Upgraded gatsby-cli from 2.16.2 to 3.9.0
```
npm -g uninstall gatsby-cli
npm -g i gatsby-cli
```
3. Created a new folder `bdv3g3`, went in and cloned     
   `git clone https://github.com/LekoArts/gatsby-starter-minimal-blog.git`

4. Went into the folder and did `npm install --legacy-peer-deps` as per instructions in README.md

5. After installs tried `gatsby develop --verbose` it failed with below messages. 

```sh
 ERROR #98124  WEBPACK

Generating development SSR bundle failed

Can't resolve '@reach/router/lib/utils' in 'D:\BigData\08. HTML\Gatsby\lupin\bdv3g3\gatsby-starter-minimal-blog\.cache'

If you're trying to use a package make sure that '@reach/router/lib/utils' is installed. If you're trying to use a local file make sure that the path is correct.  

File: .cache\find-path.js


 ERROR #98124  WEBPACK

Generating development SSR bundle failed

Can't resolve 'gatsby-link' in 'D:\BigData\08. HTML\Gatsby\lupin\bdv3g3\gatsby-starter-minimal-blog\.cache'

If you're trying to use a package make sure that 'gatsby-link' is installed. If you're trying to use a local file make sure that the path is correct.

File: .cache\gatsby-browser-entry.js


 ERROR #98124  WEBPACK

Generating development SSR bundle failed

Can't resolve 'gatsby-react-router-scroll' in 'D:\BigData\08. HTML\Gatsby\lupin\bdv3g3\gatsby-starter-minimal-blog\.cache'

If you're trying to use a package make sure that 'gatsby-react-router-scroll' is installed. If you're trying to use a local file make sure that the path is        
correct.

File: .cache\gatsby-browser-entry.js

not finished Building development bundle - 13.588s
```

6. Ran `npm outdated`
```sh {1}
D:\BigData\08. HTML\Gatsby\lupin\bdv3g3\gatsby-starter-minimal-blog>npm outdated
Package                              Current   Wanted  Latest  Location                                          Depended by
@lekoarts/gatsby-theme-minimal-blog    2.7.6    2.7.6   3.0.2  node_modules/@lekoarts/gatsby-theme-minimal-blog  gatsby-starter-minimal-blog
gatsby                               2.32.13  2.32.13   3.9.1  node_modules/gatsby                               gatsby-starter-minimal-blog
gatsby-plugin-feed                    2.13.1   2.13.1   3.9.0  node_modules/gatsby-plugin-feed                   gatsby-starter-minimal-blog
gatsby-plugin-gatsby-cloud             1.0.2    1.0.2   2.9.1  node_modules/gatsby-plugin-gatsby-cloud           gatsby-starter-minimal-blog
gatsby-plugin-google-analytics        2.11.0   2.11.0   3.9.0  node_modules/gatsby-plugin-google-analytics       gatsby-starter-minimal-blog
gatsby-plugin-manifest                2.12.1   2.12.1   3.9.0  node_modules/gatsby-plugin-manifest               gatsby-starter-minimal-blog
gatsby-plugin-netlify                 2.11.1   2.11.1   3.9.0  node_modules/gatsby-plugin-netlify                gatsby-starter-minimal-blog
gatsby-plugin-offline                 3.10.2   3.10.2   4.9.0  node_modules/gatsby-plugin-offline                gatsby-starter-minimal-blog
gatsby-plugin-sitemap                 2.12.0   2.12.0   4.5.0  node_modules/gatsby-plugin-sitemap                gatsby-starter-minimal-blog
```

7. Ran npm to update all the outdated packages forcefully like below to see what happens as i couldn't get any workable results even after couple of hours, googling and S.O
```sh
npm install @lekoarts/gatsby-theme-minimal-blog@latest gatsby@latest gatsby-plugin-feed@latest 
gatsby-plugin-gatsby-cloud@latest gatsby-plugin-google-analytics@latest gatsby-plugin-manifest@latest gatsby-plugin-netlify@latest gatsby-plugin-offline@latest gatsby-plugin-sitemap@latest --force
```
> NPM should develop an easy command to forcefully upgrade all the dependent packages

**After this forceful update, to my surprise, there were no errors.**

#### Now to the main goals
1. **Failed** : Wanted to add Latex Support to the site as i wanted to showoff some math stuff. Tried 
    * Plugins : gatsby-remark-katex
    * Plugins : gatsby-remark-mathjax
    * User [Sixian Li](https://github.com/Deerhound579/sixian.li) using the same starter pack has done it. Tried it out but it didn't work for me. 
    * Tried approach mentioned in [Gatsbyjs with MDX and Latex Equations](https://zhengchaotian.com/use-gatsbyjs-with-mdx-and-latex-equations/)
    * Read many other articles nothing worked. **Giving up**

2. **Success** : Upgrade to Google Analytics 4
    * Installed plugin `npm install gatsby-plugin-google-gtag` from [gatsby-plugin-google-gtag](https://www.gatsbyjs.com/plugins/gatsby-plugin-google-gtag)
    ```sh
    npm uninstall gatsby-plugin-google-analytics
    # Remove related section from gatsby-config.js -> plugins
    npm install gatsby-plugin-google-gtag
    # Update the code mentioned in the gatsby plugin site
    ```  
    * Watched this youtube video [GatsbyJS & GA4: Upgrading a Gatsby Site to Google Analytics 4](https://www.youtube.com/watch?v=Dwi99jtl3Fs)
    * Followed the instructions in the gatsbyJS website to get the new gtag configured. In the `gatsby-config.js`, need to add measurement id which needs to be retreived from Google Analytics site.

3. **Failed** : Add Table of Content plugin. Tried
    * [Table of Contents in Gatsby](https://www.gatsbyjs.com/plugins/gatsby-remark-table-of-contents/)
    * Read few other articles. **Giving up**

This whole thing wasted 2 days of my time. 

* * * 

##### Wish LekoArts adds following to this starter pack

* Latex support
* Table of Contents

* * * 

#### Gatsby Experience 3.9.0 

* `gatsby build --verbose` - Build time increased by 10mins. Earlier it was 10mins now its 22mins and taking lots of memory than usual enough to restart the computer. 

![Lots of Memory for simple site](assets/111-gatsby-mem2.png)

* `gatsby develop --verbose` - Every page click browsing within the site, is taking long time to process. Earlier it doesn't take time unless that page is updated. 

#### # Next steps after migrating
* [First set of custom changes made to this starter theme](23-shadowing-and-non-shadowing)
* [Changes to gatsby-config.js, hero and bottom](04-how-i-made-this-site)
* [Adding a Favicon](09-adding-favicon-to-gatsby)
* [Changing default theme colors](19.changing-gatsby-colors-manually)
* [Deploying & Hosting in Firebase](11-deploying-and-hosting-gatsby-site-in-firebase)

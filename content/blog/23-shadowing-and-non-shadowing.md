---
title: GatsbyJS - Shadowing
date: 2021-07-16
description: To make your site stand out, you have to make some custom changes 
tags:
  - web-development
  - gatsbyjs
slug: "/shadowing-and-non-shadowing"
---

> To make your site stand out from the default, you have to make some custom changes.    
> Just to let the world know, **"You have started"**

After migration, these are the first set of custom changes, i had made to the [gatsby-starter-minimal-blog](https://github.com/LekoArts/gatsby-starter-minimal-blog). In GatsbyJS, there are two types of custom changes *shadowing* and *non-shadowing*. Non-Shadowing is the NOT recommended one as it involves making changes to files in `node_modules` folder. So if you ugrade say like `npm install`. It will get overwritten. Lets see both of them one by one.

### Non-shadowing

[Shadowing is a neat concept in Gatsby](https://www.gatsbyjs.org/docs/themes/shadowing/). Here there are some rules, but they are not GatsbyJS rules but they are rules by LekoArts(theme makers). Basically you are allowed to override only certain folders and files.

> This feature allows users to replace a file in the src directory that is included in the webpack bundle with their own implementation. This works for React components, pages in src/pages, JSON files, TypeScript files, as well as any other imported file (such as .css) in your site.

**Note : ** You cannot override *gatsby-theme-minimal-blog-core* folder      
`gatsby-starter-minimal-blog\node_modules\@lekoarts\gatsby-theme-minimal-blog-core\src`     


1. Increasing number of posts list in home page
```js:title=bdv3g3\gatsby-starter-minimal-blog\node_modules\@lekoarts\gatsby-theme-minimal-blog-core\src\templates\homepage-query.tsx {4}
# Changed from default 3 to 7
export const query = graphql`
  query ($formatString: String!) {
    allPost(sort: { fields: date, order: DESC }, limit: 7) {
      nodes {
        slug
        title
        date(formatString: $formatString)
        excerpt
        timeToRead
        description
        tags {
          name
          slug
        }
      }
    }
  }
`
```

### Shadowing
All this starts with creating a folder called 'src' and after that create the below sub-folders. 

```sh
src
├───@lekoarts
│   └───gatsby-theme-minimal-blog        
└───pages
```

* From **src\@lekoarts\gatsby-theme-minimal-blog**, copy folders `components, hooks, styles, texts, gatsby-plugin-theme-ui` and `utils` from `gatsby-starter-minimal-blog\node_modules\@lekoarts\gatsby-theme-minimal-blog\src`
* **src\pages** should contain two files seo.js and 404.js otherwise there will be an error. 

Here are the first set of updates, 

1. Spacing updates ( reducing space between two elements ) 
    + Home page : Reducing the space between Latest posts and Home projects    
    `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\components\listing.tsx`

      ```ts
      From = <section sx={{ mb: [5, 6, 7] }} className={className}>
      To   = <section sx={{ mb: [3, 4, 5] }} className={className}>
      ```    
    + Home page : Reduce space between **Hi** and the message below it    
    `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\components\homepage.tsx`
      ```ts
      From = <section sx={{ mb: [5, 6, 7], p: { fontSize: [1, 2, 3], mt: 2 }, variant: `section_hero` }}>
      To   = <section sx={{ mb: [4, 5, 6], p: { fontSize: [1, 2, 3], mt: 2 }, variant: `section_hero` }}>
      ```

    + Home page : Enabling tags in Latest posts    
      ```ts
      From = <Listing posts={posts} showTags={false} />
      To   = <Listing posts={posts} showTags={true} />
      ```    

    + Home page : More space between multiple sections in the bottom    
    `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\components\list.tsx`

      ```ts
      #FROM 
            ul: { margin: 0, padding: 0},
            li: { listStyle: `none`, mb: 3 },

      #TO
            ul: { margin: 0, padding: 0, mb: 4 },
            li: { listStyle: `none`, mb: 2 },
      ```    

    + Blog page : Reducing the space between Header and "Blog" title    
      `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\components\header.tsx`

      ```ts
      From = <header sx={{ mb: [5, 6] }}>
      To   = <header sx={{ mb: [4, 5] }}>
      ```    

    + Blog page : "Blog" heading size
      `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\components\blog.tsx`

      ```ts
      From : <Heading as="h1" variant="styles.h1" sx={{ marginY: 2 }}>
      To   : <Heading as="h2" variant="styles.h2" sx={{ marginY: 2 }}>
      ```

    + Blog page : Updated space between "Blog" title and list items    
      ```ts
      From : <Listing posts={posts} sx={{ mt: [4, 5] }} />
      To   : <Listing posts={posts} sx={{ mt: [3, 4] }} />
      ```    

2. Code block font size updates

  Path : `src\@lekoarts\gatsby-theme-minimal-blog\styles\code.ts`     
  From : Default size
  ```ts
    ".prism-code": {
      fontSize: [1, 1, 2],
  ```

  To : Bit smaller. There is no decimal sizes like .7 or 1.5
  ```ts
    ".prism-code": {
      fontSize: [1, 1, 1],
  ```

  From : Inline code tag background, orginally it was almost white color
  ```ts
  "p > code, li > code": {
    bg: `gray.2`,
    color: `gray.8`,
  ```

  To : Now a bit darker color
  ```ts
  "p > code, li > code": {
    bg: `gray.5`,
    color: `gray.8`,
  ```

3. Blog page title sizes

  Path : `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\components\post.tsx`
  ```ts
  From : <Heading as="h1" variant="styles.h1"> {post.title} </Heading>
  To   : <Heading as="h2" variant="styles.h2"> {post.title} </Heading>
  ```

4. About_me, T.I.L, music, iRevere title sizes     

  Path : `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\components\page.tsx`
  ```ts
  From : <Heading as="h1" variant="styles.h1"> {post.title} </Heading>
  To   : <Heading as="h2" variant="styles.h2"> {page.title} </Heading>
  ```

5. Themes     

  Path : `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\gatsby-plugin-theme-ui\index.js`

  Under `colors:{ /** Add this ** / }`
  ```ts 
    modes: {
      light:{
        background: `#bddccc`, /* Background */        
        primary: `#7400b8`,    /* Alink posted color */
        secondary: `#ee4035`,   /* Alink top menu color */
        divide: tailwind.colors.purple[6], /* HR color */
      },      
      dark: {
        background: `#1e172c`,
        primary: `#fad141`,
        secondary: `#2ab7ca`,
        heading: `#ff0080`,
        toggleIcon: `#fdf498`,  
        text: tailwind.colors.gray[4],        
        divide: tailwind.colors.gray[6],
        muted: tailwind.colors.gray[8], /* HR color */
      },  
  ```

6. HR(horizontal rule) or dividers     

  Path : `gatsby-starter-minimal-blog\src\@lekoarts\gatsby-theme-minimal-blog\gatsby-plugin-theme-ui\index.js`

  Under `styles`
  ```ts
  From : 
    hr: {
      mx: 0,
    },

  To   : 
    hr: {
      mx: 0,
      height: `2px`, /* initially it was 1px. Increased it to 2px */
      backgroundColor: 'divide', /* to reflect the color of the theme */
    },  
  ```

All the above changes will get the primary look get better. Atleast to me. 

* * * 

### # Next Steps
* [Migrating from GatsbyJS 3 to GatsbyJS 4](111-migrating-from-gatsbyjs3-to-gatsbyjs4)
* [Changes to gatsby-config.js, hero and bottom](04-how-i-made-this-site)
* [Adding a Favicon](09-adding-favicon-to-gatsby)
* [Changing default theme colors](19.changing-gatsby-colors-manually)
* [Deploying & Hosting in Firebase](11-deploying-and-hosting-gatsby-site-in-firebase)


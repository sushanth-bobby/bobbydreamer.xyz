---
title: Upgrading gatsby site
date: 2020-10-02
description: Upgrading gatsby site, same theme different version
tags:
  - web-development
  - gatsbyjs
slug: "/43-upgrading-gatsby-site"
---

Today, when trying to make some posts and test via `gatsby develop`, saw few warnings and decided to do `npm update`. I think, that was the worst decision, i made this week. `npm update` failed in-between due to some deprecated packages and out-of-support stuff and after few failed attempts to correct things. Only option i was left with is to re-deploy [@lekoarts/gatsby-theme-minimal-blog](https://github.com/LekoArts/gatsby-themes/tree/master/themes/gatsby-theme-minimal-blog) and manually redo all the customizations again. Good thing i did last time is i had documented all the changes i had done, so, it was bit easy but even so, it took a day. 

### # Upgrading site ( codename : bdv32 ) 
1. Create new site `gatsby new bdv32 https://github.com/LekoArts/gatsby-starter-minimal-blog`
2. Update `gatsby-config.js` basically siteMetadata, plugins:options:navigation, externalLinks, google-analytics, gatsby-plugin-manifest(favicons)
3. Replace all the favicons images in `bdv32\static`
4. Setup customizations - In gatsby, certain files you can override by [shadowing technique](https://www.gatsbyjs.com/docs/themes/shadowing/#extending-shadowed-files) and certain files you cannot override( get error while executing `gatsby develop`), so have to make update to files in `node_modules`.    

  **Using shadow technique**    

    * Create new folder `src\@lekoarts\gatsby-theme-minimal-blog`. This is [overriding/shadowing](https://www.gatsbyjs.com/docs/themes/shadowing/#extending-shadowed-files) in gatsby themes. 
    * Copy folders components, hooks, styles, texts, utils from node_modules\@lekoarts\gatsby-theme-minimal-blog\src
    * Update hero.mdx & bottom.mdx in `src\@lekoarts\gatsby-theme-minimal-blog\texts`
    * Updating site theme colors. Below is the mapping based on experimenting
      ```
      background: page background
      primary: post links / selected text(this not working in this version)
      secondary: tags, header links
      heading: headings
      toggleIcon: light/dark mode
      ```

      Below are the updates and add-ins, i had made,
      ```js:title=bdv32\src\gatsby-plugin-theme-ui\index.js(diff)
        modes: {
      +    light:{
      +      background: `#d0e1f9`, /* Background */        
      +      primary: `#30157d`,
      +      secondary: `#ee4035`   /* Alink color */
      +    },      
          dark: {
      +-    background: `#1e172c`,
      +-    primary: `#fad141`,
      +-    secondary: `#2ab7ca`,
      +-    heading: `#ff0080`,
      +-    toggleIcon: `#fdf498`,  
            text: tailwind.colors.gray[4],
            divide: tailwind.colors.gray[8],
            muted: tailwind.colors.gray[8],
          },
        },
      ```
    * Spacing updates ( thought there were big gap between content & texts )    

      **Blog post** : Increasing space between H4 and previous element
      ```js:title=bdv32\src\gatsby-plugin-theme-ui\index.js {4}
      h4: {
        variant: `text.heading`,
        fontSize: [2, 3, 4],
        mt: 4,
      },
      ```

      **Home page** : Reducing the space between Latest posts and Home projects
      ```tsx:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\components\listing.tsx(diff) {3}
        const Listing = ({ posts, className = ``, showTags = true }: ListingProps) => (
      -   <section sx={{ mb: [5, 6, 7] }} className={className}>
      +   <section sx={{ mb: [3, 4, 5] }} className={className}>
            {posts.map((post) => (
              <BlogListItem key={post.slug} post={post} showTags={showTags} />
            ))}
          </section>
        )
      ```

      **Home page** : Enabling tags in Latest posts
      ```tsx:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\components\homepage.tsx(diff) {9}
      <Layout>
        <section sx={{ mb: [5, 6, 7], p: { fontSize: [1, 2, 3], mt: 2 } }}>
          <Hero />
        </section>
        <Title text="Latest Posts">
          <Link to={replaceSlashes(`/${basePath}/${blogPath}`)}>Read all posts</Link>
        </Title>
      - <Listing posts={posts} showTags={false} />
      + <Listing posts={posts} showTags={true} />
        <List>
          <Bottom />
        </List>
      </Layout>
      ```

      **Home page** : More space between multiple sections in the bottom
      ```tsx:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\components\list.tsx(diff) {6,8}
        const List = ({ children }: ListProps) => (
          <section
            sx={{
              mb: [5, 5, 6],
       -      ul: { margin: 0, padding: 0 },
       +      ul: { margin: 0, padding: 0, mb: 4 },       
       -      li: { listStyle: `none`, mb: 3 },
       +      li: { listStyle: `none`, mb: 2 },
              a: { variant: `links.listItem` },
            }}
          >
            {children}
          </section>
        )
      ```

      **Blog page** : Reducing the space between Header and Blog title
      ```tsx:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\components\list.tsx(diff) {6,8}
        const List = ({ children }: ListProps) => (
          <section
            sx={{
              mb: [5, 5, 6],
       -      ul: { margin: 0, padding: 0 },
       +      ul: { margin: 0, padding: 0, mb: 4 },       
       -      li: { listStyle: `none`, mb: 3 },
       +      li: { listStyle: `none`, mb: 2 },
              a: { variant: `links.listItem` },
            }}
          >
            {children}
          </section>
        )
      ```

      **Blog page** : Reducing the space between Header and Blog title
      ```tsx:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\components\list.tsx(diff) {3}
        return (
      -   <header sx={{ mb: [5, 6] }}>
      +   <header sx={{ mb: [4, 5] }}>
            <Flex sx={{ alignItems: `center`, justifyContent: `space-between` }}>
              <HeaderTitle />
              <ColorModeToggle isDark={isDark} toggle={toggleColorMode} />
            </Flex>
            <div
              sx={{
                boxSizing: `border-box`,
                display: `flex`,
                variant: `dividers.bottom`,
                alignItems: `center`,
                justifyContent: `space-between`,
                mt: 3,
                color: `secondary`,
                a: { color: `secondary`, ":hover": { color: `heading` } },
                flexFlow: `wrap`,
              }}
            >
              <Navigation nav={nav} />
              <HeaderExternalLinks />
            </div>
          </header>
        )
      ```

      **Blog page** : Updated space between "Blog" title and list items
      ```tsx:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\components\blog.tsx(diff) {11}
        return (
          <Layout>
            <SEO title="Blog" />
            <Flex sx={{ alignItems: `center`, justifyContent: `space-between`, flexFlow: `wrap` }}>
              <Heading variant="styles.h2">Blog</Heading>
              <TLink as={Link} sx={{ variant: `links.secondary` }} to={replaceSlashes(`/${basePath}/${tagsPath}`)}>
                View all tags
              </TLink>
            </Flex>
      -     <Listing posts={posts} sx={{ mt: [4, 5] }} />
      +     <Listing posts={posts} sx={{ mt: [3, 4] }} />
          </Layout>
        )
      ```

    * Updating table border
      ```js:title=bdv32\src\gatsby-plugin-theme-ui\index.js {12}
        table: {
          width: `100%`,
          my: 4,
          borderCollapse: `separate`,
          borderSpacing: 0,
          [[`th`, `td`]]: {
            textAlign: `left`,
            py: `4px`,
            pr: `4px`,
            pl: 0,
            borderColor: `primary`,
      +     borderBottomStyle: `dotted`,
      -     borderBottomStyle: `solid`,          
          },
        }
      ```

    * Inline code block    
      ```js:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\styles\code.ts(diff) {12}
        "p > code, li > code": {
      -   bg: `gray.2`,
      -   color: `gray.8`,
      +   bg: `rgb(1, 22, 39)`,
      +   color: `rgb(214, 222, 235)`,
          px: 2,
          py: 1,
          borderRadius: `2px`,
        },
      ```

  **Using non-shadow technique**    

    * Increasing post-count in home page( default was 3, now increased to 7)
      ```tsx:title=bdv32\node_modules\@lekoarts\gatsby-theme-minimal-blog-core\src\templates\homepage-query.tsx {3}
      export const query = graphql`
       query($formatString: String!) {
        allPost(sort: { fields: date, order: DESC }, limit: 7) {
         nodes {
      ```

5. Setup a new git repo for this version [Github:bdv32](https://github.com/bobbydreamer/bdv32)
  ```sh 
  git init
  git add .
  git commit -m "September 2020 Update 2 - New LekoArts theme version"
  git branch -M main
  git remote add origin https://github.com/bobbydreamer/bdv32.git
  git push -u origin main
  ```

6. Setup Firebase hosting, instructions are in [here](./deploying-and-hosting-gatsby-site-in-firebase)

### # Whats changed
* Changing the the background color of the selected text
  * Previous version
  ![files in folder](assets/43-sel-prev.png)  
  * Current version ( couldn't change the color, its coming as inverse)
  ![files in folder](assets/43-sel-new.png)  

* Font size in code block in the previous version it was bit smaller, now its bigger. Below are the differences found related to the size, decided to leave it as it is. 
  ```ts:title=bdv32\src\@lekoarts\gatsby-theme-minimal-blog\styles\code.ts(diff)
  ".prism-code": {
  -  fontSize: 1,
  -  padding: 3,
  +  fontSize: [1, 1, 2],
  +  padding: `2rem 1rem 1rem 1rem`,
  ```

* I am seeing this new warning message 
  ```sh
  warn Query takes too long:
  File path: D:/BigData/08. HTML/Gatsby/lupin/bdv32/node_modules/@lekoarts/gatsby-theme-minimal-blog-core/src/templates/post-query.tsx
  URL path: /gatsby-theme-features
  Context: {
      "slug": "/gatsby-theme-features",
      "formatString": "DD.MM.YYYY"
  ```

### # References
1. [First set of custom changes made to this starter theme](23-shadowing-and-non-shadowing)
1. [Adding a Favicon](09-adding-favicon-to-gatsby)
1. [Changing default theme colors](19.changing-gatsby-colors-manually)
1. [Deploying & Hosting in Firebase](11-deploying-and-hosting-gatsby-site-in-firebase)

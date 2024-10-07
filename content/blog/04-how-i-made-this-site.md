---
title: How i made this site
date: 2020-03-15
description: How i made this site
tags:
  - web-development
  - gatsbyjs
slug: "/how-i-made-this-site"
---

One fine day, i decided to make a new version of my site and thats because of my new acquired knowledge and successful little tests. I have a plan to accomplish this but this project is not time bound like nobody is eagerly waiting for it except me. 

The plan is very simple, "I want to build a site" and in the address bar, i don't want to see .html when the page is displayed. I want to make content and maintain consistent look across the site. Content can be stored in .json or markdown or even better in Firebase storage. Most importantly appearance has to be awesome. 

**Solutions**    

1. There are many solutions to this like [.htaccess](https://www.youtube.com/watch?v=-6LyG9I-FPc), but to me better one is running the application written in NodeJS with Express.
1. To maintain consistency, i can use NodeJS template engines like EJS, PUG, Handlebars, etc... 
1. Data can be retreived from Firebase / Firestore or Firebase storage, think on pricing, coding and how often will you use this. 
1. Awesome appearance. hmmm, get a list of things you want to have and prepare of list of essential things/must have sort of. 

Next few months, mostly i have been working on the requirements, you know the *The Awesome Appearance*, actually was alot occupied at work, so mostly i was just making notes and saving links in [Stash](http://stash.bobbydreamer.com/). And one fine day, i decided i should put a end to all this and make the site and like all successful Software products, there should be a plan/strategy to do this. Honestly to say, i didn't go step by step, i was working parallely in all stages at different times like changing designs and steps based on feasibility. 

This is the thing, **THE SDLC**

| N  | Stages                                   | Activity |
| -- | ---------------------------------------- | ---- |
| 1  | [Plan](/things-that-my-new-site-should-have) | Collectors item / All amazing fancy stuff  |
| 2  | [Define](/epiphany-moment)  | Epiphany Moment. Its going to be a plain content site, nothing else. (PERIOD) |
| 3  | Design | You are here, this is the final product. Next 3 stages are repetitive |
| 4  | Build | Started to add some content here |
| 5  | Test | This is a test till break stage. If it breaks, go back to stage (3)/(4) depending on the issue. If it does not break, then you are in UAT/Pre-PROD zone. Do the final testing. If all OK, move to next stage. |
| 6  | [Deploy](/deploying-and-hosting-gatsby-site-in-firebase) | Truly a ninja moment, nobody knows that this site exists, but it does |
| 7  | Maintenance | Add more content |

### # Installing Gatsby and a starter theme
1. Install NodeJS 

1. Install Gatsby CLI
  ```sh noLineNumbers
  npm install -g gatsby-cli
  ```

1. Go to the github site [Gatsby Starter: Minimal Blog](https://github.com/LekoArts/gatsby-starter-minimal-blog)

1. Open your VS Code and create a new folder 
  ```sh noLineNumbers
  mkdir lupin
  cd lupin
  ```

1. Use gatsby CLI to install the starter template. It will take around 5mins or so to finish(in my system)
  ```sh noLineNumbers
  gatsby new bdv3g4 https://github.com/LekoArts/gatsby-starter-minimal-blog
  -- or
  git clone https://github.com/LekoArts/gatsby-starter-minimal-blog
  cd gatsby-starter-minimal-blog
  -- or 
  git clone https://github.com/LekoArts/gatsby-starter-minimal-blog bdv3g4
  cd bdv3g4

  -- If you use npm 7 or above use the `--legacy-peer-deps` flag
  npm install --legacy-peer-deps
  ```

1. Start the template site. 
  ```sh noLineNumbers
  gatsby develop --verbose
  ```
   What `gatsby develop` does is, runs the server in the background, enables useful features like live reloading and Gatsby's GraphQL to query pages & attributes.

1. Visit the site `http://localhost:8000/` in browser of your choice. 

### # Starting the custom changes

After seeing the site working. First change we will be making is in `gatsby-config.js` and i have highlighted the updated lines
  ```json:title=gatsby-config.js {7-13,21-40,43-50,75-77,162-173}
  require(`dotenv`).config()

  const shouldAnalyseBundle = process.env.ANALYSE_BUNDLE
  // const googleAnalyticsTrackingId = process.env.GOOGLE_ANALYTICS_ID

  module.exports = {
    siteMetadata: {
      siteTitle: `bobby_dreamer`,    
      siteTitleAlt: `BobbyDreamer - Works of Sushanth Bobby Lloyds`,
      siteHeadline: `Personal website of Sushanth Bobby Lloyds`,
      siteUrl: `https://www.bobbydreamer.com`,
      siteDescription: `Sushanth Bobby Lloyds. Programming. Experiments. Wealth. Music. Bio.`,
      author: `Sushanth Bobby Lloyds`,    
    },
    plugins: [
      {
        resolve: `@lekoarts/gatsby-theme-minimal-blog`,
        // See the theme's README for all available options
        options: {
          navigation: [
            {
              title: `about_me`,
              slug: `/bio`,
            },          
            {
              title: `blog`,
              slug: `/blog`,
            },
            {
              title: `T.I.L`,
              slug: `/til`,
            },
            {
              title: `music`,
              slug: `/music`,
            },
            {
              title: `iRevere`,
              slug: `/irevere`,
            },
          ],
          externalLinks: [
            {
              name: `Github`,
              url: `https://github.com/bobbydreamer`,
            },
            {
              name: `LinkedIn`,
              url: `https://www.linkedin.com/in/sushanth-bobby-lloyds/`,
            },
          ],
        },
      },
      {
        resolve: `gatsby-omni-font-loader`,
        options: {
          enableListener: true,
          preconnect: [`https://fonts.gstatic.com`],
          interval: 300,
          timeout: 30000,
          // If you plan on changing the font you'll also need to adjust the Theme UI config to edit the CSS
          // See: https://github.com/LekoArts/gatsby-themes/tree/master/examples/minimal-blog#changing-your-fonts
          web: [
            {
              name: `IBM Plex Sans`,
              file: `https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap`,
            },
          ],
        },
      },
      `gatsby-plugin-sitemap`,
      {
        resolve: `gatsby-plugin-manifest`,
        options: {
            name: `BobbyDreamer - Works of Sushanth Bobby Lloyds`,
            short_name: `bobby|dreamer`,
            description: `Sushanth Bobby Lloyds. Programming. Experiments. Wealth. Music. Bio.`,
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
      `gatsby-plugin-offline`,
      `gatsby-plugin-gatsby-cloud`,
      `gatsby-plugin-netlify`,
      {
        resolve: `gatsby-plugin-feed`,
        options: {
          query: `
            {
              site {
                siteMetadata {
                  title: siteTitle
                  description: siteDescription
                  siteUrl
                  site_url: siteUrl
                }
              }
            }
          `,
          feeds: [
            {
              serialize: ({ query: { site, allPost } }) =>
                allPost.nodes.map((post) => {
                  const url = site.siteMetadata.siteUrl + post.slug
                  const content = `<p>${post.excerpt}</p><div style="margin-top: 50px; font-style: italic;"><strong><a href="${url}">Keep reading</a>.</strong></div><br /> <br />`

                  return {
                    title: post.title,
                    date: post.date,
                    excerpt: post.excerpt,
                    url,
                    guid: url,
                    custom_elements: [{ "content:encoded": content }],
                  }
                }),
              query: `
                {
                  allPost(sort: { fields: date, order: DESC }) {
                    nodes {
                      title
                      date(formatString: "MMMM D, YYYY")
                      excerpt
                      slug
                    }
                  }
                }
              `,
              output: `rss.xml`,
              title: `Minimal Blog - @lekoarts/gatsby-theme-minimal-blog`,
            },
          ],
        },
      },
      shouldAnalyseBundle && {
        resolve: `gatsby-plugin-webpack-bundle-analyser-v2`,
        options: {
          analyzerMode: `static`,
          reportFilename: `_bundle.html`,
          openAnalyzer: false,
        },
      },
      {
        resolve: `gatsby-plugin-google-gtag`,
        options: {
          // You can add multiple tracking ids and a pageview event will be fired for all of them.
          trackingIds: [
            "G-6X2JSPJ1WR", // Google Analytics
          ],
          // This object is used for configuration specific to this plugin
          pluginConfig: {
            // Puts tracking script in the head instead of the body
            head: true,
          },
        },
      },       
    ].filter(Boolean),
  }
  ```

#### Changes to home page 
* Updating the text in homepage banner. Its in a file called `hero.mdx`. It needs to be replaced with below content. 
    ```text:title=src/@lekoarts/gatsby-theme-minimal-blog/texts/hero.mdx
    <Text sx={{ fontSize: [3, 4, 5], fontWeight: `bold`, color: `heading` }}>
      Hello, I am Sushanth.
    </Text>

    Welcome to my site. 

    I am a mainframe Db2 DBA. Yep, mainframe is still there and as usual its highly scalable, highly available and highly secured. 

    If you don't know what mainframe is, you should see [this](https://www.youtube.com/watch?v=ar0xLps7WSY), this is how our work environment looks like. 

    [This](01-hello-world) site is my sandbox, probably will contain collection of my unorganized programming notes, things i learned doing some home projects, fav. music, self development, notes taken while watching youtube videos, etc., more or less.  

    **Thanks**
    ```

* Updating the "Projects" section of the homepage which is in the bottom after "Latest Posts". 
    ```text:title=src/@lekoarts/gatsby-theme-minimal-blog/texts/bottom.mdx
    <Title text="Home Works" />

    - [Db2 Notes](105-db2-notes)
    - [Working the djinn](42-working-the-djinn)
    - [Quest for Wealth - Value Investor Education](40-wealth-education)
    - [Side projects](36-side-projects)
    - [Notes from Tedx](37-tedx)
    - [Site Reliability Engineering](53-sre-references)
    - [Stock market terms](112-stock-market-terms)
    - [Shortcuts and commands](74-shortcuts-and-commands)
    ```

#### Primary Content  

Primary are contents are pages which appears in the page header. For this site, i have decided to have below pages, for now

+ **bio** - Possibly going to be a long resume
+ **blog** - This is where the articles will be listed. 
+ **TIL**(Today i learned) - Snippets, life lessons, plans, ideas, todos, bucket list, etc. 
+ **music** - My Fav music from Spotify. 
+ **iRevere** - People, whom i followed/follow and get inspiration from. According to me they are the best in what they do. 


**Steps to add new primary content**   

1. Create a new folder inside `content/pages` like bio, blog, TIL, music and irevere
1. Create a new `index.mdx` file
  ![content/pages](assets/04-content-pages.png)  
1. In `index.mdx` write your frontmatter(title, slug) and content
  ![Page/Frontmatter](assets/04-page-frontmatter.png)  

##### Adding new post

Posts are blog posts (or) articles and they can be added by creating folders/files inside `content/posts` folder.

1. Create a new folder inside `content/posts`

1. Create a new `index.mdx` file
  ![content/posts](assets/04-content-posts.png)

1. In `index.mdx` write your frontmatter(title, date, description, tags and slug) and content below it
  ![Post/Frontmatter](assets/04-post-frontmatter.png)

### # Test 

Testing is quite simple. All you need to do is to type the below command, this will start a development server in your machine and watch for changes and refresh the site(just like nodemon)
```sh 
gatsby develop --verbose
```

Below will be the output of the above command 
```sh 
PS D:\BigData\08. HTML\Gatsby\lupin\bdv2> gatsby develop
success open and validate gatsby-configs - 0.271s
success load plugins - 4.072s
success onPreInit - 0.030s
success initialize cache - 0.040s
success copy gatsby files - 0.275s
success onPreBootstrap - 0.039s
success createSchemaCustomization - 0.024s
success source and transform nodes - 1.319s
success building schema - 1.080s
success createPages - 0.280s
success createPagesStatefully - 0.237s
success onPreExtractQueries - 0.015s
success update schema - 0.101s   
success extract queries from components - 1.142s
success write out requires - 0.460s
success write out redirect data - 0.029s
success Build manifest and related icons - 0.027s
success onPostBootstrap - 0.104s
⠀
info bootstrap finished - 18.945 s
⠀
success run queries - 0.183s - 3/3 16.38/s
warn "typescript" is not installed. Builtin ESLint won't be working on typescript files.
⠀
You can now view bobby_dreamer in the browser.
⠀
  http://localhost:8000/
⠀
View GraphiQL, an in-browser IDE, to explore your site's data and schema
⠀
  http://localhost:8000/___graphql
⠀
Note that the development build is not optimized.
To create a production build, use gatsby build
⠀
success Building development bundle - 13.618s
```

You can browse your test site in `http://localhost:8000/`

Sometimes during testing, thing might not work as expected, during those times, *Keep calm and run* `gatsby clean` and then `gatsby develop` again, to see if this worked. 
```sh 
PS D:\BigData\08. HTML\Gatsby\lupin\bdv2> gatsby clean
info Deleting .cache, public
info Successfully deleted directories
```

### # Advantages / Disadvantages of this theme
**Advantages**    

1. Code block - You can highlight specific code lines in a code block, turn on/off line numbers, can mention programming language name and title
1. Blog page will be updated with the list of all the posts in descending order. If post doesn't appear, basically means that .mdx file has issues. Check the VSCode console for any error messages. 
1. Has Dark mode
1. Blog posts have tags
1. Images get optimized properly and images have shadow glowing effect

**Disadvantages**    

1. [Gatsby Markdown MDX](https://www.gatsbyjs.org/docs/mdx/markdown-syntax/) - Regular markdown supports HTML codes but MDX doesn't. Eg:- line breaks `<br>`
1. Making custom changes to the code, you have to be an expert going through codes in ```node_modules``` folder and sub-folders. 
  ```sh 
  @lekoarts\gatsby-theme-minimal-blog-core
  @lekoarts\gatsby-theme-minimal-blog
  ```
1. [Gatsby Shadowing](https://www.gatsbyjs.org/docs/themes/shadowing/), sometimes it works and sometimes it doesn't. Its a great feature, by the way. 

### # Conclusion
 **Does it fit the purpose ?**    
Yes. I wanted a simple site to dump my learnings, an online archive, wanted it to be fast, responsive with tagging & code highlighting capabilities for posts. This particular gatsby theme has all of it and more, which i am still exploring. 

### # Next steps 
1. [First set of custom changes made to this starter theme](23-shadowing-and-non-shadowing)
1. [Adding a Favicon](09-adding-favicon-to-gatsby)
1. [Changing default theme colors](19.changing-gatsby-colors-manually)
1. [Deploying & Hosting in Firebase](11-deploying-and-hosting-gatsby-site-in-firebase)


**Thank you very much for reading the post**!


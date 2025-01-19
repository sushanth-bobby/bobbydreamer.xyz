---
title: Migrating from Gatsby to Quartz
date: 2024-11-21
description: Hosting Quartz SSG in Firebase
tags:
  - firebase
  - web-development
  - deployment
slug: /152-gatsby-to-quartz
---

## Why migrate from Gatsby ? 

Earlier i was using Gatsby with starter theme made by LekoArts - [LekoArts/gatsby-starter-minimal-blog](https://github.com/LekoArts/gatsby-starter-minimal-blog) . Initially Gatsby was excellent, it was seriously fast in building the site and site also loaded very fast in the internet. But when the number of pages crossed 130, it started to slow down in my PC. After upgrading my PC, I encountered few issues with Gatsby and NodeJS, which breaks the Gatsby CLI and had down-level NodeJS version for it to work which affected my other works. 

## Hunt for new Static Site Generator

I started [here (Awesome Static Web Site Generators)](https://github.com/myles/awesome-static-generators) and went down checking each of the SSG's whether its suitable for my requirement. My requirement is simple. 
1. It should support Markdown
2. Should support Coding, Code Highlighting, Blog Listing with date, tags for pages and frontmatter in each markdown files. Basically was looking for everything that my earlier site had. 
3. Should allow custom changes but it shouldn't too technical

Quartz looked simple and site was fast, checked few sites of current users, they had lots of content, so i thought it should be fine and started to test it.

One more thing about using Quartz is all the users were using [Obsidian](https://obsidian.md/)software for taking notes. So, that's one more thing, i had to start to use.

### Setting up Quartz

[Quartz 4](https://quartz.jzhao.xyz/) *Getting started* had all the documentation to start testing

### Setup
```
git clone https://github.com/jackyzha0/quartz.git
cd quartz
npm i
```
**Note:** Ignore the messages in npm regarding fixes

### Testing
```
-- Testing with docs which comes with Quartz
npx quartz build --serve -d docs

-- Testing with own markdown files
npx quartz build --serve
```
This should start in `http://localhost:8080/`

### Building
```
npx quartz build
```
All outputs should come to `public` directory

## Folder Structure

There was a huge difference in folder structure between *Gatsby site* and  *Quartz*

In Gatsby, `content` folder looks like this. Two sub-folders `pages` and `posts`. 
* Posts has all the blog data. Each blog page is a sub-folder in it and `index.mdx` contains the content and images used in the blog are saved in the same folder.
* Pages has the sub-folders related to the main top links.
```
+---pages
¦   +---bio
¦   ¦       index.mdx
¦   ¦       
¦   +---irevere
¦   ¦       index.mdx
¦   ¦       
¦   +---til
¦           index.mdx
¦           ListBucketResult.PNG
¦           
+---posts
    +---100-qfw-yen-liow
    ¦       index.mdx
    ¦       munger-partnership.png
    ¦       pareto-rule.png
    ¦       yen-liow-the-path.png
    ¦       yen-liow.png
    ¦       
    +---101-bob-sutton-outwit-workplace
    ¦       bob-sutton-damage-done.png
    ¦       bob-sutton-deb.png
    ¦       index.mdx
```

In quartz, the folder structure is like below.
* `.obsidian` is a obsidian software folder as i have opened Obsidian vault right here. 
* `assets` contain all the images
* `blog` contain all the blog post markdown files. 
* `pages` contain the top links

```
+---.obsidian
¦       app.json
¦       appearance.json
¦       core-plugins-migration.json
¦       core-plugins.json
¦       workspace.json
¦       
+---assets
¦       01-hello-world.jpg
¦       02-image001.png
¦       .....
+---blog
¦       01-hello-world.md
¦       02-host-site-from-google-storage.md
¦       164-psychological-mind-traps.md
¦       
+---pages
        about_me.md
        irevere.md
        til.md
```

This is not an easy move i thought, it would be, there was a little bit of migration work need to be carried out,
* `.mdx` files need to renamed to `.md` files and moved to `blog` folder
* All the images need to be moved to `assets` folder and image links need to point to `assets` folder.
* All the internal links would have a relative folder path that need to be changed as well as all files are in same `blog` folder in quartz

Wrote a python program to handle above things. Luckily there is no change to FrontMatter in each .md file.

## Custom Configuration Changes

*Note:* Documentation related to usage of quartz is available in `./docs`

 * Updated `\quartz.layout.ts` : Moved darkMode from left to right

* Moving entire site little up
	* Updated `\quartz\styles\variables.scss` - `topSpacing:` from 6rem to 3rem

* linksHeader - Inspired from 
	* `https://notes.camargomau.com/` 
	* `https://github.com/camargomau/notkesto-site`
	
	 * Added `quartz/components/styles/linksHeader.scss`
	 * Added `quartz/components/LinksHeader.tsx`
	 * Updated `quartz/components/index.ts` to include Linksheader
	 * Updated `\quartz.layout.ts` : Initialize variable sharedPageComponents with `header: [Component.LinksHeader()],`
	 * Updated `\quartz\styles\variables.scss` - to include `$mobileBreakpoint: 600px;`

* Recent Notes - Squeeze
	* Updated - `\quartz\components\styles\recentNotes.scss` - From 1rem to 0.5rem
	* `.recent-notes>ul.recent-ul>li { margin: 0.5rem 0;`

* Custom CSS oneCompiler wrapper
	* Code added in `template\quartz\styles\custom.scss`

* Mermaid text labels had issues when theme changed to light mode, it still appeared gray
	* Added css in `custom.scss`

## Hosting Quartz in Firebase - Part 1

After [[#Testing]] and [[#Building]], time to deploy in Firebase Hosting

1. Update/Install NPM tools - `npm install -g firebase-tools`

2. Firebase CLI Login - `firebase login`
   - if already logged in, you can `firebase logout` and login for reauthentication

3. List the existing projects to verify name - `firebase projects:list`

```shell
√ Preparing the list of your Firebase projects
┌──────────────────────┬──────────────┬────────────────┬──────────────────────┐
│ Project Display Name │ Project ID   │ Project Number │ Resource Location ID │
├──────────────────────┼──────────────┼────────────────┼──────────────────────┤
│ bdxyz                │ bdxyz-000001 │ 319373000080   │ us-central           │
└──────────────────────┴──────────────┴────────────────┴──────────────────────┘

1 project(s) total.
```

To test the site in firebase locally,
```sh
firebase serve --only hosting
```

Site displayed, but it wasn't working as expected at all. 

Tried to deploy and see and same result as local, 
```shell
firebase deploy -m "Nov 2024 : Update 1"
```

After a bit of research, one thing i got to know is, i cannot host the site directly from Firebase as i did for Gatsby. So, the next available option is App Engine or Cloud Run. 

I have used both and i wanted to try this Cloud Run. 

## Need for a web server

After `npx quartz build`, all the .html files are in the `public` folder and we need a web server to serve these files. While Nginx & Apache are currently the most popular web servers, decided to go with **Caddy**, as i saw an easy example in the web and documentations were easy to understand.  There is no installation in the local windows, its just one .exe file which you have point in PATH in environment variables. 

Added below Caddyfile in the root directory
```Caddyfile
:8080 {
    root * /srv
    try_files {path} {path}.html {path}/ =404
    file_server
    encode gzip

    handle_errors {
        rewrite * /{err.status_code}.html
        file_server
    }
}
```

Explanation for above code,
1. This line specifies that the server should listen on port 8080.
2. Sets the root directory for the site to `/srv`. 
3. try_files
	- Attempts to serve the file at the requested path (`{path}`).
    - If that fails, it tries to serve `{path}.html`.
    - If that fails, it tries to serve `{path}/`.
    - If none of these exist, it returns a 404 error.
4. Enables the file server, which serves files from the root directory.
5. Enables gzip compression for the files being served, which can improve load times for the users.
6. handle_errors
	- This block defines custom error handling.
	- When an error occurs, it rewrites the URL to a specific error page based on the status code (like [404.html](https://404.html) for a 404 error).
	- - Serves the rewritten error page using the file server.

**For development**, local testing you can below `development.caddyfile`
```
:8080 {
	root * ./public
	try_files {path} {path}.html {path}/ =404
	file_server
	encode gzip

	handle_errors {
		rewrite * /{err.status_code}.html
		file_server
	}
}
```
Note: Line 2 - Here we are pointing to the build folder `public`

You can use below command in `cmd` to test in local system
```
caddy run --config "development.caddyfile"
```

## Cloud Run is all Containers

Cloud Run is a managed compute platform that lets you run containers directly on top of Google's scalable infrastructure.

So, we need `Dockerfile` to build and run the site. 

```Dockerfile
#### STAGE 1: Use the official lightweight Node.js image.
# https://hub.docker.com/_/node
FROM node:20-slim as build

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure copying both package.json AND package-lock.json (when available).
# Copying this first prevents re-running npm install on every code change.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy local code to the container image.
COPY . ./

# Build
RUN npx quartz build


#### STAGE 2: Caddy image
FROM caddy:2.7-alpine

# Copy the static files from the 'public' directory to /src
COPY --from=build /usr/src/app/public /srv

COPY --from=build /usr/src/app/Caddyfile /etc/caddy/Caddyfile

# Expose port 8080
EXPOSE 8080
```

This is a two-stage Docker Build, 
1. Build the static website using Quartz
2. Copy the built site and Caddyfile and serve the site using Caddy image.

Thing to notice here is, 
* `COPY --from=build /usr/src/app/public /srv`
	* Build files are copied from `/usr/src/app/public` to `/srv`
* `root * /srv`
	* In Caddy([[#Need for a web server]]), we have said to serve from `/srv`
* Above both the points should link/match-up for the to work.

After all the above is done, proceed to next step
## Deploying the site in Cloud Run

This is a manual approach
* After your testing, push all the latest changes to GitHub
* Login into Google Cloud Platform
* Open Cloud Shell and enter below commands

```shell
-- Initial Cleanup
rm -rf .npm
rm -rf .docker

-- Run and Authorize the response
gcloud auth list

gcloud config list project
gcloud config set project bdxyz-000001
echo $GOOGLE_CLOUD_PROJECT

gcloud config set compute/zone asia-south1
```

Test the site locally in GCP Cloud Shell
```shell
git clone https://github.com/sushanth-bobby/bobbydreamer.xyz.git

cd bobbydreamer.xyz
npm i

npx quartz build --serve
```

Once the site is tested. Build it.
```
npx quartz build

gcloud services enable cloudbuild.googleapis.com

gcloud builds submit --tag gcr.io/${GOOGLE_CLOUD_PROJECT}/bdxyz:1.0.0 .

gcloud run deploy --image=gcr.io/${GOOGLE_CLOUD_PROJECT}/bdxyz:1.0.0 --platform managed --allow-unauthenticated
```

Note: If the user executing above commands have full Admin access, its fine. Otherwise to allow site to be accessed by allUsers, invoker role needs to be added. 
* IAM --> Grant Access
* Eg:- Add Principal=bob@bobbydreamer.xyz --> Role=Cloud Run -> Cloud Run Admin

Proceed to execute below commands in Cloud Shell,  
```shell
gcloud run services add-iam-policy-binding --region=asia-south1 --member=allUsers --role=roles/run.invoker bdxyz

-- Execution Output
bobby@cloudshell:~/bobbydreamer.xyz (bdxyz-000001)$ gcloud beta run services add-iam-policy-binding --region=us-central1 --member=allUsers --role=roles/run.invoker bdxyz
Updated IAM policy for service [bdxyz].
bindings:
- members:
  - allUsers
  role: roles/run.invoker
etag: BwYm8YgxT_=
version: 1
```

Check the Cloud Run Service
```shell
gcloud run services list

-- Usage
bobby@cloudshell:~ (bdxyz-000001)$ gcloud run services list
✔
SERVICE: bdxyz
REGION: asia-south1
URL: https://bdxyz-319373831080.asia-south1.run.app
LAST DEPLOYED BY: bob@bobbydreamer.xyz
LAST DEPLOYED AT: 2024-11-15T11:16:00.966897Z
```

## Cleanup
If you don't clean-up Cloud Shell, you might get billed for it. So cleanup in both the cases, 
* After successful deployment
* After unsuccessful deployment as well to retry after corrections

Below are the cleanup commands,
```shell
# Delete Container Registry
## Delete the container image for version 1.0.0 of our bdxyz
gcloud container images delete gcr.io/${GOOGLE_CLOUD_PROJECT}/bdxyz:1.0.0 --quiet

-- Below command didnt work, i deleted from Cloud Storage GUI
# Delete Cloud Build artifacts from Cloud Storage
# The following command will take all source archives from all builds and delete them from cloud storage
# Run this command to print all sources:
# gcloud builds list | awk 'NR > 1 {print $4}' 
gcloud builds list | awk 'NR > 1 {print $4}' | while read line; do gsutil rm $line; done

# Delete Cloud Run service
gcloud run services delete bdxyz --platform managed
```

## Hosting Quartz in Firebase - Part 2

Continuing with firebase deployment. 

This is in local system. Below is the `firebase.json` file
```firebase.json
{
    "hosting": {
      "rewrites": [{
        "source": "**",
        "run": {
          "serviceId": "bdxyz",
          "region": "asia-south1"
        }
      }]
    }
  }
```

Below is the firebase deploy command
```
firebase deploy --only hosting --project bdxyz-000001

D:\20230422 - BigData\08. HTML\quartz\bdv4q1>firebase deploy --only hosting --project bdxyz-000001

=== Deploying to 'bdxyz-000001'...

i  deploying hosting
i  hosting[bdxyz-000001]: no "public" directory to upload, continuing with release
i  hosting[bdxyz-000001]: finalizing version...
+  hosting[bdxyz-000001]: version finalized
i  hosting[bdxyz-000001]: releasing new version...
+  hosting[bdxyz-000001]: release complete

+  Deploy complete!

Project Console: https://console.firebase.google.com/project/bdxyz-000001/overview
Hosting URL: https://bdxyz-000001.web.app
```

In the below screenshot, notice
* In the latest hosting deployment, there's only 2 files
* In the earlier ones, when i used Gatsby, i contained more files. 

![Hosting Differences](FirebaseHosting_Screenshot_2024-11-15_175536.png)

---
## References
* [Quartz](https://quartz.jzhao.xyz/hosting)
* [Codelabs: Cloud Run Deployment](https://codelabs.developers.google.com/codelabs/cloud-run-deploy?authuser=1#8)
* [Hosting static site using Cloud Run](https://til.cafe/blog/2024/hosting-static-web-site-using-google-cloud-run/)
* [Caddy Web Server](./165-caddy-web-server)
* [Cloud Run Deploy Continously](https://cloud.google.com/run/docs/quickstarts/deploy-continuously)

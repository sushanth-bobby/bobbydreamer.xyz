---
title: ExpressJS Favicon issue resolved by virtual path prefix
date: 2021-01-26
description: Resolving problems in accessing static images which were in public folder from multi-level path
tags: ['expressjs', 'nodejs', 'javascript']
slug: "/78-expressjs-static-files-virtual-path-prefix"
---

In ExpressJS, *virtual path prefix* helped me resolve accessing static assets from public folder in a multi-level path site. Here, i am trying to access from Favicon which is in `public\images\favicon.ico` and in my HEAD tag pug file has something like this and this pug file is used in rendering all the pages. 
```
link(rel="shortcut icon" href="../images/favicon.ico")
```

This works in, 
* http://localhost:3000/ - Works
* http://localhost:3000/category/world - Works
* http://localhost:3000/category/world/article - Doesn't work

Added the below highlighted line to resolve the above issue. So as per the [doc](https://expressjs.com/en/starter/static-files.html)

>To create a virtual path prefix (where the path does not actually exist in the file system) for files that are served by the express.static function, specify a mount path for the static directory, as shown below:

```js:title=index.js {2}
app.use(express.static('public'));
app.use('/category', express.static('public')); 
```

**Note** : However, the path that you provide to the express.static function is relative to the directory from where you launch your node process.
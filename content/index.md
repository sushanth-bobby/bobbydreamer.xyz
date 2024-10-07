---
title: Welcome to Quartz 4
---

# Quartz v4

[Quartz](https://github.com/jackyzha0/quartz) is a fast, batteries-included static-site generator that transforms Markdown content into fully functional websites. 

> “[One] who works with the door open gets all kinds of interruptions, but [they] also occasionally gets clues as to what the world is and what might be important.” — Richard Hamming

This is my template for my site bobbydreamer.xyz

🔗 Read the documentation and get started: https://quartz.jzhao.xyz/ and [showcase](https://quartz.jzhao.xyz/showcase) has many sample sites which use this SSG.

Below are couple of sites, i refered
* https://notes.yxy.ninja/
* https://notes.camargomau.com/ - linkHeaders, darkMode, recent Notes


## Installation
---

Clone repository
```shell
git clone https://github.com/jackyzha0/quartz.git
cd quartz
npm i
```
Ignore the messages in npm regarding fixes


## Configuration 
---

Below are some of the configuration changes i have made from the default setup 

* *Note:* Documentation related to usage of quartz is available in `./docs` 

* Blog content are to be kept in folder `./content`

* Updated `\quartz.layout.ts` : Moved darkMode from left to right

* Moving entire site little up
  - Updated `\quartz\styles\variables.scss` - `topSpacing:` from 6rem to 3rem

* linksHeader - Inspired from `https://notes.camargomau.com/` - `https://github.com/camargomau/notkesto-site`
  - Added `quartz/components/styles/linksHeader.scss`
  - Added `quartz/components/LinksHeader.tsx`
  - Updated `quartz/components/index.ts` to include Linksheader
  - Updated `\quartz.layout.ts` : Initialize variable sharedPageComponents with `header: [Component.LinksHeader()],`
  - Updated `\quartz\styles\variables.scss` - to include `$mobileBreakpoint: 600px;`

* Recent Notes - Squeeze
  - Updated - `\quartz\components\styles\recentNotes.scss` - From 1rem to 0.5rem
  - `.recent-notes>ul.recent-ul>li { margin: 0.5rem 0;`

* Custom CSS oneCompiler wrapper
  - Code added in `template\quartz\styles\custom.scss`

* Mermaid text labels had issues when theme changed to light mode, it still appeared gray
  - Added css in custom.scss   


## Development
---

To serve docs
```
npx quartz build --serve -d docs
```

Building quartz locally
```
npx quartz build --serve
```

This should start in `http://localhost:8080/`

> [!hint] Flags and options
> For full help options, you can run `npx quartz build --help`.
>
> Most of these have sensible defaults but you can override them if you have a custom setup:
>
> - `-d` or `--directory`: the content folder. This is normally just `content`
> - `-v` or `--verbose`: print out extra logging information
> - `-o` or `--output`: the output folder. This is normally just `public`
> - `--serve`: run a local hot-reloading server to preview your Quartz
> - `--port`: what port to run the local preview server on
> - `--concurrency`: how many threads to use to parse notes


## Deployment

```
npx quartz build
```

All outputs should come to `public` directory

---
title: NVM - Node Version Manager
description: This tool helps in managing different versions of NodeJS in the local system
date: 2024-11-22
tags:
  - scraping
slug: /167-nvm-node-version-manager
---

NVM is used to handle multiple versions on NodeJS in the system. 
Source: 
* https://learn.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
* https://github.com/coreybutler/nvm-windows/releases

**Commands**
```
nvm list available
nvm list

nvm install 20.18.0
nvm use 20.18.0
```

**Ran below commands**
```
C:\Users\Admin>nvm use 20.18.0
Now using node v20.18.0 (64-bit)

C:\Users\Admin>node --version
v20.18.0

C:\Users\Admin>npm --version
10.8.2

---
title: Caddy - Web Server
description: Basic of using Caddy Web Server
date: 2024-11-16
tags:
  - hosting
slug: /165-caddy-web-server
---

Below commands are straight taken from Caddy documents and run for testing

## Installation

* There isn't much of installation, its just one execution file
* Store it your user folder `.caddy` and update environment `PATH`, so it can be accessed

## Basics
### Starting caddy
```
caddy run
```

It tells to which port its listening to
```
2024/11/14 16:25:03.756 INFO    admin   admin endpoint started  {"address": "localhost:2019", "enforce_origin": false, "origins": ["//[::1]:2019", "//127.0.0.1:2019", "//localhost:2019"]}
2024/11/14 16:25:03.757 INFO    serving initial configuration
```

Note: You will have to open another command prompt to execute below commands

### Config

To check Caddy's config. You can run below command, but initially caddy's config will be blank.
```
curl localhost:2019/config/
```

First Config- Save below as `caddy.json` 
```caddy.json
{
	"apps": {
		"http": {
			"servers": {
				"example": {
					"listen": [":2015"],
					"routes": [
						{
							"handle": [{
								"handler": "static_response",
								"body": "Hello, world!"
							}]
						}
					]
				}
			}
		}
	}
}
```

### Loading the config file
In windows use `^` and on unix use `\`
```cmd
curl localhost:2019/load ^
	-H "Content-Type: application/json" ^
	-d @caddy.json

-- Actual pasting
D:\20230422 - BigData\26.Caddy>curl localhost:2019/load ^
More? -H "Content-Type: application/json" ^
More? -d @caddy.json
```

On checking the config, you get below response
```
D:\20230422 - BigData\26.Caddy>curl localhost:2019/config/
{"apps":{"http":{"servers":{"example":{"listen":[":2015"],"routes":[{"handle":[{"body":"Hello, world!","handler":"static_response"}]}]}}}}}
```

### Testing 
```
D:\20230422 - BigData\26.Caddy>curl localhost:2015
Hello, world!
```

### Actual `Caddyfile` format

```Caddyfile
:2015 

respond "Hello, world!"
```

Above Caddyfile can be converted to JSON format by below command, response in command prompt contains the json
```
caddy adapt

-- (OR)
-- If file in another path
caddy adapt --config /path/to/Caddyfile

-- Response
D:\20230422 - BigData\26.Caddy>caddy adapt
2024/11/14 17:22:23.877 INFO    using adjacent Caddyfile
{"apps":{"http":{"servers":{"srv0":{"listen":[":2015"],"routes":[{"handle":[{"body":"Hello, world!","handler":"static_response"}]}]}}}}}
```

Note: Response would look similar to above `caddy.json`

### Reloading Config file live

First start the caddy
```
caddy run
```

Open another command prompt, if there is a `Caddyfile` in the current folder, run below command. It will update the configuration. 
```
caddy reload

-- If Caddyfile is in another path
caddy reload --config "d:\20230422 - BigData\08. HTML\quartz\bdv4q1\til.caddyfile"

caddy reload All outputs should come to `public` directory
```
Note: Make sure extension is `.caddyfile`

### Stop caddy
```
caddy stop
```


While executing `caddy run` config flag can be passed to mention the path of the `Caddyfile`
```
caddy run --config "d:\20230422 - BigData\08. HTML\quartz\bdv4q1\Caddyfile"
```

## Real use case

For development, below is `Caddyfile`
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

Explanation for above code,
1. This line specifies that the server should listen on port 8080.
2. Sets the root directory for the site to `./public`. All file paths will be relative to this directory.
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

---
### References
* [Quartz Hosting in Firebase](./152-gatsby-to-quartz)

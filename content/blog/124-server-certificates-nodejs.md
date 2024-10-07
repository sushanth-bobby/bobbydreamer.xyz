---
title: Using openSSL certificates in NodeJS
date: 2021-08-28
description: Example of using server certificates in NodeJS
tags: ['notes', 'nodejs', 'security']
slug: "/124-server-certificates-nodejs"
---

### # Install

```sh
npm install --save express morgan nodemon
```

### # Steps for SSL certificate generation

1. Generate a private key
  ```sh {1}
  openssl genrsa -out key.pem
  Generating RSA private key, 2048 bit long modulus (2 primes)
  ..............+++++
  .............................+++++
  e is 65537 (0x010001)
  ```

2. Create a CSR(Certificate Signing Request) using private key. Here it will few questions like country code, state, city, organization name, organization unit, common name/hostname, email address and challenge password. You can skip by pressing enter. 

  ```sh {1}
  openssl req -new -key key.pem -out csr.pem
  You are about to be asked to enter information that will be incorporated
  into your certificate request.
  What you are about to enter is what is called a Distinguished Name or a DN.
  There are quite a few fields but you can leave some blank
  For some fields there will be a default value,
  If you enter '.', the field will be left blank.
  -----
  Country Name (2 letter code) [AU]:IN
  State or Province Name (full name) [Some-State]:Tamil Nadu
  Locality Name (eg, city) []:Chennai
  Organization Name (eg, company) [Internet Widgits Pty Ltd]:bobbydreamer.com inc
  Organizational Unit Name (eg, section) []:Tech
  Common Name (e.g. server FQDN or YOUR name) []:bobbydreamer.com
  Email Address []:bobby.dreamer@gmail.com
  
  Please enter the following 'extra' attributes
  to be sent with your certificate request
  A challenge password []:
  An optional company name []:
  ```

3. Generate self-signed certificate using CSR. Here `x509` is a standard for defining public key certificate. 

  ```sh {1}
  openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
  Signature ok
  subject=C = IN, ST = Tamil Nadu, L = Chennai, O = bobbydreamer.com inc, OU = Tech, CN = bobbydreamer.com, emailAddress = bobby.dreamer@gmail.com
  Getting Private key
  ```

4. CSR file is no longer required. It can be deleted
  ```sh
  rm csr.pem
  ```

* * * 

if you want to extract public key from private key, you can use below command. 

```sh
openssl rsa -in key.pem -pubout -out public.pem
```

* * * 

### # Verifications

```sh {1}
openssl req -text -in csr.pem -noout -verify

verify OK
Certificate Request:
    Data:
        Version: 1 (0x0)
        Subject: C = IN, ST = Tamil Nadu, L = Chennai, O = bobbydreamer.com inc, OU = Tech, CN = bobbydreamer.com, emailAddress = bobby.dreamer@gmail.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)
                Modulus:
                    00:c0:eb:fc:de:87:cf:ac:56:87:26:9d:04:4a:f8:
                    1f:db:0c:9f:ad:8d:2b:66:d8:60:cd:35:82:05:a3:
                    ff:4c:19:39:27:e0:bf:99:a6:6d:5b:8a:57:8a:12:
                    45:ab:d5:94:d8:11:71:cf:78:19:21:e1:86:2f:f8:
                    07:8e:72:be:e1:59:f5:6a:99:29:b1:89:7a:d8:91:
                    a4:68:b1:86:0e:0a:a8:72:99:51:a7:e6:92:d2:52:
                    d4:d4:02:3c:e0:a0:c6:0a:e1:de:52:76:15:ba:cc:
                    81:33:86:09:bd:3e:51:19:be:65:cd:51:67:a8:7b:
                    36:9e:56:b9:17:46:db:ee:e1:c6:a4:47:a9:9b:1a:
                    56:6b:9a:41:de:1f:11:80:fa:7d:58:42:29:c7:5d:
                    ca:6f:a8:7d:98:b3:06:ef:ca:62:73:cb:a9:46:69:
                    a8:36:de:19:76:f1:4f:2f:6f:47:32:70:f2:93:bf:
                    5a:71:db:75:38:4b:7e:a5:06:56:7e:e2:a8:1c:79:
                    4e:10:23:24:8b:c2:7f:d7:11:3a:d3:d7:f0:ae:94:
                    ea:c0:e2:51:c4:06:e2:c9:e7:63:6a:d6:f4:b9:59:
                    5e:47:ad:e9:df:bc:2f:c6:b6:3d:93:b0:02:44:d9:
                    a1:e7:92:99:8a:87:5c:95:f5:84:8d:47:01:66:5c:
                    90:a1
                Exponent: 65537 (0x10001)
        Attributes:
            a0:00
    Signature Algorithm: sha256WithRSAEncryption
         af:d4:ff:a6:b4:cf:2e:b3:13:29:03:bc:3f:7b:30:b8:27:ee:
         75:33:06:15:0f:97:3b:a2:1a:5e:6c:22:84:bd:d7:db:ff:7e:
         fd:cb:61:da:cf:ed:4d:63:72:37:4f:44:0f:16:6c:eb:a6:9a:
         7f:1a:08:19:28:80:0f:ae:e6:01:a4:db:2f:df:df:68:fb:b6:
         a2:ce:96:1a:19:28:6f:e5:d7:04:0d:e5:ba:01:67:76:90:21:
         1f:93:d9:df:68:a0:5d:ed:7f:f4:9c:20:9c:15:1a:cf:9b:1d:
         3c:c7:e5:87:5c:23:22:f7:26:36:38:bc:0e:5f:41:c0:df:9c:
         65:ee:33:e2:3d:5f:f3:91:f9:de:66:11:d0:16:d5:6e:cf:3a:
         43:4e:cf:af:51:00:a6:ed:bb:8d:93:54:5d:ee:ac:f8:ac:8b:
         be:d5:47:50:2e:8b:75:38:e8:32:db:14:ba:d0:e9:52:de:e8:
         7f:35:fe:b7:18:16:26:e2:28:d0:24:32:0c:11:05:b4:ed:4e:
         59:5e:06:a3:b2:1e:b8:95:1d:0f:7b:36:00:c0:f5:d6:b1:af:
         5d:5d:84:75:be:4d:19:8e:56:88:60:61:8e:65:c9:2e:7f:49:
         99:05:8f:cf:6f:c3:9a:b5:2e:23:90:f2:a3:1c:07:33:39:04:
         ed:2e:1d:5f
```

### # NodeJS Program

```js
const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')

const app = express()

const options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'cert.pem'))
};

const sslServer = https.createServer(options, app)

app.use('/', (req, res, next) => {
  res.send('Hello from SSL server')
})

sslServer.listen(3000, () => {
  console.log('Secure server 🔑 on port 3000')
});
```

![https site](assets/124-sc1.png)

![certificate](assets/124-sc2.png)


### References

* [Yt - yoursTRULY : How to generate and use a SSL certificate in NodeJS](https://youtu.be/USrMdBF0zcg)
* [Notes on http, https, SSL, TLS and CA](122-tls-certificates)
* [Github - Generating Self-Signed Server Certificates](https://github.com/bobbydreamer/server-certificate)
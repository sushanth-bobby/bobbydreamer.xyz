---
title: Testing mutual TLS using NodeJS
date: 2021-08-30
description: Testing mutual TLS using NodeJS
tags: ['notes', 'nodejs', 'security']
slug: "/125-mutual-tls"
---

In Mutual TLS both Client and Server have a certificate and both sides authenticate using their public/private key pair. Below are the handshake steps in simplistic way. 

* Client connects to server
* Server presents its TLS certificate
* Client verifies the server's certificate
* Client presents its TLS certificate
* Server verifies the client's certificate
* Server grants access
* Client and server exchange information over encrypted TLS connection

![Mutual TLS](assets/125-mutualTLS.png)

Below are the steps and commands 

* [Generate Server Certificate](#l1)
  1. [Generate Certification Authority (CA) certificate for server](#l2)
  2. [Generating a private key](#l3)
  3. [Generate Certificate Signing Request (CSR)](#l4)
  4. [Generate the server certificate from CSR](#l5)
  5. [Verify certificate signature](#l6)
* [Generate Client Certificate](#l7)
  1. [Generate Certification Authority (CA) certificate for client](#l8)
  2. [Generate a private key](#l9)
  3. [Generate Certificate Signing Request (CSR)](#l10)
  4. [Generate client certificate from CSR](#l11)
  5. [Verify certificate signature](#l12)
* [Test](#l13)

* * * 

<a id="l1"></a>

## Generate Server Certificate

Server Details
* Organization Name: Bobby Dreamer Inc., 
* Organizational Unit Name: Crypto

<a id="l2"></a>

### Generate Certification Authority (CA) certificate for server

* Password: super
* Common Name(CN): localhost

```sh {1,8,9,23}
openssl req -new -x509 -days 365 -keyout server-ca-key.pem -out server-ca-crt.pem

# Output
Generating a RSA private key
....+++++
.............................................+++++
writing new private key to 'server-ca-key.pem'    
Enter PEM pass phrase:
Verifying - Enter PEM pass phrase:
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:IN
State or Province Name (full name) [Some-State]:TN
Locality Name (eg, city) []:Chennai
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Bobby Dreamer Inc., 
Organizational Unit Name (eg, section) []:Crypto
Common Name (e.g. server FQDN or YOUR name) []:localhost
Email Address []:
```

<a id="l3"></a>

### Generating a private key

```sh {1}
openssl genrsa -out server-key.pem 4096

# Output
Generating RSA private key, 4096 bit long modulus (2 primes)
.............................++++
..............................++++
e is 65537 (0x010001)
```
<a id="l4"></a>

### Generate Certificate Signing Request (CSR)

* Common Name(CN): server.localhost
* do not insert the challenge password

```sh {1,16,21}
openssl req -new -sha256 -key server-key.pem -out server-csr.pem

# Output
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:IN
State or Province Name (full name) [Some-State]:TN
Locality Name (eg, city) []:Chennai
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Bobby Dreamer Inc., 
Organizational Unit Name (eg, section) []:Crypto
Common Name (e.g. server FQDN or YOUR name) []:server.localhost
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```

<a id="l5"></a>

### Generate the server certificate from CSR

* Type in the CA Password:super

```sh {1,7}
openssl x509 -req -days 365 -in server-csr.pem -CA server-ca-crt.pem -CAkey server-ca-key.pem -CAcreateserial -out server-crt.pem

# Output
Signature ok
subject=C = IN, ST = TN, L = Chennai, O = "Bobby Dreamer Inc., ", OU = Crypto, CN = server.localhost
Getting CA Private Key
Enter pass phrase for server-ca-key.pem:
```

<a id="l6"></a>

### Verify certificate signature

Using the below command you can verify the certificate signature against the CA 

```sh
openssl verify -CAfile server-ca-crt.pem server-crt.pem

# Output
server-crt.pem: OK
```

<a id="l7"></a>

## Generate Client Certificate

Client details
* Organization Name: Browsers Inc.,
* Organizational Unit Name: Security

<a id="l8"></a>

### Generate Certification Authority (CA) certificate for client 

* Password: client
* Common Name(CN): browser.com

```sh {1,8-9,23}
openssl req -new -x509 -days 365 -keyout client-ca-key.pem -out client-ca-crt.pem

# Output
Generating a RSA private key
......+++++
............+++++
writing new private key to 'client-ca-key.pem'
Enter PEM pass phrase:
Verifying - Enter PEM pass phrase:
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:IN
State or Province Name (full name) [Some-State]:TN
Locality Name (eg, city) []:Chennai
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Browsers Inc.,
Organizational Unit Name (eg, section) []:Security
Common Name (e.g. server FQDN or YOUR name) []:browser.com
Email Address []:
```

<a id="l9"></a>

### Generate a private key 

```sh {1}
openssl genrsa -out client-key.pem 4096

# Output
Generating RSA private key, 4096 bit long modulus (2 primes)
...............................................................................................................................++++
..............................++++
e is 65537 (0x010001)
```

<a id="l10"></a>

### Generate Certificate Signing Request (CSR)

* Common Name(CN): client.browser.com
* do not insert the challenge password

```sh {1,16,21}
openssl req -new -sha256 -key client-key.pem -out client-csr.pem

# Output
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:IN
State or Province Name (full name) [Some-State]:TN
Locality Name (eg, city) []:Chennai
Organization Name (eg, company) [Internet Widgits Pty Ltd]:Browsers Inc.,
Organizational Unit Name (eg, section) []:Security
Common Name (e.g. server FQDN or YOUR name) []:client.browser.com
Email Address []:

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:
An optional company name []:
```

<a id="l11"></a>

### Generate client certificate from CSR

* Type in the CA Password:client

```sh {1}
openssl x509 -req -days 365 -in client-csr.pem -CA client-ca-crt.pem -CAkey client-ca-key.pem -CAcreateserial -out client-crt.pem

# Output
Signature ok
subject=C = IN, ST = TN, L = Chennai, O = "Browsers Inc.,", OU = Security, CN = client.browser.com
Getting CA Private Key
Enter pass phrase for client-ca-key.pem:
```

<a id="l12"></a>

### Verify certificate signature

```sh
openssl verify -CAfile client-ca-crt.pem client-crt.pem

# Output 
client-crt.pem: OK
```

<a id="l13"></a>

## Test 

Code is available here in [Github](https://github.com/bobbydreamer/mutual-tls)

* Start the server.js script `node server.js`
* In another terminal window, start the `node client.js`

#### Errors you might get

```sh
D:\BigData\14.Nodejs\17.Certificates\b.client-server_certificate2>node client.js
TLS Socket ERROR (Error: getaddrinfo ENOTFOUND server.localhost)
```

#### Solution

In Windows, go to `C:\Windows\System32\drivers\etc`
* Backup the existing `hosts` file
* Edit the file and add the below two lines

```
127.0.0.1 server.localhost
127.0.0.1 client.browser.com
```

It should look like below
![Mutual TLS](assets/125-ma1.png)

Rerun the client script `node client.js`

```js
D:\BigData\14.Nodejs\17.Certificates\b.client-server_certificate2>node client.js
TLS Connection established successfully!
Response statusCode:  200
Response headers:  {
  date: 'Mon, 30 Aug 2021 15:25:24 GMT',
  connection: 'close',
  'transfer-encoding': 'chunked'
}
Server Host Name: server.localhost
Received message: OK!

TLS Connection closed!
```

In the server side, you will get response like below, 

```sh
D:\BigData\14.Nodejs\17.Certificates\b.client-server_certificate2>node server.js
Mon Aug 30 2021 20:55:23 GMT+0530 (India Standard Time) ::ffff:127.0.0.1 GET /
```

## CURL 

Tried to connect to server using CURL it did not work. Did not attempt to do any further investigating as it looks like another whole subject to learn. 

```sh {1,15,26}
curl -k https://127.0.0.1:8888 -v --cacert ./certs/server-ca-crt.pem --key ./certs/client-key.pem --cert ./certs/client-crt.pem

# Output 
* Rebuilt URL to: https://127.0.0.1:8888/
*   Trying 127.0.0.1...
* TCP_NODELAY set
* Connected to 127.0.0.1 (127.0.0.1) port 8888 (#0)
* schannel: SSL/TLS connection with 127.0.0.1 port 8888 (step 1/3)
* schannel: disabled server certificate revocation checks
* schannel: verifyhost setting prevents Schannel from comparing the supplied target name with the subject names in server certificates.
* schannel: using IP address, SNI is not supported by OS.
* schannel: sending initial handshake data: sending 153 bytes...
* schannel: sent initial handshake data: sent 153 bytes
* schannel: SSL/TLS connection with 127.0.0.1 port 8888 (step 2/3)
* schannel: failed to receive handshake, need more data
* schannel: SSL/TLS connection with 127.0.0.1 port 8888 (step 2/3)
* schannel: encrypted data got 1970
* schannel: encrypted data buffer: offset 1970 length 4096
* schannel: a client certificate has been requested
* schannel: SSL/TLS connection with 127.0.0.1 port 8888 (step 2/3)
* schannel: encrypted data buffer: offset 1970 length 4096
* schannel: sending next handshake data: sending 100 bytes...
* schannel: SSL/TLS connection with 127.0.0.1 port 8888 (step 2/3)
* schannel: encrypted data got 7
* schannel: encrypted data buffer: offset 7 length 4096
* schannel: next InitializeSecurityContext failed: SEC_E_ILLEGAL_MESSAGE (0x80090326) - This error usually occurs when a fatal SSL/TLS alert is received (e.g. handshake failed). More detail may be available in the Windows System event log.
* Closing connection 0
* schannel: shutting down SSL/TLS connection with 127.0.0.1 port 8888
* schannel: clear security context handle
curl: (35) schannel: next InitializeSecurityContext failed: SEC_E_ILLEGAL_MESSAGE (0x80090326) - This error usually occurs when a fatal SSL/TLS alert is received (e.g. handshake failed). More detail may be available in the Windows System event log.
```

## References

* [Matteo Mattei - Client and server SSL mutual authentication with NodeJs](https://www.matteomattei.com/client-and-server-ssl-mutual-authentication-with-nodejs/)
* [Github - Server and Client mutual authenticate using NodeJS](https://github.com/bobbydreamer/mutual-tls)
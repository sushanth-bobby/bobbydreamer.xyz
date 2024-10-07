---
title: Notes on http, https, SSL, TLS and CA
date: 2021-08-20
description: Some notes on http, https, SSL, TLS and CA
tags: ['notes', 'security']
slug: "/122-tls-certificates"
---

### # HTTP

* Usually web server listens to port 80
* HTTP runs on top of TCP protocol 
* Requests are sent via URL in clear text and they are stateless. 
* TCP is a stateful protocol, sessions are maintained by TCP. 
* HTTP is stateless, it just requires TCP to transfer stuff.
* Flow is,
  - Open : Browser sends a request(GET/, POST/, DELETE/..) to server
  - Server processes the request( there will be some latency )
  - Close : Server responds to the request with (Header, Content-type, Content-Data)

![http](assets/122-http.png)

#### Disadvantages

* Its not secure - Plain text

* * * 

### # HTTPS / SSL became TLS (rebranding)

* Its exactly same as HTTP but secure and uses the port 443. Its usually referred to as HTTP over TLS or HTTP over SSL.
* Uses Digital certificates from *Trusted Certificate Authority(CA)*
* Before sending the get request, **Handshake** happens between Client and WebServer where both agree on the key(symmetric key) which is used to encrypt and decrypt encryption

Simplified flow is,      

  - Browser initiates the request to access WebServer 
  - WebServer instead of serving the client with content, it sends a digital certificate, which contains a public key and private key is held in the WebServer itself and both these keys make asymmetric encryption possible. 
  - Browser(client) validates the certificate and it generates a session key, a symmetric key. This is the key that will be used to encrypt all the data that get transfered between client and webserver in future. Browser(client) uses the public key in the certificate to encrypt the session key and sends it to the server.
  - Only WebServer has the private key to decrypt and get the session key. Now session key is available in both the sides, it will be used to encrypt and decrypt the data rest of the session. This is where asymmetric encryption stops and symmetric starts. This is HTTPS, FTPS and anything that uses SSL/TLS. 
  - Now the WebServer processes the request, encrypts the data and responds to the client
  - Client receives the request, decrypts and reads the data. 

![SSL/HTTPS](assets/122-ssl-tls-viatto.png)

**Main points are**    

* Asymmetric encryption is established
* The session key is shared
* Symmetric encryption takes over

#### Disadvantages

* Does not hide the names of websites that you're visiting - Website name is sent using DNS which is not inside the HTTPS tunnel. So middle man knows what website you are visiting but they just can't read the data that is being transferred. 
* Protect you from visiting an evil website
* Provide anonymity - Your personal IP address (your address on the internet) has to be attached to the outside of the encrypted data. 

* * * 

#### Trusted Certificate Authority(CA)

When a application having an WebServer is developed and before it goes to production, they need to go to a trusted Certificate Authority(CA) to get certificates. Some trusted authorities are Symantec(acquired VeriSign), Comodo, GoDaddy, Google CA, Entrust, IdenTrust and Let's Encrypt.

Here trust means, browsers trust these companies. Basically anybody can create certificates and become a CA but all the browsers in the world will reject you because it will say that your website has a certificate from an untrusted CA. Certificate Authority is a company which generates digital certificate which all the browsers in the world trust. How a CAs, trust a webserver/domain is by asking requester to prove that they own the server/domain. CAs will do their due diligence before handing out certificates. 

Flow is,      

1. A WebServer(youtube.com) creates a Certificate Signing Request(CSR) with its Key-pair and sends the request to Certificate Authority (Google CA). 
2. Google CA validates the digital certificate and signs the request with its private key and responds to the WebServer/Domain with the digital certificate which will contain important things like Identity, CA Signature, Public key.

* Identity will who you are
* CA Signature is like stamp of approval by CA or say CA has validated/authenticated the identity of your WebServer/Domain. This signature is encrypted by the CA using their private key(which only they have) and can be decrypted by CA Public key which browsers have.
* Public key. This WebServers public key can only encrypt and to decrypt one needs a private key(which only webserver has). 

All the web browsers in the world have the list of public keys of the renowned trusted CAs pre-installed in them. So when a browser gets a certificate, it see's from who the certificate is from(by name may be) and it will have their public key, so it will try to decrypt the signature in the certificate and identify/validate that the certificate is from that CA only. 

* * * 

#### SSL/TLS Timeline

![SSL/TLS Timeline](assets/122-ssl-tls-history.png)

### # TLS 1.2

Transport Layer Security (TLS), the successor of the now-deprecated Secure Sockets Layer (SSL). TLS first defined in 1999 and the current version is TLS 1.3 defined in August 2018. TLS builds on the earlier SSL specifications (1994, 1995, 1996) developed by Netscape Communications for adding the HTTPS protocol to their Navigator web browser.

![TLS 1.2](assets/122-tls-1p2.png)

Flow for RSA is,      

1. Handshake is initiated with a "ClientHello." This message contains, 

    * Maximum protocol version that the client wishes to support
    * the ClientHello.random (32 bytes, out of which 28 are suppose to be generated with a cryptographically strong number generator);
    * the "session ID" (in case the client wants to resume a session in an abbreviated handshake, see below);
    * the list of "Cipher Suites" that the client knows of, ordered by client preference;
    * the list of compression algorithms that the client knows of, ordered by client preference;

2. The server responds with a "SeverHello" message and this contains, 

    * the protocol version that the client and server will use;
    * the ServerHello.random (32 bytes, with 28 random bytes);
    * the session ID for this connection;
    * the Cipher Suite that will be used; The server generally chooses the strongest common cipher suite.
    * the compression algorithm that will be used;

  Note : If the client and server do not share any capabilities in common, the connection terminates unsuccessfully.

3. In the "Certificate" message, the Server sends its SSL certificate chain (which includes its leaf certificate and intermediate certificates) to the client. To provide authentication to the connection an SSL certificate is signed by a CA, which allows the client to verify that the certificate is legitimate. Upon receipt, the client performs several checks to authenticate the certificate. This includes checking the certificate's digital signature, verifying the certificate chain, and checking for any other potential problems with the certificate data (expired certificate, wrong domain name, etc). The client will also make sure the server has possession of the certificate's private key. This is done during the key exchange/generation process.

4. This is an optional message, only needed for certain key exchange methods (anonymous Diffie-Hellman, Diffie-Hellman Ephemeral and Ephemeral RSA key-exchange) that require the server provides additional data.

5. The server sends "ServerHelloDone", a marker message (of length zero) which says that the server is finished, and the client should now talk.

6. In "ClientKeyExchange" step, the client will generates a 48-byte random string called a pre-master secret, then encrypt it with the server's public key and transmit it.

7. The "ChangeCipherSpec" message lets the server know that it has generated the session key and is going to switch to encrypted communication.

8. The "Finished" message is then sent to indicate that the handshake is complete on the client side. The Finished message is encrypted, and is the first data protected by the session key. The message contains data (MAC) that allows each party to make sure the handshake was not tampered with.

9. Now it's the server's turn to do the same. It decrypts the pre-master secret and computes the session key. Then it sends its "ChangeCipherSpec" message to indicate it is switching to encrypted communication.

10. The server sends its "Finished" message using the symmetric session key it just generated, it also performs the same check-sum to verify the integrity of the handshake.

#### Disadvantages

In TLS 1.2 is client is sending the encrypted symmetric key to the WebServer which was considered as insecure exchange and its a lot chatty, so is slow. 

### # TLS 1.3

TLS 1.3 was defined in RFC 8446 in August 2018. It is based on the earlier TLS 1.2 specification. TLS 1.3 handshake is significantly shorter than its predecessors and has reduced the number of supported ciphers from 37 to 5. Improves performance by Zero Round Trip Time Resumption. 

Flow in a simplified way, think initially there are 3 keys,      

1. Blue ( Clients Private Key )
2. Pink ( Public Key  ) - Can be exchanged
3. Red  ( Servers Private Key ) 

Combining all three keys generates a Gold Private key. Following combinations of key can be exchanged, as its unbreakable    

* Blue + Pink
* Red + Pink

Now the flow is,    

* Client : Generates two keys(blue & pink). It sends over the network, public key + Merged(public & private) to the WebServer. 
* WebServer : Generates the private key(red) and adds the other two keys and generates a Gold Key. 
  - Merges Red key and Pink key and responds to the client. 
* Client : Now has the Red, Blue and Pink key and it combines all three of them to generate the Gold key. 
* Initiate the GET/ request using the gold key and call the server. 

![TLS 1.3](assets/122-tls-1p3.png)

Actual flow is,      

1. Client Hello message comes packaged with, guesses of key agreement/exchange protocol, key share from whatever protocol it guessed.
2. The server will respond with its own Server Hello message and certificate, its own portion of the key share, calculates the session key and ends with a server finished message.
3. Now client that it has all of the relevant information, so it will authenticate the SSL certificate and use the two key shares to calculate its own copy of the session key. When this is complete it sends its own Finished message.

* * * 

### Terms and Definitions

* **Stateful** means, a server is required to maintain the current state and session information.
* **Stateless** means, server need not retain session state and information from previous requests. Basically every request is independent. i.e., it doesn't refer to previous requests or assumes server will have that information. 

* **Symmetric key**. Session keys created by browser(client) are symmetric keys. There is only one key here, the same key can be used to encrypt and decrypt.  It is less CPU intensive, can be used for large data and its fast. Examples: AES, RC4, DES and QUAD
* **Asymmetric key** means, there are two keys(public and private) used for every transaction. Here public key is available to anyone and can only encrypt and private key is private and used to decrypt. This takes lots of CPU and its slow and used for small data. Also do note that, if you encrypt with private key, it can be decrypted with public key. 
  Asymmetric Encryption Examples : Used in SSH, TLS
  - RSA (Rivest-Shamir-Adleman)
  - Diffie-Hellman
  - ElGamal

* **RSA** is based on factoring large numbers into their prime values. It was developed by Rivest, Shamir and Adleman. RSA has key-length ranges from about 512 bit to 8,000 bits (2401 digits).


### References
* [Yt - Viatto : How HTTPS Works(...and SSL/TLS too)](https://youtu.be/10aVMoalON8)
* [Yt - Hussein Nasser : Transport Layer Security, TLS 1.2 and 1.3](https://youtu.be/AlE5X1NlHgg)
* [ldapwiki - How SSL-TLS Works](https://ldapwiki.com/wiki/How%20SSL-TLS%20Works)
* [thesslstore.com - Taking a Closer Look at the SSL/TLS Handshake](https://www.thesslstore.com/blog/explaining-ssl-handshake/)
* [Using openSSL certificates in NodeJS](124-server-certificates-nodejs)
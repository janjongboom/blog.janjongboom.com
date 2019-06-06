---
layout:   post
title:    "Adding TLS Sockets to Mbed OS"
date:     2018-11-05 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Adding-TLS-Sockets-to-Mbed-OS/
originalName: "Mbed Developer Blog"
---

In Mbed OS 5 we introduced a unified [IP networking interface](https://os.mbed.com/docs/latest/reference/ip-networking.html) which gives you a standard way of dealing with IP sockets regardless of the underlying networking stack used. This makes writing networking code that's portable between targets, modules and even connectivity methods a lot easier. But the [Socket API](https://os.mbed.com/docs/v5.10/apis/network-socket.html) only gave access to standard UDP and TCP sockets, while setting up a TLS connection - to do HTTPS or MQTTS calls, for example - was left to the user.

<!--more-->

We're changing this in Mbed OS 5.11 by adding TLS sockets. These behave very similar to normal TCP sockets, but they will automatically use Mbed TLS to set up a TLS connection to the server. The TLS socket handles all certificate validation, encryption and decryption without any manual work in your application.

If you can't wait until Mbed OS 5.11 you can manually add the [TLSSocket library](https://github.com/ARMmbed/TLSSocket) to your Mbed OS 5.10 application. The [Mbed Simulator](https://labs.mbed.com/simulator) also already supports TLS sockets.

**Note on Mbed OS 5.11:** In Mbed OS 5.11 you need to set the `MBEDTLS_SHA1_C=1` macro in your `mbed_app.json` file.

## Certificate Authorities

Unlike desktop operating systems such as Windows or macOS, Mbed OS does not have a central list of trusted Certificate Authorities (CAs). This means that when you want to talk to a server over TLS you need to provide the list of root CAs yourself. Finding the root CA can be done quickly via Firefox or via OpenSSL:

**Firefox**


![Finding the root CA in Firefox]({{ site.baseurl }}/assets/root-ca-selection.png)

1. Use Firefox to go to a page that uses HTTPS and is hosted on the same domain as the server you want to talk to over a TLS Socket.
1. Click **Tools > Page Info**.
1. Click **Security**.
1. Click **View Certificate**.
1. Click on the top item in the certificate hierarchy, this is the root CA.
1. Click **Export**.
1. This gives you a `crt` file. Store it inside your project, so you can find it back later.

**OpenSSL**

1. Open a terminal, and run:

    ```
    $ openssl s_client -connect os.mbed.com:443 -showcerts
    ```

   (Replace `os.mbed.com:443` with your host and port).

1. Then look for the **last** occurance of `-----BEGIN CERTIFICATE-----`.
1. Copy everything from `-----BEGIN CERTIFICATE-----` to `-----END CERTIFICATE-----` and store in a file.


    ![Getting the root CA from OpenSSL]({{ site.baseurl }}/assets/tlssocket02.png)

### Placing the CA in code

To use the CA in code, you need to store it in a string, and escape the content. For example:

```cpp
// note that every line ends with `\n`
// To add more root certificates, just concatenate them.
const char SSL_CA_PEM[] = "-----BEGIN CERTIFICATE-----\n"
    "MIIDdTCCAl2gAwIBAgILBAAAAAABFUtaw5QwDQYJKoZIhvcNAQEFBQAwVzELMAkG\n"
    // rest of your certificate
    "-----END CERTIFICATE-----\n";
```

## Enabling logging

The TLS Socket library uses the [mbed-trace](https://github.com/ARMmbed/mbed-os/blob/1bbcfff8f331c2e00a3883ea27ca3c91461bc7a9/features/frameworks/mbed-trace/README.md) library that is part of Mbed OS for logging. Thus, if you want to see the TLS handshakes you'll need to enable the trace library. In addition, you can specify the debug level for the TLS socket. Create a file named `mbed_app.json` in the root of your project, and add the following to enable tracing:

```json
{
    "target_overrides": {
        "*": {
            "mbed-trace.enable": 1,
            "tls-socket.debug-level": 0
        }
    }
}
```

Note that enabling traces in `mbed_app.json` is not enough to actually show them. You still need to tell the trace library where it needs to write to. Calling `mbed_trace_init();` from code will write the traces to the default serial UART port, so you can see them through a serial monitor - the same as when you call `printf`.

## Making an HTTPS request to os.mbed.com

With everything in place we can now set up a TLS socket connection. On the Mbed website there's a file called [hello.txt](https://os.mbed.com/media/uploads/mbed_official/hello.txt) which returns `Hello World!` in plain text. Let's retrieve it!

**Note:** If you're looking for a fully fledged HTTP/HTTPS library, take a look at [mbed-http](https://os.mbed.com/teams/sandbox/code/mbed-http/) - it also uses TLS Sockets underneath.

### Setting up a TLS socket

You set up a TLS socket in the same way as you set up a TCP socket, except you call `set_root_ca_cert` with the root CA string.

```cpp
const char SSL_CA_PEM[] = /* your certificate, see above */;

// Get a network interface
NetworkInterface *network = NetworkInterface::get_default_instance();
if (network->connect() != 0) {
    printf("Could not connect to the network...\n");
    return 1;
}

// enable logging
mbed_trace_init();

nsapi_error_t r;

// setting up TLS socket
TLSSocket* socket = new TLSSocket();
if ((r = socket->open(network)) != NSAPI_ERROR_OK) {
    printf("TLS socket open failed (%d)\n", r);
    return 1;
}
if ((r = socket->set_root_ca_cert(SSL_CA_PEM)) != NSAPI_ERROR_OK) {
    printf("TLS socket set_root_ca_cert failed (%d)\n", r);
    return 1;
}
if ((r = socket->connect("os.mbed.com", 443)) != NSAPI_ERROR_OK) {
    printf("TLS socket connect failed (%d)\n", r);
    return 1;
}
```

If you run this on a development board, you see the TLS handshake happening:

```
Setting up TLS socket...
[INFO][TLSW]: mbedtls_ssl_conf_ca_chain()
[INFO][TLSW]: mbedtls_ssl_config_defaults()
[INFO][TLSW]: mbedtls_ssl_conf_authmode()
[INFO][TLSW]: mbedtls_ssl_conf_rng()
[INFO][TLSW]: mbedtls_ssl_setup()
[INFO][TLSW]: Starting TLS handshake with os.mbed.com
[INFO][TLSW]: TLS connection to os.mbed.com established

[DBG ][TLSW]: Server certificate:
    cert. version     : 3
    serial number     : 03:56:D4:79:41:63:31:CA:E0:56:06:61
    … snip ...

[INFO][TLSW]: Certificate verification passed
```

### Using the socket

The TLS socket is now ready, let's send some data over it to request `hello.txt`:

```cpp
char send_buffer[] = "GET /media/uploads/mbed_official/hello.txt HTTP/1.1\r\nHost: os.mbed.com\r\n\r\n";
int scount = socket->send(send_buffer, strlen(send_buffer));
printf("\nSent %d bytes:\n\n%s", scount, send_buffer);

char recv_buffer[1024] = { 0 };
int rcount = socket->recv(recv_buffer, 1024);
printf("\nReceived %d bytes:\n\n%s\n\n", rcount, recv_buffer);
```

This now makes the request, and returns the content of the file. Hello world indeed.

```
Sent 74 bytes:

GET /media/uploads/mbed_official/hello.txt HTTP/1.1
Host: os.mbed.com


Received 320 bytes:

HTTP/1.1 200 OK
Server: nginx/1.15.5
Date: Wed, 31 Oct 2018 01:09:08 GMT
Content-Type: text/plain
Content-Length: 14
Last-Modified: Fri, 27 Jul 2012 13:30:34 GMT
Connection: keep-alive
ETag: "501297fa-e"
Expires: Wed, 31 Oct 2018 11:09:08 GMT
Cache-Control: max-age=36000
Accept-Ranges: bytes

Hello world!
```

**Looking for the full example**

You can also take a look at the [complete example](https://github.com/janjongboom/mbed-simulator/blob/6e9f45c61fb10e1983668e777d68e939247b377d/demos/tlssocket/main.cpp).

## Recap

The addition of TLS sockets to Mbed OS makes it much easier to securely communicate with the outside world, and because TLS sockets expose the same API as TCP sockets it's trivial to upgrade examples or applications. In addition, you can upgrade TCP sockets whilst running through the [TLSSocketWrapper](https://github.com/ARMmbed/mbed-os/blob/1bbcfff8f331c2e00a3883ea27ca3c91461bc7a9/features/netsocket/TLSSocketWrapper.h). This allows you to set up an unsecure connection, and establish a secure connection when needed. The [mbed-http](https://os.mbed.com/teams/sandbox/code/mbed-http/) library - which offers both HTTP and HTTPS requests - has already been upgraded to take advantage of TLS sockets, and we expect many more libraries to start using it when support lands in Mbed OS 5.11. Until then you can add the [library](https://github.com/ARMmbed/TLSSocket) to your projects by hand.

-

*Jan Jongboom is a Developer Evangelist for the IoT at Arm, and the author of mbed-http.*

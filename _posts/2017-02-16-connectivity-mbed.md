---
layout:   post
title:    "Using HTTP, HTTPS, MQTT and CoAP from mbed OS"
date:     2017-02-16 00:00:00
tags:     mbed
originalUrl: https://developer.mbed.org/blog/entry/Using-HTTP-HTTPS-MQTT-and-CoAP-from-mbed/
originalName: "Mbed Developer Blog"
---

One of the biggest changes in mbed OS 5 compared to mbed OS 2.0 was the unification of network interfaces. Every interface, whether it's Ethernet, Wi-Fi, Cellular, 6LoWPAN or Thread mesh, implements the same [NetworkInterface](https://docs.mbed.com/docs/mbed-os-api-reference/en/latest/APIs/communication/network_sockets/) API. This makes it easier to write portable code that matches the available connectivity method. In addition this API is easy to implement on top of any library that supports socket primitives, so porting new targets is straightforward. Recently we also added the [Easy Connect](https://github.com/ARMmbed/easy-connect) library, which allows users to switch between all supported connectivity methods through a config file - tremendously helpful for tutorials and workshops.

<!--more-->

But adding connectivity is only one side of the story; actually doing something meaningful with the connection requires additional libraries. Recently we learned that it's not always clear which application protocols mbed supports, so in this blog post we'll show how to use the most popular internet protocols with mbed OS 5: HTTP, HTTPS, MQTT and CoAP. All examples run on every mbed OS 5 board that implements the NetworkInterface API.

**Tip:** Want a hassle-free and secure connection to the internet? Use [mbed Device Connector](http://connector.mbed.com) with [mbed Client](https://github.com/armmbed/mbed-os-example-client).

## HTTP

We can use [TCP sockets](https://docs.mbed.com/docs/mbed-os-api-reference/en/latest/APIs/communication/network_sockets/) to talk to any HTTP server, but HTTP can be a messy protocol, especially to parse. We have an example application that uses mbed OS 5 together with [node.js/http-parser](https://github.com/nodejs/http-parser) to make HTTP calls.

[HTTP calls using mbed OS 5](https://developer.mbed.org/teams/sandbox/code/http-example/).

**Tip:** When talking to web services, you may also be interested in a [JSON parser and serializer](https://github.com/udp/json-parser).

## HTTPS

mbed OS 5 comes with [mbed TLS](http://tls.mbed.org), an open source SSL library. This example demonstrates how to use mbed TLS to download files over HTTPS.

[HTTPS calls using mbed OS 5](https://developer.mbed.org/teams/sandbox/code/http-example/).

## MQTT

The [Eclipse™ Paho](http://eclipse.org/paho) project is an open-source client implementation of the MQTT protocol, and a port for mbed has been around since 2014. Recently we updated the HelloMQTT application to use mbed OS 5.

[MQTT client using mbed OS 5](https://developer.mbed.org/teams/mqtt/code/HelloMQTT/).

## CoAP

[The Constrained Application Protocol](http://coap.technology) (CoAP) is a lightweight web protocol for IoT devices. It's similar to HTTP, but with a much lower footprint and additional features like multicast. mbed Device Connector, our device management solution, uses it as its transport layer - we therefore ship a CoAP library as part of mbed OS 5. We can use this library - which includes both a CoAP serializer and parser - to connect to any CoAP server.

[CoAP client using mbed OS 5](https://developer.mbed.org/teams/sandbox/code/coap-example/).

-

*[Jan Jongboom](http://twitter.com/janjongboom) is Developer Evangelist IoT.*

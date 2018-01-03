---
layout:   post
title:    "Now available: Secure WebSockets and MQTT over TLS libraries"
date:     2016-04-26 11:00:00
tags:     iot mbed
originalUrl: https://developer.mbed.org/blog/entry/Now-available-Secure-WebSockets-and-MQTT/
originalName: "Mbed Developer Blog"
---

Two weeks ago [Real Time Logic](https://realtimelogic.com) released some very interesting libraries for mbed. Real Time Logic maintains the [SharkSSL](https://realtimelogic.com/products/sharkssl/) library, which contains a lightweight TLS client suitable for running on Cortex-M series microcontrollers. Previously SharkSSL was only available under a commercial license, but they have now released a light version of SharkSSL for [mbed users](https://developer.mbed.org/users/wini/code/SharkSSL-Lite/).

<!--more-->

While that in itself is already worthy of a blog post, they also released a number of (according to y'all in the forums) highly sought after examples: [secure WebSockets (WSS)](https://developer.mbed.org/users/wini/code/WebSocket-Client-Example/) and [MQTT over TLS](https://developer.mbed.org/users/wini/code/SharkMQ-LED-Demo/).

![SharkSSL-Lite running on an mbed board, talking to a WSS server]({{ site.baseurl }}/assets/websocket1.png)

*SharkSSL-Lite running on an mbed board, talking to a WSS server.*

The examples currently run on boards with an Ethernet port (verified on an [FRDM-K64F](https://developer.mbed.org/platforms/FRDM-K64F/)), but should be easy to port to other IP-based protocols like WiFi, Cellular and 6LoWPAN.

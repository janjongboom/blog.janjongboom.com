---
layout:   post
title:    "Web Standards column: Web Bluetooth"
date:     2015-12-23 11:50:00
tags:     iot bluetooth
originalUrl: http://www.creativebloq.com/net-magazine
originalName: "net magazine"
---

For the January 2016 issue of net magazine I wrote the Web Standards column on Web Bluetooth (and a little bit about physical web).

Every object around us is getting smart. Plants, suitcases, keys; there is a “Make X smart”-Kickstarter campaign for all of them. And that is just the start. Billions of smart devices are coming to our world in the next years, and that brings a new challenge: how do you discover these devices? And, after discovery, how do you interact with them?

<!--more-->
 
## New Discovery
 
To solve the discoverability problem, we can use the new Bluetooth Smart standard. It’s the low energy variant of normal Bluetooth, which broadcasts ‘advertisement packages’ that your phone can pick up. Advertisement packages in themselves are very boring, they are just bytes, but Google’s Eddystone protocol allows you to embed URLs in them. Now every device can have its own web page, and your web browser can pick up on the signals. Your meeting room can broadcast the URL of its calendar, and a movie poster can broadcast the URL of the schedule of the local cinema. It’s just web, so the opportunities are endless. Google named this approach ‘the Physical Web’, which is pretty spot on. If you want to experiment with this tech, you can buy an Eddystone beacon for around 10 dollars, and get the Physical Web application from your favorite app store. Browser support and OS integration are currently being worked on by Google and [Mozilla](https://bugzilla.mozilla.org/show_bug.cgi?id=1196233).

## Interaction
 
This doesn’t solve the issue of interacting with the devices, as Physical Web is just about broadcasting URLs. To interact with the device sending out the signal we need to look into the new WebBluetooth API. Bluetooth Smart normally is ‘lazy’, it just broadcasts. When you want to interact with the device you set up a GATT connection and have a two-way connection. This is where WebBluetooth comes in. It allows you to set up a connection to a device straight from the browser through a new JavaScript API. To avoid having to change your code for every new device coming out, GATT describes standard services. For instance, a heart rate service, which is implemented by every heart rate monitor. This way you’ll only have to write the logic once, and your web app will work with every new monitor that comes to market. Now let’s imagine that I just bought a Parrot MiniDrone. These drones already use Bluetooth Smart. Previously this meant installing the proprietary app, waiting, discovering through that app, etc. Now, I can discover the drone through Physical Web, and when I tap the URL it opens a web app which can actually fly the drone through JavaScript. How amazing is that?! Discovering devices and using them in seconds, and with no need to install any native applications. The code to do that, and a video of the result, can be found [here](https://hacks.mozilla.org/2015/08/flying-a-drone-in-your-browser-with-webbluetooth/).
 
## Web Awesomness

WebBluetooth is currently in Draft status at W3C, and support is coming to (at least) Chrome and Firefox. If you want to play around with it already, the API is supported in Chrome OS 45+ and Firefox OS 2.5+.
 
To sum it up: The combination of Physical Web and WebBluetooth is going to be amazing. We can solve discoverability of new devices, and interacting with devices without needing to install native apps anymore, bringing the awesomness of the web into the IoT space.




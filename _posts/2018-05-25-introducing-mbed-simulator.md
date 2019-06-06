---
layout:   post
title:    "Introducing the Mbed Simulator"
date:     2018-05-25 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/introducing-mbed-simulator/
originalName: "Mbed Developer Blog"
---

**Try the simulator directly in the browser: [Open Simulator](https://labs.mbed.com/simulator)**

While we have worked hard to improve embedded development tooling in Mbed (e.g. via the Online Compiler), the development for microcontrollers is still very similar to how it was in the 90s. Compilation is slow, and flashing is even slower. When fixing a bug, you need to get the device into the exact state as it was in before encountering the bug. This makes for a very slow feedback loop, which hinders productivity and often pulls you out of the zone.

<!--more-->

To make this feedback loop much faster, we're releasing an alpha version of the Mbed Simulator. The simulator allows you to run your Mbed OS 5 applications directly on your computer, so that you can quickly test and verify applications without flashing them on a real board. This is a valuable learning tool, as you quickly learn how Mbed works. It is also very useful for developing complex applications. Within Arm, we have been using the simulator for work on [mbed-http](https://os.mbed.com/teams/sandbox/code/mbed-http/), the Mbed LoRaWAN stack and [uTensor](http://utensor.ai).

**Note:** The Mbed Simulator is part of [Mbed Labs](https://labs.mbed.com). The Mbed Labs projects showcase interesting side projects developed by Mbed engineers. However, these projects are not actively supported by Arm, and may be added, removed or break at any time.


![The Mbed Simulator online environment running Blinky and showing the C12832 LCD display]({{ site.baseurl }}/assets/simulator2.png)

## Online Simulator

The simulator comes in two flavours: an online version, which runs completely in your browser, and an offline version, which works for any Mbed OS 5 project. The easiest way to get started is to:

**[Open the online Mbed Simulator](https://labs.mbed.com/simulator)**

The simulator shows the code editor on the left. You can change the code here, and click *Compile* to run it in the simulator. There is a wide range of demo' available, from peripheral demos (like the popular [C12832](https://os.mbed.com/components/128x32-LCD/) LCD display) to network demos. Yes, that's right; you can use the full Mbed networking stack directly from the simulator. Select the demo in the dropdown menu and click *Load*. The demo loads automatically.

You can also add new components. For example, to blink an external LED:

1. Load 'Blinky'.
2. Click *Add component*.
3. Select the *Red LED*.
4. Select *p5* as the pin.
5. In the code, change `LED1` to `p5`.
6. Click *Compile*.
7. Now the external LED blinks, instead of the internal LED.

You can also share your code with others by sharing the URL of your compiled application. When someone opens the URL, it loads the application you previously created.

## Offline

You can also run the simulator offline on any Mbed OS 5 project. This allows you to integrate the simulator into your development workflow.

To use the simulator offline, make sure you have:

1. [Mbed CLI](https://os.mbed.com/docs/v5.8/tools/arm-mbed-cli.html).
2. The [Emscripten SDK](https://kripken.github.io/emscripten-site/docs/getting_started/downloads.html).
3. [Node.js 8](https://nodejs.org) or higher.

Then open a terminal window, navigate to an Mbed OS 5 project and run:

```
# installs the simulator
$ npm install mbed-simulator -g

# run the current project
$ mbed-simulator .
```

This cross-compiles the current application and opens a browser running the application.

Here is a demo running both Blinky and [uTensor](http://utensor.ai) in the simulator:

[![Mbed Simulator offline]({{ site.baseurl }}/assets/simulator3.png)](https://www.youtube.com/watch?v=0OwuH138k4w)

You can can pass a wide variety of options to the simulator - such as C++11 support, preloading file systems, or loading components - and these can be found in [the documentation](https://github.com/janjongboom/mbed-simulator#cli).

## How it works

Unlike [Fast Models](https://developer.arm.com/products/system-design/fast-models), the Mbed Simulator is not fully simulating a Cortex-M device. Instead, it cross-compiles Mbed OS 5 using [Emscripten](https://github.com/kripken/emscripten). Emscripten is an LLVM to JavaScript compiler, which takes in a complex C++ project and spits out something that can be run in a web environment. Then, when something should happen with the physical board (for example, pull a pin high), the call is intercepted, and instead of toggling a register, we can toggle a graphical element on the display. This is done by adding a [new target](https://github.com/ARMmbed/mbed-os/pull/6457) to Mbed OS.

A similar approach is taken for components. The moment that the actual communication should take place, we intercept the call and send the data to the browser. For example, with an LCD display, we intercept when the frame buffer is flushed and dump the image to a canvas instead. Everything else in the driver, from font rendering to the API, remains exactly the same. Here you can see both a real device and the simulator running the same animation:

[![C12832 LCD running both in Mbed Simulator and on physical board]({{ site.baseurl }}/assets/simulator4.png)](https://www.youtube.com/watch?v=wpicvKWP4Iw&feature=youtu.be)

Writing new components is easy and can mostly be done in JavaScript. See [the docs](https://github.com/janjongboom/mbed-simulator#cli-arguments).

### Networking

A similar approach is taken for networking. A fake network interface is added while compiling for the simulator. When this interface opens a TCP or UDP socket, this is dispatched to a Node.js daemon (because you cannot open random sockets from the browser), and `send`/`recv` actions on this socket are then piped through. This approach allows you to run almost any Mbed OS networking example directly in the simulator, including HTTP, HTTPS (including TLS handshakes), CoAP and NTP examples.

To get the LoRaWAN stack to run in the simulator, the simulator uses a fake LoRa radio driver. When the LoRaWAN stack wants to drive the radio, the fake radio intercepts the package. This is low level enough that we only get the encrypted packet, data rate and frequency. This data is then delivered directly to a LoRaWAN network server, which has no idea that this is not a real LoRaWAN device. This approach works well, as two-way data, acknowledgements and OTAA joins all function.

## Limitations

Currently, the simulator has the following limitations:

1. Busy-looping (`while (1) {}`) without calling `wait` anywhere will make the browser hang. Make sure you use `wait()` when you want to pause.
2. Not at all cycle accurate. The application runs as fast as possible.
3. Much more memory available. No limitations are in place for stack and heap size.
4. Interrupts are faked. The browser has no concept of interrupts, so interrupts don't take priority over the main thread.
5. No RTOS. This is a single-threaded environment. You can use `mbed-events` to make it a bit easier to deal with complex environments, but you can't spin up multiple threads.

## Recap

The alpha version of the Mbed Simulator is a great step in the right direction. It massively shortens the feedback loop when developing applications, and because it includes networking, you can use the simulator for more than just toying around. One additional use is that it gives non-embedded developers access to simulated devices for easy development. In preparation for an event, we gave our web developer access to a fake LoRaWAN device to verify that the back-end handling of LoRa events was correct, and that worked well.

We're currently looking at ways to integrate the simulator into our other tools, perhaps in the documentation, getting started guides, or the Online Compiler. For now we'd love developers to try this out first. If you have any feedback, please raise a ticket on the [GitHub project](https://github.com/janjongboom/mbed-simulator)! Also keep an eye on the Mbed blog, as we'll be publishing an article about the LoRaWAN simulator in the next few weeks.

P.S. we realize that this is not the only approach to simulating devices, and we're also working on [Fast Model](https://github.com/ARMmbed/mbed-os/pull/6862) support for Mbed OS.

-

*Jan Jongboom is Developer Evangelist IoT at Arm, and the author of the Mbed Simulator. He's always trying to force more JavaScript upon embedded developers.*

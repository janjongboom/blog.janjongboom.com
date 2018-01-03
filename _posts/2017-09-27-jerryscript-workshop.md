---
layout:   post
title:    "JerryScript workshop 2017"
date:     2017-09-27 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/JerryScript-workshop-2017/
originalName: "Mbed Developer Blog"
---

A year ago we launched [experimental JavaScript support](https://os.mbed.com/javascript-on-mbed/) for mbed OS 5, which allows developers to write their IoT applications in a high level scripting language. This is possible through [JerryScript](http://jerryscript.net), a lightweight JavaScript engine that has full EcmaScript 5.1 support, but fits in only 64K of RAM.

Last week the core contributors to the JerryScript project came together in Szeged, Hungary to talk shop, discuss new features and drink some home-made [palinka](https://en.wikipedia.org/wiki/Pálinka). Rob Moran (senior engineering manager, Tools team) and Jan Jongboom (JerryScript contributor) were representing Arm.

<!--more-->

![JerryScript workshop 2017 participants]({{ site.baseurl }}/assets/jerry-wp1.jpg)

*JerryScript workshop participants: twenty-four people from seven companies, flying in from three continents.*

## State of JerryScript

With twenty-four participants from Arm, Intel, Texas Instruments, Samsung, Fitbit, Hop.js, and the University of Szeged, we had a wide range of JerryScript users and contributors in the same place.

The workshop was kicked off by Ákos Kiss - who leads the JerryScript team at the University of Szeged - and László Langó, giving an overview of the changes in JerryScript since the last workshop in April 2016. Some highlights:

1. Last year the JerryScript project was transferred by Samsung to the JS Foundation. This will provide long-term governance and stability to the project.
2. A [debugger](http://jerryscript.net/debugger/) was added to the project, making it possible to step through JavaScript code running on a real device.
3. A lot of new features were contributed, including ArrayBuffer, TypedArray, Promises, extensions for [argument parsing](http://jerryscript.net/ext-reference-arg/) and [module extensions](http://jerryscript.net/ext-reference-module/), an [automated test system](https://jerryscript-project.github.io/jerryscript-test-results/) and support for Zephyr and Mbed OS 5.
4. Performance has increased by 200%, and memory consumption is down by (up to) 30% when running Sunspider tests.

This was all an amazing community effort, with 44 contributors landing 676 pull requests. [The full slide deck is available here](https://github.com/jerryscript-project/jerryscript/blob/7ff37da73595513f09d35b4875db6512e38d6136/slides/jerryscript-workshop-september-2017/JerryScriptProgress.pdf).

## Projects and companies using JerryScript

The teams demonstrated a number of JerryScript projects:

* **Fitbit** is releasing their first smartwatch in a few weeks, the [Fitbit Ionic](https://www.fitbit.com/ionic). The watch comes with a complete JerryScript API to deal with all kinds of watch functions, allowing developers to write their watch applications in JavaScript. It was great to hear from a product company on how they integrate the runtime, separating application heaps (through an MPU) and enforcing constraints to avoid the system becoming unresponsive due to a rogue application.
* **Arm** showed the current state of JerryScript on Mbed, including [Bluetooth Low Energy support](https://github.com/ARMmbed/mbed-js-ble-example) with an nRF52-DK connecting to an iPhone, the [REPL](https://github.com/ARMmbed/mbed-js-repl-example), an experimental [simulator](https://github.com/janjongboom/mbed-js-simulator), and the [JerryScript wrapper generator](https://os.mbed.com/blog/entry/Generating-C-wrappers-for-JS-on-mbed/).
* **Intel** showed their work on the argument parsing and module extensions, which have both landed in core. They also showed an early version of their in-browser simulator, which uses [Emscripten](https://github.com/kripken/emscripten) to cross-compile C++ bindings, and they presented the NAPI proposal, which makes it possible to share native modules between node.js and JerryScript. Last, they demonstrated a new testing framework (compatible with [Jest](https://facebook.github.io/jest/)) to run integration and unit tests.
* The [IoT.js](http://iotjs.net) project, mainly developed by **Samsung** and the **University of Szeged**, released their 1.0 version two months ago. The project implements a variety of node.js compatible modules, including events, net and dgram, which provide a really nice ecosystem on top of JerryScript. It's something that we (Arm) are looking at with great interest, and running IoT.js on top of Mbed would be great.
* **Hop.js** showed their distributed JavaScript runtime - built on top of IoT.js - that creates services for business applications, all written in one language, which can run partially on embedded devices and partially on the server.
* **Texas Instruments** proposed a system for defining JerryScript interfaces on top of [WebIDL](https://www.w3.org/TR/WebIDL-1/), the interface language used by browser vendors for browser APIs. They created a set of scripts that take WebIDL definitions and output JerryScript boilerplate, separating the interface from the actual C++ <-> JS conversion code.

In addition, there were various discussions on the [W3C Sensor API](https://www.w3.org/TR/generic-sensor/), calling conventions of C++ functions from JavaScript, debugging, and how to simulate JerryScript applications in the browser.

## Other events

Of course a workshop is not all business; there was time for some fun as well. For many of us it was the first time that we met face to face, normally only talking on GitHub, IRC or during the bi-weekly community calls (join us! The calls are announced on the [mailing list](https://groups.io/g/jerryscript-dev)), so dinner conversations are a great casual opportunity to get to know your fellow core contributors. Many thanks to everyone at the University of Szeged who took us out every night, who brought us palinka, and who dragged us to the wine festival (Hungary is great wine country).


![Wine festival]({{ site.baseurl }}/assets/jerry-wp2.jpg) ![Homemade palinka]({{ site.baseurl }}/assets/jerry-wp3.jpg)

*View from the wine festival, and a bottle of homemade palinka.*

-

*Jan Jongboom is a contributor to JerryScript. He spoke about JerryScript on mbed OS 5 during [JSConf.asia 2016](https://www.youtube.com/watch?v=3HLRwcVqgFE).*

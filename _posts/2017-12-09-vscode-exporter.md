---
layout:   post
title:    "Adding a Visual Studio Code exporter"
date:     2017-12-09 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Adding-a-Visual-Studio-Code-exporter/
originalName: "Mbed Developer Blog"
---

**Update (June 2019): I've given up on using the Mbed exporters. They're breaking very often, and are inflexible. Instead I've put together [mbed-vscode-generator](https://github.com/janjongboom/mbed-vscode-generator) which should work for both pyOCD and STLink targets.**

Visual Studio Code, Microsoft's new cross-platform IDE, is gaining a lot of momentum. In the [2017 Stack Overflow Developer Survey](https://stackoverflow.com/insights/survey/2017#technology-most-popular-developer-environments-by-occupation) it ranked in the top five for most popular developer environment for both web and desktop developers. Unfortunately, the survey did not have numbers on embedded developers - but its popularity is definitely on the rise in the Mbed offices, thanks to the excellent C/C++ support and the built-in support for visual debugging through GDB.

<!--more-->

It's now easier to develop Mbed OS applications in Visual Studio Code: Mbed OS 5.6 includes an exporter for both our online compiler and Mbed CLI. The exporter is available for every target that supports building through a Makefile, and can build using GCC ARM, ARMCC and IAR. Not only does the exporter set the IDE up so you have context-aware language analysis, it also configures the debugger, so you can debug most targets by simply pressing `F5`.

![Debugging an Mbed OS 5 application in Visual Studio Code]({{ site.baseurl }}/assets/vscode-blog1.png)

_Debugging an Mbed OS 5 application in Visual Studio Code_

For information on how to export your applications, and the prerequisites for debugging, see the docs: [Debugging Mbed OS applications with Visual Studio Code](https://os.mbed.com/docs/v5.6/tutorials/visual-studio-code.html).

Happy debugging!

-

_Jan Jongboom is Developer Evangelist IoT at Arm_
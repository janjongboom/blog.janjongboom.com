---
layout:   post
title:    "IoT test automation with Mbed and Jumper"
date:     2018-09-07 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/IoT-test-automation-with-Mbed-and-Jumper/
originalName: "Mbed Developer Blog"
---

Continuous testing is critical to build safe and reliable IoT devices, but continuous IoT testing is hard. Good testing equipment is not readily available, devices must react to sensory inputs and are heavily dependent on network conditions, and running tests in parallel requires vast amounts of hardware.

At Mbed, we deal with the challenge of IoT testing by [throwing huge amounts](https://www.linkedin.com/feed/update/urn:li:activity:6361118108287008768) of testing equipment at the problem (for the Mbed OS 5.9 release we ran 28,000 hours of tests on real hardware); however, this approach requires a large capital investment, is very labor-intensive, and still does not cover every possible test case. Wouldn't it be great if we could accurately model our devices, and then run our tests in a simulated environment?

<!--more-->


![A rack of development boards we use to test Mbed OS]({{ site.baseurl }}/assets/jumper01.jpg)

*A rack of development boards we use to test Mbed OS*

At Arm, we're no strangers to device simulation. Over the past few months, we launched the [Mbed Simulator](https://os.mbed.com/blog/entry/introducing-mbed-simulator/), and we added [Fast Model support](https://github.com/ARMmbed/mbed-os/pull/6862) to Mbed OS 5.9. These device simulation methods, however, also have their downsides. The Mbed Simulator cross-compiles your application, rather than emulating the underlying hardware, and Fast Models are expensive and quite generic, modeling just the Arm core.

Fortunately, we're not the only ones looking at this space. [Jumper](https://jumper.io), an Israeli startup, is working on accurate full-device simulators to enable continuous testing of firmware without the need for a physical device.

## Simulating peripherals

The beautiful thing about Jumper is that their simulated devices are completely compatible with real devices. You can compile an application for any of Jumper’s supported MCUs, and run that binary both on the real board and in the simulator. Jumper has also modeled a variety of sensors and peripherals, which behave just like their real-world counterparts. This means that the code you write to talk to a SPI flash driver, for example, also works in the simulator. In this way, Jumper enables you to build an accurate model of your real device and run actual Mbed OS programs on it.

In addition to basic peripheral simulation, Jumper offers radio simulation. Simulating Wi-Fi or Ethernet is not a unique feature - these are also present in Fast Models and the Mbed Simulator - but Jumper also offers a Bluetooth simulator. When you run a simulated device that uses the Bluetooth Low Energy (BLE) radio (for example, a virtual nRF52832), Jumper can hook into the Linux BLE APIs and present the virtual device as a real, connectable BLE device. This lets you run end-to-end BLE tests on your computer.

## Getting started with Jumper

Getting started with Jumper is pretty straightforward. They have an [online environment](https://app.jumper.io), called Jumper Virtual Labs, which lets you run a simulated model in the browser.

To run your first simulation:

1. Log into, or sign up for, [an Mbed account](https://os.mbed.com).
1. Go to [mbed-os-example-blinky](https://os.mbed.com/teams/mbed-os-examples/code/mbed-os-example-blinky/), and click **Import into Compiler**. The Mbed Online Compiler opens.
1. Click **Import** in the **Import Program** popup window.
1. In the top-right corner, select the nRF52-DK or NUCLEO-F411RE development board.
1. Click **Compile**. A binary file is downloaded.

Now head over to [jumper.io](https://jumper.io).

1. Sign up for a Jumper account.
1. In the Virtual Lab create a new STM32F4 (if you compiled for the NUCLEO-F411RE) or NRF52832 (if you compiled for the nRF52-DK) board.
1. Drag the binary file onto the picture of the board.
1. Click **Run**.


![Running an Mbed OS 5 application in Jumper]({{ site.baseurl }}/assets/jumper02.png)

*Running Mbed OS 5 Blinky in Jumper*

In addition to the online environment, Jumper has offline tools, which also support debugging. You can find more installation instructions [in their docs](https://docs.jumper.io/docs/install.html).

## Future

Device simulation is a very promising subject. With accurate simulators it's possible to automate labor-intensive IoT testing, run integration tests quickly on every commit, and reduce the number of bugs in hard-to-test edge cases. At Arm, we're investing in making testing easier, through the [Greentea](https://github.com/ARMmbed/greentea) automated testing tool, Fast Model support, and the Mbed Simulator, and we’re very glad to see that the Mbed ecosystem is also working toward this goal.

If you want to learn more device simulation and automated testing, Dan Shemesh, CTO of Jumper, will be presenting at Mbed Connect, Arm's IoT developer day at Arm TechCon, on 16 October in San Jose, USA.

[Mbed Connect](https://www.mbed.com/en/about-mbed/events/mbed-connect-usa-2018/) features a range of talks about testing, machine learning, industrial deployments, and many more topics! All by engineers, for engineers. [Grab your ticket now for just $79](https://www.armtechcon.com/registration.html#mbed).


[![Learn from Dan Shemesh at Mbed Connect](https://os.mbed.com/media/uploads/nprobably/mbedconnectbanner.png)](https://www.armtechcon.com/registration.html#mbed)

-

*Jan Jongboom is a Developer Evangelist for the Internet of Things at Arm. If he's not living in a simulation, then at least his IoT devices should.*

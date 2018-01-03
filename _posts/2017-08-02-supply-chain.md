---
layout:   post
title:    "Built with mbed - supply chain monitoring with Babbler"
date:     2017-08-02 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Built-with-mbed-Supply-chain-monitoring/
originalName: "Mbed Developer Blog"
---

This is the third article in the 'built with mbed'-series. In the previous articles, we [monitored snow](https://developer.mbed.org/blog/entry/Built-with-mbed-Snowmelt-System-Monitor/) and [brewed beer](https://developer.mbed.org/blog/entry/Built-with-mbed-brewing-beer-with-bruiot/).

Shipping bananas from Africa to Europe, sending flowers over the Pacific Ocean, importing electronics from Asia. Every year, there are almost [700 million container movements](http://data.worldbank.org/indicator/IS.SHP.GOOD.TU) around the world. The sheer volume of global shipments can pose some  interesting challenges. How do you ensure that the temperature of your fruit has been consistent during the entire trip? How do you know that the container was not opened after loading, for example to smuggle drugs? And how do you communicate the data back to HQ in time to act on it? The Dutch company [Itude Mobile](https://www.itude.com) has tackled all of these questions  with [Babbler](http://www.babbler.io), a small and tamper-proof seal that monitors how your cargo is treated. A fascinating product by itself, it’s even more interesting when you realize that it's the first hardware product the company has ever developed. Reason enough for Jan Jongboom (Developer Evangelist) and Danielle Irons (Content Specialist) to talk with Robin Puthli, CEO of Itude.

<!--more-->


![Babbler seal attached to a shipping container]({{ site.baseurl }}/assets/babbler1.png)

*Babbler seal attached to a shipping container. Still from https://vimeo.com/182254746.*

**Congratulations on launching! Where did the idea for Babbler come from?**

At Itude Mobile, we have been developing software for supply chain monitoring for the past six years, and during that time, we identified a real issue when  attempting to verify that your container has not been compromised. Traditionally, this is done by adding a [security seal](https://en.wikipedia.org/wiki/Security_seal), a piece of plastic or metal attached on the outside of the container, which needs to be broken in order to open the container. However, these seals are [prone to evasion](https://www.youtube.com/watch?v=UgW_KNCaIxI), for example by attacking the hinges of the door; plus they can often be easily defeated, as is shown in [this DEFCON talk](https://www.youtube.com/watch?v=W07ZpEv9Sog).

We figured  if we create an electronic seal that is placed inside the container, we can use sensors to detect whether the container was opened or tampered with. In addition, you can use the seal for cold chain monitoring, verifying that your produce has been at a consistent temperature. That is important when shipping perishable goods, such as fruits or vegetables.

**Sounds interesting. What kind of hardware is in the seal?**

The device contains a light sensor, magnetic field sensor, accelerometer and a temperature sensor, which are connected to an [nRF51422](https://www.nordicsemi.com/eng/Products/ANT/nRF51422) MCU (Cortex-M0) from Nordic Semiconductors that has a Bluetooth Low Energy radio. Because the device is not connected most of the time, we encrypt and store all sensor data locally, and an operator can read the data back using a mobile phone when the shipment arrives.

In addition, there is an option to add a long-range radio to the seal, through an NB-IoT or LoRa radio module.  The nice thing about that option is that it allows you to read the data from a distance, but of course it adds extra cost to the module. Another aspect that we're experimenting with involves putting LoRa gateways on ships, with a satellite backhaul, so the seals can synchronize their data when they are loaded onto the ship, without manual intervention.

**What was the hardest part of designing the product?**

Definitely power management. It's already hard to design your software to be power efficient when you're dealing with two separate radios and multiple sensors, but we also found that individual sensors do not conform to their specifications when running in low power mode. Very frustrating, as it directly affects your hardware design. Also, do you want a replaceable or a rechargeable battery? That’s a decision that you need to make before you even start designing the product because it directly influences the design.

**Your software is built on mbed. When did you first find out about us?**

We saw mbed OS for the first time during Mobile World Congress two years back, and our software engineers thought it was a great fit. It's a lot nicer to develop against than programming bare-metal, the [event system](https://github.com/ARMmbed/mbed-os/tree/master/events) works well for our usecase, and the project is well maintained. Of course, it was also great that the nRF51422 was already supported, so that saved a lot of work. Right now, we're still on mbed OS 3, but we'll probably move to mbed OS 5 at some point in the future.

**Sounds terrific! Any crazy stories from actual deployments?**

We were monitoring a shipment of flowers from an Eastern African country, and at some point - while the shipment was driven from the plantation to the harbor - we saw the temperature of the shipment rising. Nothing dangerous, but there was a sudden temperature rise while the container doors remained closed. Normally, you might want to blame this on a faulty refrigerator unit or the driver opening the doors to check on the cargo, but given that we were verifying our product, we decided to dig deeper. In the end, we found out that the driver was stealing fuel from the truck, requiring him to  turn off the motor, which stopped the refiguration units and caused the temperature fluctuations. Without our seals, that would have never been found out.

**Great story! Good luck with the product.**

If you want to know more about Babbler, or order some units, visit http://babbler.io.

-

This was the third article of 'Built with mbed'. In this series, we look at innovative IoT projects that use ARM mbed. Want to get featured as well? [Contact us!](mailto:jan.jongboom@arm.com).

-

*Jan Jongboom is Developer Evangelist IoT and Danielle Irons is Content Specialist for mbed.*

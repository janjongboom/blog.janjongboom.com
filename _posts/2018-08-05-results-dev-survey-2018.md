---
layout:   post
title:    "Results of the Mbed Developer Survey 2018"
date:     2018-08-05 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Results-of-the-Mbed-Developer-Survey-201/
originalName: "Mbed Developer Blog"
---

Three months ago, we ran the second annual Mbed Developer Survey. The fun part of doing a second survey is that you can compare data to the year before: which technology is gaining in popularity, how many developers have started production and which market segments are trending. In addition, surveys give valuable insight into what you - as the Mbed community - like and dislike and what we can do to make it easier to go to production.

<!--more-->

This year’s survey was a great success, with over 2,300 respondents - and because information wants to be free, we're sharing some insights of the 2018 survey in this blog post. ([We have a similar one for 2017](https://os.mbed.com/blog/entry/Results-from-the-Mbed-Developer-Survey-2/).)

**Who is using Mbed?**

Embedded development is a tough skill to master: from quirky peripherals to manual memory management, trying to squeeze the last bit of performance out of a microcontroller (and thus saving another 20 cents in your BOM) requires experience. 60% of Mbed developers have over 10 years of experience, and almost half the respondents are over 46 years of age.

The full-stack embedded developer seems to be upcoming, with 30% of developers indicating that they can do both sides of an IoT product: both embedded and web.


![Mbed demographics]({{ site.baseurl }}/assets/survey18-1.png)

Japan has always been one of the strongest markets for Mbed; we hold regular [Mbed Fests](https://os.mbed.com/blog/entry/mbedfest-02242018/), and Mbed Enabled development boards are widely available in the [electronics markets](https://www.cnet.com/g00/news/welcome-to-tokyos-akihabara-electric-town-with-the-craziest-gadget-stores-youll-ever-see/?i10c.encReferrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8%3D&i10c.ua=4). In addition, we see many developers from the US, UK, Germany, France and India. It's also interesting to see that the results are well balanced between Asia, Europe and North America. Note that when compared with Google Analytics data, the survey results are skewed toward English speaking countries, probably because the survey was in English.


![Mbed developers by country]({{ site.baseurl }}/assets/survey18-2.png)

**What are they using?**

2018 saw a big increase of [supported modules](https://os.mbed.com/modules/) in Mbed. Modules drastically shorten the time to market, reduce cost in smaller production runs and can save time by having precertified RF. We see this trend also in the survey results; 40% of developers incorporate a module in their design.


![Hardware architecture]({{ site.baseurl }}/assets/survey18-3.png)

So how do you write the code for this hardware? The Arm Mbed Online Compiler is what draws most people into Mbed, but after initial prototyping, most professional developers move their project to their favorite IDE. Keil uVision is the most used IDE among our developers, but the high use of GCC over commercial compilers stands out. J-Link is used more than ULINKpro, but Mbed's own open-source [SWDAP debugging probe](https://os.mbed.com/teams/mbed/wiki/SWDAP) is increasing in popularity.


![IDEs and debugging probes used]({{ site.baseurl }}/assets/survey18-4.png)

**Connectivity types**

Embedded news is all about IoT, but about 30% of embedded devices still have no connectivity method. That number has increased from 29% to 33%, though it's difficult to draw conclusions. Let's see how this develops in 2019.


![Connectivity used in your device?]({{ site.baseurl }}/assets/survey18-5.png)

For the devices that use connectivity, we see a very sharp rise of LoRa, now twice as big as the cellular LPWAN methods (Cat-M1 and NB-IoT) combined. Mbed always has had a big foothold in the LoRa community, and we have added a [LoRaWAN stack](https://os.mbed.com/blog/entry/Adding-a-LoRaWAN-stack-to-Mbed-OS-58/) to Mbed OS a few months ago. It'll be interesting to see how this develops when more NB-IoT and LTE CAT-M1 networks become available.


![Connectivity by type]({{ site.baseurl }}/assets/survey18-6.png)

Another question we asked was whether security has become more important over the past year. Arm is investing heavily in making IoT devices more secure, through the [Platform Security Architecture](https://developer.arm.com/products/architecture/platform-security-architecture) and [TrustZone for v8-M](https://www.arm.com/products/security-on-arm/trustzone) - both of which will be supported by Mbed OS. Therefore, we're glad that 68% of respondents indicated that they think security has become more important.


![Has security become more important]({{ site.baseurl }}/assets/survey18-7.png)

**End markets and going to production**

There weren’t a lot of changes in the end markets for which people develop. The industrial and smart home markets remain very strong, the wearables market is slowly dropping and the smart cities market is on the rise. We see a correlation between the growth of LPWANs and smart cities, so if the growth of LoRa, NB-IoT and CAT-M1 continues, it will be interesting to see whether smart cities adoption accelerates, as well.


![End markets]({{ site.baseurl }}/assets/survey18-8.png)

Of course, the only way for IoT devices to affect these end markets is for the device to make it to the market. 16% of users said that they’re currently shipping products, and 24% of respondents expect the product they're working on to go to production. Of the devices in production, respondents identified 'software development and debug problems' as the biggest issue during development. That’s probably not too surprising given that it's mostly developers responding to the survey.


![Issues faced when going to production]({{ site.baseurl }}/assets/survey18-9.png)

**And what about Mbed itself**

Mbed OS 5 has now been on the market for almost two years, and we have done a lot of development since it launched. In the past year, we have added a resilient file system, better networking stacks, bootloader support and new, low power APIs. It's great to see this effort has paid off, with Mbed OS 5 now receiving a much higher satisfaction rating. We're not done yet, of course!


![Satisfaction ratings]({{ site.baseurl }}/assets/survey18-10.png)

It's unfortunate to see a low score for our documentation, and we'll be working hard to improve the docs. We're working on new porting guides, architecture references and a general cleanup of old documentation; hopefully you'll like it!

Next year we'll be back with another survey!

-

*Jan Jongboom is Developer Evangelist IoT at Arm, and he loves pretty graphs.*

---
layout:   post
title:    "Built with mbed - brewing beer with bruiot"
date:     2017-04-19 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Built-with-mbed-brewing-beer-with-bruiot/
originalName: "Mbed Developer Blog"
---

This is the second article in the 'built with mbed'-series. In the previous article, we explored the [snowmelt monitoring system](https://developer.mbed.org/blog/entry/Built-with-mbed-Snowmelt-System-Monitor/) deployed in Holland, MI.

Homebrewing is taking the world by storm. With [20% year-on-year growth rate](https://www.brewersassociation.org/press-releases/american-homebrewers-association-26-percent-growth-in-2012-u-s-homebrew-sales/) and over a million homebrewers in the United States alone, there’s a growing thirst for new technological developments in the age-old art of brewing. Creating a good, consistent craft beer is not easy. Not only does it requires quality ingredients and spotless machinery, the process also needs to be monitored intensively, as a two degree °C temperature variation while mashing the malts can cause inconsistency in a batch. For some, that's a problem - for others, it’s a challenge. Martin Bradley, a homebrewer from Boulder, Colorado, brushed off his electrical engineering skills and started automating his home brewery using mbed OS development boards, and leveraging [mbed Device Connector](https://connector.mbed.com) as a data channel. Jan Jongboom (Developer Evangelist) and Danielle Irons (Content Specialist) spoke with him.

<!--more-->

<iframe width="700" height="450" src="//www.youtube.com/embed/6JlWbMpbgHQ" frameborder="0" allowfullscreen></iframe>

*A video showing Martin Bradley's smart brewery*

**[ARM] Where did you get the idea to start automating your brewery?**

Brewing beer is a delicate process, and my initial goal was to focus on temperature control and water circulation. Depending on the style of the beer, you want to ensure that the temperature of the malts during the mashing process stays between 63°C and 68°C; but that small five degree variation yields vastly different beers. Therefore, for a nice and consistent beer, it's crucial that the temperature not only is correct, but also remains very consistent during the process.


![Hot liquor tank and mash tun](brew1.png)

*On the left the hot liquor tank. On the right the mash tun.*

The setup that I created is one where the mash tun - where the sugars are extracted from the grains - is constantly monitored by a temperature sensor. This in turn can control the valve between the hot liquor tank and the mash tun, so hot water can be added when the temperature starts dropping.

**[ARM] You said that this was the original plan, what else did you add?**

When you start building this kind of setup, you realize that a lot of the problems you see in the brewery boil down to the same building blocks. You monitor a value, and then set actions that run when you hit certain thresholds. That same process can be used over multiple vessels, can be used to track the fill level of the boiling tank, added to monitor the chiller, or used to set alarms. So instead of having a single device multitasking to both handle monitoring and take actions, I split them up in multiple devices, that can be reused within the brewery.

**[ARM] However, if the devices are not connected physically, how do they communicate?**

I saw that mbed OS supports the Lightweight Machine-to-Machine (LwM2M) protocol, and started to experiment with that. You can create a model that describes a device in a standard way. So, I can have a device with a temperature sensor, and when you ask the device what it can do, it can tell you: 'I have a temperature sensor, and this is the precision, and call this function to read the temperature'. And another device might tell you that it can turn its valve on through an action. All of that while the devices are already running. That's pretty nice, as you can define how devices interact at a later stage, without having to reprogram them.

**[ARM] That sounds great, how does this work in practice?**

Really well! I started by creating a small workflow engine where you can generate workflows for the devices. For example, when the temperature starts to drop in a vessel, we can initiate the flow of hot water. Since the discovery is automatic, you can easily scale this to cover many vessels. Next, I also used this to automatically generate my brewery management dashboard. It shows the state of the brewery and lets you do actions, all without having to manually program new parts of the brewery in.


![Brewing dashboard](brew2.png)

*The brewing dashboard, automatically generated from the LwM2M models of the devices in the brewery.*

**[ARM] The most important question: how does the beer taste?**

Well, if you're ever near Boulder, feel free to drop by!


![The end-result](brew3.jpg)

*Enjoying the end-result in the mountains of Colorado.*

**[ARM] Thanks Martin!**

If you want to know more about this project, visit [www.bruiot.com](http://www.bruiot.com), which describes the process in more detail, and contains extra photos and links of the project.

-

This was the second article of 'Built with mbed'. In this series, we look at innovative IoT projects that use ARM mbed. Want to get featured as well? [Contact us!](mailto:jan.jongboom@arm.com).

-

*Jan Jongboom is Developer Evangelist IoT and Danielle Irons is Content Specialist for mbed. They've both enjoyed plenty of homebrewed beer at Christmas parties while working in Scandinavia.*

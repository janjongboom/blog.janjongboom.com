---
layout:   post
title:    "Happy holidays from Edge Impulse 🎄 sneak peek, and where to meet us in 2020"
date:     2019-09-21 00:00:00
tags:     edge-impulse
originalUrl: https://www.linkedin.com/pulse/happy-holidays-from-edge-impulse-sneak-peek-where-meet-jan-jongboom/
originalName: "LinkedIn"
---

Earlier this year Zach Shelby and I [founded Edge Impulse](https://medium.com/@zach_shelby/embedded-ml-for-all-developers-1f000ccdaddd), to help developers create the next generation of intelligent device solutions with machine learning. The past six months have been a very intense ride with lots of work, lots of interviews, lots of customer meetings, and one legendary company trip to Amsterdam. We're making great progress, and we're preparing to launch to all developers in early 2020. Your sensors are about to get a whole lot smarter!

In this post we want to give you a sneak peek into what we've built, and let you know that we'll be present at CES, The Things Conference and the TinyML summit. We'd love to see you there in person!

<!--more-->

Excited and want to get early access? Sign up for our [developer preview](https://www.edgeimpulse.com/)!

**Feature extraction**

To successfully deploy small machine learning models you first need to extract meaningful features from raw sensor data. This reduces noise, makes models much smaller, and significantly speeds up classification when running on device. We’ve built fully configurable feature extraction blocks for the most common types of sensor data, including visualizations, and optimized code to run these blocks efficiently on even the smallest microcontrollers.

![Visualization of a gesture recognition dataset, after feature extraction.]({{ site.baseurl }}/assets/newsletter-dsp2.png)

*Visualization of a gesture recognition dataset, after feature extraction.*

**More than just neural networks**

Neural networks get all the hype, but they are not the only game in town. For example, neural networks perform very unpredictably when dealing with data that is unlike anything it has ever seen: a very common case when dealing with real-world sensor data. To know when we can’t trust the neural network we can train a second machine learning algorithm that uses clustering to find these anomalies, and flag these as anomalies. With Edge Impulse you can design and train both these machine learning algorithms together with signal processing and feature extraction, generating highly efficient code to run on real devices and live sensors.

![Anomaly detection on the same dataset, showing familiar data in blue, and some anomalies in orange.
]({{ site.baseurl }}/assets/newsletter-anomaly.png)

*Anomaly detection on the same dataset, showing familiar data in blue, and some anomalies in orange.*

**Meet us at CES, The Things Conference and the TinyML summit**

Excited and want to talk to us in person?

Zach Shelby, our CEO, will be around at **CES**, 9-10 January, and will be happy to give you a live demo or talk about a specific use case. Just respond to this email and we’ll get back to you.

Rather want to listen to the message while we’re at the big stage? Jan Jongboom, our CTO, and Zach Shelby will both have a keynote during **[The Things Conference](https://www.thethingsnetwork.org/conference/)** in Amsterdam, 30-31 January. This is the largest LoRaWAN conference, and one of the largest IoT conferences, in the world with about 2,000 participants.

We’ll also be present during the mother of all tiny machine learning events: the **[TinyML summit](https://tinymlsummit.org/)** in San Jose, CA from 12-13 February. A fantastic opportunity to see what the world is building with embedded machine learning.

Hope to see you soon, and a happy new year from the whole team!

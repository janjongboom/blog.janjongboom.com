---
layout:   post
title:    "Making tomatoes smart at Data Science Africa 2018"
date:     2018-09-12 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Making-tomatoes-smart-at-Data-Science-Af/
originalName: "Mbed Developer Blog"
---

For the second year in a row, Arm sponsored [Data Science Africa](http://www.datascienceafrica.org), a machine learning and data science conference held annually in East Africa. This year took us to the [Dedan Kimathi University of Technology](https://www.dkut.ac.ke) (DKUT) in Nyeri, Kenya, where hundreds of students participated in a three-day summer school and an adjacent conference program. But how much data science can you actually learn from sitting in a classroom working on existing data sets? Last year we experimented with some field work ([report here](https://os.mbed.com/blog/entry/streaming-data-cows-dsa2017/)), but this year we made data acquisition an integral part of the summer school.

<!--more-->

Thus, on a sunny Tuesday morning, Gen-Tao Chiang (Staff Analytics Engineer), Jan Jongboom (Developer Evangelist) and Damon Civin (Lead Data Scientist) showed up in Nyeri, equipped with Mbed-enabled development boards, gateways and sensors, ready not only to teach data science, but also to show how to build IoT devices that can actually gather datasets.


![Damon Civin, Jan Jongboom and Gen-Tao Chiang with a lot of boxes]({{ site.baseurl }}/assets/dsa01.jpg)

## Getting hardware

Ciira Maina, senior lecturer at DKUT, who got us [running after cows](https://os.mbed.com/blog/entry/streaming-data-cows-dsa2017/) last year, introduced us to three field work opportunities: monitoring tomato growth conditions, measuring air quality in a conservancy, and counting animals in the conservancy. The first two projects required both long-range connectivity and a long battery life, so we decided to set up a LoRaWAN network at the university. LoRaWAN is [well supported](https://os.mbed.com/blog/entry/Adding-a-LoRaWAN-stack-to-Mbed-OS-58/) in Mbed OS, runs in the unlicensed spectrum (so telco fees are not required), and two base stations covered both the university and the conservancy.


![Initial gateway placement]({{ site.baseurl }}/assets/dsa03.jpg) ![Final gateway placement]({{ site.baseurl }}/assets/dsa04.jpg)

*Gateway placement was an issue. First, we hung one out of the window of the university; next, we placed it closer to the greenhouses.*

The LoRaWAN base stations (through [Multi-Tech](https://www.multitech.com/)) and the NUCLEO-F446RE development boards (generously donated by [ST](https://st.com/)) were quickly acquired, but we still needed a battery connector, some storage and a LoRa radio. Chris Styles - Mbed co-founder, micro:bit designer, and our designated hardware specialist - jumped on the opportunity to design an amazing-looking custom shield incorporating all these features.


![Custom hardware for DSA 2018]({{ site.baseurl }}/assets/dsa02.jpg)

*Custom hardware for DSA 2018, sporting a SX1276 radio, SPI flash, SD card holder, secure element, and a battery connector.*

As a developer evangelist, Jan Jongboom is well aware of Murphy's law: “whatever can go wrong, will go wrong”, especially when hardware is involved. Last year, this involved breaking into the arrivals hall of Arusha airport to reclaim sensors. This year it involved the shipping company losing a box full of the custom shields. Some cursing and a day and a half later, the boxes turned up, and we made it to the conference only a day late, ready for some field work.

## Making tomatoes smart

The university has multiple greenhouses on campus where they grow tomatoes. One of the things we wanted to see is whether the soil moisture, temperature and humidity within a greenhouse have an effect on the yield. Placing sensors in multiple greenhouses would enable us to compare the initial raw data with the eventual yield, and see whether and how we could optimize the yield.

After a short introduction about the fundamentals of IoT ([slides](https://www.slideshare.net/janjongboom/fundamentals-of-iot-data-science-africa-2018)), students assembled the NUCLEO-F446RE; the DSA shield; the temperature, relative humidity and soil moisture sensors; and a battery pack to create a system for greenhouse monitoring.


![Greenhouse monitoring system]({{ site.baseurl }}/assets/dsa05.jpg) ![Greenhouse monitoring system]({{ site.baseurl }}/assets/dsa06.jpg)

These sensors were placed in five locations in each greenhouse, sending their data back every ten minutes. This raw data set was then stored, to be analyzed later in the week. Here's a great video explaining the process:

https://youtu.be/9goHb8naVqk

## Air quality in the conservancy

DKUT also sports a [large conservancy](https://conservancy.dkut.ac.ke) with over 140 acres of indigenous forest. In here, we wanted to run two experiments: monitor the air quality at various spots, and count the animals in the conservancy. The air quality sensors needed to work outside, but also needed a continuous air flow, so we repurposed some water bottles as waterproof enclosures.


![Air quality in a bottle]({{ site.baseurl }}/assets/dsa07.jpg)

*Dr. Ciira Maina showing the air quality sensor in the DKUT conservancy*

Because we did not want animals to alter the sensors, there was also some tree climbing involved for correct sensor placement. As these sensors use LoRaWAN for communication, and because there's plenty of attenuation from trees and leaves in the conservancy, placing sensors higher had a great effect on the signal strength. It turned out that the signal wasn't ideal, which led us to conclude that we need to place the base stations higher in future experiments for full coverage.


![Climbing trees to place sensors at DSA 2018]({{ site.baseurl }}/assets/dsa08.jpg)

## Counting animals

The last project was to count the animals in the conservancy using computer vision. Both of the previous field work projects involved capturing data and then sending it to a central server; but this is not an option when you have a battery-powered camera. Streaming the video feed would incur hefty data charges, and keeping a 4G modem on would quickly run down the battery. We're looking at enabling deep learning on microcontrollers through [uTensor](https://github.com/uTensor/uTensor), but for this project we wanted to stay on the safe side.

We headed back to the field with ten Raspberry Pi 3's, camera modules, motion sensors, and a trained ImageNet model. Whenever the motion sensor detected movement, the camera would snap a photo, feed it into ImageNet and store the classification. Damon Civin wrote about the training sequence in [this blog post](https://blog.usejournal.com/arm-at-data-science-africa-2018-1071389e92d9).


![Camera trap]({{ site.baseurl }}/assets/dsa09.jpg) ![Llama living in the DKUT conservancy]({{ site.baseurl }}/assets/dsa10.jpg)

*Camera trap, and a llama living in the conservancy. Another llama was recently eaten by a puma, hence the need for camera traps.*

## Recap

It was a great honor to be part of Data Science Africa 2018. The sheer enthusiasm and willingness to learn was amazing, and we're looking forward to seeing what the students will build with their newfound skills. It's also fantastic to see field work as an integral part of the summer school.

Having to build something that will be deployed on the very same day is both really awesome and very scary, but it shows the real challenges involved in building connected systems. The source code for the greenhouse monitor and air quality sensors is [available on GitHub](https://github.com/janjongboom/dsa2018-greenhouse-monitor), and Damon Civin produced a [great write-up](https://blog.usejournal.com/arm-at-data-science-africa-2018-1071389e92d9) about the field work and the conference.


![Walking toward the field work]({{ site.baseurl }}/assets/dsa11.jpg) ![Group of students during Data Science Africa 2018]({{ site.baseurl }}/assets/dsa12.jpg)

If you want to learn more about data science and how to apply it to your work as an IoT developer, come join us at Mbed Connect! Damon Civin will introduce you to the wonderful world of data science, Neil Tan will talk about machine learning on the edge, and Treasure Data has a workshop on analyzing big data sets. [Grab your ticket now for just $79](https://www.armtechcon.com/registration.html#mbed).


[![Mbed Connect bannner](https://os.mbed.com/media/uploads/nprobably/mbedconnectbanner.png)](https://www.mbed.com/en/about-mbed/events/mbed-connect-usa-2018/)

-

*Jan Jongboom is a Developer Evangelist for the Internet of Things at Arm. He found that field work is tiring. During Data Science Africa he walked 40.7 kilometers.*

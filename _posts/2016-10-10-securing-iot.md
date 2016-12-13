---
layout:   post
title:    "Securing the IoT evolution"
date:     2016-10-10 11:00:00
tags:     iot security
originalUrl: http://eecatalog.com/IoT/2016/10/10/securing-the-iot-evolution/
originalName: "Embedded Systems Engineering news letter"
---

While the Internet of Things (IoT) is well-accepted as a concept, there are issues to address for secure connectivity. A proven developer platform, supported by an ecosystem of partners can speed up the creation and deployment of IoT devices based on ARM® microcontrollers. Caroline Hayes talks to Jan Jongboom, Developer Evangelist IoT at ARM.

<!--more-->

**CH:** The Internet of Things (IoT) is often described by analysts as the next revolution in the computer industry—do you agree?

**JJ:** Many embedded developers will see the IoT as a natural evolution, rather than a completely new paradigm – given that they have built connected devices for decades. It is a set of tools to quickly build millions of centrally-managed, connected devices – combining best practices on communication techniques, security and software.

**CH:** What is your main concern for IoT?

**JJ:** Security is definitely top of my list. The internet is full of examples of security being either non-existent, or which has gone completely wrong, on IoT devices. This leads to unacceptable risks, both in the home—for example, webcams or baby monitors that can be accessed without any form of authentication— and in industrial automation. In 2015, research showed how a Jeep’s braking system could be accessed by hackers.

A big issue is that developers are still trained to build embedded devices ‘unsecure by default’. They build an embedded system and put a radio on top of it, but building a secure system requires either a very good understanding of cryptography and the underlying hardware, or a good off-the-shelf software / hardware stack that has security at its core.

**CH:** Apart from securing the data streams, are there other security concerns?

**JJ:** When we talk about IoT, we imagine millions of connected devices; so identity management becomes more important. It is important to verify that only the right devices come online, that security keys are not compromised, and that you are not communicating with a device that has compromised firmware.

You cannot solve all of these problems in software. When a hacker has access to the physical device they will find a way to access the RAM, making all areas vulnerable. One approach is to move some of these issues into hardware: tamper proofing devices, or adding features like ARM® TrustZone® to processors to hardware-isolate trusted and non-trusted code.

Another tool is mbed™ OS to develop IoT connected products, based on an ARM® Cortex®-M microcontroller. Its multi-layer security protects the IoT device, with isolated domains, mbed uVisor and mbed TLS (Transport Layer Security), to ensure secure communications within the IoT.

The mbed OS offers a range of libraries that can be imported, allowing the developer to focus activity on the device’s differentiating features. It also has a supportive eco-system of partners, for access to mbed-enabled partner boards, and collaboration.

**CH:** With millions of connected devices, manually updating devices is impossible. How do you see devices being updated?

**JJ:** This is where it shows how important it is to have a trusted relationship between your cloud and your device, as it can not only be a trusted data channel, but also a way of sending firmware updates to the device. Performing firmware updates over the air is a delicate process, not only is it vulnerable to attack, it can also be detrimental to the battery life of the device.

A combination of hardware support – to protect the keys used to verify the firmware signature – as well as software support – is needed, to achieve updates in an incremental manner in order to save battery life. If an update goes wrong, as was the case in Taiwan recently, when a bicycle rental service was brought to a standstill because of a failed system update, it can paralyze devices and networks.

**CH:** You mention battery life, how can you get the most out of a device?

**JJ:** It is something the embedded OS can help with. I think we will see a movement where much of the power management on the device will be done automatically. Rather than taking full control over the wake-sleep-cycle of a device, and switching contexts when necessary, we will see advanced schedulers being implemented on top of RTOSs. Especially on small sensor nodes, data will need to be monitored and sent only occasionally. A good scheduler should be able to do that efficiently.

**CH:** With so many options for connectivity protocols, how will developers adapt?

**JJ:** With the advent of the term IoT, we also see a lot of really great new radio techniques come along – from LoRaWAN (the Low Power Wide Area Network (LPWAN) specification intended for wireless battery devices) to NB-IoT (NarrowBand IoT, standardized by the 3GPP – 3rd Generation Partnership Project telecoms standards body) to 6LoWPAN (IPv6 over LPWANs).

Who knows what the hot new connectivity method will be in 2018. Development is going really fast here, so I’d suggest picking a stack that allows you to test and switch radios whenever necessary without having to completely redevelop the product.

mbed OS has a range of communications option and drivers for Bluetooth Low Energy, Thread, 6LoWPAN, Ethernet and WiFi, to provide as flexibility and future-proofing of devices.


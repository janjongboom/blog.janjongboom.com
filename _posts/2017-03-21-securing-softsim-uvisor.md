---
layout:   post
title:    "Securing soft-SIM credentials with mbed uVisor"
date:     2017-03-21 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Securing-soft-SIM-credentials-with-mbed/
originalName: "mbed Developer Blog"
---

Device authentication is a difficult and interesting problem. How do you know that a device is not lying about its identity? How do you keep authentication keys secure? On mobile phones, we've solved this by using SIM cards, which run their own operating system completely separate from the OS of your phone, ensuring that keys stay secure. However, SIM cards have some big disadvantages for IoT devices: they are relatively bulky, need a connector and add extra cost to your design. That's why [Ericsson, u-blox and ARM have collaborated](https://www.ericsson.com/research-blog/internet-of-things/secure-iot-identities/) to work on a solution for IoT devices that offers strong enough security but none of the downsides of SIM cards. This work was demonstrated three weeks ago during Mobile World Congress.

<!--more-->

![Brokering IoT dependencies with Lego]({{ site.baseurl }}/assets/ericsson2.jpg)

## Initial provisioning of credentials

The first challenge we face in such a product is how to securely provision the SIM credentials into the device. We don't want the credentials baked into the ROM because they are dynamic and may change over time. For this initial key exchange, we use the [OMA LWM2M] (http://www.openmobilealliance.org/wp/index.html) standard with the client provisioning service. LWM2M is an open standard for various device management functions, including provisioning, firmware updates and data exchange.

This initial provisioning step can happen over an untrusted data channel like Bluetooth or the installer’s mobile phone. For this demo, we set up a warehouse with an open WiFi network where devices were provisioned before being deployed. The device connects over a normal UDP socket that mbed TLS protects, which uses a client certificate (in ROM). When provisioning is complete, we get the IMSI (subscriber) number and the keys that are normally held on the SIM card.

**Note:** More information about LWM2M? See [this excellent webinar](https://attendee.gotowebinar.com/rt/7339085464228007426?Source=mbedblog).

## Protecting the keys

With these keys now held on the device, we face a new problem. How can we protect the keys? A traditional microcontroller design uses a flat address space, and thus, any piece of code can read all the memory on the device. This is a big problem. If an attacker finds a remote code execution vulnerability on the device, all keys will be leaked. One way of dealing with this problem is by using the [mbed uVisor](https://www.mbed.com/en/technologies/security/uvisor/). mbed uVisor allows you to create separate boxes with their own address space, which allows you to separate trusted and non-trusted code. These boxes are protected via an external MPU (on ARMv7-M architecture) or via [ARM TrustZone](https://www.arm.com/products/security-on-arm/trustzone) (on the new ARMv8-M architecture).


![Stepping through code while visiting Ericsson]({{ site.baseurl }}/assets/ericsson1.png)

*Stepping through uVisor code while visiting Ericsson*

Communication between boxes happens through a whitelisted RPC channel, which serializes requests and responses. For this demo, we have set up two boxes: one runs our application, and one deals with our credentials. When the application code wants to sign a message, it calls the secure box, which returns the signed message. This way, the application code never has to touch the keys. It also means that the code running in the secure box runs entirely separately from the network stack and is thus less susceptible to attacks.

## Communication

Afterward, we can set up a secure communication channel using these keys. The 3GPP - the standards body for everything GSM related - has defined a number of IETF standards for secure key distribution. For cellular networks, this is done through the [AKA](https://en.wikipedia.org/wiki/Authentication_and_Key_Agreement_(protocol) protocol. Fortunately 3GPP didn't stop there and also defined a derived standard that can be used for noncellular networks: [EAP-AKA and EAP-AKA'](https://en.wikipedia.org/wiki/Extensible_Authentication_Protocol#EAP_Authentication_and_Key_Agreement_prime_.28EAP-AKA.27.29). We can use these protocols to enable two-way identity verification and data encryption to the network, and use the internet through the backhaul of the GSM provider.

We now have the same setup as a device with a SIM card, including an almost similar security level, but all implemented in software.

## Conclusion

Security is a major concern for the Internet of Things. In this demo, we demonstrated how to do secure provisioning, how to protect keys and how to setup a protected and controlled data plane. Some more information is available at [Ericsson's blog](https://www.ericsson.com/research-blog/internet-of-things/secure-iot-identities/).

We want to stress that keeping your keys safe is especially important; thus, uVisor is a vital asset for any embedded application. When ARMv8-M devices - based on the ARM Cortex-M23 and Cortex-M33 cores - with built-in TrustZone become available, there is no excuse not to take security seriously.

-

*Jan Jongboom is Developer Evangelist IoT at ARM, and he found an [interesting bug](https://github.com/ARMmbed/mbed-os/issues/3610) while supporting Ericsson on this project.*


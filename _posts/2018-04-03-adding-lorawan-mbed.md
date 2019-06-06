---
layout:   post
title:    "Adding a LoRaWAN stack to Mbed OS 5.8"
date:     2018-04-03 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Adding-a-LoRaWAN-stack-to-Mbed-OS-58/
originalName: "Mbed Developer Blog"
---

LoRaWAN is a low-power wide-area network technology that combines kilometers of range with low power consumption - a great fit for Internet of Things devices. Arm is continuing its investment in LoRaWAN by adding a native LoRaWAN stack to Mbed OS 5.8. The stable, well-tested, and (EU) pre-certified stack makes it easy for device manufacturers to add long-range connectivity to their IoT devices.

<!--more-->

Arm's partners have been using Mbed as their main development platform for LoRaWAN devices for a long time. Semtech - the company that invented the LoRa modulation technique - has been publishing their stack on Mbed since the first LoRaWAN specification came out, and Multi-Tech's certified [mDot](https://os.mbed.com/platforms/MTS-mDot-F411/) and [xDot](https://os.mbed.com/platforms/MTS-xDot-L151CC/) modules are among the most popular modules on Mbed. But up until now, every vendor has had to build their own LoRaWAN networking stack. That is changing in Mbed OS 5.8.

In Mbed OS 5.8, Arm is adding a native, pre-certified LoRaWAN stack that works with any Mbed OS 5-enabled development board, and any available LoRa radio. The stack is integrated with other features that are important for IoT devices, such as Mbed TLS, Mbed RTOS, tickless mode, and deep-sleep APIs. This will allow device and module manufacturers to dramatically shorten their time to market, without having to develop their own networking stack. This is becoming more and more important, as the LoRaWAN standard is increasing in complexity with LoRaWAN 1.1 and adding features such as multicast and firmware updates.

Arm is heavily invested in advancing the LoRaWAN standard. We're an an active member of the LoRa alliance, and we were the first company to demonstrate multicast [firmware updates over LoRaWAN](https://mbed.com/fota-lora). An IoT device is more than just an MCU and a radio. A complete IoT product incorporates an RTOS, crypto libraries, an update client, a resilient file system, and more. Having a common set of well-integrated middleware modules is vital for a secure and scalable IoT solution.

## Getting started

In order to  get started with the new LoRaWAN stack, you need an Mbed-enabled development board. Either:

* A development board with a LoRa transceiver:
    * [L-TEK FF1705](https://os.mbed.com/platforms/L-TEK-FF1705/).
    * [Multi-Tech xDot](https://os.mbed.com/platforms/MTS-xDot-L151CC/).
    * [Multi-Tech mDot](https://os.mbed.com/platforms/MTS-mDot-F411/) and the [UDK2 board](http://www.digikey.com/product-detail/en/multi-tech-systems-inc/MTUDK2-ST-MDOT/591-1278-ND/5247463).
    * [Multi-Tech mDot EVB](https://os.mbed.com/platforms/mdotevb/).
    * [B-L072Z-LRWAN1 LoRa®Discovery kit](https://os.mbed.com/platforms/ST-Discovery-LRWAN1/).
* Or, an Mbed OS 5-enabled development board together with a LoRa shield:
    * [SX1272MB2xAS](https://os.mbed.com/components/SX1272MB2xAS/) - shield based on the SX1272 transceiver.
    * [SX1276MB1xAS](https://os.mbed.com/components/SX1276MB1xAS/) - shield based on the SX1276 transceiver.

In order to help you get started, we created a full end-to-end guide to build your own LoRa network. [The guide is available here](https://docs.mbed.com/docs/lora-with-mbed/en/latest/intro-to-lora/).

## Stack size

The LoRaWAN stack is completely statically allocated, and fits into 6K of RAM. The total size of the stack depends on your Mbed OS configuration. All numbers are measured on the Multi-Tech xDot target running Mbed OS 5.8.

**Default configuration, develop profile**

```
ROM [|||||||||||||||||||||||                             ]   117KB/256KB
RAM [||||||||||||||||||||||||                            ]   15.4KB/32KB
```

**Minimal configuration, release profile with newlib-nano and without RTOS loaded**

```
ROM [||||||||||||||                                      ]  72.3KB/256KB
RAM [|||||||||                                           ]   6.33KB/32KB
```

For more information about size optimization, see [this blog post](https://os.mbed.com/blog/entry/Reducing-memory-usage-with-a-custom-prin/), which has many useful links.

## Pre-certified

LoRaWAN operates in the unlicensed spectrum, but unlicensed does not mean unregulated. There are still limitations that your device needs to adhere to. This includes maximum power output, duty cycle limitations, and dwell time limitations. In order to  ensure that your devices  comply with the law, regardless of location, we ship a variety of channel plans with the LoRaWAN stack, modeled after the [regional parameters document](http://net868.ru/assets/pdf/LoRaWAN-Regional-Parameters-v1.1rA.PDF) by the LoRa alliance.

In addition, the stack is pre-certified by Etteplan in the European Union. This makes it easier - and cheaper - to certify the full device. In the near future, we'll also add support for other regions, most likely starting with the US. If you need a *fully* certified solution, you can use the Multi-Tech xDot or mDot modules.

## Future

Adding the stack to Mbed OS 5.8 is just the start. At the moment, the stack is LoRaWAN 1.02 compatible and is mainly focused on LoRaWAN Class A. We'll continue investing in the stack, bringing new LoRaWAN versions to it, and adding other operation classes.  When the multicast and data fragmentation specifications are standardized in the LoRa alliance, we'll also be updating our multicast firmware update solution to use the new stack.

-

*Jan Jongboom is Developer Evangelist at Arm, and an active contributor to the LoRa Alliance.*

---
layout:   post
title:    "Q&A - Webinar: Exploring LoRa with Mbed"
date:     2018-03-22 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/QA-Webinar-Exploring-LoRa-with-Mbed/
originalName: "Mbed Developer Blog"
---

On March 13th, Arm and Etteplan hosted two webinars on the new LoRaWAN stack that will be included in Mbed OS 5.8. More than 600 people joined the webinar, but if you missed it, see our  recording of the webinar [here](https://pages.arm.com/build-with-mbed-explore-LoRa-using-mbed.html).

We received far more questions during the Q&A than we could handle during the webinar, so in this blog post, we're answering as many as possible.

<!--more-->

If your question is not answered  below, then it may have already been answered in the  [Q&A post](https://os.mbed.com/blog/entry/Getting-started-LoRa-Mbed-Things-Network/) from our previous webinar last November, which covered the basics of LoRaWAN.

Please also see the  [getting started guide](https://docs.mbed.com/docs/lora-with-mbed/en/latest/intro-to-lora/), which covers many LoRaWAN basics, including gateway setup and compiling your first application.

**Where can I find the presentation?**

The slides are available [here](https://www.slideshare.net/janjongboom/build-with-mbed-exploring-lora-using-mbed), and the recording is available [here](https://pages.arm.com/build-with-mbed-explore-LoRa-using-mbed.html).

## What, why and when?

**When can we start using this stack?**

You can start using the stack  today. Just import the [example program](https://github.com/armmbed/mbed-os-example-lorawan) and start building. The official release will be when Mbed OS 5.8 comes out - probably next week.

**What is the cheapest Mbed-enabled LoRa module? What development board should I buy?**

The cheapest solution is to buy any Mbed-enabled microcontroller ($2) and pair it with an SX1272 radio ($3.50), though this requires you to do your own RF work. Multi-Tech xDot modules (integrated RF design) go for about $13.

Development boards are more expensive, of course, but you can get a  [NUCLEO-F401RE](https://os.mbed.com/platforms/ST-Nucleo-F401RE/) ($9) and an [SX1272 shield](https://os.mbed.com/components/SX1272MB2xAS/) ($25) and have a nice versatile development option. A full list of options - with integrated radios, or with a shield - are listed in the [getting started guide](https://docs.mbed.com/docs/lora-with-mbed/en/latest/intro-to-lora/).

**In the webinar you mentioned a 'fully optimized' configuration which fits in 7K of RAM. Does this include Mbed OS or just the radio stack?**

This includes Mbed OS 5.8 and all startup code, drivers and stacks, as well as  a small application which sends and receives data. It really fits in 7K. You do need to do a few things, including unloading the RTOS, switching to newlib-nano, and building for a release profile. You can find details for this in [this blog post](https://os.mbed.com/blog/entry/Reducing-memory-usage-with-a-custom-prin/).

**When creating a LoRa device using Mbed OS, how do you  verify that it is compatible with LoRa networks? Will devices need to be certified for the new stack? You  mentioned that the lora stack is pre-certified for Europe. Is there any certification that needs to be done for the US?**

The LoRa stack in Mbed OS 5.8 is pre-certified for the EU, which guarantees compatibility with every LoRaWAN network there. We'll be working with certification houses in other regions too, including the US. You're still required to do certification for your end-devices, but this should make it much simpler.  If you switch stacks, then you do need to re-certify.

**When do you expect the stack to be updated to LoRaWAN 1.1?**

We’ll start working on this after the initial release. It's too early to give a release date, especially since there are no LoRaWAN 1.1 network servers ready yet. We're actively working with The Things Network to make both our ends LoRaWAN 1.1 compatible.

**Besides the LoRaWAN stack, do you have a plan to develop P2P (point-to-point) Master-Slave stack without the use of gateway devices?**

No, not at this point, as we like standards-based communication protocols. But one of the things we're doing is abstracting radios behind a common interface, and you can use this as a base to create a point-to-point network.

## Features

**Is it possible to turn the LoRa module completely off (for instance in sleep mode)? Or is there a constant current consumption due to the LoRa module? Does Mbed OS supporting tickless sleep mode?**

The LoRa radio automatically shuts down when there's no activity. The rest of the device will go into sleep mode whenever all threads are idle. More information is in [the SleepManager docs](https://os.mbed.com/docs/v5.7/reference/sleep-manager.html).

Mbed OS 5.6 and later releases also support a tickless sleep mode. You can find more information in the [Mbed OS 5.6 release blog post](https://os.mbed.com/blog/entry/Mbed-OS-56/).

**Does Mbed OS take care of the duty cycle for me or should I calculate this myself?**

The Mbed OS LoRaWAN stack will automatically take care of the duty cycle and reject sending any message that violates the duty cycle.

**Does Mbed OS support multiple LoRa device connections?**

In LoRaWAN, you have credentials for a session and can use these credentials to encrypt / decrypt messages. Devices typically only hold one set of credentials (unless you use multicast). You can swap between credentials by calling the `connect` function on the stack multiple times and passing on the credentials you want to use.

**You specifically mentioned the Multi-Tech modules and Semtech radios. Are there any plans for support the RN2903 Module?**

Not integrated with the new LoRaWAN stack. The RN2903 needs to be paired with another microcontroller and then driven through AT commands. The Mbed OS LoRaWAN stack expects to be able to drive the radio directly. If you want to use the RN2903 you can look at the [ATCmdParser](https://github.com/ARMmbed/mbed-os/blob/master/platform/ATCmdParser.h) to write your own driver.

**Is LoRa triangulation / localization possible with this stack?**

Yes, because localization in LoRaWAN depends on features in the gateways and a clever algorithm. No changes to devices are necessary.

**Any plan to support AS923? If yes, when?**

The AS923 channel plan [is already supported](https://github.com/ARMmbed/mbed-os/blob/7c30faf69de11c84acc5853ed322e8b67a4ce33a/features/lorawan/lorastack/phy/LoRaPHYAS923.h).

**Can we process received data?**

Yes, this stack supports receiving downlink messages. See the `receive` call in the [example program](https://github.com/armmbed/mbed-os-example-lorawan).

**is there an API call to get the RSSI value?**

It depends on the network server. Most networks that I know send you the RSSI and SNR values of all gateways that received the message. On the device, side you can get RSSI values whenever you receive a message.

**Is Class B supported?**

LoRaWAN 1.1 is the first standard where Class B actually becomes viable. So, when the stack is updated to 1.1, we'll have Class B support too.

**Is Class C supported?**

There's no proper API for it yet, but the stack supports it.

**Is cryptography done in the LoRa module or in application?**

This is done in the networking stack, or alternatively,  in an external crypto engine. If you use the Mbed OS LoRaWAN stack, this will be handled automatically for you.

## Device and radio support

**Will this stack be useful for the Murata LoRa module which has the STM32L072CZ MCU and SX1276 radio?**

Yes, this stack can be used directly on the Murata module. Take a look at the [DISCO-L072CZ-LRWAN1](https://os.mbed.com/platforms/ST-Discovery-LRWAN1/) development board, which has this module and is fully supported by Mbed OS 5.8.

**I see most targets are based on ST. Will this easily work for other microcontrollers, or does this require porting?**

This stack works on every development board / module that [supports Mbed OS 5](https://os.mbed.com/platforms/). If your target does not support Mbed OS 5 yet, see this  [porting guide](https://os.mbed.com/docs/v5.7/reference/contributing-target.html).

**Can Multi-Tech mDot modules be upgraded to LoRaWAN 1.1?**

Yes. LoRaWAN 1.1 does not require any new hardware, so when the stack is updated to LoRaWAN 1.1 mDot modules will support it too.

**What timeframe would you estimate for SX1261 radio drivers?**

The radios first need to become available. [DigiKey still lists them with 10 weeks lead time](https://www.digikey.com/products/en?keywords=sx1261). Once  they become available, we'll add them as soon as we can.

**Future features of root of trust ownership were  mentioned. Do any modules currently support/have hardware crypto chips?**

The Multi-Tech xDot has an [optional secure element](https://www.multitech.com/brands/multiconnect-xdot), but it's just for AES-128 encryption right now. There are no root of trust features yet. You can always add an external secure element yourself. We're going to use the Microchip [ATECC608A](http://www.microchip.com/wwwproducts/en/ATECC608A) for our initial prototype.

## Generic LoRa(WAN) questions

**I'm using a NUCLEO-F401RE board with a SX1276 LoRa shield, but have not been able to send data whenever I want to. It limits itself to sending every 2m11s. Any idea what's going on?**

LoRa operates in an unlicensed spectrum, and there are regulations which govern this spectrum. One of those regulations is that, in Europe, you can use the spectrum only 1% of the time. So if you're sending for 2 seconds, you need to be quiet for 198 seconds. You can get around this by switching to a higher data rate (lower spreading factor) - although that comes at the cost of lower range. You're probably using SF12 at this point.

**How prone is LoRa to jamming?**

It's a radio protocol, so it’s relatively easy to jam, although this is illegal. However, that's the case for all radio protocols. GSM is also easy to jam, but GSM jammers are illegal as well. LoRa is very resistant against narrowband interference though, so if you have other devices using the same frequency you will not see too much loss.

**Which LoRaWAN server do you suggest for a demo?**

During the webinar, we used the embedded network server that is in the Multi-Tech Conduit. However, we do not recommend using this for anything other  than a demo, as it violates the basic principle of LoRaWAN architecture that all gateways should be 'transparent' (just passing messages through). Our [getting started guide](https://docs.mbed.com/docs/lora-with-mbed/en/latest/intro-to-lora/) uses The Things Network, which does not have these problems and is free to use.

**If a mobile LoRa device moves across country borders (e.g. on a truck/train/container), how can you ensure that the device uses the right RF frequencies, and adheres to local duty cycle regulations?**

The hardest problem is knowing when you cross borders. If you have GPS or a different positioning service, that could work, but there's nothing in LoRaWAN that  helps you with this. If your device is supposed to switch RF frequencies, then you need to have multiple antennas on the board, and have a radio that  supports both frequencies. You can switch between channel plans in the stack, and if you do this correctly, the device will keep adhering to local regulations.

**How does the ADR choose a spreading factor? Is it based on RSSI automatically, or is it up to the user to configure?**

It depends on the implementation of the network provider, but see the [algorithm from The Things Network](https://www.thethingsnetwork.org/docs/lorawan/adr.html). Here is some [background info](http://www.sghoslya.com/p/how-does-lorawan-nodes-changes-their.html), which includes which MAC commands go over the line.

**When can we expect 'WULoRa' - an energy harvesting wake-up receiver?**

Good question. This was actually the first time I heard about it ([see  the paper](http://ieeexplore.ieee.org/document/7927233/)). I’m not sure when we'll see it in commercial devices.

**If I understand correctly, it is possible to use 64 channels. But most gateways I found only use 8 channels. Did I miss something?**

No , this is correct. In some locations you have 64 channels, for example in the US. To get 8-channel gateways to work, network operators use  a sub-band (e.g. sub-band 2 uses channels 8-15). You need to check with your network operator to see which sub-band they use, and be  sure to configure both devices and gateways to it.

If your device uses OTA activation, it will receive the channels to use in the join accept message. However, this might take a while if you don't have sub-bands configured (as it first needs to jump to a frequency the gateway supports - this might take 8 tries).

**I have worked with the STML0 Mbed Nucleo boards, and found that the US915 has bugs. I have found something similar  with other modules. They work reliably  at 868MHz, but infrequently at 915 MHz. What might be going on?**

This is probably because of sub-band configuration. See the question above.

**I understand LoraWAN is exclusively a star topology.  Do you guys know of anyone trying to build a mesh topology on top of the LoRa PHY?**

No, I'm not aware of anyone doing this. But you could do it by porting an 802.15.4 mesh stack on top of LoRa radio. Arm actually has an open source [6LoWPAN on 802.15.4 stack](https://docs.mbed.com/docs/arm-ipv66lowpan-stack/en/latest/01_overview/). The lower data rates (versus QPSK) might pose an issue, as 802.15.4 frames are much larger than LoRaWAN.

**What configuration should I use in Malaysia?**

There are no regional parameters published for Malaysia yet, but [according to this document](https://tutorial.cytron.io/2017/10/20/lora-malaysia-probably-indonesia/) you should use 919-923 MHz (with some duty cycle limitations), so if you use a  915 MHz radio you should be safe. Be  sure to adapt the channel plan, so that it doesn't violate the regulations in Malaysia.

## Firmware updates

We have a dedicated page that documents our efforts around multicast firmware updates over LoRaWAN. It contains a demo, presentations, a reference application, and a whitepaper: https://mbed.com/fota-lora. Note that this is a very early release, which is not standardized in the LoRa alliance yet (but it's in progress), nor has it gone through a full security review. For the full release, we'll follow the [suit](https://datatracker.ietf.org/wg/suit/documents/) proposed standard, which is under consideration with the IETF.

**Will FOTA be a function in this stack?**

Yes, but we are waiting for the multicast and data fragmentation specifications to be finalized before updating the stack to support FOTA, as we do not want non-standard devices to start shipping. This would hurt the LoRaWAN ecosystem. An earlier version - that does not yet use  the new stack - and more information are  available in the link above.

**Wouldn't firmware updates over LoRa be extremely slow? Or can you make these incremental?**

Yes, we’ve used some techniques (and introduced some new standards) to make this viable. They  include clever fragmentation, multicast, and delta updates. A typical update in EU868 at SF9 takes 2 minutes and 30 seconds of transmission time.

**Do you use security validation in firmware updates (signing and authentication)?**

Yes, we use asymmetric crypto (ECDSA-SHA256) to verify the integrity of firmware. The public key is held on the device and the private key is used to sign the update. This is also the case for delta updates, where we sign the hash of the file after patching. The full architecture that we're following is documented [on the IETF website](https://datatracker.ietf.org/doc/draft-moran-suit-architecture/), and is written by Arm engineers.

**How does data fragmentation work with ADR?**

When sending large blocks of frames (using data fragmentation), we peg the data rate and frequency. Thus, ADR is disabled. Theoretically, you could have it enabled while  sending data over unicast, but that slows down transmission, as you need to send MAC commands back and forth. In multicast, it's impossible, as you need to explicitly set the data rate for all devices.

## Mbed

**How do we import an online Mbed project into our local compiler?**

If you have a project in the online compiler, just Right click on it, select 'Export,' and select your IDE.

**Is there any support for industrial communication protocols like  RS232 and Modbus, such as reading some registers of a Modbus device and sending them by LoRaWAN?**

There is no support  in Mbed OS itself, but we have an amazing community. For example, see this  [Modbus slave implementation](https://os.mbed.com/users/cam/code/Modbus/). RS232 can often be done by using `Serial` (or otherwise via a MAX232).

**When will the online compiler support C++11?**

I don't know, unfortunately. If we'd have [build profiles](https://os.mbed.com/docs/latest/tools/build-profiles.html) in the Online Compiler this would be trivial. There is a [ticket for it](https://github.com/ARMmbed/mbed-os/issues/6390).

**I thought Babbler is using NB-IoT from T-Mobile and not LoRaWAN?**

Babbler - interviewed for 'Built with Mbed' [here](https://os.mbed.com/blog/entry/Built-with-mbed-Supply-chain-monitoring/) - has options for both LoRa and NB-IoT. Note that at  Arm, we also like NB-IoT. We're heavily investing in both technologies.

**Are any existing suppliers planning on abandoning their own stack and supporting the Mbed OS LoRaWAN stack?**

IoT devices are much more than just an MCU and a radio these days. So, I believe that when Mbed OS 5.8 lands, vendors will realize that it's a lot easier to use Arm's complete offering (which includes RTOS, file systems, a bootloader, and update client), rather than creating their own software stack. That should lead to cheaper, feature-rich, and more secure devices.

-

*Jan Jongboom is a Developer Evangelist IoT at Arm, and is actively working on [firmware updates over LoRaWAN](https://mbed.com/fota-lora). Next time he'll look at his traveling schedule first before agreeing to a webinar at 4AM.*

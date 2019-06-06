---
layout:   post
title:    "Introducing hardware crypto for LoRaWAN"
date:     2019-01-31 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/introducing-lorawan-hw-crypto/
originalName: "Mbed Developer Blog"
---

In a world where everything is connected, security is not optional. To protect LoRaWAN devices, Arm, Microchip Technology and The Things Industries today released a pre-provisioned secure element. The secure element contains a secure identity, root keys compatible with LoRaWan 1.0.x and 1.1, and a crypto accelerator. The Mbed OS LoRaWAN stack can use the secure element to automatically offload all cryptographic operations, so your keys will never be visible nor accessible, even when your device might be compromised.

<!--more-->

It's important that IoT devices have an identity that you can trust. You need to make sure that data sent by a device are trusted, and was sent by the actual device In LoRaWAN 1.1 this is handled by a root key which is shared between the device and a join server. The join server is run by a trusted third party, here The Things Industries, and authenticates devices when they join the network.

The root key needs to be stored, and then injected to the device during production. This can be troublesome: where do you store the keys securely, and do you fully trust your factory not to leak your keys? One way of dealing with this is by using an external secure element that holds the identity. The identity creation is done in a separate secure facility so that sensitive keys are never exposed throughout the supply chain nor when the device is deployed. The  pre-provisioned secure elements are then sent to the assembly line.

The [Microchip ATECC608A-MAHTN-T](http://www.microchip.com/ATECC608aLoRaTTI) is one such secure element. It's tamper-proof, has protected storage for the root key, and has cryptographic acceleration for AES-128 (required to encrypt LoRaWAN payloads) and ECDSA-SHA256 (for validation of new firmware). And, as of today, you can buy them pre-provisioned with root keys for the join server offered by The Things Industries. This means you don't have to worry about the device's identity or key storage during deployment. Just integrate the secure element in your design, and the secure authentication is taken care of.

This does not mean you can use the secure element for authenticating only with The Things Industries. Join servers are a standardized part of LoRaWAN 1.1, and are independent of the network that you're using.

We have also integrated the ATECC608A in the Mbed OS LoRaWAN stack. When one is present, we'll offload all of the cryptographic operations to the secure element. Because the root keys are held in the secure boundary of the ATECC608A, your MCU will never (and can never) see the keys. Besides offering extra security, this also saves on both flash and RAM, because software crypto functions for AES-128 and ECDSA do not have to be loaded.

## Getting started

This example uses the [Atmel SAML21 Xplained Pro](https://os.mbed.com/platforms/SAML21-XPRO/) development board, but any Mbed-enabled development board should work. You'll need the following hardware:

* The [CryptoAuthentication™ UDFN Socket Kit](https://www.microchip.com/DevelopmentTools/ProductDetails/AT88CKSCKTUDFN-XPRO) extension board, and enable DIP switches 1, 3 and 6.
* A [pre-provisioned ATECC608A-MAHTN-T with the The Things Industries profile](https://www.microchipdirect.com/product/search/all/atecc608a-mahtn).

    Insert the ATECC608A to the CryptoAuthentication Socket Kit. When inserting the secure element, make sure the 'T' on the chip is aligned with the 'T' on the Socket Kit. You might need to use a magnifying glass.

* A SX1272 or SX1276 LoRa radio, such as the [SX1272MB2xAS](https://os.mbed.com/components/SX1272MB2xAS/) or [SX1276MB1xAS](https://os.mbed.com/components/SX1276MB1xAS/) shield.

After buying the pre-provisioned secure elements, you'll receive a file from Microchip. This file contains the unique identifiers for the ATECC608As and is cryptographically signed. Upload this file to the [The Things Industries Join Server](http://ttn.fyi/joinserver/microchip) to claim the devices.

When that is done, connect the LoRa radio over SPI to EXT1, and the CryptoAuthentication module over I2C to EXT3 on the SAML21 Xplained Pro:


![SAML21 Xplained Pro with SX1276 LoRa radio and secure element]({{ site.baseurl }}/assets/secure01.jpg)

*SAML21 Xplained Pro with LoRa radio and secure element.*

Then, import our [example project](https://github.com/armmbed/mbed-os-example-lorawan-atecc608a) using Mbed CLI or the Online Compiler.

**Note:** If you're using a different development board, set the right pins to connect to the LoRa radio and the secure element in `mbed_app.json`.

Compile and flash the application, and your device will join the network. That's all!

## Future

At Arm, we have a number of initiatives that improve the security of IoT devices: The [Platform Security Architecture (PSA)](https://www.arm.com/why-arm/architecture/platform-security-architecture) describes security threats and how to mitigate them, [TrustZone](https://developer.arm.com/technologies/trustzone) for v8-M introduces secure and non-secure domains on the same MCU, and [Pelion Device Management](https://cloud.mbed.com/product-overview) provides secure lifecycle management for devices. As all these projects benefit from an integration with external secure elements, we're also working on [Mbed Crypto](https://github.com/ARMmbed/mbed-crypto), a library which has a unified API for cryptography whether it's done in software through [Mbed TLS](https://tls.mbed.org/) or in an external crypto engine.

The collaboration with Microchip and The Things Industries fits this perfectly. Security can no longer be an afterthought, and should be designed in from the start. As part of this project, we've added a crypto abstraction to the Mbed OS LoRaWAN stack. This allows other vendors to also plug in their implementation. If you're interested in this, please let us know.

Also, don't miss our sessions during [The Things Conference](https://www.thethingsnetwork.org/conference/) 31 January and 1 February!

* Thursday 31 January, 2:00 PM Stage 1 - Firmware Updates over the Air, Jan Jongboom.
* Thursday 31 January, 3:00 PM Stage 2 - Why machine learning on microcontrollers, Neil Tan.
* Friday 1 February, 2:30 PM Stage 2 - Developing with Mbed OS, Jan Jongboom.

-

*Jan Jongboom is a Developer Evangelist for the Internet of Things at Arm. He wants to extend a special thanks to Hasnain Virk and Antti Kauppila for their endless effort in getting this project up and running.*

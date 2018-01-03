---
layout:   post
title:    "Firmware updates on Mbed OS 5.5 with FlashIAP"
date:     2017-10-06 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/firmware-updates-mbed-5-flashiap/
originalName: "Mbed Developer Blog"
---

The Dutch have a saying: "where people work, mistakes are made." This is a problem if the mistake involves thousands of IoT devices that have a critical bug or a gaping security hole, especially if these devices are on a remote island or baked into concrete. Therefore, every Internet of Things deployment needs to remotely upgrade firmware securely and safely. To help developers build these firmware update capabilities into their devices, we have added new APIs and tools to Arm Mbed OS 5.5.

<!--more-->

The example in this blog requires a [FRDM-K64F](https://developer.mbed.org/platforms/FRDM-K64F/), [NUCLEO-F429ZI](https://developer.mbed.org/platforms/ST-Nucleo-F429ZI/) or [EVK-ODIN-W2](https://developer.mbed.org/platforms/ublox-EVK-ODIN-W2/) development board, plus a micro-SD card. However, the same principles apply to any other Mbed OS 5 board and any other flash chip.

## New APIs

In Mmbed OS 5.5, we have added support for these new features:

1. Bootloader support - The ability to build bootloaders, the ability to jump to other applications and integration of bootloaders in the Mbed build process.
1. FlashIAP - A new standard API - part of the HAL - to do In Application Programming on a variety of boards.
1. Storage drivers - New APIs for SD cards and block storage devices. Plus a FATFileSystem library, which you can mount to any storage driver.

Let's use these new APIs to build a simple firmware update demonstration. All these APIs are currently supported on the [FRDM-K64F](https://developer.mbed.org/platforms/FRDM-K64F/), [NUCLEO-F429ZI](https://developer.mbed.org/platforms/ST-Nucleo-F429ZI/), [EVK-ODIN-W2](https://developer.mbed.org/platforms/ublox-EVK-ODIN-W2/)  and [MultiTech xDot](https://developer.mbed.org/platforms/MTS-xDot-L151CC/). Support for more platforms is welcome. An example of adding support for a new board is [here](https://github.com/ARMmbed/mbed-os/pull/4640).

## How a firmware update works

A microcontroller stores its application in its flash memory. When you program a microcontroller - through drag-and-drop programming for example - the programmer (for example [DAPLink](https://github.com/mbedmicro/DAPLink) or a JTAG) stops the MCU, erases the flash, stores the new program and restarts the MCU. The new program loads. You need to stop the MCU because if you rewrite instructions while the application is running, the MCU crashes almost instantly.

However, if you guarantee that you're only programming flash that the running application does not touch, then you don't need to stop the MCU. This technique is called In Application Programming (IAP). The way to do this is to create two applications, each in their own region in flash. The first application starts up, checks if there is new firmware and then overwrites the flash of the second application. Afterward, jump to the address of the second application, and the new firmware runs.

This first application is called a bootloader. Bootloaders are typically small, do not use any networking and are only used to verify if new firmware has to be applied and then flash the new application. To facilitate firmware updates this way, the bootloader and our application need some shared storage space such as an external flash chip or an SD card. The example application in this blog post checks if new firmware is ready, downloads it and puts it in the external flash. On reboot, the bootloader checks the external flash, upgrades the application and hands control back.

## Building the bootloader

Part of the Mbed OS 5.5 release is an example bootloader, which uses an SD card as its external firmware storage. On startup, the bootloader verifies that an update file is on the SD card, loads the file and then uses FlashIAP to program the new application. The application is at [mbed-os-example-bootloader](https://github.com/armmbed/mbed-os-example-bootloader) and can be built in the Mbed Online Compiler or with [Mbed CLI](https://github.com/ARMmbed/mbed-cli):

```
$ mbed import https://github.com/armmbed/mbed-os-example-bootloader
$ cd mbed-os-example-bootloader
$ mbed compile -m UBLOX_EVK_ODIN_W2 -t GCC_ARM
```

As you can see in the source code, the bootloader is a normal Mbed OS 5 application. The magic is in [mbed_app.json](https://github.com/ARMmbed/mbed-os-example-bootloader/blob/86f4bbab206355a07b2641d27e1ef6529bd27eb0/mbed_app.json#L33), where we set the `target.restrict_size` option. When this option is set, the size of the bootloader image inflates to always match this size. This is necessary because you need to know exactly at which address the real application starts. If you inflate the bootloader size to a standard size (`0x40000` in this case), you can concat the two images togetherin the build process.

Another addition is the `mbed_start_application` function and the `POST_APPLICATION_ADDR` macro ([used here](https://github.com/ARMmbed/mbed-os-example-bootloader/blob/86f4bbab206355a07b2641d27e1ef6529bd27eb0/main.cpp#L38)). The macro indicates the location of the second application in flash, and the `mbed_start_application` function jumps to this address. In addition, it clears any interrupts that the bootloader application set.

**Note:** Pins are not reset when the bootloader hands over to the application.

As you're using the [FATFileSystem](https://github.com/ARMmbed/mbed-os/blob/master/features/filesystem/fat/FATFileSystem.h), make sure to format the SD card as FAT. Also note that you can use any other external flash chip, as long as you implement the BlockDevice class. ([Here's an example for the popular AT45 chip](https://github.com/chrissnow/DataFlashDevice).)

### Bootloader alignment

Some rules apply when setting the `target.restrict_size` option. First, any [Arm application](http://infocenter.arm.com/help/index.jsp?topic=/com.arm.doc.dui0203h/Cihdidh2.html) must start at a vector table size aligned address. Vector address alignment depends on the number of external interrupts on the target chip, but the maximum on ARMv7-M is 256 words (1024 bytes); thus, setting `target.restrict_size` to a multiple of 1024 is a safe choice for any Mbed Enabled MCU.

Second, the FlashIAP API can only reprogram complete pages, thus the application should also be page size and sector size aligned. These sizes differ from board to board, and you can obtain them by calling the `get_sector_size` and `get_page_size` functions of the FlashIAP API:

```cpp
FlashIAP iap;
iap.init();
// note: the address passed into `get_sector_size` should be close to where the application will be to get accurate numbers
printf("page size is %lu, sector size is %lu\n", iap.get_page_size(), iap.get_sector_size(0x8000000));
```

For the ODIN-W2 board, this results in a page size of 0x400 and a sector size of 0x4000. The `target.restrict_size` setting of `0x40000` aligns with both.

## Building the application

An application that uses a bootloader is almost exactly the same as an application without the bootloader. The only thing you need to add is a section in `mbed_app.json`, which points to the bootloader file:

```
{
    "target_overrides": {
        "UBLOX_EVK_ODIN_W2": {
            "target.bootloader_img": "bootloader/UBLOX_EVK_ODIN_W2.bin"
        }
    }
}
```

When this option is present, the application automatically aligns, and the build process combines the bootloader with the application. In addition, you see an *extra* binary in the BUILD folder, called `projectname_application.bin`. This binary contains only the application - but offset at the address right after the bootloader. This is the application you flash through FlashIAP. For initial drag-and-drop programming, still use `projectname.bin`.

For this blog post, we have written a small application that uses [mbed-http](https://developer.mbed.org/teams/sandbox/code/mbed-http/) to download a file from the network and then store it on the SD card. When the download is complete, the system restarts, and the bootloader can update the firmware.

To build this application:

* Import [`mbed-os-example-fota-http`](https://github.com/janjongboom/mbed-os-example-fota-http) through Mbed CLI.
* Set your connectivity method (and, optionally, your Wi-Fi credentials) in `mbed_app.json`.
* Set the address of a server (for example, your local computer's IP) in `main.cpp`.
* Build and flash the application.

The application already contains a bootloader for three boards (FRDM-K64F, NUCLEO-F429ZI and ODIN-W2). If you want to add another board, you need to compile the bootloader.

### Creating an updated application

Now, change some parameters in the application, for example the speed at which blinky runs or the text at the start of the application, and recompile. Then, copy the `mbed-os-example-fota-http_application.bin` to a location where the board can download it.

For example, with Python installed, copy the file to a new folder, rename the file to `update.bin`. From a terminal, run (in the folder):

```
$ python -m SimpleHTTPServer
```

This starts an HTTP server on port 8000. If the board and computer are on the same network, the board can download the file directly from the computer.

## Running the application

Here's a video of the process in action on a uBlox EVK-ODIN-W2 board.

<iframe width="700" height="450" src="https://www.youtube.com/embed/n_KdkA8bZww" frameborder="0" allowfullscreen></iframe>

## Security

This application contains no security, so do not deploy it to real devices! Some tips to make the process more secure:

* Download the firmware over HTTPS. `Mbed-http` already supports this.
* Calculate the hash of the firmware to ensure the whole firmware was downloaded.
* Sign the firmware with a private key, and hold the public key in both bootloader and application, so the update process can verify the source of the firmware.
* Tag the new firmware with a version number and a device class ID, so you do not apply a wrong firmware accidentally.
* Keep the key used to verify the firmware in a secure element to prevent people from stealing it.
* Store at least two copies of the firmware for rollback purposes.
* Add a watchdog in the bootloader, so if the new firmware image bricks the device, you can roll back the old firmware.

Arm has already completed all this work for you, and the cryptographically secure bootloader and update client are available to [Mbed Cloud](http://cloud.mbed.com/) licensees.

## Size of the bootloader

A final note on the size of the bootloader. When working on a constrained device, you can make the bootloader smaller by removing the FATFileSystem driver and using the external flash directly. In addition, make sure to not use any `printf` statements, compile with a release profile (`mbed compile --profile=release`) and [remove the RTOS](https://developer.mbed.org/blog/entry/Reducing-memory-usage-by-tuning-RTOS-con/). In addition, building with ARMCC yields better results than with GCC for code size. With these optimizations, we built a bootloader for the MultiTech xDot that only uses 21K of flash.

## Conclusion

Mbed OS 5.5 has the infrastructure in place to make it a lot easier to build firmware-update aware applications. Integration of bootloaders in the build process removes the error-prone process of manually linking bootloader and application together, and the standard FlashIAP and data storage APIs make it possible to target many boards with only one application. On top of this, these APIs are not linked to any connectivity method. Arm is using the APIs to have a single update client which can update devices both over CoAP and [LoRaWAN](https://developer.mbed.org/blog/entry/firmware-updates-over-lpwan-lora/). The initial release supports four development boards, but we hope to support many more boards very soon. Pull requests are always welcome ([here's an example](https://github.com/ARMmbed/mbed-os/pull/4640))!

-

*Jan Jongboom is working on secure multicast firmware updates over [Low-Powered Wide Area Networks like LoRa](https://developer.mbed.org/blog/entry/firmware-updates-over-lpwan-lora/). He is speaking about this topic during [Arm Techcon 2017](http://schedule.armtechcon.com/session/enabling-firmware-updates-over-lpwan/850218).*

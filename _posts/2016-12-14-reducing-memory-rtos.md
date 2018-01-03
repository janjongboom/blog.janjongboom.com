---
layout:   post
title:    "Reducing memory usage by tuning RTOS configuration"
date:     2016-12-14 00:00:00
tags:     mbed
originalUrl: https://developer.mbed.org/blog/entry/Reducing-memory-usage-by-tuning-RTOS-con/
originalName: "Mbed Developer Blog"
---

Two weeks ago, we blogged about [optimizing memory usage for mbed OS 5.2](https://developer.mbed.org/blog/entry/Optimizing-memory-usage-in-mbed-OS-52/), and today we want to show how memory usage can be decreased even further. This can be accomplished by tuning the RTOS configuration to our specific needs, or even turning off mbed RTOS altogether. This allows us to fit mbed mbed OS 5.2 on the smallest targets, like the [nRF51822](https://developer.mbed.org/platforms/Nordic-nRF51-DK/) which has only 6K of RAM available for user-space applications.

<!--more-->

All programs in this blog post are compiled for the nRF51-DK target using GCC 4.9.3.

## Baseline numbers

When compiling [blinky](https://github.com/armmbed/mbed-os-example-blinky) with `NDEBUG` defined and `stdio-flush-at-exit` disabled (see [this blog post](https://developer.mbed.org/blog/entry/Optimizing-memory-usage-in-mbed-OS-52/)), we use about 5K of static RAM and 15K of flash:

```
Total Static RAM memory (data + bss): 5044 bytes
Total RAM memory (data + bss + heap + stack): 20548 bytes
Total Flash memory (text + data + misc): 14896 bytes
```

## RTOS configuration

If we don’t need all the features of mbed RTOS, we can tweak these numbers by reducing the number of tasks, decreasing thread stack sizes or disabling user timers. The default values for these configuration options are in [this file](https://github.com/ARMmbed/mbed-os/blob/master/rtos/rtx/TARGET_CORTEX_M/RTX_Conf_CM.c) and can be overriden using the [mbed_app.json](https://github.com/ARMmbed/mbed-os/blob/master/docs/config_system.md#configuration-data-in-applications) configuration file.

Some interesting options that we have here are:

* `OS_TASKCNT` - Number of concurrent running user threads.
* `OS_IDLESTKSIZE` - Default stack size for the Idle thread - in words of 4 bytes.
* `OS_STKSIZE` - Default Thread stack size - in words of 4 bytes.
* `OS_TIMERS` - Enable the timer thread.
* `OS_FIFOSZ` - ISR FIFO Queue size.
* `OS_MUTEXCNT` - Maximum number of system mutexes.

We can configure these options by adding the ‘mbed_app.json’ file in the root of our project and re-compiling:

```json
{
    "macros": [
        "NDEBUG=1",
        "OS_TASKCNT=1",
        "OS_IDLESTKSIZE=32",
        "OS_STKSIZE=1",
        "OS_TIMERS=0",
        "OS_FIFOSZ=4",
        "OS_MUTEXCNT=1"
    ],
    "target_overrides": {
        "*": {
            "platform.stdio-flush-at-exit": false
        }
    }
}
```

The actual parameter values will of course depend on your application. With these configuration parameters above we can shrink down our static RAM usage to about 3K:

```
Total Static RAM memory (data + bss): 3364 bytes
Total RAM memory (data + bss + heap + stack): 20548 bytes
Total Flash memory (text + data + misc): 14324 bytes
```

## Removing the RTOS

If we don’t need the RTOS at all, we can also remove the feature completely, saving both RAM and flash. To do this, we can exclude the RTOS folders when building via an [.mbedignore](https://docs.mbed.com/docs/mbedmicro-api/en/latest/ignoring_files_from_build/) file. We will also need to change `main.cpp` to not use `Thread::wait` as this function will not be available.

To remove the RTOS we create a new file ‘.mbedignore’ in the root of our program:

```
mbed-os/rtos/*
mbed-os/features/FEATURE_CLIENT/*
mbed-os/features/FEATURE_COMMON_PAL/*
mbed-os/features/FEATURE_UVISOR/*
mbed-os/features/frameworks/*
mbed-os/features/net/*
mbed-os/features/netsocket/*
mbed-os/features/storage/*
mbed-os/events/*
```

When we now rebuild the application we see a huge decrease of RAM and flash, to 720 bytes (!) static RAM and less than 8K of flash.

```
Total Static RAM memory (data + bss): 720 bytes
Total RAM memory (data + bss + heap + stack): 20552 bytes
Total Flash memory (text + data + misc): 7828 bytes
```

## Conclusion

The flexibility of mbed OS 5's configuration system makes it possible to run the OS on many different MCUs, whether they're beefy Cortex-M4s or tiny Cortex-M0s. For small targets, it's always worth it to carefully tune the RTOS parameters and if you have a very small target and a specific use case, you might even consider removing the RTOS altogether. By using the optimizations in this post, we managed to squeeze mbed OS 5, a Bluetooth stack, mbed TLS and Google's [Eddystone reference implementation](https://github.com/roywant/EddystoneBeacon/) onto a tiny nRF51822 beacon.

-

*[Jan Jongboom](https://twitter.com/janjongboom) is Developer Evangelist IoT at ARM.*

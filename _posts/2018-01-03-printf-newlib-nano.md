---
layout:   post
title:    "Reducing memory usage with a custom printf and newlib-nano"
date:     2018-01-03 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Reducing-memory-usage-with-a-custom-prin/
originalName: "Mbed Developer Blog"
---

We’ve blogged about memory optimization before: [Reducing memory usage by tuning RTOS configuration](https://os.mbed.com/blog/entry/Reducing-memory-usage-by-tuning-RTOS-con/), [Optimizing memory usage in Mbed OS 5.2](https://os.mbed.com/blog/entry/Optimizing-memory-usage-in-mbed-OS-52/) and [Where did my flash go? Visualizing linker statistics](https://os.mbed.com/blog/entry/visualizing-linker-stats/). Mbed OS also supports [runtime memory tracing](https://os.mbed.com/docs/v5.7/tutorials/optimizing.html#runtime-memory-tracing) and [runtime memory statistics](https://os.mbed.com/docs/v5.7/tutorials/optimizing.html#runtime-statistics).

Both flash memory and RAM are limited on most microcontrollers, so reducing the memory footprint of your application can help you squeeze in more features or reduce cost. In this blog post we'll look at making Mbed OS 5 applications smaller, first by replacing standard I/O calls with a smaller implementation, and then by switching the whole standard library. All numbers in this post are based on Mbed OS 5.6.6 and GCC 6.3.1, and verified on [NUCLEO-F401RE](https://developer.mbed.org/platforms/ST-Nucleo-F401RE/).

<!--more-->

## Printf() and friends

Take the following application, which blinks an LED and prints the state of a button:

```cpp
#include "mbed.h"

DigitalOut led1(LED1);
DigitalIn btn(USER_BUTTON);

int main() {
    while (true) {
        led1 = !led1;

        printf("Button value is %d\n", btn.read());

        wait(0.5);
    }
}
```

When compiling with the `release` [build profile](https://os.mbed.com/docs/v5.7/tools/build-profiles.html), this application takes 10K static RAM and 41K of flash.

Now, if you comment out the `printf()` call, this drops to 21K of flash. A huge difference. This is because `printf()` needs to cover different scenarios and various inputs - things that cannot be analyzed during build time. So when you include a single print statement, everything needs to be linked in.

**Note:** To see the exact difference between these builds, run the compile command with `--stats-depth=100`. It gives you a complete list of files and their size.

## A smaller printf() alternative

The easiest way of reducing the size of the binary is to exclude all `printf` calls in a release build. You can do this by changing `printf()` to `debug()` calls (located in the [mbed_debug.h](https://os.mbed.com/docs/v5.6/mbed-os-api-doxy/mbed__debug_8h_source.html) header). However, if you ever need to look through logs, you’ll find that you’ve lost valuable debug information.

A better way of optimizing this is using an alternative `printf` version that you can tweak at compile time. No need for floating point numbers? Just compile it out. This saves valuable flash.

A variety of alternative `printf` implementations exist. This blog post uses the implementation from the [Coremark LM32](https://github.com/jpbonn/coremark_lm32) project. This library offers a *subset* of `printf()` features (it's not 100% complete), and can disable floating point  support to save additional flash. Let's look at some numbers.

First, add the library to your project (we’re using Mbed CLI because the Online Compiler always builds with the develop build profile):

```
$ mbed add https://github.com/janjongboom/mbed-coremark-lm32-printf
```

Then use the library in the application:

```
#include "mbed.h"
#include "ee_printf.h"

DigitalOut led1(LED1);
DigitalIn btn(USER_BUTTON);

int main() {
    while (true) {
        led1 = !led1;

        ee_printf("Button value is %d\n", btn.read());

        wait(0.5);
    }
}
```

Compiling this version gives very different stats:

```
Total Static RAM memory (data + bss): 9748 bytes
Total Flash memory (text + data): 22912 bytes
```

This is 23K of flash, instead of the 41K you saw when including the full `printf` implementation and the 21K without `printf`. Great!

Note that this does not include floating point support. You can enable this in mbed_app.json ([instructions](https://github.com/janjongboom/mbed-coremark-lm32-printf#usage)).

### Note on writing directly to the stdio UART device

To swap implementations, you need to implement the function in the implementation that writes the actual character. This function is often called `put_character`, `send_character` or something similar. In this function, you want to write directly to the stdio UART device.

To see how this is done in the library used earlier, look at [the initialization](https://github.com/janjongboom/mbed-coremark-lm32-printf/blob/4031a45864c19ac757a4f92f58f9548cdd28b64d/ee_printf.c#L50), and the [forwarding of characters to UART](https://github.com/janjongboom/mbed-coremark-lm32-printf/blob/4031a45864c19ac757a4f92f58f9548cdd28b64d/ee_printf.c#L607).

## newlib-nano

Now, where else can we cut some weight? newlib, the C standard library used in GCC for Arm embedded, is bulky (see the 20K `printf()` function). So a few years ago Arm released support for [newlib-nano](https://community.arm.com/iot/embedded/b/embedded-blog/posts/shrink-your-mcu-code-size-with-gcc-arm-embedded-4-7) - a project to shrink the standard library. It includes a smaller `printf()` function, cuts C89 features and replaces the memory allocator with a smaller one. A large downside - for Mbed OS 5 development - is that it also removes thread safety from the standard library.

**If you are using Mbed's RTOS, do _not_ use newlib-nano!**

However, if you run your Mbed OS application in a single thread (or [have removed the RTOS](https://os.mbed.com/blog/entry/Reducing-memory-usage-by-tuning-RTOS-con/)), and need to squeeze the last piece of flash out of your system, using newlib-nano can bring signifcant benefits. Compiling the first example in this article (without `ee_printf`) uses less memory for newlib-nano:

```
Total Static RAM memory (data + bss): 7600 bytes
Total Flash memory (text + data): 21108 bytes
```

That's 20K less flash and 3K less RAM used.

If you remove the RTOS and switch to `ee-printf`, this will go down even more (at the cost of lost functionality):

```
Total Static RAM memory (data + bss): 1496 bytes
Total Flash memory (text + data): 11352 bytes
```

#### How to enable newlib-nano

You can enable newlib-nano through a [build profile](https://os.mbed.com/docs/v5.7/tools/build-profiles.html), by adding `--specs=nano.specs` to the `ld` flags. An example is [here](https://github.com/ARMmbed/lorawan-fota-demo/blob/7c8e932b2c99fdc0763e3953a9bcddbdd473d0ab/profiles/release.json#L15).

Then build with your custom profile:

```
$ mbed compile --profile=./path/to/release.json
```

## Final thoughts

Closely analyzing where your flash went (either manually, using `--stats-depth=100` or through the [linker visualizer](https://os.mbed.com/blog/entry/visualizing-linker-stats/)), and swapping large dependencies for more light-weight implementations can save space. The default `printf` implementation often eats flash, and switching to an alternative implementation, either a custom printf or newlib-nano, can help. Note that `printf()` is not the only place where the linker does suboptimal work; applications that use Mbed TLS can often benefit from using a custom configuration file - we saved over 100K flash for an application using HTTPS that way.

Keep in mind that newlib-nano is *not thread-safe* and should not be used by any Mbed OS application that uses the RTOS.

-

*Jan Jongboom is Developer Evangelist IoT and used these tricks to get the size of the [LoRaWAN firmware update bootloader](https://github.com/ARMmbed/lorawan-fota-bootloader) under 16K of flash.*

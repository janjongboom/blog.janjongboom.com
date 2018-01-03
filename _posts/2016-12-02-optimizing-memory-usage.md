---
layout:   post
title:    "Optimizing memory usage in mbed OS 5.2"
date:     2016-12-02 11:00:00
tags:     mbed
originalUrl: https://developer.mbed.org/blog/entry/Optimizing-memory-usage-in-mbed-OS-52/
originalName: "Mbed Developer Blog"
---

Three months ago we released [mbed OS 5](https://developer.mbed.org/blog/entry/Introducing-mbed-OS-5/), the latest version of our operating system for microcontrollers. While we added a lot of new features - including an RTOS - we also saw a bigger than expected increase in flash and RAM usage, two things that are scarce on embedded devices. Reason for Vincent Coubard, Senior Software Engineer on the mbed team, to dig through the `.map` files and see how we can decrease memory usage in mbed OS.

<!--more-->

## Comparison with mbed 2.0

First, we need some baseline numbers. When compiling [blinky](https://docs.mbed.com/docs/mbed-os-handbook/en/5.2/getting_started/blinky_compiler/) - a simple program that just flashes an LED - on mbed 2.0, we see about 5K static RAM, and around 38K flash used (compiled with GCC 4.9.3 on the [FRDM-K64F](https://developer.mbed.org/platforms/FRDM-K64F/)):

```
Allocated Heap: 65536 bytes
Allocated Stack: 32768 bytes
Total Static RAM memory (data + bss): 5128 bytes
Total RAM memory (data + bss + heap + stack): 103432 bytes
Total Flash memory (text + data + misc): 37943 bytes
```

When we compile the same program on mbed OS 5.1.2 we see a large increase in both RAM and flash usage, to almost 13K static RAM, and about 57K flash:

```
Allocated Heap: 65536 bytes
Allocated Stack: unknown
Total Static RAM memory (data + bss): 12832 bytes
Total RAM memory (data + bss + heap + stack): 78368 bytes
Total Flash memory (text + data + misc): 57284 bytes
```

## Removing unused modules

To see where that memory went we can first look at how memory usage is split between different modules:

```
+---------------------+-------+-------+-------+
| Module              | .text | .data |  .bss |
+---------------------+-------+-------+-------+
| Fill                |   132 |     4 |  2377 |
| Misc                | 28807 |  2216 |    88 |
| features/frameworks |  4236 |    52 |   744 |
| hal/common          |  2745 |     4 |   325 |
| hal/targets         | 12172 |    12 |   200 |
| rtos/rtos           |   119 |     4 |     0 |
| rtos/rtx            |  5721 |    20 |  6786 |
| Subtotals           | 53932 |  2312 | 10520 |
+---------------------+-------+-------+-------+
```

Most of this is normal; we're loading the hardware abstraction layer and the RTOS, but we also see `features/frameworks`. That is weird, as that is where our test tools live. We happen to build one of our test harnesses into every binary. What a waste! By [eliminating this module](https://github.com/ARMmbed/mbed-os/pull/2559) we save about 1K of RAM and a whopping 8K of flash:

```
Total Static RAM memory (data + bss): 11808 bytes
Total RAM memory (data + bss + heap + stack): 77344 bytes
Total Flash memory (text + data + misc): 49807 bytes
```

## Printf and UART

The next target would be the `Misc` module with around 28K of flash used. When we look at a visual representation of the memory map for our program, we see the UART driver and various functions related to `printf` being compiled in. That is suspicious, given that we are not using either in our program.

![Visualization of our memory map showing the UART and printf functions in the top right corner]({{ site.baseurl }}/assets/memory1.png)

*Visualization of our memory map showing the UART and printf functions in the top right corner*

We found that this was related to how we do traces and assertions in some of our modules, always redirecting error messages to `printf`. Whenever someone uses a single `printf` we need to compile in both the library and the UART driver (for serial communication). That is a huge overhead for something that is not actually used. While traces and assertions are very useful during development and in debug builds, we want them completely removed in release builds.

We already complied with standard C by not tracing in assertion code (`assert` and `MBED_ASSERT` functions) when `NDEBUG` is defined, but still wrote traces in `error` functions. By altering our drivers ([1](https://github.com/ARMmbed/mbed-os/pull/2715), [2](https://github.com/ARMmbed/mbed-os/pull/2741)) to fully disable logging to serial output on errors when `NDEBUG` is defined, we save 28K(!) of flash (but no RAM):

```
Total Static RAM memory (data + bss): 11808 bytes
Total RAM memory (data + bss + heap + stack): 77344 bytes
Total Flash memory (text + data + misc): 21244 bytes
```

To disable this feature you need to set the `NDEBUG` macro and the following configuration parameter in your `mbed_app.json` file:

```json
{
    "macros": [
        "NDEBUG=1"
    ],
    "target_overrides": {
        "*": {
            "core.stdio-flush-at-exit": false
        }
    }
}
```

Some more information can be found [in this comment](https://github.com/ARMmbed/mbed-os/issues/2635#issuecomment-248404271).

**Note:** Different compilers, different results; when compiling with ARMCC the ``printf`` and UART libraries only cost ~14K of flash.

## No need for destruction

We can also take advantage of the fact that we run our programs only on embedded targets. When you run a C++ applications on a desktop computer, the runtime constructs every global C++ object before `main` is called. It also registers a handle to destroy these objects when the program ends. This is injected by the compiler and has some implications for the application:

* The code injected by the compiler consumes memory.
* It implies dynamic memory allocation, and thus requires `malloc` and friends to be included in the binary, even when not used by the application.

When we run an application on an embedded device we don't need handlers to destroy objects when the program exits, because the application will never end. By [removing the registration of destructors](https://github.com/ARMmbed/mbed-os/pull/2745) on application startup, and by eliminating the code to destruct objects when `exit()` is called, we can shave off another ~2.5K of RAM and an additional 8K of flash:

```
Total Static RAM memory (data + bss): 8008 bytes
Total RAM memory (data + bss + heap + stack): 73544 bytes
Total Flash memory (text + data + misc): 14102 bytes
```

## Conclusion

Together these three optimizations gave us a huge decrease of both static RAM (47%) and flash (2.69x less) usage. Compared with mbed 2.0 we use 3K more RAM - which is mainly due to the inclusion of mbed RTOS - but we use only half the flash. We'll continue to make improvements on this in the near future. All patches have landed and are included in mbed OS 5.2.

-

*This article was written by Vincent Coubard (Senior Software Engineer) and Jan Jongboom (Developer Evangelist IoT).*

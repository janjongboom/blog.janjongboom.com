---
layout:   post
title:    "Tracing stack and heap overflow errors"
date:     2017-03-02 00:00:00
tags:     mbed
originalUrl: https://developer.mbed.org/blog/entry/Tracing-stack-and-heap-overflow-errors/
originalName: "Mbed Developer Blog"
---

If you have ever seen the [lights of dead](https://docs.mbed.com/docs/debugging-on-mbed/en/latest/Debugging/lights_of_dead/) on your development board, accompanied by an `RTX error code: 0x00000001` or `Operator new out of memory` message on the serial port, you have hit a memory overflow bug. Memory management remains a difficult problem on microcontrollers. Not only is memory limited, but also microcontrollers do not have an MMU and therefore cannot move memory blocks around without changing addresses. This lack of virtual memory means you have to have fixed stack sizes, so you can run into a stack overflow error even when there is still RAM available.

<!--more-->

To monitor and debug memory overflow issues, mbed OS 5 provides [runtime statistics](https://docs.mbed.com/docs/mbed-os-handbook/en/latest/advanced/runtime_stats/#heap-stats) for stack and heap usage. To make it easier to dynamically use these runtime statistics, [Max Vilimpoc](https://vilimpoc.org/blog/) - embedded software lead at unu GmbH in Germany - released the [mbed-memory-status](https://github.com/nuket/mbed-memory-status) library, which this blog post uses to analyse and debug both a stack overflow and a heap allocation error.

In addition, this post shows how you use Max's library to track usage of the ISR stack, which the mbed OS 5 runtime statistics do not provide.

## Adding mbed-memory-status to your project

If you're using the online compiler:

1. Right-click on your project.
1. Choose *Import Library > From URL*.
1. Under 'Source URL', enter: `https://github.com/nuket/mbed-memory-status`
1. Click *Import*.

If you're using mbed CLI, run:

```
$ mbed import https://github.com/nuket/mbed-memory-status
```

## Enabling runtime statistics

Open or create the mbed_app.json file, and fill it with:

```json
{
    "macros": ["DEBUG_ISR_STACK_USAGE=1", "MBED_HEAP_STATS_ENABLED=1", "MBED_STACK_STATS_ENABLED=1"]
}
```

This enables stack, heap and ISR stack statistics.

**Note:** If you're using the online compiler, remove the `DEBUG_ISR_STACK_USAGE=1` macro.

### ISR statistics

The ISR stack is not covered by the mbed OS runtime statistics but is an extension made by the mbed-memory-status library. Tracking works like this:

1. The library registers a function in the startup (*.S) script for the application.
1. This function fills the ISR stack with placeholder values (`0xAFFEC7ED`) but without affecting the stack pointer.
1. When requesting the available space on the ISR stack, the code inspects the memory reserved for the ISR stack and sees which part of the memory has not changed.

To enable these statistics, you'll need to modify the startup script for your development board. This only works if you're compiling locally with GCC, not in the online compiler. Instructions are [here](https://github.com/nuket/mbed-memory-status).

**Note:** This approach unfortunately does not track freed memory.

## Viewing memory regions

Now that you have enabled runtime statistics, you can view the memory regions. This is useful because it gives you insight in the threads that are running, the stack sizes of these threads and the available heap memory. This is especially useful when debugging stack overflow errors because it shows the memory regions and thread IDs.

To view the running threads and the heap and ISR stack sizes, add these lines to your `main()` function:

```cpp
#include "mbed_memory_status.h"

int main() {
    print_all_thread_info();
    print_heap_and_isr_stack_info();
```

For [mbed-os-example-blinky](https://github.com/armmbed/mbed-os-example-blinky) compiled with GCC_ARM, running on a [FRDM-K64F](https://developer.mbed.org/platforms/FRDM-K64F/) this results in the following output:

```
    stack ( start: 20002690 end: 200029B0 size: 00000320 used: 00000070 ) thread ( id: 200029F8 entry: 00002E8D )
    stack ( start: 20000B7C end: 20001B7C size: 00001000 used: 00000098 ) thread ( id: 20002A38 entry: 000025F1 )
    stack ( start: 20002DC8 end: 20002FC8 size: 00000200 used: 00000040 ) thread ( id: 2000301C entry: 00002639 )
     heap ( start: 20003130 end: 2002F000 size: 0002BED0 used: 00000000 )  alloc ( ok: 00000000  fail: 00000000 )
isr_stack ( start: 2002F000 end: 20030000 size: 00001000 used: 00000400 )
```

You see three threads running, their memory regions and the amount of stack space used. To see what these threads are, you can inspect the `.elf` file (on a [debug](https://docs.mbed.com/docs/debugging-on-mbed/en/latest/Debugging/debug_builds/) build) via:

```
arm-none-eabi-nm mbed-os-example-blinky.elf
```

Looking for entries with offset `entry` minus 1 ([Why minus 1?](https://vilimpoc.org/blog/2017/02/01/stack-heap-and-thread-crash-hunting-in-mbed-os/#comment-304580)):

```
00002e8c T osTimerThread
000025f0 T pre_main
00002638 T os_idle_demon
```

## Debugging a stack overflow error

Now that you know which threads are running and the memory space that they are using, you can trigger a stack overflow error. The following program overflows the stack size of the main thread (`0x1000` bytes on the K64F) after a second:

```cpp
#include "mbed.h"
#include "mbed_memory_status.h"

int main() {
    uint8_t big_arr[1024];
    for (size_t ix = 0; ix < sizeof(big_arr); ix++) big_arr[ix] = ix; // fill the memory

    print_all_thread_info();

    while (true) {
        wait(1.0);

        // allocate an array that does not fit on the stack
        char another_array[3072];
        for (size_t ix = 0; ix < sizeof(another_array); ix++) another_array[ix] = ix;

        // some random operations on the arrays to prevent them from being optimized away
        another_array[rand() % sizeof(another_array)] = big_arr[rand() % sizeof(big_arr)];
        printf("random number is %d\n", another_array[rand() % sizeof(another_array)]);
    }
}
```

When you run this application, it first prints out the thread list and crashes immediately after.

```
    stack ( start: 20000B7C end: 20001B7C size: 00001000 used: 00000FFC ) thread ( id: 20002A38 entry: 00002575 )
RTX error code: 0x00000001, task ID: 0x20002A38
```

You can now look in the `nm` output to see which thread was responsible for crashing. This already helps pinpoint the problem, and by carefully placing `print_all_thread_info()` calls around your code, you can find out where the allocation fails quickly.

Unfortunately, a debugger does not help much in this scenario because this causes a stack corruption. Even when you set a watchpoint at the end of the stack, or break in the error handling code, the stack is corrupt, and you cannot backtrace.

**Note:** To prevent applications from continuing when stack corruption occurs, mbed OS 5 has a 'stack canary'. It's located in [rt_System.c](https://github.com/ARMmbed/mbed-os/blob/729ef153076ea9db4a9c9f81e90076960e035213/rtos/rtx/TARGET_CORTEX_M/rt_System.c#L318).

### Mitigating this problem

To deal with this problem, you can either:

* Move items from stack to the heap by replacing stack allocations with `malloc`.
* Increase the size of the stack.

The best way of dealing with this issue depends on your setup.

When you want to increase the stack size, you can either change the default stack size for threads (via the [OS_STKSIZE](https://developer.mbed.org/blog/entry/Reducing-memory-usage-by-tuning-RTOS-con/) macro) or spin up a new thread with the required stack size. The first option affects all your threads and thus is less recommended, and the second option is more flexible but requires you to allocate an extra thread.

You can run the example above in a new thread with a bigger stack size like this:

```cpp
#include "mbed.h"
#include "mbed_memory_status.h"

void fn_that_requires_big_stack() {
    uint8_t big_arr[1024];
    for (size_t ix = 0; ix < sizeof(big_arr); ix++) big_arr[ix] = ix; // fill the array

    while (true) {
        wait(1.0);

        // allocate an array that does not fit on the stack
        char another_array[3072];
        for (size_t ix = 0; ix < sizeof(another_array); ix++) another_array[ix] = ix;

        // some random operations on the arrays to prevent them from being optimized away
        another_array[rand() % sizeof(another_array)] = big_arr[rand() % sizeof(big_arr)];
        printf("random number is %d\n", another_array[rand() % sizeof(another_array)]);
    }
}

int main() {
    Thread t(osPriorityNormal, 8 * 1024 /* 8K stack */);
    t.start(&fn_that_requires_big_stack);

    print_all_thread_info();

   wait(osWaitForever);
}
```

When you run this application, you now see an extra thread with a stack size of 8K, of which 4.2K is used.

```
    stack ( start: 20002690 end: 200029B0 size: 00000320 used: 00000070 ) thread ( id: 200029F8 entry: 000031F1 )
    stack ( start: 20000B74 end: 20001B74 size: 00001000 used: 00000104 ) thread ( id: 20002A38 entry: 00002815 )
    stack ( start: 20003140 end: 20005140 size: 00002000 used: 00001070 ) thread ( id: 20002A78 entry: 00002515 )
    stack ( start: 20002DC8 end: 20002FC8 size: 00000200 used: 00000040 ) thread ( id: 2000301C entry: 0000279D )
```

*The third entry is the new thread.*

## Debugging a heap allocation error

When the heap is full, you either see `malloc()` fail, or you see the `Operator new out of memory` runtime error. You can use the same library to also track heap usage. This program fills up the heap using `malloc()` calls and then creates a new `DigitalOut` object, triggering the runtime error after a few seconds.

```cpp
#include "mbed.h"
#include "mbed_memory_status.h"

int main() {
    print_all_thread_info();
    print_heap_and_isr_stack_info();

    size_t malloc_size = 16 * 1024;

    while (true) {
        wait(0.2);

        // fill up the memory
        void* ptr = malloc(malloc_size);
        printf("Allocated %d bytes (success %d)\n", malloc_size, ptr != NULL);
        if (ptr == NULL) {
            malloc_size /= 2;
            print_heap_and_isr_stack_info();
        }

        // and then allocate an object on the heap
        DigitalOut* led = new DigitalOut(LED1);
    }
}
```

By printing the heap information, you can quickly see how each operation affects the amount of free memory on the heap.

```
Allocated 2048 bytes (success 1)
     heap ( start: 20003130 end: 2002F000 size: 0002BED0 used: 0002AC3C )  alloc ( ok: 0000001D  fail: 00000003 )
Allocated 2048 bytes (success 0)
     heap ( start: 20003130 end: 2002F000 size: 0002BED0 used: 0002AC40 )  alloc ( ok: 0000001E  fail: 00000004 )
Allocated 1024 bytes (success 0)
     heap ( start: 20003130 end: 2002F000 size: 0002BED0 used: 0002AC44 )  alloc ( ok: 0000001F  fail: 00000005 )
… snip ...
Allocated 128 bytes (success 1)
     heap ( start: 20003130 end: 2002F000 size: 0002BED0 used: 0002ACD0 )  alloc ( ok: 00000023  fail: 00000007 )
Allocated 128 bytes (success 0)
     heap ( start: 20003130 end: 2002F000 size: 0002BED0 used: 0002ACD4 )  alloc ( ok: 00000024  fail: 00000008 )
Operator new out of memory
```

After a while, the system cannot declare a new `DigitalOut` object on the heap anymore, and the program throws a runtime error.

A quick way to debug these errors is by attaching a [debugger](https://docs.mbed.com/docs/debugging-on-mbed/en/latest/) to your application and setting breakpoints in the `operator new` and `operator new[]` functions of [mbed_retarget.cpp](https://github.com/ARMmbed/mbed-os/blob/master/platform/mbed_retarget.cpp#L1023).


![Debugging OOM errors on the heap in Visual Studio Code]({{ site.baseurl }}/assets/oom1.png)

*Debugging OOM errors on the heap in Visual Studio Code*

This log information can also help when you want to determine whether you're leaking memory anywhere. You can run the logger in a separate thread and periodically print the heap memory used. If you see this increase over time, you may want to see if you forgot to free some objects.

## Conclusion

Memory issues remain one of the most annoying problems when developing for small microcontrollers, but with the addition of runtime statistics in mbed OS 5, it becomes easier to find these bugs. It's especially great to see the community using these statistics in new libraries to better analyze problems while running the application.

-

*Jan Jongboom is Developer Evangelist IoT, and he has debugged far too many memory leaks.*

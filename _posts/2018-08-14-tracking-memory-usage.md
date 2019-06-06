---
layout:   post
title:    "Tracking memory usage with Mbed OS"
date:     2018-08-14 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Tracking-memory-usage-with-Mbed-OS/
originalName: "Mbed Developer Blog"
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/1KJWW-6Y6IU" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

If you have ever seen the [lights of dead](https://docs.mbed.com/docs/debugging-on-mbed/en/latest/Debugging/lights_of_dead/) on your development board, accompanied by an `RTX error code: 0x00000001` or an `Operator new out of memory` message on the serial port, you have hit a memory overflow bug. Memory management remains a difficult problem on microcontrollers. Not only is memory limited, but also microcontrollers also do not have an MMU and therefore cannot move memory blocks around without changing addresses. This lack of virtual memory means that you have to have fixed stack sizes, so you can run into a stack overflow error even when there is still RAM available.

<!--more-->

Fortunately, Mbed OS has features that track exactly how much RAM is being used, what the stack sizes of your threads are, and has functionality to track all allocations throughout your application. In this blog post we'll introduce you to these tools and show you how to use them to analyze stack and heap overflow errors.

If you don't have an Mbed OS project yet, then import [mbed-os-example-blinky](https://os.mbed.com/teams/mbed-os-examples/code/mbed-os-example-blinky/) from Mbed CLI. The examples can also be compiled in the Online Compiler.  However, in order to view debug information, you need the `elf` file, which you cannot obtain through the Online Compiler.

## Enabling runtime statistics

Mbed OS has three modes for tracking memory usage: heap stats tracking, stack stats tracking and memory tracing. You can enable these functions by setting a macro in `mbed_app.json`. Open (or create) `mbed_app.json` in the root of your project and enter:

```json
{
    "macros": [
        "MBED_HEAP_STATS_ENABLED=1",
        "MBED_STACK_STATS_ENABLED=1",
        "MBED_MEM_TRACING_ENABLED"
    ],
    "target_overrides": {
        "*": {
            "platform.stdio-baud-rate": 115200,
            "platform.stdio-convert-newlines": true
        }
    }
}
```

Because memory tracing is done over the serial port by default (though this is overridable) the baud rate is upped to 115,200 bps to avoid a large slowdown. If your microcontroller supports it, then you can set this even higher.

## Viewing memory regions

Now that you have enabled runtime statistics, you can view the memory regions. This is useful because it gives insight into the threads that are running, the stack sizes of these threads and the available heap memory. This is especially useful when debugging stack overflow errors because it shows the memory regions and thread IDs.

To view the running threads and the heap and stack sizes, change `main.cpp` to read:

```
#include "mbed.h"
#include "mbed_mem_trace.h"

DigitalOut led1(LED1);

void print_memory_info() {
    // allocate enough room for every thread's stack statistics
    int cnt = osThreadGetCount();
    mbed_stats_stack_t *stats = (mbed_stats_stack_t*) malloc(cnt * sizeof(mbed_stats_stack_t));

    cnt = mbed_stats_stack_get_each(stats, cnt);
    for (int i = 0; i < cnt; i++) {
        printf("Thread: 0x%lX, Stack size: %lu / %lu\r\n", stats[i].thread_id, stats[i].max_size, stats[i].reserved_size);
    }
    free(stats);

    // Grab the heap statistics
    mbed_stats_heap_t heap_stats;
    mbed_stats_heap_get(&heap_stats);
    printf("Heap size: %lu / %lu bytes\r\n", heap_stats.current_size, heap_stats.reserved_size);
}

int main() {
    while (true) {
        print_memory_info();

        // Rest of the program
        led1 = !led1;
        wait(0.5);
    }
}
```

For Mbed OS 5.9.4 compiled with GCC_ARM with a debug profile, running on a FRDM-K64F, this results in the following output:

```
Thread: 0x20001F0C, Stack size: 824 / 4096
Thread: 0x20000E70, Stack size: 112 / 512
Thread: 0x20000EB8, Stack size: 144 / 768
Heap size: 1024 / 183216 bytes
```

To see what these threads are, you can find the entry function for each thread in the `.elf` file (on a debug build) by:

```
$ arm-none-eabi-nm mbed-os-example-blinky.elf

20001f0c B _main_obj
20000e70 b os_idle_thread_cb
20000eb8 b os_timer_thread_cb
```

This shows the main thread, the idle thread and the timer threads that are running. If you spawn a new thread, then  you'll see it pop up here as well. To adjust stack sizes, refer to the [runtime execution section](https://os.mbed.com/docs/v5.9/reference/execution.html) in the documentation.

## Debugging a stack overflow error

Now that you know which threads are running and the memory space that they are using, you can trigger a stack overflow error. The following program overflows the stack size of the main thread (4096 bytes) after a second. Replace the `main` function with:

```cpp
int main() {
    uint8_t big_arr[1024];
    for (size_t ix = 0; ix < sizeof(big_arr); ix++) big_arr[ix] = ix; // fill the memory

    print_memory_info();

    while (true) {
        wait(1.0);

        // allocate an array that does not fit on the stack
        char another_array[2048 + (rand() % 1024)];
        for (size_t ix = 0; ix < sizeof(another_array); ix++) another_array[ix] = ix;

        // some random operations on the arrays to prevent them from being optimized away
        another_array[rand() % sizeof(another_array)] = big_arr[rand() % sizeof(big_arr)];
        printf("random number is %d\n", another_array[rand() % sizeof(another_array)]);
    }
}
```

When you run this application it errors out after a second:

```
++ MbedOS Error Info ++
Error Status: 0x80010133 Code: 307 Module: 1
Error Message: Mutex: 0x20001ED4, Parameter error
Location: 0x2EA5
Error Value: 0x20001ED4
Current Thread: Id: 0x20001F0C Entry: 0x20001ED4 StackSize: 0x1000 StackMem: 0x20001ED4 SP: 0x2002FF00
-- MbedOS Error Info --
```

This gives you the thread, the size and the location from where the error was triggered. You can use the `Location` field to find the exact line that the error was thrown in. We discuss how to use this further below.

Unfortunately, this is as much information as we can extract. A debugger does not help in this scenario because the application causes a stack corruption. Even when you set a watchpoint at the end of the stack or break in the error handling code, the stack is corrupt and you cannot backtrace.

Combining the thread information, `nm` and the last location where an error was thrown can help pinpoint the problem. And, by carefully placing `print_memory_info()` calls around your code, you can find out where the allocation fails quickly.


**Note:** To prevent applications from continuing when stack corruption occurs, Mbed OS 5 has a 'stack canary'.

### Mitigating this problem

To deal with this problem, you can either:

* Move items from stack to the heap by replacing stack allocations with `malloc`.
* [Increase the size of the stack](https://os.mbed.com/docs/v5.9/reference/execution.html).

The best way to resolve the issue depends on your setup.

## Debugging a heap allocation error

When the heap is full, you can either see `malloc()` fail, or the `Operator new out of memory` runtime error. You can debug these errors through the heap stats tracker, and by using a debugger. Below a program that fills up the heap using `malloc()` calls and then creates a new `DigitalOut` object, triggering the runtime error after a few seconds. Replace the `main()` function with:

```cpp
int main() {
    print_all_thread_info();
    print_heap_and_isr_stack_info();

    size_t malloc_size = 16 * 1024;

    while (true) {
        wait(0.2);

        // fill up the memory
        void *ptr = malloc(malloc_size);
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
Heap size: 179272 / 183216 bytes
Heap size: 179536 / 183216 bytes
Heap size: 179540 / 183216 bytes

++ MbedOS Error Info ++
Error Status: 0x8001011F Code: 287 Module: 1
Error Message: Operator new out of memory

Location: 0x2DCD
Error Value: 0x4
Current Thread: Id: 0x20001F0C Entry: 0x411D StackSize: 0x1000 StackMem: 0x20001F58 SP: 0x20002EA0
-- MbedOS Error Info --
```

After a while, the system cannot declare a new `DigitalOut` object on the heap anymore, and the program throws a runtime error.

A quick way to debug these errors is by attaching a [debugger](https://os.mbed.com/docs/v5.9/tutorials/debugging.html) to your application and setting breakpoints in the `operator new` and `operator new[]` functions of `mbed_retarget.cpp`.


![Debugging heap overflow errors in Mbed OS 5.9]({{ site.baseurl }}/assets/oom1_8kaM171.png)

*This shows the application breaking in the error handler, and the valid call stack pointing at the `DigitalOut` declaration.*

## Using the memory tracer

The previous applications were quite straightforward, but finding a leak in a larger application may not be. To assist with this, you can use the memory tracer to track all allocations and deallocations in your application. To enable the memory tracer, set the `MBED_MEM_TRACING_ENABLED` macro and call `mbed_mem_trace_set_callback` from your application with a handler function. The default handler logs to `stdout`.

Below is an application that forgets to free a pointer. Replace `main` with:

```cpp
int main() {
    print_memory_info();
    mbed_mem_trace_set_callback(mbed_mem_trace_default_callback);

    while (true) {
        wait(2.0);

        void *ptr1 = malloc(512);
        void *ptr2 = malloc(768);
        void *ptr3 = (void*)new DigitalOut(LED1);

        // Grab the heap statistics
        mbed_stats_heap_t heap_stats;
        mbed_stats_heap_get(&heap_stats);
        printf("Heap size: %lu / %lu bytes\r\n", heap_stats.current_size, heap_stats.reserved_size);

        // Forget to free a pointer
        free(ptr1);
        free(ptr3);
    }
}
```

When you look at the serial output, you'll see data from the memory tracer, prefixed by `#`:

```
Heap size: 1024 / 183216 bytes
#m:0x200034b0;0x185b-512
#m:0x200036c0;0x1865-768
#m:0x20003060;0x186d-4
Heap size: 2308 / 183216 bytes
#f:0x0;0x1897-0x200034b0
#f:0x0;0x189d-0x20003060
#m:0x200034b0;0x185b-512
#m:0x200039d0;0x1865-768
#m:0x20003060;0x186d-4
Heap size: 3076 / 183216 bytes
#f:0x0;0x1897-0x200034b0
#f:0x0;0x189d-0x20003060
```

The log format for the tracer is for malloc:

```
#m:return_value:instruction-size
```

And for `free`:

```
#f:return_value:instruction-pointer
```

As you can see, we allocate 3 objects and only free 2. To find the exact location where this allocation was made, use `arm-none-eabi-objdump` and look for the instruction responsible for this allocation.

First, extract the symbols from the `elf` file:

```
$ arm-none-eabi-objdump -S mbed-os-example-blinky.elf > symbols.txt
```

Then open `symbols.txt`

Look for the offset of instruction that was not free'd in minus 1 ([why minus 1?](https://vilimpoc.org/blog/2017/02/01/stack-heap-and-thread-crash-hunting-in-mbed-os/#comment-304580)). In this case it’s `1864`.

```
        void *ptr1 = malloc(512);
    1852:    f44f 7000     mov.w    r0, #512    ; 0x200
    1856:    f009 fad5     bl    ae04 <malloc>
    185a:    9009          str    r0, [sp, #36]    ; 0x24
        void *ptr2 = malloc(768);                       <!--- this is where the dangling pointer was defined
    185c:    f44f 7040     mov.w    r0, #768    ; 0x300
    1860:    f009 fad0     bl    ae04 <malloc>
    1864:    9008          str    r0, [sp, #32]               <--- this line in ASM, look for the C++ line above to find the declaration
        void *ptr3 = (void*)new DigitalOut(LED1);
    1866:    2004          movs    r0, #4
    1868:    f002 f990     bl    3b8c <_Znwj>
```

Look at the C++ line above the assembly. This is the declaration of the dangling pointer. Crisis averted!

## Conclusion
Memory issues remain one of the most irritating problems in developing for small microcontrollers. However, the addition of runtime statistics and memory tracing in Mbed OS 5 has made it easier to find these bugs. To help locate these dangling pointers, there is a [script](https://github.com/janjongboom/mbed-find-dangling-pointers) available, which can parse the serial output and give you the information in a handy format.

If you're looking for memory optimization, see our blogposts on [Reducing memory usage by tuning RTOS configuration](https://os.mbed.com/blog/entry/Reducing-memory-usage-by-tuning-RTOS-con/), [Reducing memory usage with a custom printf and newlib-nano](https://os.mbed.com/blog/entry/Reducing-memory-usage-with-a-custom-prin/) and [Where did my flash go? Visualizing linker statistics](https://os.mbed.com/blog/entry/visualizing-linker-stats/).

-

*Jan Jongboom is Developer Evangelist IoT and he likes to keep his pointers steady.*

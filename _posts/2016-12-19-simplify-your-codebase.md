---
layout:   post
title:    "Simplify your codebase with mbed-events"
date:     2016-12-19 00:00:00
tags:     mbed
originalUrl: https://developer.mbed.org/blog/entry/Simplify-your-code-with-mbed-events/
originalName: "Mbed Developer Blog"
---

Alongside the release of mbed OS 5, we also introduced [mbed-events](https://github.com/ARMmbed/mbed-events), an event loop library that can run in an RTOS thread. Using an event loop is very useful to defer execution of code to a different context. An example would be to defer execution from an interrupt context (ISR) to the main loop, or to defer execution from the high-priority thread to a lower priority thread. Now that mbed-events is part of core mbed OS 5.2, we'd like to show how this library can simplify your code.

<!--more-->

For more information about the mbed-events library, have a look at [the documentation](https://docs.mbed.com/docs/mbed-os-handbook/en/5.1/concepts/events/). All code in this blog post was tested against mbed OS 5.2.3.

## Calling printf in an interrupt context

The following program has probably been written by anyone learning how to program microcontrollers. It registers an interrupt handler when a button is pressed, and then calls `printf` from the ISR.

**Naive approach**

```cpp
#include "mbed.h"

DigitalOut led(LED1);
InterruptIn btn(SW2);

void do_something() {
  led = !led;
  printf("Toggle LED!\r\n"); // CRASH! Blocking call in ISR...
}

int main() {
  btn.fall(&do_something);

  while (1) { }
}
```

When you compile this code with ARMCC, the program will crash right after toggling the LED. This is because calls to stdio (like `printf`) are [guarded by mutexes](https://developer.mbed.org/handbook/CMSIS-RTOS) in the ARM C standard library, and mutex functions [cannot be called from an ISR](https://www.keil.com/pack/doc/cmsis/RTOS/html/group__CMSIS__RTOS__MutexMgmt.html). We can get around this by signalling the main thread from the ISR and do the `printf` call in there. That's especially confusing when teaching beginners, as now we need to explain the concept of [Semaphores](https://developer.mbed.org/handbook/RTOS#semaphore) or [Mailboxes](https://developer.mbed.org/handbook/RTOS#mail) as well.

**Using a Semaphore**

```cpp
#include "mbed.h"

DigitalOut led(LED1);
InterruptIn btn(SW2);

Semaphore updates(0);

void do_something() {
  // release the semaphore
  updates.release();
}

int main() {
  btn.fall(&do_something);

  while (1) {
    // wait for the semaphore to be released from the ISR
    int32_t v = updates.wait();

    // now this runs on the main thread, and is safe
    if (v == 1) {
      led = !led;
      printf("Toggle LED!\r\n");
    }
  }
}
```

While this works, it's a lot more unclear, and we need to build a state machine to determine why the semaphore was released if we're adding more interrupts. Preferably we'd also run this in a separate thread.

With mbed-events we can easily spin up a new RTOS thread with the event loop running in it, and we can defer from ISR to that thread in one line of code.

**Using mbed-events**

```cpp
#include "mbed.h"
#include "mbed_events.h"

DigitalOut led(LED1);
InterruptIn btn(SW2);

// create an event queue
EventQueue queue;

void do_something() {
  // this now runs in the context of eventThread, instead of in the ISR
  led = !led;
  printf("Toggle LED!\r\n");
}

int main() {
  // create a thread that'll run the event queue's dispatch function
  Thread eventThread;
  eventThread.start(callback(&queue, &EventQueue::dispatch_forever));

  // wrap calls in queue.event to automatically defer to the queue's thread
  btn.fall(queue.event(&do_something));

  while (1) {}
}
```

When the interrupt fires, it now automatically defers calling the `do_something` function to the other thread, from where it's safe to call `printf`. In addition, we don't need to taint our main thread's main loop with program logic.

## Manually deferring from ISR to a thread

The downside of this approach is that both the toggling of the LED and the `printf` call are now executed outside the ISR and thus are not guaranteed to run straight away. We can work around this by toggling the LED from the ISR, then manually deferring the printf event to the thread.

```cpp
#include "mbed.h"
#include "mbed_events.h"

DigitalOut led(LED1);
InterruptIn btn(SW2);

EventQueue queue;

void do_something_outside_irq() {
  // this does not run in the ISR
  printf("Toggle LED!\r\n");
}

void do_something_in_irq() {
  // this runs in the ISR
  led = !led;

  // then defer the printf call to the other thread
  queue.call(&do_something_outside_irq);
}

int main() {
  Thread eventThread;
  eventThread.start(callback(&queue, &EventQueue::dispatch_forever));

  btn.fall(&do_something_in_irq);

  while (1) {}
}
```

## Mixing high priority and low priority events

We can differentiate between the importance of events by using multiple threads that run with different priorities. We can easily add a [Ticker](https://developer.mbed.org/handbook/Ticker) to the program which toggles `LED2` every second, which runs with a higher priority than the `printf` calls by creating a second event queue.

```cpp
#include "mbed.h"
#include "mbed_events.h"

DigitalOut led1(LED1);
DigitalOut led2(LED2);
InterruptIn btn(SW2);

EventQueue printfQueue;
EventQueue eventQueue;

void blink_led2() {
  // this runs in the normal priority thread
  led2 = !led2;
}

void print_toggle_led() {
  // this runs in the lower priority thread
  printf("Toggle LED!\r\n");
}

void btn_fall_irq() {
  led1 = !led1;

  // defer the printf call to the low priority thread
  printfQueue.call(&print_toggle_led);
}

int main() {
  // low priority thread for calling printf()
  Thread printfThread(osPriorityLow);
  printfThread.start(callback(&printfQueue, &EventQueue::dispatch_forever));

  // normal priority thread for other events
  Thread eventThread(osPriorityNormal);
  eventThread.start(callback(&eventQueue, &EventQueue::dispatch_forever));

  // call blink_led2 every second, automatically defering to the eventThread
  Ticker ledTicker;
  ledTicker.attach(eventQueue.event(&blink_led2), 1.0f);

  // button fall still runs in the ISR
  btn.fall(&btn_fall_irq);

  while (1) {}
}
```


## Conclusion

mbed-events makes it a lot easier to defer calls from one context to another, whether it's from an ISR back to a user thread, or from one thread to another. It also makes it easy to prioritise certain events over other events, and does not require you to write your own state machine or taint your main loop. Since it's a one-liner (wrap the callback in `queue.event()`) to wrap a call that would normally run in an ISR, it's also very friendly for beginners.

As of mbed OS 5.2, mbed-events is included as part of the core OS. If you're still on an earlier version of mbed OS, you can manually add [the library](https://github.com/armmbed/mbed-events) to your existing program. For more information see [the documentation](https://docs.mbed.com/docs/mbed-os-handbook/en/5.1/concepts/events/).

-

*[Jan Jongboom](https://twitter.com/janjongboom) is Developer Evangelist IoT at ARM and does not like to explain Semaphores during workshops.*

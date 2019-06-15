---
layout:   post
title:    "Power management in Mbed OS"
date:     2019-06-15 00:00:00
tags:     mbed
---

IoT devices often claim that they can run ten years off a battery, but building low powered nodes is hard. In any complex product there will be multiple threads running, a variety of active timers, perhaps a second core handling network connectivity, and of course there are your sensors and other peripherals using up your power budget. To help you manage these complexities while using the least amount of power, Mbed OS contains a number of low-power features including low power tickers, tickless mode and the sleep manager.

<!--more-->

**Note:** This article was written using Mbed OS 5.12.

## Power modes

Mbed OS contains three power modes:

* Active - The MCU and all clocks are running.
* Sleep - The core system clock is disabled. This eliminates dynamic power that the processor, memory systems and buses use.
* Deep sleep - In addition to the core system clock, also all high-frequency clocks are disabled, and the [SysTick](https://os.mbed.com/docs/mbed-os/v5.12/apis/rtos.html) is disabled.

Switching between these power modes is done automatically. When all threads in the system are idle Mbed OS yields control to the [idle thread](https://os.mbed.com/docs/mbed-os/v5.11/apis/idle-loop.html). The idle thread then invokes the sleep manager, which brings the system in sleep or deep sleep mode. The idle thread also sets a timer to wake the system back up, although you can also wake the system up through an external interrupt or the Real-Time Clock (RTC).

For example, this application will automatically bring the system in sleep mode between blinking the LED:

```cpp
#include "mbed.h"

DigitalOut led(LED1);

int main() {
    while (1) {
        // blink the LED
        led = !led;
        // sleep for two seconds
        wait_ms(2000);
    }
}
```

The same principles also apply when using multiple threads, or while using the [EventQueue](https://os.mbed.com/docs/mbed-os/v5.11/apis/eventqueue.html). When all threads are idle, the system will go to sleep.

This yields significant energy savings, without any modification from the developer. For example, here is the program mentioned above running without sleeping, with sleep mode enabled, and with deep sleep mode enabled; on the NUCLEO-F446RE blinking the built-in LED:


![No sleep]({{ site.baseurl }}/assets/idle-3.png)

*Without sleeping the MCU always consumes at least 43 mA.*


![Sleep]({{ site.baseurl }}/assets/sleep.png)

*By enabling sleep the idle current goes down to 15 mA; with clear peaks whenever we run some code.*


![Deep sleep]({{ site.baseurl }}/assets/deepsleep1.png)

*In deep sleep mode, the idle current goes down to 358 uA. Jitter can show if unused pins are not properly pulled up.*

**Note:** the current consumption differs wildly between targets, even when comparing between MCUs from the same vendor. Look at the data sheet for your MCU to get an indication of power consumption in sleep and deep sleep mode. The DISCO-L475VG-IOT01A target goes down to under 60 uA with the same application.

### Sleep vs. deep sleep

Whether the sleep manager puts the MCU in deep sleep instead of in sleep depends on:

* Whether the target has low-power tickers available. These are required to wake up the MCU when high-frequency tickers are disabled. If low power tickers are available, the `DEVICE_LPTICKER` macro is set.
* Whether [tickless mode](https://os.mbed.com/docs/mbed-os/v5.11/porting/tickless.html) is enabled. In tickless mode the system can function without the SysTick running. This is either enabled by the target, or by setting the `MBED_TICKLESS=1` macro.
* If any bus or driver is active that relies on the high-frequency clock. For example, the SPI bus when doing asynchronous operations or a high-frequency [Timer](https://os.mbed.com/docs/mbed-os/v5.11/apis/timer.html).
* The time until wake-up, as waking up from deep sleep can take up to 10 ms.

To help you understand how much time the MCU spends in active, sleep and deep sleep modes, and to determine what might be blocking deep sleep, you can enable CPU statistics and the sleep tracer.

### CPU statistics

To enable CPU statistics, which show you how much time is spent in various modes, add the following line to the `target_overrides` section of your `mbed_app.json` file:

```
           "platform.cpu-stats-enabled": 1
```

You can now call the `mbed_stats_cpu_get()` function to retrieve information on sleep behavior. For example:

```cpp
#include "mbed.h"
#include "mbed_stats.h"

static DigitalOut led(LED1);

int main() {
   while (1) {
       led = !led;
       wait_ms(2000);

       mbed_stats_cpu_t stats;
       mbed_stats_cpu_get(&stats);
       printf("Uptime: %llu ", stats.uptime / 1000);
       printf("Sleep time: %llu ", stats.sleep_time / 1000);
       printf("Deep Sleep: %llu\n", stats.deep_sleep_time / 1000);
   }
}
```

When your target supports low-power tickers and tickless mode this will yield:

```
Uptime: 2099 Sleep time: 0 Deep Sleep: 2098
Uptime: 4202 Sleep time: 0 Deep Sleep: 4197
Uptime: 6305 Sleep time: 0 Deep Sleep: 6296
Uptime: 8407 Sleep time: 0 Deep Sleep: 8394
Uptime: 10510 Sleep time: 1 Deep Sleep: 10493
Uptime: 12613 Sleep time: 1 Deep Sleep: 12591
```

(The uptime does not go up by exactly 2000 ms. as we also spend time writing the data out over serial).

### Blocking deep sleep

As stated before there are drivers and components that can block deep sleep, either because they need access to the high-frequency timers (such as the `Timer` object), or because they cannot handle the latency that waking up from deep sleep introduces. This happens for example when attaching a receive interrupt on an UART. By the time the interrupt fires the data that was written to the UART could no longer be there.

#### Acquiring a sleep lock

If your code requires blocking deep sleep, you can acquire a 'sleep lock'. While the lock is active Mbed OS will not bring the MCU into deep sleep mode. You can do this either by calling:

```cpp
sleep_manager_lock_deep_sleep();

// ... do your operation

sleep_manager_unlock_deep_sleep();
```

Or through the [DeepSleepLock](https://os.mbed.com/docs/mbed-os/v5.11/mbed-os-api-doxy/_deep_sleep_lock_8h_source.html) RAII object. While the object is in scope deep sleep will be locked.

```
// some code here
{
    DeepSleepLock lock;
    // Code in this block will run with the deep sleep mode locked
}
// deep sleep mode will be restored to their previous state
```

In addition, the `DeepSleepLock` object also has `lock` and `unlock` functions, which are useful for asynchronous operations.

#### Seeing active sleep locks

The sleep manager maintains a list of all active deep sleep locks, and can log these whenever the device goes into sleep mode. This helps you determine what is blocking sleep. To enable these log messages add the following macro to the `macros` section of your `mbed_app.json` file:

```
"MBED_SLEEP_TRACING_ENABLED"
```

For example, here we create a `Ticker` object that blinks the LED. The `Ticker` requires the high-frequency timers to be active:

```
#include "mbed.h"

static DigitalOut led(LED1);
static Ticker ticker;

void blink() {
   led = !led;
}

int main() {
   ticker.attach(&blink, 2.0f);
}
```

When you run this code with tickless enabled, this will print:

```
# at the beginning of the program
LOCK: Ticker.cpp, ln: 61, lock count: 1

# every time the device goes to sleep
Sleep locks held:
[id: Ticker.cpp, count: 1]
Sleep locks held:
[id: Ticker.cpp, count: 1]
```

This tells us every time we go to sleep that we have one sleep lock active, and it also tells us where the lock was declared. To bring this device into deep sleep we thus need to get rid of the lock. You can either do this by using a low-power variant of the same class, e.g. `LowPowerTicker` in this case, or by only keeping the object that locks active when you actually need it. For example, a WiFi module that uses a UART interrupt will block deep sleep; so only keep the interrupt active when you expect a response from the module. For PWM free the interface whenever you're not using it as to not block deep sleep.

**Tip:** Too much output from the sleep tracer? You can disable the code that logs all active locks when going to sleep in [mbed_sleep_manager.c](https://github.com/ARMmbed/mbed-os/blob/8e819de43e88a11428f3f7d21db7f6e7a534058a/platform/mbed_sleep_manager.c). This can make for a much cleaner log.


#### Mbed OS drivers that block deep sleep

This is a list of core Mbed OS drivers that block deep sleep:

* [Ticker](https://os.mbed.com/docs/mbed-os/v5.11/apis/ticker.html) - if you don't need the precision of the high-frequency timer, you can use [LowPowerTicker](https://os.mbed.com/docs/mbed-os/v5.11/apis/lowpowerticker.html) instead.
* [Timeout](https://os.mbed.com/docs/mbed-os/v5.11/apis/timeout.html) - if you don't need the precision of the high-frequency timer, you can use [LowPowerTimeout](https://os.mbed.com/docs/mbed-os/v5.11/apis/lowpowertimeout.html) instead.
* [Timer](https://os.mbed.com/docs/mbed-os/v5.11/apis/timer.html) - if you don't need the precision of the high-frequency timer, you can use [LowPowerTimer](https://os.mbed.com/docs/mbed-os/v5.11/apis/lowpowertimer.html) instead.
* [SPI](https://os.mbed.com/docs/mbed-os/v5.11/apis/spi.html), when using the asynchronous APIs.
* [I2C](https://os.mbed.com/docs/mbed-os/v5.11/apis/i2c.html), when using the asynchronous APIs.
* [CAN](https://os.mbed.com/docs/mbed-os/v5.11/apis/can.html), if there is an interrupt attached.
* [PWM](https://os.mbed.com/docs/mbed-os/v5.11/apis/pwm.html), after writing a value to a pin.
* Every class that inherits from `SerialBase`, such as [Serial](https://os.mbed.com/docs/mbed-os/v5.11/apis/serial.html), if they have a receive interrupt attached. Additionally, deep sleep is blocked temporarily while using the asynchronous APIs for reading and writing.

In addition target-specific drivers (such as USB stacks) or networking drivers might also block deep sleep.

## Advanced topics

### Inner workings

When all threads are paused the system [idle hook](https://os.mbed.com/docs/mbed-os/v5.11/apis/idle-loop.html) is invoked. By default (although this behavior is overridable) this will yield control over to the sleep manager. The sleep manager then either calls `hal_sleep()` or `hal_deepsleep()` depending whether deep is locked or permitted. These HAL functions are implemented by the target, according to the following specs:

* `hal_sleep()`:
    * Wake-up time should be less than 10 us.
    * The MCU should be able to wake up from any internal peripheral interrupt, and from an external pin interrupt.
    * All peripherals need to operate the same as in active mode.
* `hal_deepsleep()` -
    * Wake-up time should be less than 10 ms.
    * The MCU should be able to wake up from the low-power ticker, from the RTC, from an external interrupt, and from the watchdog timer.
    * High-speed clocks should be turned off.
    * RTC is running and keeps time.

Both HAL sleep functions work like an ARM Wait For Interrupt (WFI) instruction, where the function returns when there is a pending interrupt. To achieve this the sleep manager calls these functions from a [critical section](https://os.mbed.com/docs/mbed-os/v5.11/apis/criticalsectionlock.html). Often (although this is target specific) `hal_sleep` is implemented as just a `__WFI()` call, and deep sleep is the same call but surrounded by power control settings that limit the wakeup sources and functioning peripherals.

This is also why you'll see the MCU wake up from sleep every millisecond when not having tickless enabled. In non-tickless mode the SysTick needs to fire every millisecond, and does this by setting an interrupt on the usticker. Right after the SysTick the sleep manager will put the MCU back to sleep. However, this also means that in non-tickless mode we cannot put the MCU in deep-sleep, as the wake-up latency is bigger than the SysTick interval XXX.

For more information on the design of tickless and the sleep manager, see the [office hours video with Bartek Szwatkowski](https://www.youtube.com/watch?v=OFfOlBaegdg).

### Hibernate mode without RAM retention

All sleep modes in Mbed OS are implemented with RAM retention, but some MCUs have even lower power modes that completely stop the MCU, and won't retain any information. After waking up the MCU will start execution from the beginning of the program. F.e. the NUCLEO-F446RE mentioned earlier consumes 358 uA in deep-sleep mode, but can go down to 22 uA in 'standby' mode. Typically the only way to wake up from this mode is through an interrupt on a wake-up pin, or from the RTC (if it's running).

This use-case is not covered by the Mbed OS sleep API, but you can write target specific code that leverages this mode. For example, here is an Mbed OS 5 library to put STM32 devices [in standby mode](https://os.mbed.com/teams/sandbox/code/stm32-standby-rtc-wakeup/) and wake them up from the RTC.

### Measuring power consumption

Accurately measuring power consumption of deep sleep is hard because the huge dynamic range required, with current ranging from 1 uA to 100 mA. Also, the MCU is often awake for a very short amount of time, so measuring by hand is not practical. In addition, almost all Mbed-enabled development boards have a debug circuit that draws power (often much more than the MCU itself). Thus, for accurate power measurement you'll need:

1. A current measurement probe. Some options that we have good experiences with:
    * [QOITECH Otii](https://www.qoitech.com/) - acts as both a current and voltage measurement device, and as a flexible power source for your device. Probably your best option if you can spare $589.
     * [SiLabs Giant Gecko](https://os.mbed.com/platforms/EFM32-Giant-Gecko/) - this development board has a circuit which can also measure current [of an external MCU](https://www.silabs.com/community/mcu/32-bit/forum.topic.html/how_to_use_an_stkto-jLpQ). At $29 a much cheaper alternative to the dedicated probes, but can only output 3.3V which can be a problem when powering 5V peripherals.
    * [Nordic Power Profiler kit](https://www.nordicsemi.com/Software-and-Tools/Development-Kits/Power-Profiler-Kit) - originally made for Nordic development boards, you can also use this kit to measure current of any other MCU. Available for $80, but can also only output a maximum of 3.3V.
1. Have a way of powering the MCU (and preferably its peripherals) without powering the debug circuit - this is very specific to the development board.
1. Disable any peripherals that draw power but are not part of your application (e.g. a power LED). This might require you to physically remove components.


![Current measurement setup for this article]({{ site.baseurl }}/assets/sleep-setup-jan.jpg)

This is the current measurement setup for the images earlier in this article. The STLink debug circuit is physically disconnected from the NUCLEO-F446RE to avoid powering the debug circuit during measurement. The jumper wires from the STLink to the development board are there to re-program the device. On the NUCLEO-F446RE board resistor R32 is removed to disable the power LED. The EFM32 Giant Gecko acts as the power source for the board, connecting VMCU on the Giant Gecko to 3.3V on the NUCLEO-F446RE (and GND to GND). Simplicity Studio can be used to show the current measurement.

Unfortunately there is no generic way of doing this. There are probably hints in the help guide for your development board.

### Choice of, and shutting down of, peripherals

It might seem like an open door, but putting the MCU to sleep is only part of a low power design: peripherals can draw much more power than the MCU. The LED in the beginning of the article is drawing ~2.8 mA, much more than the rest of the circuit in deep sleep. Thus, make sure to pick components that fit your power budget, and shut peripherals down when you don't use them. Radios often have sleep modes that you can invoke, so make sure your drivers use these.

In addition you can see jitter if you keep unused pins floating (see the image at the beginning of the article). You can pull these pins up in software via:

```cpp
static DigitalIn unused[] = { PA_4, PA_7, PA_8 };
for (size_t ix = 0; ix < sizeof(unused) / sizeof(unused[0]); ix++) {
    unused[ix].mode(PullUp);
}
```

Another thing to consider is to use a lower voltage design. There are many MCUs that can run at 1.8V instead of 3.3V, and picking peripherals that can run on the same voltage will drastically reduce your overall power consumption.

## Troubleshooting

### Stack overflow when enabling sleep tracing or CPU statistics

When enabling sleep tracing or CPU stats the idle thread has to allocate more data. On some targets this will lead to stack overflows on the idle thread. If you encounter this you can up the stack size of the idle thread, by adding the following section under `target_overrides` in your `mbed_app.json`:

```
        "rtos.idle-thread-stack-size": 1024
```

### Device not entering deep sleep even though tickless is enabled

On some targets the interrupt latency when running on the low-power tickers is so bad, that the target starts dropping bytes when running the serial at higher baud rates (f.e. 115,200). To mitigate this these targets run tickless from the microsecond ticker instead of the low-power ticker, and this blocks deep sleep.

If your application does not require high baud rates, you can set the following macro to re-enable tickless from the low-power ticker:

```
MBED_CONF_TARGET_TICKLESS_FROM_US_TICKER=0
```

Devices can only enter deep sleep when tickless is running off the low power ticker, but unfortunately on some targets the interrupt latency when running in this mode is so bad, that the target starts dropping bytes when running serial at baud rate 115,200.

### Device wakes up from deep sleep every second (or other period)

On some targets, like the DISCO-L475VG-IOT01A, you see the device wake-up from deep sleep for a small period every second, even when the device is instructed to wake up much later.


![Blinky with 10 second interval on DISCO-L475VG-IOT01A1]({{ site.baseurl }}/assets/deepsleep-wakeup.png)

This is related to the maximum timeout of the hardware low power ticker. It can only be asleep accurately for one second, thus will wake up every second, and Mbed OS will bring the board back into deep sleep afterwards. You often can override this behavior by choosing a different clock source, but this is target specific. Look at the data sheet for your MCU. On the DISCO-L475VG-IOT01A1 you can override this by adding the following line to the `target_overrides` section of your `mbed_app.json`:

```json
        "target.lpticker_lptim_clock": 4
```

### Device does not sleep in bare-metal mode

The sleep manager is currently not loaded when running Mbed OS in bare-metal mode. You can track progress [in this pull request](https://github.com/ARMmbed/mbed-os/pull/10104).

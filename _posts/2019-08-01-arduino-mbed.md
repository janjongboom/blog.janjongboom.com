---
layout:   post
title:    "Run Arduino libraries and sketches on Mbed OS"
date:     2019-08-01 00:00:00
tags:     mbed arduino
---

Yesterday Arduino announced that their new [Arduino Nano 33 BLE](https://blog.arduino.cc/2019/07/31/why-we-chose-to-build-the-arduino-nano-33-ble-core-on-mbed-os/) development board runs on top of Mbed OS. I think this is fantastic news: first, it will give Arduino users a much bigger standard library of high quality components including an RTOS, two file systems, networking stacks and [automatic power management](http://blog.janjongboom.com/2019/06/15/power-management-mbed-os.html). And second, this also brings the Arduino core as a library to Mbed OS, giving Mbed OS applications access to the huge set of Arduino peripheral drivers through a standard interface. I think this is great news for both communities.

<!--more-->

Martino Faccin already tackled the first point in his [announcement blog post](https://blog.arduino.cc/2019/07/31/why-we-chose-to-build-the-arduino-nano-33-ble-core-on-mbed-os/), but in this blog post I'll show you how you can use Arduino core for Mbed OS to load any Arduino library or sketch as part of an Mbed OS program. This blog post assumes that you have [Mbed CLI](https://os.mbed.com/docs/mbed-os/v5.13/tools/developing-mbed-cli.html) and all its dependencies installed, and that you're familiar with building Mbed OS projects.

The code for this blog post can be found at [janjongboom/arduino-mbed-mashup](https://github.com/janjongboom/arduino-mbed-mashup).  Import the code through Mbed CLI:

```
$ mbed import https://github.com/janjongboom/arduino-mbed-mashup
```

## What's in this thing?

**Note:** You can only build this repository on a **case-sensitive** file system (due to naming issues around `String.cpp` / `string.cpp`). On macOS follow [these instructions](https://coderwall.com/p/mgi8ja/case-sensitive-git-in-mac-os-x-like-a-pro) to create a case-sensitive mount point.

We'll need two libraries from Arduino. Together these give us the full Arduino API:

* [ArduinoCore-API](https://github.com/arduino/ArduinoCore-API/tree/namespace_arduino) - this is the HAL layer for Arduino core, containing all header files.
* [ArduinoCore-nRF528x-mbedos](https://github.com/arduino/ArduinoCore-nRF528x-mbedos) - this is the implementation of the Arduino core HAL for Mbed OS boards. Even though the name might suggest otherwise, this library does not just support the nRF528x series, but supports all Mbed OS targets.
    * Note: you'll need [this patch](https://github.com/arduino/ArduinoCore-nRF528x-mbedos/pull/2) to make this work with Mbed OS 5.13. This patch is already incorporated in the example project.

In addition there is an `.mbedignore` file to exclude the PDM and USB drivers from Arduino core, as they did not compile on my target.

Last, you'll need to set up the pin configuration for the board. This includes the Arduino to Mbed OS pin map (which is used when you call `digitalWrite(4, HIGH)`), mappings for serial ports, and board initialization code (to disable / enable timers, LEDs, etc.).  I've added an example for the DISCO-L475VG-IOT01A [here](https://github.com/janjongboom/arduino-mbed-mashup/tree/master/source) and tried to keep this as generic as possible, but you might need changes due to conflicting names in the HAL for your development board.

## Writing sketches

With this in place you now have the full Arduino API available in your Mbed OS application. Note that Mbed OS does not know how to handle the `setup()` and `loop()` functions in Arduino sketches, so you'll need to call these yourself from `main()`. Open `main.cpp` and add the following code:

```cpp
// Arduino code
#include "Arduino.h"

void setup() {
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.begin(115200);
    Serial.println("Welcome to Arduino on Mbed OS");
}

void loop() {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println("LED is now on!");
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
    Serial.println("LED is now off!");
    delay(1000);
}

// Mbed OS code
int main() {
    setup();
    while (1) loop();
}
```

Compile and flash the application using Mbed CLI to see the application running:

```
$ mbed compile -m auto -t GCC_ARM -f
```

## Adding libraries and mixing Mbed and Arduino

Many Arduino peripheral drivers will work out of the box as long as they only use the Arduino core API. You can add them through Mbed CLI and then use them as you'd normally use them in a sketch. For example to add [Arduino's Chainable LED library](https://github.com/pjpmarques/ChainableLED), run:

```
$ mbed add https://github.com/pjpmarques/ChainableLED
```

Because this is still an Mbed OS application you can use any Mbed OS feature. For example, you can use the RTOS to start two threads (both with their own `loop()` function) without having to do any manual scheduling. Here's an example of running a pattern on the Grove Chainable LED and blinking the built-in LED using two threads:

```cpp
#include "Arduino.h"
#include <ChainableLED.h>

// demo from https://github.com/pjpmarques/ChainableLED
#define NUM_LEDS  1

ChainableLED leds(4, 5, NUM_LEDS);

// setup is generic for both threads
void setup() {
    Serial.begin(115200);
    leds.init();
    pinMode(LED_BUILTIN, OUTPUT);
    Serial.println("Welcome to Arduino on Mbed OS");
}

float hue = 0.0;
boolean up = true;

// loop through all colors on the Grove Chainable LED
void loop() {
    for (byte i=0; i<NUM_LEDS; i++)
        leds.setColorHSB(i, hue, 1.0, 0.5);

    delay(50);

    if (up)
        hue += 0.025;
    else
        hue -= 0.025;

    if (hue >= 1.0 && up)
        up = false;
    else if (hue <= 0.0 && !up)
        up = true;
}

// another loop to blink the built-in LED
void loop_builtin_led() {
    digitalWrite(LED_BUILTIN, HIGH);
    Serial.println("LED is now on!");
    delay(1000);
    digitalWrite(LED_BUILTIN, LOW);
    Serial.println("LED is now off!");
    delay(1000);
}

// the thread needs a function to run, loop here
void builtin_thread_main() {
    while (1) loop_builtin_led();
}

// Mbed OS bootstrap code
int main() {
    setup();

    // start a new thread and run the 'builtin_thread_main' function in there
    Thread builtin_thread;
    builtin_thread.start(&builtin_thread_main);

    while (1) loop();
}
```

Result:

<video src="{{ site.baseurl }}/assets/arduino-mbed.mp4" controls autoplay muted loop></video>

*DISCO-L475VG-IOT01A development board running two threads with Arduino sketches on top of Mbed OS.*

## Recap

I think it's very cool that this is now available. When I was working as a developer evangelist for Arm it would often happen at hackathons that people would have some exotic hardware and an Arduino driver, and this project would have saved us lots of porting support. In addition it gives Arduino developers a standard way of dealing with threads, file systems, sleep behavior and networking stacks, plus a very easy way to port Arduino to the many Mbed targets available.

Disclaimer: I implemented the initial proof of concept of this project back in 2018, so I'm obviously biased ;-).

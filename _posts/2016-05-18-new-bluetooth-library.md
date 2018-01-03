---
layout:   post
title:    "A new Bluetooth library: SimpleBLE"
date:     2016-05-18 11:00:00
tags:     iot mbed ble
originalUrl: https://developer.mbed.org/blog/entry/A-new-Bluetooth-library-SimpleBLE/
originalName: "Mbed Developer Blog"
---

**TL;DR?** Here's the link to the [SimpleBLE library](https://developer.mbed.org/teams/mbed-x/code/SimpleBLE/).

Four months ago I joined the mbed team as Developer Evangelist. A big part of my job is running around at events and talking to developers. Not only does that make for very entertaining conversations, it also gives some first hand insight into how developers are using mbed. This is especially true for new users, especially if they've never done embedded development before. There's no better way of testing the user-friendliness of your platform than by giving a workshop to novice users.

<!--more-->

Last week's event was [RISE Manchester](https://thinkrise.com/manchester.html), where we held an IoT workshop around Bluetooth Low Energy. The [mbed Bluetooth library](https://developer.mbed.org/teams/Bluetooth-Low-Energy/code/BLE_API/) is one of the most popular libraries on mbed (and the reason I started using mbed!). But we saw that people were struggling with concepts like services, characteristics and advertisement frames - all things that you need to think about, even when you just want to broadcast a sensor value to your phone.

![Photo by Michelle Hua]({{ site.baseurl }}/assets/simpleble1.jpg)

*Photo by [Michelle Hua](https://twitter.com/MadewithGlove/status/727844492829704192).*

## A simplified library

This got [Jonny Austin](https://developer.mbed.org/users/JonnyA/) and me thinking about a 'workshop-friendly' version of the Bluetooth API, with the following premises:

* Users should not care about bootstrapping the BLE API.
* Declaring a new service or characteristic should be done in a single line of code.
* Characteristics should act like normal variables, magically syncing their state over BLE.

The result of that work is now published as the [SimpleBLE](https://developer.mbed.org/teams/mbed-x/code/SimpleBLE/) library. Here's an example program that exposes a light sensor (on pin A0) over BLE, and lets it update every second:

```cpp
#include "mbed.h"
#include "SimpleBLE.h"

AnalogIn light(A0);

SimpleBLE ble("MY_LIGHT_SENSOR"); // declare SimpleBLE

// create a new characteristic under service 0x8000, char 0x8001
SimpleChar<uint16_t> lightValue = ble.readOnly_u16(0x8000, 0x8001);

// now treat lightValue like any other variable
void read() {
    lightValue = light.read_u16();
}

int main(int, char**) {
    Ticker t;
    t.attach(&read, 1.0f); // read new value every second

    ble.start();
    while (1) { ble.waitForEvent(); }
}
```

SimpleBLE will now take care of declaring services, preparing advertisement frames, handling disconnects, and updating the value of the characteristic whenever you write to it. Easy peasy!

You can also read the variable, as it acts like any other variable. For example, this is how you count button presses:

```cpp
InterruptIn btn(D0);
SimpleChar<uint8_t> presses = ble.readOnly_u8(0x8500, 0x8501);

void btn_press() {
    presses = presses + 1; // read value and up with one
}

btn.fall(&btn_press);
```

## Write callbacks

Another feature that is hard to grasp in the BLE API is how to get write callbacks, as there is only a global [onDataWritten](https://developer.mbed.org/teams/Bluetooth-Low-Energy/code/BLE_API/docs/ff83f0020480/classBLE.html#a5e977ec60fcd8aee8dd586b0b3e456e9) callback. We fixed this by adding the possibility to provide a callback function to the SimpleBLE variable. Whenever someone writes a new value over BLE we'll call the callback function, and let you know the new value.

For example, here's how you expose an LED over BLE using SimpleBLE:

```cpp
DigitalOut led(D0);

void updateLed(bool newState) {
    led = newState;                 // could also do led = ledState here...
}

SimpleChar<bool> ledState = ble.writeOnly_bool(0x8600, 0x8601, &updateLed);
```

## More complicated: a tri-color LED

We can easily write more complicated programs, for example exposing a tri-color LED over BLE. We create one characteristic with 4 bytes (`uint32_t`) where we use the first byte as red, the second as green and the third as blue.

```cpp
PwmOut red(D0);
PwmOut green(D1);
PwmOut blue(D2);

void update(uint32_t newColor) {
    // read individual bytes
    uint8_t* channels = (uint8_t*)&newColor;

    // cast to float, as PwmOut expects a value between 0.0f and 1.0f
    red   = static_cast<float>(channels[0]) / 255.0f;
    green = static_cast<float>(channels[1]) / 255.0f;
    blue  = static_cast<float>(channels[2]) / 255.0f;
}

SimpleChar<uint32_t> color = ble.writeOnly_u32(0x6200, 0x6201, &update);
```

## API

We currently have three types implemented, which are accessible under an instantiated `SimpleBLE` object:

* readOnly - Only readable over BLE.
* readWrite - Readable and writable over BLE.
* writeOnly - Only writable over BLE.

All types are generic, and a type is selected via a postfix. For example call `ble.readWrite_bool(...)` to create a boolean variable, or `ble.readWrite_u32(...)` to create a variable with type `uint32_t`.

**Note:** The access classifier only applies to BLE. Your program can always read from and write to the variable.

The following arguments can be passed to create a type:

* `serviceUuid` - Short (`uint16_t`) or long (`const char*`) UUID.
* `charUuid` - See serviceUuid.
* `notify` - Whether to allow notifications on the characteristic (default: true).
* `defaultValue` - Default value of the characteristic.
* `callback` - Function pointer to be called whenever a new value is written over BLE. Only available for readWrite and writeOnly.

We will probably expand this API to enable exposing pins directly over BLE, but we're happy to see what you can build with this today.

## Recap

SimpleBLE is a brand-new library, but is built on top of the very well tested normal Bluetooth library. We hope that it significantly decreases the barrier for people to start programming BLE devices, especially in a time-constrained environment like a hackathon or workshop.

You can find the library [here](https://developer.mbed.org/teams/mbed-x/code/SimpleBLE/), and an example program [here](https://developer.mbed.org/teams/mbed-x/code/SimpleBLE-Example/). If you want more information on the internals of the library, look at the [mbed BLE docs](https://docs.mbed.com/docs/ble-intros/en/latest/). If you have feedback, please let me know!

-

*Jan Jongboom is Developer Evangelist IoT at ARM.*
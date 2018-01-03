---
layout:   post
title:    "Using mbed libraries with JerryScript"
date:     2016-10-03 11:00:00
tags:     mbed js
originalUrl: https://developer.mbed.org/blog/entry/Using-mbed-libraries-with-JerryScript/
originalName: "Mbed Developer Blog"
---

Two weeks ago Stephen Kyle [posted about](https://developer.mbed.org/blog/entry/Bringing-JavaScript-to-mbed-OS/) adding support for JavaScript on ARM mbed OS with JerryScript - which has now landed in the [JerryScript main repository](https://github.com/Samsung/jerryscript/pull/1318). The ability to run a JavaScript engine on top of a microcontroller is tremendously helpful for rapid prototyping, and lowers the barrier for anyone interested in programming microcontrollers. One great thing about building JerryScript support on top of ARM mbed is that we can also leverage the vast set of published mbed libraries (5,375 and counting!).  Unfortunately at this point we cannot directly use C++ libraries from JavaScript - we need some glue. In this article we'll go over the pieces needed to use a C++ mbed library in JerryScript.

<!--more-->

## Requirements

You'll need:

* An [development board capable of running mbed OS 5](https://developer.mbed.org/platforms/?mbed-os=19) with at least 64 KB of RAM (like the [FRDM K64F](https://developer.mbed.org/platforms/FRDM-K64F/), [Nucleo F401RE](https://developer.mbed.org/platforms/ST-Nucleo-F401RE/) or [nRF52-DK](https://developer.mbed.org/platforms/Nordic-nRF52-DK/)).
* A clone of the [JerryScript repository](http://github.com/samsung/jerryscript/).
* [mbed CLI](https://docs.mbed.com/docs/mbed-os-handbook/en/5.1/dev_tools/cli/#installing-mbed-cli).
* [GCC ARM Embedded Toolchain](https://launchpad.net/gcc-arm-embedded).
* On Windows: [GNU Make](http://gnuwin32.sourceforge.net/packages/make.htm).

## Setting up

The following instructions guide you through the process of setting up an environment where you can run JavaScript on mbed OS:

1. Open a terminal and navigate to the folder where you cloned the JerryScript repository.
1. Run `cd targets/mbedos5`.
1. Run `make getlibs` - this will pull in mbed OS and all related repositories.
1. Run `pip install -r ./tools/requirements.txt` - this will install Python modules required by the build scripts.

## Writing a very simple library, and a wrapper for it

If you don't like copy and pasting, the example program written in this article is [available on GitHub](https://github.com/janjongboom/jerryscript/tree/the-answer).

### Creating the library

We'll start off by writing a simple library from scratch: 'TheAnswer'. It's a single header, with a single class, and a single function which returns 42.

In your source directory (under `JerryScript/targets/mbedos5/source`) create a new directory `the-answer`, and in there create a new file `TheAnswer.h`.

Add the following code to `TheAnswer.h`:

```cpp
#ifndef __THE_ANSWER_H__
#define __THE_ANSWER_H__

class TheAnswer {
public:
    uint8_t give() { return 42; }
};

#endif
```

### Wrapping the library

The next thing that we need to do is create some glue functions that wrap around the 'TheAnswer'. These glue functions will define the JavaScript API and are responsible for translating C++ into JavaScript objects and vice versa. To make it easier to write glue functions we provide some macros.

Create a new file ``TheAnswer-js.h`` in the `the-answer` directory:

```cpp
#ifndef _THE_ANSWER_JS_H
#define _THE_ANSWER_JS_H

// This file contains all the macros
#include "jerryscript-mbed-library-registry/wrap_tools.h"

// TheAnswer is a class constructor
DECLARE_CLASS_CONSTRUCTOR(TheAnswer);

// Define a wrapper, we can load the wrapper in `main.cpp`.
// This makes it possible to load libraries optionally.
DECLARE_JS_WRAPPER_REGISTRATION (the_answer_library) {
    REGISTER_CLASS_CONSTRUCTOR(TheAnswer);
}

#endif  // _THE_ANSWER_JS_H
```

We can now write the C++ file that implements this header. Create a new file `TheAnswer-js.cpp` with the following content:

```cpp
#include "jerryscript-mbed-util/logging.h"
#include "jerryscript-mbed-library-registry/wrap_tools.h"

// Load the library that we'll wrap
#include "TheAnswer.h"

/**
 * TheAnswer#give (native JavaScript method)
 *
 * @returns 42
 */
DECLARE_CLASS_FUNCTION(TheAnswer, give) {
    CHECK_ARGUMENT_COUNT(TheAnswer, give, (args_count == 0));

    // Extract native TheAnswer pointer
    uintptr_t ptr_val;
    jerry_get_object_native_handle(this_obj, &ptr_val);

    TheAnswer* native_ptr = reinterpret_cast<TheAnswer*>(ptr_val);

    // Get the result from the C++ API
    uint8_t result = native_ptr->give();
    // Cast it back to JavaScript and return
    return jerry_create_number(result);
}

/**
 * TheAnswer#destructor
 *
 * Called if/when the TheAnswer is GC'ed.
 */
void NAME_FOR_CLASS_NATIVE_DESTRUCTOR(TheAnswer)(const uintptr_t native_handle) {
    delete reinterpret_cast<TheAnswer*>(native_handle);
}

/**
 * TheAnswer (native JavaScript constructor)
 *
 * @returns a JavaScript object representing TheAnswer.
 */
DECLARE_CLASS_CONSTRUCTOR(TheAnswer) {
    CHECK_ARGUMENT_COUNT(TheAnswer, __constructor, args_count == 0);

    // Create the C++ object
    uintptr_t native_ptr = (uintptr_t) new TheAnswer();

    // create the jerryscript object
    jerry_value_t js_object = jerry_create_object();
    jerry_set_object_native_handle(js_object, native_ptr, NAME_FOR_CLASS_NATIVE_DESTRUCTOR(TheAnswer));

    // attach methods
    ATTACH_CLASS_FUNCTION(js_object, TheAnswer, give);

    return js_object;
}
```

### Loading our wrapper

To make `TheAnswer` class available from JavaScript, we need to load the wrapper when the board starts up.

Open `main.cpp`, and add to the includes:

```cpp
#include "the-answer/TheAnswer-js.h"
```

And then, just above `jsmbed_js_launch();`, add:

```cpp
JERRY_USE_MBED_LIBRARY(the_answer_library);
```

We're all set on the C++ side. We can now use the library from JavaScript!

Open `main.js`, and replace the contents with:

```js
var led = DigitalOut(LED1);
var theAnswer = TheAnswer();

var ticker = Ticker();
ticker.attach(function() {
  led.write(led.read() == 1 ? 0 : 1);
}, 0.5);

print("The answer is ", theAnswer.give());
print("main.js has finished executing.");
```

### Compiling

Open a terminal and navigate to the directory where you cloned `javascript-app`.

Compile the application:

```bash
$ make BOARD=K64F
```

<span class="notes">**Note:** Replace `K64F` with the name of your development platform. To find out the name of your board run `mbed detect`.</span>

### Running the app and viewing the answer

Use drag and drop to copy the `mbedos5.bin` to your development board to flash the new program. The LED should start blinking (if not, press the 'Reset' button on your board).

When we attach a serial monitor to the board we can see our answer:

```
JerryScript in mbed
   build date:  Oct  3 2016

The answer is 42
main.js has finished executing.
```

## Functions that take arguments

In the previous example we only used a primitive (a number), but we can also construct functions that take objects, as long as a mapping was created for that object. In JerryScript there are already mappings for a lot of generic mbed objects, like `DigitalOut`, `InterruptIn`, `I2C`, so we can talk to the outside world.

### Adding a new function to TheAnswer

We can add a new function to the `TheAnswer` class: `blink42times`, which takes a `DigitalOut` pin and then blinks it 42 times. Open `the-answer/the_answer.h` and replace the content with:

```cpp
#ifndef __THE_ANSWER_H__
#define __THE_ANSWER_H__

#include <stdint.h>
#include "mbed.h"

class Blinker {
public:
    Blinker(DigitalOut & led, uint16_t times) : led(led), times_left(times) {}

    void start() {
        ticker.attach(this, &Blinker::blink, 0.2f);
    }

private:
    void blink() {
        led = !led;
        if (--times_left == 0) {
            ticker.detach();
        }
    }

    DigitalOut & led;
    uint16_t times_left;
    Ticker ticker;
};

class TheAnswer {
public:
    uint8_t give() { return 42; }

    void blink42times(DigitalOut & led) {
        Blinker* blinker = new Blinker(led, 42);
        blinker->start();
    }
};

#endif
```

### Exposing the function to JavaScript

Similar to the `give` function, we now need to write a wrapper around the `blink42times` function. Add the following function wrapper to ``TheAnswer-js.cpp`` (before the destructor):

```cpp
/**
 * TheAnswer#blink42times (native JavaScript method)
 * @param pin DigitalOut pin to blink
 */
DECLARE_CLASS_FUNCTION(TheAnswer, blink42times) {
    // Check that we have 1 argument, and that it's an object
    CHECK_ARGUMENT_COUNT(TheAnswer, blink42times, (args_count == 1));
	CHECK_ARGUMENT_TYPE_ALWAYS(TheAnswer, blink42times, 0, object);

    // Extract native DigitalOut argument (objects are always pointers)
    uintptr_t digitalout_ptr;
    jerry_get_object_native_handle(args[0], &digitalout_ptr);
	DigitalOut* pin = reinterpret_cast<DigitalOut*>(digitalout_ptr);

    // Extract native TheAnswer pointer (from this object)
    uintptr_t ptr_val;
    jerry_get_object_native_handle(this_obj, &ptr_val);

    TheAnswer* native_ptr = reinterpret_cast<TheAnswer*>(ptr_val);

    // Call our native function (C++) with the native argument
    native_ptr->blink42times(*pin);

    // When done, return undefined
    return jerry_create_undefined();
}
```

**Note:** We always receive a pointer to the object (`uintptr_t`) passed in as an argument. All objects in JerryScript are always declared on the heap, never on the stack.

Make sure to also add the function in the constructor (under `// attach methods`):

```cpp
ATTACH_CLASS_FUNCTION(js_object, TheAnswer, blink42times);
```

### Calling the function from JavaScript

We can now call the function from JavaScript. Replace the content of `main.js` with:

```js
var led = DigitalOut(LED1);
var theAnswer = TheAnswer();

print("The answer is ", theAnswer.give());

theAnswer.blink42times(led);

print("main.js has finished executing.");
```

Compile the program and use drag and drop to flash the program to your board. The LED will now blink 42 times.

## Conclusion

JerryScript support is a great addition to the mbed ecosystem. Using JavaScript to program microcontrollers allows for rapid prototyping of new features or programs, and this blog post should give some insight in how C++ and JavaScript can work together. At this point porting a library is still a bit tedious and requires manual work, but we think that large parts of this process can be automated, so if you're interested in helping out there, please give me a shout!

-

*Jan Jongboom is Developer Evangelist IoT at ARM, and has warm feelings for both C++ and JavaScript.*

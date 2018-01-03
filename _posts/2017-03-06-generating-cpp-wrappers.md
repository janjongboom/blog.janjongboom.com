---
layout:   post
title:    "Generating C++ wrappers for JS on mbed"
date:     2017-03-06 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Generating-C-wrappers-for-JS-on-mbed/
originalName: "Mbed Developer Blog"
---

**TL;DR?** Here's the link to the [JS wrapper generator](https://github.com/janjongboom/mbed-js-wrapper-generator).

A few months ago, we launched [JavaScript on mbed](https://developer.mbed.org/javascript-on-mbed/), an experimental program that runs the [JerryScript VM](http://jerryscript.net) on top of mbed OS 5. This allows you to code your embedded application in a higher level language, while the core OS is still C++. This combination lets you use the flexibility of a dynamic language without too much sacrifice on performance.

<!--more-->

## From C++ to JS

Communication between JavaScript and native code is handled through wrappers, which are a mapping layer between JS and C++ types. These wrappers are currently written by hand. In some cases this is a must, because idiomatic JavaScript looks different from idiomatic C++. In other cases, especially for peripheral drivers, the resulting APIs look very much alike. The JS and C++ APIs for `DigitalOut`, `InterruptIn` and `I2C` are exactly the same. This is also the case for a lot of community libraries for actuators and peripherals.

Having to manually write a wrapper for these simple libraries hurts the ecosystem. JS developers will not use the native libraries, because it requires them to write a wrapper, and thus you'll see the drivers re-implemented in JS (bad for performance) which causes fragmentation. Enough reason to start hacking on a solution that can automatically generate JerryScript wrappers.

## Problem: parsing C++ code

To generate a wrapper you first need to have a representation of the native code; this must include object names, functions, parameters and return types. Unfortunately, deriving this from the source code is a very difficult problem because C++ has an [undecidable grammar](http://www.yosefk.com/c++fqa/defective.html#defect-2). Building a C++ parser quickly turns into building a full compiler.

Instead, you can leverage the compiler to create a build which contains debug symbols, and parse the debug symbols into (a form of) an Abstract Syntax Tree. When you have the tree, it's easy to query the tree for the symbols you want to wrap. To assist with this, we built the [arm-objdump-parser](https://github.com/janjongboom/arm-objdump-parser).

For example, this is how you query for the [DigitalOut constructor](https://github.com/ARMmbed/mbed-os/blob/aff49d8/drivers/DigitalOut.h#L63), and the output that the parser generates:

**Query:**

```
// children length of 3 = this (because member function) + 2 arguments
dump.nodes.filter(f => f.name === 'DigitalOut' && f.tag === 'subprogram' && f.children.length === 3)
```

**Output (redacted):**

```js
{
  name: 'DigitalOut',
  accessibility: '1\t(public)',
  type:
   { tag: 'pointer_type',
     type:
      { tag: 'class_type',
        name: 'DigitalOut' } },
  children:
   [ { tag: 'formal_parameter',
       type:
        { tag: 'typedef',
          name: 'PinName',
          type:
           { tag: 'enumeration_type',
             // drilling down this list will give you all the possible enumeration values
             children: [Object] } } },
     { tag: 'formal_parameter',
       type:
        { tag: 'base_type',
          byte_size: '4',
          name: 'int' } }
   ]
}
```

The constructor returns a pointer to a `DigitalOut` object and takes two parameters: a `PinName` enum and an `int`. Now that you have the function signature you can use this information as a basis to generate wrappers.

**Note:** Want to play around with the objdump parser? [Here's a live demo](http://janjongboom.com/arm-objdump-parser/demo/web/objdump.html). The parser can be used standalone, and is not tied to the JS wrapper generator.

## Building a wrapper

Now that you have a queryable representation of the application, you can start writing wrappers. JerryScript wrappers are relatively simple and mostly deal with converting JS objects to C++ objects and vice-versa. For example, this is the wrapper for `DigitalOut#write`:

```cpp
DECLARE_CLASS_FUNCTION(DigitalOut, write) {
    // check argument count
    CHECK_ARGUMENT_COUNT(DigitalOut, write, (args_count == 1));
    // check argument type (JS number in this case)
    CHECK_ARGUMENT_TYPE_ON_CONDITION(DigitalOut, write, 0, number, (args_count == 1));

    // extract 'this', which is a pointer to a DigitalOut object
    // all JerryScript objects live on the heap
    uintptr_t ptr_val;
    jerry_get_object_native_handle(this_obj, &ptr_val);

    DigitalOut* native_ptr = reinterpret_cast<DigitalOut*>(ptr_val);

    // because JS only has one number type everything is casted to a C++ 'double'
    double jArg0 = jerry_get_number_value(args[0]);
    // static_cast it to an integer, because that's what DigitalOut#write requires
    int arg0 = static_cast<int>(jArg0);

    // call the native function
    native_ptr->write(arg0);
    // this function has type 'void', so ignore the result
    return jerry_create_undefined();
}
```

By having a list of rules on how to cast from JS to C++ and from C++ to JS, you can generate these wrappers on the fly for almost any object.

The generator for these wrappers is available at [mbed-js-wrapper-generator](https://github.com/janjongboom/mbed-js-wrapper-generator). It's alpha quality right now, but it is a good starting point, and it can generate wrappers for most simple objects.

### Caveats

* The generator does not currently handle callbacks and function pointers.
* If functions are declared on the base-class, they are not wrapped when you wrap the inheritee ([example](https://github.com/janjongboom/mbed-js-wrapper-generator/issues/1)).
* C++ and JS are different languages, so for more complex APIs you should avoid a one-one mapping.

If you're interested in working on any of these issues, [contributions are very welcome](https://github.com/janjongboom/mbed-js-wrapper-generator).

## Showcase: wrapping the FXOS8700Q driver

Enough talk, let's build a wrapper for the NXP FXOS8700Q, the accelerometer found on the FRDM-K64F development board. First, you need a C++ library that uses this accelerometer, so the compiler can generate debug symbols. Since the online compiler cannot generate debug builds, you can only do this locally using the [mbed Command-Line Interface (CLI)](https://github.com/ARMmbed/mbed-cli).

A C++ library that uses this accelerometer can be found at [developer.mbed.org/users/janjongboom/code/FXOS8700CQ/](https://developer.mbed.org/users/janjongboom/code/FXOS8700CQ/).

Import a program that uses this library and produce a debug build:

```
$ mbed import https://developer.mbed.org/users/janjongboom/code/fxos8700cq_example/
$ cd fxos8700cq_example

# build the application
$ mbed compile -m K64F -t GCC_ARM --profile ./mbed-os/tools/profiles/debug.json
```

When the compilation succeeds you find an `.elf` file in the build directory. Export the symbols from this application and feed these into the wrapper generator:

```
# export symbols
$ arm-none-eabi-objdump -Wi -g BUILD/K64F/GCC_ARM/*.elf > symbols.txt

# run the wrapper generator, first argument is the symbols file, second argument is the class, third argument is the name of the header file
$ node ~/mbed-js-wrapper-generator/generate.js symbols.txt FXOS8700CQ --header-file "FXOS8700CQ.h"

... snip ...
FXOS8700CQ#getMagnetX
FXOS8700CQ#getMagnetY
FXOS8700CQ#getMagnetZ
FXOS8700CQ#FXOS8700CQ

Done. Created wrapper in /mbed-js-wrapper-generator/output/js-mbed-fxos8700cq-1488803902971
To add this wrapper to your project:
	1. Add the native library to the wrapper ('mbed add http://path-to-native-library')
	2. Add the wrapper to your JS project via 'npm install /mbed-js-wrapper-generator/output/js-mbed-fxos8700cq-1488803902971 --save'
```

Now add the native library to the wrapper:

```
$ cd ~/mbed-js-wrapper-generator/output/js-mbed-fxos8700cq*
$ mbed add https://developer.mbed.org/users/janjongboom/code/FXOS8700CQ/
```

You now have a wrapper for the accelerometer driver that you can add to a JS on mbed application.

## Using the wrapper

To use the wrapper, create a new JS on mbed project:

```
# clone the mbed-js-example application
$ git clone git@github.com:armmbed/mbed-js-example fxos8700cq-demo
$ cd fxos8700cq-demo
# install dependencies
$ npm install
```

Then add the wrapper as a dependency of your project:

```
# !!! do not forget *--save* and *--ignore-scripts* here !!!
$ npm install /path/to/jerryscript-mbed-fxos8700cq-* --save --ignore-scripts

mbed-js-example@0.0.1 /Users/janjon01/repos/fxos8700cq-demo
└── mbed-js-fxos8700cq@1.0.0
```

### Writing some code

Open ``main.js`` and replace the content with:

```js
var acc = FXOS8700CQ(PTE25, PTE24, (0x1D<<1));
acc.enable();

setInterval(function() {
    acc.get_data();
    print("acc x=" + acc.getAccelX() + " y=" + acc.getAccelY() + " z=" + acc.getAccelZ());
}, 1000);
```

You can then build the application. The first time you build, this step takes a long time because it downloads JerryScript and mbed OS 5.

```
# replace K64F with your
$ gulp --target=K64F
```

In the ``build/out/K64F`` folder there will be a `mbedos5.bin` file. To flash the binary to your board, drag and drop the `mbedos5.bin` file on to your development board - it mounts as a mass-storage device.

To see the accelerometer values, attach a [serial monitor](https://docs.mbed.com/docs/debugging-on-mbed/en/latest/Debugging/printf/) to the device, and set the baud rate to 115,200. Victory!


![Logging values from the accelerometer with JS on mbed]({{ site.baseurl }}/assets/mbedjswrapper1.png)

**Note:** If the application immediately fails, double-check that you have called `npm install` with the `--save` argument. Only packages that are in `package.json` are loaded by JerryScript.

### Taking it further

If you happen to have a Grove Chainable LED laying around, you can add the [mbed-js-chainableled](https://github.com/janjongboom/mbed-js-chainableled) library to your project, and make something pretty:


![Colors!]({{ site.baseurl }}/assets/mbedjswrapper2.gif)

## Conclusion

The mbed-js-wrapper-generator, while still in its infancy, is a valuable tool to quickly generate JerryScript bindings for existing C++ applications. It makes it a lot easier for JS developers to use the vast ecosystem of C++ libraries that the mbed community has written over the years. In addition, it helps users write code that cannot be written in JS - for example because of timing constraints - by quickly referencing a C++ library instead.

If you like this project, also look at the [JS on mbed REPL](https://github.com/janjongboom/mbed-js-repl-example) which allows you to use peripherals and test out code over the serial port, without compilation. Or if you want to learn more about JS on mbed, [watch the video from JSConf.asia 2016](https://www.youtube.com/watch?v=3HLRwcVqgFE)!

-

*Jan Jongboom is Developer Evangelist IoT, and he loves a good C++/JS mashup.*

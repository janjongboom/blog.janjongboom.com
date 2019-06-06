---
layout:   post
title:    "Connecting devices to Pelion Device Management using Mbed Edge"
date:     2018-09-11 00:00:00
tags:     mbed
---

Not every device can connect to the cloud directly. Legacy devices might not have a networking interface, and constrained devices might not have IP connectivity. To manage these devices you thus need a local gateway that understands the legacy protocol, and can bridge the data to the cloud. [Mbed Edge](https://cloud.mbed.com/docs/v1.3/connecting/mbed-edge.html) helps you build these gateways, and bring legacy and non-IP devices into Pelion Device Management.

<!--more-->

This tutorial shows how to use Mbed Edge to connect a device with a proprietary serial protocol to the cloud. It was tested against Mbed Edge v0.5.1 on Ubuntu 16.04.

## Prerequisites

You'll need:

* An [Mbed-enabled development board](https://os.mbed.com/platforms/).
* A Linux computer, or a Linux VM (Ubuntu 16.04 prefered) - as Mbed Edge only runs on Linux.

On the Linux computer or Linux VM, install:

* [Mbed Edge](https://github.com/armmbed/mbed-edge) - and confirm that it connects to Pelion Device Management.
* [Node.js](https://nodejs.org) version 8 or higher.

## Setting up the device

The development board will run a sample application which implements a simple proprietary serial protocol which can toggle LEDs, and report the status of the buttons. It takes the following input (followed by a newline):

* `+LED1` to turn on the LED.
* `-LED1` to turn off the LED.

And emits the following events (followed by a newline):

* `<BTN=XX` when the button was toggled, where `XX` is the number of times the button was pressed.


![Device running proprietary serial protocol]({{ site.baseurl }}/assets/edge01.png)

To run this application on the development board:

1. Go to [mbed-edge-tutorial-firmware](https://os.mbed.com/users/janjongboom/code/mbed-edge-tutorial-firmware/).
1. Import the program in the Online Compiler or via Mbed CLI.
1. Build and flash the program for your development board - unsure how? [Here are the docs](https://os.mbed.com/docs/v5.9/tools/index.html).

Connect a [serial monitor](https://os.mbed.com/docs/v5.9/tutorials/debugging-using-printf-statements.html#prerequisites) to the development board on baud rate 115,200 and verify that the connection works.

## Creating a protocol translator

An Mbed Edge installation consists of two parts: the Edge core, which is the same for all deployments and handles communication with the cloud; and a protocol translator, which knows how to speak the proprietary or non-IP protocol. When you installed Mbed Edge on the Linux computer or Linux VM, this has given you Edge core. Now it's time to add a protocol translator.

**Starting Mbed Edge core**

Open a new terminal window, navigate to the location where you installed Mbed Edge, and start Edge core:

```
~/mbed-edge$ build/bin/edge-core -o 8005
```

This opens a Linux socket on `/tmp/edge.sock` which you can communicate with from the protocol translator.

### Adding Mbed Edge JS

This protocol translator is written in Node.js, but you can write one in any language that supports JSONRPC. There are examples available in C, Java and JavaScript. To start:

1. Open a new terminal.
1. Create a new folder:

    ```
    $ mkdir pt
    $ cd pt
    ```

1. Install Mbed Edge JS and the other dependencies.

    ```
    $ npm install mbed-edge-js es6-promisify serialport --save
    ```

1. Create a new file in this folder, called `pt.js` and open it in your favourite IDE.

### Connecting to Mbed Edge

In `pt.js` enter:

```js
const Edge = require('mbed-edge-js');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const promisify = require('es6-promisify');

// This connects to the proprietary device over serial port
class ProprietarySerialDevice extends require('events') {
    constructor(port, baudRate) {
        super();
        this.sp = new SerialPort(port, {
            baudRate: baudRate,
            autoOpen: false
        });
    }
    async init() {
        await promisify(this.sp.open.bind(this.sp))();
        this.parser = this.sp.pipe(new Readline({ delimiter: '\r\n' }));
        this.parser.on('data', this.onData.bind(this));
    }
    onData(data) {
        data = data.toString('utf-8');
        if (data.indexOf('<BTN=') === 0) {
            this.emit('button-count', Number(data.replace('<BTN=', '')));
        }
    }
    async turnLedOn() {
        this.sp.write(new Buffer('+LED1\r\n', 'utf-8'));
    }
    async turnLedOff() {
        this.sp.write(new Buffer('-LED1\r\n', 'utf-8'));
    }
    async deinit() {
        await promisify(this.sp.close.bind(this.sp))();
    }
}

(async function() {
    let edge, serialDevice;
    try {
        // make sure to deinit() when quit'ing this process
        let quitImmediately = false;
        let sigintHandler;
        process.on('SIGINT', sigintHandler = async function(err) {
            if (err) console.error(err);
            if (quitImmediately) process.exit(1);

            try {
                if (edge) await edge.deinit();
                if (serialDevice) await serialDevice.deinit();
            } catch (ex) {}
            process.exit(1);
        });
        process.on('uncaughtException', sigintHandler);
        process.on('unhandledRejection', sigintHandler);


        // initialize Mbed Edge
        edge = new Edge('/tmp/edge.sock', 'tutorial-pt');
        await edge.init();

        console.log('Connected to Mbed Edge');

        // ... REST OF YOUR CODE HERE ... //


    }
    catch (ex) {
        console.error('Error...', ex);

        if (edge) await edge.deinit();
        if (serialDevice) await serialDevice.deinit();
    }
})();
```

Save this file, and run from the terminal:

```
$ node pt.js

[ClientService] Connecting to Mbed Edge on ws+unix:///tmp/edge.sock:/1/pt (try: 1)
[ClientService] Connected to Mbed Edge
[ClientService] Registering protocol translator tutorial-pt
[ClientService] Mbed Edge initialized
Connected to Mbed Edge
```

This has created a skeleton application that registers with Mbed Edge core, and has some code to deal with serial devices. Now let's tie the serial device to Mbed Edge.

### Sending data from the serial device to Edge core

Under '... REST OF YOUR CODE HERE …' add:

```js
        // If your serial device is connected on a different port, change it here
        serialDevice = new ProprietarySerialDevice('/dev/ttyACM0', 115200);
        await serialDevice.init();

        console.log('Connected over serial');

        // Register the new device in Mbed Edge
        let edgeDevice = await edge.createCloudDevice('serial-device1', 'proprietary-serial');
        await edgeDevice.register([
            // Button resource (read-only)
            {
                path: '/3200/0/5501',
                operation: ['GET'],
                value: 0
            },
            // LED resource (read/write both allowed)
            {
                path: '/3201/0/5850',
                operation: ['GET', 'PUT'],
                value: 0
            }
        ], false /* supports update */);

        console.log('Device registered in Mbed Edge');

        // When an update comes in, we send the data through to Mbed Edge
        serialDevice.on('button-count', async function(count) {
            console.log('Serial button count update', count);
            let r1 = edgeDevice.resources['/3200/0/5501'];
            await r1.setValue(count);
            console.log('Updated button count in Edge', count);
        });

        // Similar... If a write comes in from Mbed Edge, we send it back over serial
        edgeDevice.on('put', async function(route, newValue) {
            if (route === '/3201/0/5850' && newValue === 1) {
                await serialDevice.turnLedOn();
                console.log('Serial LED is now on');
            }
            else if (route === '/3201/0/5850' && newValue === 0) {
                await serialDevice.turnLedOff();
                console.log('Serial LED is now off');
            }
            else {
                console.log('PUT came in for unsupported resource', route, newValue);
            }
        });
```

This registers for events coming from both the Edge device and the Serial device, and forwards messages to each other. If you now run this application you'll see both the gateway and the device in Pelion Device Management.

**Note:** Do you get the error 'Error: Permission denied, cannot open /dev/ttyACM0'? Then run the command with `sudo`, or change your lsusb rules to allow the current account to access the USB device.


![Gateway and gateway managed device in Pelion Device Management]({{ site.baseurl }}/assets/edge02.png)

Clicking on `serial-device1` shows you the button and LED resource, and you can interact with them like any other resource. Data is automatically streamed from/to the proprietary serial protocol whenever you change a resource.


![Resources under the device]({{ site.baseurl }}/assets/edge03.png)

## Recap

You can use Mbed Edge to connect any device that does not have a native IP connection to the cloud, from proprietary serial protocols to non-IP devices like BLE beacons. This article just showed the tip of the iceberg though. In the future you can also facilitate firmware updates for end devices through Edge or build a complete managed gateway platform when combined with Mbed Linux. More information can be requested [here](https://www.mbed.com/contact/).

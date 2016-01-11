---
layout:   post
title:    "Physical Web and Web Bluetooth on mbed os"
date:     2016-01-11 14:00:00
tags:     iot bluetooth
originalUrl: http://blog.mbed.com
originalName: "mbed Developer Blog"
---

One of the questions we're facing as IoT developers is: 'how can we make users interact with our devices?'. The standard way of solving that issue for the past few years has been to create an app to accompany your device, but with the vast rise of devices around you it gets harder and harder to convince users to install *'yet another app™'*. Of course, that is under the assumption that your users even know about your device...

<!--more-->

Thus, we might need a better story for dealing with IoT devices around us. Not just interacting with them, but also finding a better way of discovering devices. In that light it's very interesting that starting with [Chrome 48 for Android](http://www.androidpolice.com/2015/11/21/chrome-dev-48-rolls-out-with-early-bluetooth-web-api-support-on-chrome-os-dev-channel-and-android-marshmallow/) (which is planned to launch mid-March) Google is adding two new features to their browser, which will tackle both these issues.

First, they are adding [Physical Web](https://google.github.io/physical-web/), which integrates into the operating system, and will show Bluetooth Beacons that are around you. Using the [Eddystone-URL](https://developers.google.com/beacons/?hl=en) protocol, this allows you to use cheap Bluetooth Low Energy beacons to broadcast URLs that allow you to interact with the outside world. This can range from a payment portal for a parking meter to a web application that allows you to control a new toy. This is already very interesting, but Google is also adding support for [Web Bluetooth](https://www.w3.org/community/web-bluetooth/), allowing web applications to talk to Bluetooth Low Energy devices.

These two features in themselves are absolutely great, but combined they offer a unique feature set for IoT developers.

1. Have your device broadcast a URL so it will be discovered by users close to it.
2. On this URL, have a web application that can control your device.

Boom. Now we solved both the discoverability problem, and users won't need to install your app anymore. Going from seeing the device in the physical world, to interacting with it now happens in seconds! To demonstrate, here is a video of discovering and flying a Parrot drone in this way:

<iframe width="560" height="315" src="//www.youtube.com/embed/yILD_ZdXJW4" frameborder="0" allowfullscreen></iframe>

## Eddystone beacons are non-connectable

However, an issue we're facing when writing this code from an embedded perspective, is that Eddystone beacons are, well, beacons. Their job is to sit in a location and broadcast advertisement packages. Thus we cannot connect over GATT to them to interact. Adding to the complexity, there is no room in the Eddystone protocol to send a list of GATT Service UUIDs, so other applications cannot detect our features anyway. This very much limits their usability. But, as we're all developers, let's hack around this.

As part of the [BLE Examples repository](https://github.com/ARMmbed/ble-examples/tree/master/BLE_EddystoneService/source) there is an excellent Eddystone library that runs on mbed OS. Recently my colleague Andres Amaya Garcia has added some new features to the library that adds [frame scheduling](https://github.com/ARMmbed/ble-examples/pull/47). This feature is intended to be used to allow a beacon to broadcast (for example) both URLs and telemetry data, which is achieved by sending different advertisement packages from the same beacon.

That's just what we need if we want a beacon to be both a Physical Web / Eddystone URL beacon, and a connectable Bluetooth device. Every 500 ms. we can broadcast a URL, and 500 ms. later we can broadcast a normal Bluetooth frame. This is nicely wrapped up in the following [library](https://github.com/web-bluetooth/juggling/tree/ee6b224/firmware/source/eddystone). You can add the 'eddystone' folder to your 'source' directory in your mbed os project, and then initialize the library like this:

{% highlight cpp %}
#include "mbed-drivers/mbed.h"
#include "minar/minar.h"
#include "core-util/FunctionPointer.h"
#include "ble/BLE.h"
#include "eddystone/EddystoneService.h"

using namespace mbed::util;

// Eddystone URL
static const char defaultUrl[] = "https://control.me";
// Normal Beacon name
static char beaconName[] = "I'm a beacon!";
// Service UUIDs for the beacon
static uint16_t uuid16_list[] = { 0x8765 };

static const PowerLevels_t defaultAdvPowerLevels = {-47, -33, -21, -13};
static const PowerLevels_t radioPowerLevels      = {-30, -16, -4, 4};

void disconnectionCallback(const Gap::DisconnectionCallbackParams_t *params)
{
    BLE::Instance().gap().startAdvertising(); // restart advertising
}

void onBleInitError(BLE &ble, ble_error_t error)
{
    (void)ble;
    (void)error;
   /* Initialization error handling should go here */
}

void bleInitComplete(BLE::InitializationCompleteCallbackContext *params)
{
    BLE&        ble   = params->ble;
    ble_error_t error = params->error;

    if (error != BLE_ERROR_NONE) {
        onBleInitError(ble, error);
        return;
    }

    if (ble.getInstanceID() != BLE::DEFAULT_INSTANCE) {
        return;
    }

    ble.gap().onDisconnection(disconnectionCallback);

    // Set up Eddystone
    auto eddyServicePtr = new EddystoneService(ble, defaultAdvPowerLevels, radioPowerLevels, 0);
    eddyServicePtr->setURLData(defaultUrl);
    // The name of the beacon and the service list
    eddyServicePtr->setNormalFrameData(beaconName, strlen(beaconName), uuid16_list, sizeof(uuid16_list));

    // Every 500 ms. Eddystone URL, then Normal frame
    eddyServicePtr->setUIDFrameAdvertisingInterval(0);
    eddyServicePtr->setTLMFrameAdvertisingInterval(0);
    eddyServicePtr->setURLFrameAdvertisingInterval(500);
    eddyServicePtr->setNormalFrameAdvertisingInterval(500);

    eddyServicePtr->startBeaconService();
}

void app_start(int, char**) {
    BLE::Instance().init(bleInitComplete);
}
{% endhighlight %}

## Seeing it all come together

To verify that everything works, you'll need a phone that runs Android 6 or higher, and install [Chrome Dev](https://play.google.com/store/apps/details?id=com.chrome.dev&hl=en_GB). After installation, navigate to chrome://flags#enable-physical-web and chrome://flags/#enable-web-bluetooth to enable both features. Now, when you pull down the drawer you'll see that there are Physical Web beacons nearby and see the URL listed.

![Look ma, I have a URL!]({{ site.baseurl }}/assets/physical3.jpg)

We can now write a small web application that utilizes Web Bluetooth to verify that we can connect to the device.

{% highlight html %}
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Web Bluetooth demo</title>
  </head>
  <body>
    <button id="go">Go Bluetooth</button>
    <script>
    document.querySelector('#go').onclick = (e) => {
      e.preventDefault();
      // Use the same service UUID as in mbed here!
      navigator.bluetooth.requestDevice({ filters: [{ services: [ 0x8765 ] }] })
        .then(device => {
          console.log('Found device ' + device.name);
          return device.connectGATT();
        )
        .then(() =>
          alert('Connected over GATT!');
        });
        .catch(err => {
          alert('' + err + ' ' + JSON.stringify(err));
        });
      };
    </script>
  </body>
</html>
{% endhighlight %}

*Please note that this web page needs to be served over HTTPS for Web Bluetooth to work!*

When we navigate to the page and hit 'Go Bluetooth' we'll be presented with a list of available Bluetooth peripherals that implement service 0x8765, and among those we can see our device.

![Not just an Eddystone beacon, we're also a legit BLE device]({{ site.baseurl }}/assets/physical1.jpg)

After we hit 'Pair', a connection is made and we can start reading and writing characteristics.

![We're paired and ready to go]({{ site.baseurl }}/assets/physical2.jpg)

I expect that the Pairing step will no longer be necessary when connecting via a Physical Web URL when everything is ready, but for now this is necessary.

## Conclusion

From here the opportunities are endless. We have a proper BLE connection to the device and we can read and write characteristics just like we would when building a native Android application. If you're ready to take the next step, we have some code ready that exposes an accelerometer service over Bluetooth and has a web application that plots movement of multiple BLE devices over time, which can be found on [GitHub](http://github.com/web-bluetooth/juggling). Enjoy!

<video autoplay loop>
  <source src="{{ site.baseurl }}/assets/devicemotion.mp4" type="video/mp4">
</video>

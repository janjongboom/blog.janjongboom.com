---
layout:         post
title:          "Flying a drone in your browser with WebBluetooth"
date:           2015-08-19T12:00:00.000Z
categories:     WebBluetooth
originalUrl:    https://hacks.mozilla.org/2015/08/flying-a-drone-in-your-browser-with-webbluetooth/
originalName:   Mozilla Hacks
language:       en
commentCount:   3
---

<p>There are tons of devices around us, and the number is only growing. And more and more of these devices come with connectivity. From <a href="http://bluesmart.com/" target="_blank">suitcases</a> to <a href="http://www.parrot.com/usa/products/flower-power/"
    target="_blank">plants</a> to <a href="http://www.amazon.com/Minder-Wink-App-Enabled-Smart-Tray/dp/B00GN92KQ4" target="_blank">eggs</a>. This brings new challenges: how can we discover devices around us, and how can we interact with them?</p>
<p>Currently device interactions are handled by separate apps running on mobile phones. But this does not solve the discoverability issue. I need to know which devices are around me before I know which app to install. When I’m standing in front of a <a href="http://blog.telenor.io/iot/2015/08/04/smart-meetingroom.html"
    target="_blank">meeting room</a> I don’t care about which app to install, or even what the name or ID of the meeting room is. I just want to make a booking or see availability, and as fast as possible.</p>
<!--more-->
<h2 id="bluetooth">Bluetooth</h2>
<p><a href="https://twitter.com/scottjenson" target="_blank">Scott Jenson</a> from Google has been thinking about discoverability for a while, and came up with the <a href="https://google.github.io/physical-web/" target="_blank"><em>Physical Web</em></a>    project, whose premise is:</p>
<blockquote>
    <p>Walk up and use anything</p>
</blockquote>
<p>The idea is that you use <a href="http://www.bluetooth.com/Pages/Bluetooth-Smart.aspx" target="_blank">Bluetooth Smart</a>, the low energy variant of bluetooth, to broadcast URLs to the world. Your phone picks up the advertisment package, decodes it,
    and shows some information to the user. One click and the user is redirected to a web page with relevant content. This can be used for a variety of things:</p>
<ul>
    <li>A meeting room can broadcast a URL to its calendar for scheduling.</li>
    <li>A movie poster can broadcast a URL to show viewing times and trailers.</li>
    <li>A prescription medicine can broadcast a URL with information about the medication or how to refill it. </li>
    <li>Look around you. Examples of other use cases are everywhere, waiting to be implemented.</li>
</ul>
<p>However, the material world is not a one-way street, and this presents a problem. Broadcasting a URL is great for informing me about things like movie times, but it does not allow me to interact more deeply with the device. If I want to fly a <a href="http://www.parrot.com/usa/products/rolling-spider/"
    target="_blank">drone</a> I don’t just want to discover that there’s a drone near me, I also want to interact with the drone straight away. We need to have a way for web pages to communicate back to devices.</p>
<p>Enter the work of the <a href="https://www.w3.org/community/web-bluetooth/" target="_blank">Web Bluetooth W3C group</a>, that includes representatives of Mozilla’s <a href="https://wiki.mozilla.org/B2G/Bluetooth" target="_blank">Bluetooth team</a>, who
    are working on bringing bluetooth APIs to the browser. If the <em>Physical Web</em> allows us to walk up to any device and get the URL of a web app, then WebBluetooth allows the web app to connect to the device and talk back to it.</p>
<p>At this point, there’s still a lot of work to be done. The bluetooth API is only exposed to <a href="https://developer.mozilla.org/en-US/Firefox_OS/Security/Security_model" target="_blank">certified content</a> on Firefox OS, and thus is not currently
    accessible to ordinary web content. Until security issues <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1053673" target="_blank">have been cleared</a> this will continue to be the case. A second issue is that <em>Physical Web</em> beacons
    broadcast a URL. How can a specific web resource know which specific device has broadcast the URL?</p>
<p>As you can see, lots of work remains to be done, but this blog is called Mozilla Hacks for a reason. Let’s start hacking!</p>
<h2 id="adding-physical-web-support-to-firefox-os">Adding <em>Physical Web</em> support to Firefox OS</h2>
<p>Since most of the work around WebBluetooth has been done for Firefox OS, I’ve made it my weapon of choice. I want the process of discovering devices to be as painless and obvious as possible. I figured the lockscreen would be the best possible place.
    Whenever you have bluetooth enabled on your Firefox OS phone, a new notification would then pop up asking you to search for devices (<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1196233" target="_blank">tracking bug</a>).</p>
<p><img class="alignnone size-medium wp-image-29168" src="{{ site.baseurl }}/assets/bt1.png" alt="Tap, tap, tap"></p>
{% highlight js %}
navigator.mozBluetooth.defaultAdapter.startLeScan([]).then(handle => {
  handle.ondevicefound = e => {
    console.log('Found', e.device, e.scanRecord);
  };
  setTimeout(() => {
    navigator.mozBluetooth.defaultAdapter.stopLeScan(handle)
  }, 5000);
).catch(err => console.error(err));
{% endhighlight %}
<p>As you can see on the third line, we have a <code>scanRecord</code>. This is the advertisement package that the device broadcasts. It’s nothing more than a set of bytes, and you are free to declare your own protocol. For our purpose—broadcasting URLs
    over bluetooth—Google has already developed two ways of encoding: <a href="https://github.com/google/uribeacon" target="_blank">UriBeacon</a> and <a href="https://github.com/google/eddystone" target="_blank">EddyStone</a>, both of which can be found
    in the wild today.</p>
<p>Parsing the advertisement package is pretty straightforward. Here’s some code I wrote to <a href="https://gist.github.com/janjongboom/78f6e45bc3b4133193ff" target="_blank">parse UriBeacons</a>. Parsing the UriBeacon will give you a URL, which is often
    shortened, because of limited bytes in the advertisement package —this makes for an uninformative UI:</p>
<p><img class="alignnone size-medium wp-image-29169" src="{{ site.baseurl }}/assets/bt2.png" alt="So what the hack (pun intended) is this device?"></p>
<p>To get some information about the web page behind the beacon we can do an AJAX request and parse the content of the page to enhance the information displayed on the lockscreen:</p>

{% highlight js %}
function resolveURI(uri, ele) {
var x = new XMLHttpRequest({ mozSystem: true });
x.onload = e => {
  var h = document.createElement('html');
  h.innerHTML = x.responseText;

  // After following 301/302s, this contains the last resolved URL
  console.log('url is', x.responseURL);

  var titleEl = h.querySelector('title');
  var metaEl = h.querySelector('meta[name="description"]');
  var bodyEl = h.querySelector('body');

  if (titleEl && titleEl.textContent) {
    console.log('title is', titleEl.textContent);
  }

  if (metaEl && metaEl.content) {
    console.log('description is', metaEl.content);
  }
  else if (bodyEl && bodyEl.textContent) {
    console.log('description is', bodyEl.textContent);
  }
};
x.onerror = err => console.error('Loading', uri, 'failed', err);
x.open('GET', uri);
x.send();
};
{% endhighlight %}

<p>This yields a nicer notification that actually describes the beacon.</p>
<p><img class="alignnone size-medium wp-image-29170" src="{{ site.baseurl }}/assets/bt3.png" alt="Much nicer"></p>
<h3 id="a-drone-that-doesnt-broadcast-a-url">A drone that doesn’t broadcast a URL</h3>
<p>Unfortunately not all BLE devices broadcast URLs at this point. All of this new technology is experimental and very cool, but not yet fully implemented. We’ve got high hopes that this will change in the near future. Because I still want to be able to
    fly my drone now, I added some code that transforms the data a drone broadcasts <a href="https://github.com/comoyo/gaia/blob/physical_web/apps/system/lockscreen/js/lockscreen_physical_web.js#L126" target="_blank">into a URL</a>.</p>
<h2 id="the-web-application">The web application</h2>
<p>Now that we’ve solved the issue of discoverability, we need a way to control the drone from the browser. Since bluetooth access is not available for web content, we need to make some changes to Gecko, where the Firefox OS security model is implemented.
    If you are interested in the changes, <a href="https://github.com/jan-os/gecko-dev/commit/4c80faf0e48ebad1346ca9fcdbada18a6a276e6d" target="_blank">here’s the commit</a>. We also needed a <a href="https://github.com/comoyo/gaia/commit/d823f61994ded5fdb7259bf965ba82b7746a2db9"
    target="_blank">sneaky hack</a> to make sure the tab’s process is run with the right Linux permissions. </p>
<p>With these changes in place, we open up <code>navigator.mozBluetooth</code> to all content, and run every tab in Firefox in a process that is part of the ‘bluetooth’ Linux group, ensuring access to the hardware. If you’re playing around with this build
    later, please note that with my “sneaky” hack implemented, you are now running a build where no security is guaranteed. Using a build hack like this, with security disabled, is fine for IoT experimentation, but is definitely <strong>not recommended</strong>    as a production solution. When the Web Bluetooth spec is finalized, and official support lands in Gecko, proper security <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=1053673" target="_blank">will be implemented</a>.</p>
<p>With the API in place, we can start writing the application. When you tap on the <em>Physical Web</em> notification on the lockscreen, we pass the device address in as a parameter. This is subject to change. For the ongoing discussion take a look at the
    <a href="https://docs.google.com/document/d/1jFCTyq84T2fLc8ZhxorTz3u_gCk59hp17EmkFgaDQ2c/edit" target="_blank">Eddystone -&gt; Web Bluetooth handoff</a>. </p>

{% highlight js %}
var address = 'aa:bb:cc:dd:ee'; // parsed from URL
var counter = 0;
navigator.mozBluetooth.defaultAdapter.startLeScan([]).then(handle => {
  handle.ondevicefound = e => {
    if (e.device.address !== address) return;

    navigator.mozBluetooth.defaultAdapter.stopLeScan(handle);

    // write some code to fly the drone
  };
}, err => console.error(err));
{% endhighlight %}

<p>Now that we have a reference to the device address, we can set up a connection. The protocol we use to talk back and forth to the device is called <a href="https://www.safaribooksonline.com/library/view/getting-started-with/9781491900550/ch04.html" target="_blank">GATT</a>,
    the Generic Attribute Profile. The idea behind GATT is that a device can have multiple standard services. For example, a heart rate sensor can implement the battery service and the heart rate service. Because these services are standardized, a consuming
    application only needs to write the implementation logic once, and can talk to any heart rate monitor.</p>
<p>Characteristics are aspects of a given service. For example, a heart rate service will implement <a href="https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.heart_rate_measurement.xml" target="_blank">heart rate measurement</a>    and <a href="https://developer.bluetooth.org/gatt/characteristics/Pages/CharacteristicViewer.aspx?u=org.bluetooth.characteristic.heart_rate_max.xml" target="_blank">heart rate max</a>. Characteristics can be readable and writeable depending on how
    they are defined. This goes the same with the drone. It has a service for flying the drone and characteristics to let you control the drone from your phone.</p>
<p>Luckily <a href="http://robotika.cz/robots/jessica/en" target="_blank">Martin Dlouhý</a> (as far as I can tell, he was the first) has already decoded the communication protocol for the Rolling Spider drone, so we can use his work and the new Bluetooth
    API to start flying…</p>

{% highlight js %}
// Have a way of knowing when the connection drops
e.device.gatt.onconnectionstatechanged = cse => {
  console.log('connectionStateChanged', cse);
};
// Receive events (battery change f.e.) from device
e.device.gatt.oncharacteristicchanged = cce => {
  console.log('characteristicChanged', cce);
};

// Set up the connection
e.device.gatt.connect().then(() => {
  return e.device.gatt.discoverServices();
}).then(() => {
  // devices have services, and services have characteristics
  var services = e.device.gatt.services;
  console.log('services', services);

  // find the characteristic that handles flying the drone
  var c = services.reduce((curr, f) => curr.concat(f.characteristics), [])
    .filter(c => c.uuid === '9a66fa0b-0800-9191-11e4-012d1540cb8e')[0];

  // take off instruction!
  var buffer = new Uint8Array(0x04, counter++, 0x02, 0x00, 0x01, 0x00]);
  c.writeValue(buffer).then(() => {
    console.log('take off successful!');
  });
});
{% endhighlight %}

<p>The Mozilla team in Taipei used this to create a <a href="https://github.com/fxos-bt-squad/RollingSpider">demo application</a> for Firefox OS, demonstrating the capabilities of the new API during the Mozilla Work Week in Whistler last June. With the API
    now available in the browser, we can take that work, <a href="https://github.com/janjongboom/rollingspider.xyz">host it as a web page</a>, beef up the graphics a bit, and have a <em>web site</em> flying a drone!</p>
<p><img class="alignnone size-medium wp-image-29171" src="{{ site.baseurl }}/assets/bt4.png" alt="Such amaze"></p>
<p><em>Such amaze. Much drone.</em></p>
<p>
    <iframe src="https://www.youtube.com/embed/yILD_ZdXJW4?start=33&amp;feature=oembed" allowfullscreen="" frameborder="0" height="281" width="500"></iframe>
</p>
<h2 id="conclusion">Conclusion</h2>
<p>It’s an exciting time for the Web! With more and more devices coming online we need a way to discover and interact with them without much hassle. The combination of <em>Physical Web</em> and WebBluetooth allows us to create frictionless experiences for
    users willing to interact with real-world appliances and new devices. Although we’re a long way off, we’re heading in the right direction. Google and Mozilla are actively developing the technology; I’ve got high hopes that everything in this blog
    post will be common knowledge in a year!</p>
<p>If that’s not fast enough for you, you can play around with an experimental build of Firefox OS which enables everything seen in this post. This build runs on the <a href="https://developer.mozilla.org/en-US/Firefox_OS/Developer_phone_guide/Flame" target="_blank">Flame</a>    developer device. First, upgrade to <a href="https://developer.mozilla.org/en-US/Firefox_OS/Phone_guide/Flame/Updating_your_Flame" target="_blank">nightly_v3 base image</a>, then flash <a href="http://rollingspider.xyz/bt-flame.zip" target="_blank">this build</a>.</p>
<h3
id="attributions">Attributions</h3>
<p>Thanks to <a href="https://github.com/dwi2" target="_blank">Tzu-Lin Huang</a> and <a href="https://github.com/weilonge" target="_blank">Sean Lee</a> for building the initial drone code; the WebBluetooth team in Mozilla Taipei (especially <a href="https://github.com/yrliou"
    target="_blank">Jocelyn Liu</a>) for quick feedback and patches when I complained about the API; <a href="https://twitter.com/voodootikigod" target="_blank">Chris Williams</a> for putting the drone in my JSConf.us gift bag; <a href="https://twitter.com/scottjenson"
    target="_blank">Scott Jenson</a> for answering my numerous questions about the <em>Physical Web</em>; and <a href="http://telenordigital.com/" target="_blank">Telenor Digital</a> for letting me play with drones for two weeks.</p>

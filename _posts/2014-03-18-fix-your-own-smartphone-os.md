---
layout:         post-tweakers
title:          "Fix your own smartphone OS"
date:           2014-03-18T09:27:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/10085/fix-your-own-smartphone-os.html
originalName:   Coding Glamour
language:       en
commentCount:   5
commentUrl:     http://glamour.tweakblogs.net/blog/10085/fix-your-own-smartphone-os.html#reacties
---

   <p class="article">If you&apos;re an avid smartphone user there will be times when there
  is behavior on your phone that just doesn&apos;t make sense, and that annoys
  the crap out of you. Well, you&apos;re not alone! Same thing happens to
  me, and I&apos;m even a full time developer on Firefox OS. One of the things
  that bugs me the most is the behavior of the address bar in the browser.
  When you scroll enough down, it will disappear, but the content jumps up
  under your finger. And content jumping is the @#*&amp;*#@&amp;#&amp;$ annoying.
  <br>
  <br>Time to fix it!
  <br>
  <br>So Firefox OS is built on top of open standards, HTML, JavaScript, blah,
  blah, blah, but the only real important thing here is, is that every (system)
  app is built on top of web technology. And thus, it&apos;s not compiled.
  That&apos;s actually pretty cool, because what I could do is <a href="https://github.com/mozilla-b2g/gaia/"
  rel="external nofollow">grab the source code</a> of the whole frontend of
  the OS; make changes; and then push to my phone. Sure. But that takes long,
  and maybe you miss a build prerequisite, etc. Luckily, because the browser
  app is basically a website, we can just pull the app from the phone and
  edit it.
  <!--more-->
<b>Pulling the app</b>
  <br>So first we&apos;ll need the source code of the application. To do that,
  we first enable remote debugging on the phone. You do this via:
  <br>
  <br>Settings -&gt; Device Information -&gt; More Information -&gt; Developer
  -&gt; Remote Debugging
  <br>
  <br>Now if you have the <a href="https://developer.mozilla.org/en-US/Firefox_OS/Debugging/Installing_ADB"
  rel="external nofollow">Android Developer Bridge (adb)</a> installed, and
  plugged in your phone, running adb devices will show you your device:
  <br>
  <br>
{% highlight bash %}
$ adb devices
List of devices attached
ClovertrailB8FBEE0A    device
{% endhighlight %}
  <br>Time to pull the browser app. All system apps live in &apos;/system/b2g/webapps/[name].gaiamobile.org&apos;
  (you can |adb shell| into the phone if you like), and then are zipped up
  as &apos;application.zip&apos;. So to pull the browser, run:
  <br>
  <br>
{% highlight bash %}
$ adb pull /system/b2g/webapps/browser.gaiamobile.org/application.zip browser-original.zip
4998 KB/s (847237 bytes in 0.165s)
{% endhighlight %}
  <br>
  <br>
<b>Updating the app</b>
  <br>Now it&apos;s time to update the application. First unzip the file, and
  then open the folder in your favourite editor. <b>Don&apos;t delete the ZIP</b>.
  In the /js folder there is a bunch of JavaScript files, just as in a normal
  website.
  <br>
  <br>
{% highlight bash %}
js
|- authentication_dialog.js
|- awesomescreen.js
|- browser.js
|- browser_db.js
|- init.json
|- modal_dialog.js
|- settings.js
|- toolbar.js
|- utilities.js
{% endhighlight %}
  <br>The code is not minified or zipped, so it&apos;s pretty easy to just start
  digging around (yeah, you can attach a debugger and inspect the code, but
  that&apos;s for another time). By looking in browser.js there are some
  scrolling thresholds defined on top of the file:
  <br>
  <br>
{% highlight js %}
// ...
  UPPER_SCROLL_THRESHOLD: 50, // hide address bar
  LOWER_SCROLL_THRESHOLD: 5, // show address bar
// ...
{% endhighlight %}
  <br>Well, that seems pretty much what I need. Time to kill the address bar
  toggling! Searching for the variable brings us to:
  <br>
  <br>
{% highlight js %}
  handleScroll: function browser_handleScroll(evt) {
    this.lastScrollOffset = evt.detail.top;
    if (evt.detail.top < this.LOWER_SCROLL_THRESHOLD) {
      this.showAddressBar();
    } else if (evt.detail.top > this.UPPER_SCROLL_THRESHOLD) {
      this.hideAddressBar();
    }
  },
{% endhighlight %}
  <br>So, let&apos;s just remove that code, and always show the address bar.
  Now the thing is that the code that gets executed on the device <b>is minified and combined</b>.
  And it lives in &apos;gaia_build_defer_index.js&apos; in the root of the
  app. So let&apos;s open that file, throw it through a JS beautifier, and
  find the same code. Now we can also fix this piece of code and remove the
  toggling.
  <br>
  <br>
{% highlight js %}
  handleScroll: function browser_handleScroll(evt) {
    this.lastScrollOffset = evt.detail.top;
    this.showAddressBar();
  },
{% endhighlight %}
  <br>You can minify the file again, but who actually cares.
  <br>
  <br>
<b>Time to push this back to the phone</b>
  <br>So, <b>make sure you have the original ZIP</b>, in case you made a fuck
  up. Now make a ZIP file from the app again (select all files -&gt; Compress
  X items in OSX). Make sure you ZIP the <b>content</b> of the browser folder,
  not the actual folder itself! And time to push it back to the phone.
  <br>
  <br>
{% highlight bash %}
# First remount because we need root permissions for this
$ adb remount
# Push the new ZIP file
$ adb push browser-new.zip /system/b2g/webapps/browser.gaiamobile.org/application.zip
4986 KB/s (920309 bytes in 0.180s)
# And restart the OS
$ adb shell stop b2g && adb shell start b2g
{% endhighlight %}
  <br>Tah dah, no more annoying scroll behavior.
  <br>
  <br>
<b>Don&apos;t want to hack your own phone?</b>
  <br>It will be fixed in Firefox OS 1.4. But then again, there is probably
  something else that might annoy you :-)</p>
   
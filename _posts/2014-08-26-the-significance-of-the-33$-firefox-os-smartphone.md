---
layout:         post-tweakers
title:          "The significance of the 33$ Firefox OS smartphone"
date:           2014-08-26T18:48:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/10747/the-significance-of-the-33%24-firefox-os-smartphone.html
originalName:   Coding Glamour
language:       en
commentCount:   7
commentUrl:     http://glamour.tweakblogs.net/blog/10747/the-significance-of-the-33%24-firefox-os-smartphone.html#reacties
---

   <p class="article"><i>This article is a reworked abstract from my book Firefox OS in Action. The first few chapters are currently available under early access at <a href="http://manning.com/jongboom/" rel="external nofollow"> http://manning.com/jongboom/</a>. You&apos;ll get 50% off with code &apos;dotd082714au&apos; if you buy it on August 27.</i>
  <br>
  <br>The launch of Firefox OS phones in India yesterday made a lot of buzz.
  Major reason: for the first time a smartphone was launched for a price
  under 2,000 rupees (&#xA4;25 or $33). This might seem insignificant in
  the &apos;first world&apos;, where every teenager runs around with a $700
  iPhone in their pockets, but will make a huge impact in the third world.
  In this article I&apos;d like to talk about the reasons why we have focused
  on breaking the price barrier, and about the choices in architecture that
  we made to facilitate this.
  <br>
  <br>While internet is a commodity for most readers of this article, this is
  not the case for the majority of people on this planet. At the moment of
  writing an astonishing 4.2 billion people do not have access to the greatest
  source of information that humankind has ever created. There are more people
  that do not have access to the internet, than those who do. One of the
  main goals (for me *the* main goal) of Firefox OS is to change this.
  <br>
  <br>Working as an evangelist for Telenor, a telco that has a number of subsidiaries
  in poor countries, this directly affects me. I have the opportunity to
  travel to a lot of these places, and the thing that strikes me the most
  every time I&apos;m down in South-East Asia is the curiosity and willing
  to learn that people show. Every time we host a seminar, a training session
  or a Firefox OS app day there are 5 times more people that sign up than
  that we have room for. We have not even launched in Bangladesh and there
  are over a hundred apps in the Firefox OS marketplace already. It&apos;s
  astonishing.
  <br>
  <br>For me this is the ultimate proof that the biggest difference between
  us, the Silicon Valley induced Hacker News crowd, and them is just plain
  simple opportunity. Internet is the way to level that playing field. With
  internet everyone has access to the best <a href="https://www.coursera.org/"
  rel="external nofollow">education programs</a>; <a href="http://amardaktar.com/"
  rel="external nofollow">health care information</a>; and <a href="https://appear.in/"
  rel="external nofollow">communication channels</a>. And on top of that
  it allows people to sell their product to the global market. Internet is
  going to have a direct impact on the lives of these 4.2 billion people.
  <br>
  <br>
</p>
<h5>The foundation</h5>
<br>To accommodate these goals Firefox OS is built on two pillars. First:
be able to run on the lowest hardware possible, because cost is a big factor.
And second: put the open web first, as there is <a href="http://www.slideshare.net/janjongboom/firefox-os-internet-for-all-digitalworld-bangladesh-2014/20"
rel="external nofollow">ten thousand times</a> more information available
on the web than in app stores.
<br>Optimizing a phone to run the web as fast as possible on cheap hardware
means that some interesting changes are made in the architecture of the
OS. When you want to view a web page on Windows or on Android you&apos;ll
do this through a browser like Mozilla Firefox or Google Chrome. The browser
then runs on top of the operating system (Windows, Android, etc.), the
operating system then runs on top of the hardware.
<br>
<br>That means that running a web page will always be slower than running
a native application on these operating systems, because it has one less
layer of abstraction (App -&gt; OS -&gt; Hardware, versus Web Page -&gt;
Browser -&gt; OS -&gt; Hardware). But Firefox OS takes a new approach.
Web pages should run as fast as possible, so the OS layer that sits between
the browser and the hardware is just a factor that slows that down.
<br>
<br>When you are designing an OS from the ground up you can change the way
this works. Firefox OS takes a new approach, where there is no separate
OS layer and the browser runs directly on top of the hardware. That way
the heavy step in between is gone and we have a cheap and fast web browser
on a mobile device.
<br>
<br>This approach has one big drawback. The OS layer contains a lot of useful
stuff that is not present in the browser. For example access to hardware
sensors, the ability to place a phone call, and access to the SD card.
Those features are not included in the browser. To make up for this, Mozilla
added new JavaScript APIs to the browser that allow you to access all these
things. This means that you can now write some JavaScript to place a phone
call.
<br>
<br>JavaScript:
<br>
{% highlight text %}
var call = navigator.mozTelephony.dial('+1555332134'); // #a
call.addEventListener('connected', function() { // #b
  call.hangUp(); // #c
});
{% endhighlight %}
<br>Here the API to make phone calls is located under navigator.mozTelephony.
This API has a moz prefix because other browser vendors have not agreed
upon the API yet. We can call the dial function to initiate a phone call
(#a). The API returns a standard JavaScript object where we can attach
event listeners. In this case we wait for the call to be connected (the
other party picks up the phone #b), and instantly hang up (#c). This gives
us the opportunity to interact with real life, straight from JavaScript!
<br>
<br>

<h5>The web is great</h5>
<br>Now the ability to place a phone call from JavaScript might seem trivial
but it&apos;s actually a big deal. Developers love building for the web.
The web is open by nature; there is no gatekeeper or app store that puts
restrictions on what you do. You are free to publish what you want, and
when you want. And your applications are also available instantly, no need
to install applications locally, and available on every device with a web
browser.
<br>
<br>But seen from the users perspective, mobile web applications often give
a sub par experience, because the web is lacking some very important features.
When people want mobile apps they don&apos;t want desktop apps scaled down
to work on a smaller screen. They want apps that are a lengthening piece
of their own lives.
<br>
<br>Some examples, Shazam can detect which song you&apos;re listening to by
using the microphone in your phone. Fitness trackers use the accelerometer
to detect if you&apos;re walking or biking. News apps send push messages
when breaking news happens. These are all apps that are impossible to build
on the mobile web. Until now.
<br>
<br>Because Firefox OS adds new APIs for all the features in your phone, you
can create web applications that leverage all these new techniques. And
for the first time you can write mobile web apps that have the same functionality
as native apps. And it doesn&apos;t stop at sensors, there are facilities
for dealing with the SD card, push notifications, offline, etc.
<br>
<br>

<h6>STANDARDIZATION</h6>
<br>And because Firefox OS is in essence nothing more than a browser running
on hardware, these new features are implemented in the Firefox browser.
A lot of these new APIs will therefore also come to Firefox for Android.
And that&apos;s just the start. The goal of Firefox OS is to make the web
a better place, so other browser vendors are encouraged to also implement
these new features.
<br>
<br>Therefore, it proposed all new APIs to the W3C (World Wide Web Consortium),
the main standards organization for the web. W3C members include browser
vendors, big Internet companies, governments, and non-profits.
<br>
<br>The benefit of going through W3C is that vendors have a say in the choices
Mozilla made and in the APIs it had implemented. W3C acceptance is very
important and indicates a strong chance other browser and OS vendors will
implement the API as well. If that happens it will also be possible to
use phone-specific features on those platforms using one standard API.
This is the reason one web site will work on all web browsers.
<br>
<br>Standardization of new APIs does not happen overnight though, as people
will use them as soon as they&apos;re available. Because of that it is
important to get consensus across all vendors, as it&apos;s almost impossible
to change an API. But there already has been progress. For example, the
W3C has accepted the API to <a href="http://www.w3.org/TR/vibration/" rel="external nofollow">vibrate the phone</a> and
the API to <a href="http://www.w3.org/TR/notifications/" rel="external nofollow">show notifications</a> in
the OS. And now they work in Chrome for Android as well. And that makes
the web as a whole a stronger alternative to native.
<br>
<br>

<h5>More information</h5>
<br>If you&apos;d like to learn more about the architecture of Firefox OS,
how we do process isolation, and how we route SMS from HTML all the way
down to hardware, check out my talk at <a href="https://www.youtube.com/watch?v=xJ1HztLKnHI&amp;hd=1"
rel="external nofollow">Simonyi Konferencia</a>.
<br>
<br>For information on how to create applications for Firefox OS you can get
<a
href="http://manning.com/jongboom/" rel="external nofollow">my book</a>(remember &apos;dotd082714au&apos;), or watch the free video
  series me, Sergi Mansilla and Christian Heilmann made called <a href="https://developer.mozilla.org/en-US/Firefox_OS/Screencast_series:_App_Basics_for_Firefox_OS"
  rel="external nofollow">App Basics for Firefox OS</a>.
  <p></p>
   
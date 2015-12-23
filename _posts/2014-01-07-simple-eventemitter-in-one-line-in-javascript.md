---
layout:         post-tweakers
title:          "Simple EventEmitter in one line in javascript"
date:           2014-01-07T14:12:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/9765/simple-eventemitter-in-one-line-in-javascript.html
originalName:   Coding Glamour
language:       nl
commentCount:   1
commentUrl:     http://glamour.tweakblogs.net/blog/9765/simple-eventemitter-in-one-line-in-javascript.html#reacties
---

   <p class="article">Chances are that if you have a large javascript application that you&apos;ll
  need an EventEmitter at one moment or another because events are great
  to wire separate modules together without them having to expose implementation
  details. Too bad that you&apos;ll need to pull in dependencies, another
  library, extra risk, etc. Especially if you&apos;re testing some simple
  scenario or small app that&apos;s a lot of boilerplate. Behold: a dependency-less
  event emitter (1 line of javascript!):
  <br>
  <br>
{% highlight js %}
function createEventEmitter() {
  return document.createElement('div');
}
{% endhighlight %}
  <br>All DOM elements implement <a href="http://www.w3.org/TR/DOM-Level-3-Events/"
  rel="external nofollow">DOM Level 3 events</a>, which you can abuse as
  a nice event emitter. Great thing is that you get cancelation and bubbling
  as well. Bad things:
  <ul>
    <li>It&apos;s about 5x times as slow as EventEmitter.js (<a href="https://groups.google.com/d/msg/mozilla.dev.gaia/D4kRaSDspQI/OINSjliIu5oJ"
      rel="external nofollow">source</a>), but you can very easily swap out this
      by EE if required in a later stage.</li>
    <li>Dispatching events is a bit cumbersome because you need to use this syntax:
      `new CustomEvent(&quot;eventname&quot;, { detail: &quot;eventdetail&quot;
      })`</li>
  </ul>Usage:
  <br>
  <br>
{% highlight js %}
var ee = document.createElement('div')
ee.addEventListener('awesome', function() { console.log('omg omg omg', e.detail) })
ee.dispatchEvent(new CustomEvent('awesome', { detail: 1337 }))
// omg omg omg, 1337 /* output from the console.log */
// true /* event did not get canceled */
{% endhighlight %}</p>
   
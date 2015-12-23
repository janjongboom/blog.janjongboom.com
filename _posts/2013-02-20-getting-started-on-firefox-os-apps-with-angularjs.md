---
layout:         post-tweakers
title:          "Getting started on Firefox OS apps with AngularJS"
date:           2013-02-20T10:21:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/8717/getting-started-on-firefox-os-apps-with-angularjs.html
originalName:   Coding Glamour
language:       en
commentCount:   0
commentUrl:     http://glamour.tweakblogs.net/blog/8717/getting-started-on-firefox-os-apps-with-angularjs.html#reacties
---

   <p class="article">The part that amazes me most about working day to day with Firefox OS
  is the incredible way that the existing web eco-system can be reused to
  target mobile phones. We have seen this with <a href="http://comoyo.github.com/blog/2013/02/01/weinre-debugging-firefoxos/"
  rel="external">using Weinre to remote debug the FFOS system</a>, <a href="http://syntensity.com/static/espeak.html"
  rel="external">using emscripten to cross compile C code into javascript</a>,
  or just the ease of reusing jQuery within your Firefox OS app; something
  that I would have killed for back in the days when doing WPF.
  <!--more-->
  <br>
  <br>Development in JavaScript frameworks has exploded since the mid-2000s,
  with new players emerging every other day, and application frameworks like
  <a
  href="http://emberjs.com/" rel="external">Ember.js</a>or <a href="http://angularjs.org/" rel="external">AngularJS</a> now
    taking the lead, giving website developers extremely powerful components
    at a fraction of the costs. The great thing about Firefox OS is that we
    can take advantage of the developments in these areas, rather than waiting
    for a new release from Apple or Google to react on the changing world.
    <br>
    <br>However, building great web applications doesn&apos;t end with picking
    an application framework. Perhaps the most scaring part here is to pick
    a UI framework, or to get over the data binding syntax. The good thing
    here is: been there, done that. We have explored a variety of UI libraries,
    application frameworks and we have experienced first hand which are the
    pitfalls when building for Firefox OS. That&apos;s why we&apos;re releasing
    application boilerplate for writing great looking and structured mobile
    applications. For an impression: the application can be found on <a href="http://comoyo.github.com/ffos-list-detail"
    rel="external">comoyo.github.com/ffos-list-detail</a> (visit in any modern
    browser).
    <br>
    <br>
    <img src="https://c9.io/janjongboom/dropbox/workspace/ffos1.png" title="https://c9.io/janjongboom/dropbox/workspace/ffos1.png"
    alt="https://c9.io/janjongboom/dropbox/workspace/ffos1.png">
    <br>
    <br>Things we have addressed here:
    <ul>
      <li>Routing for bookmarkable segments in the application</li>
      <li>Separation in controllers, views and services through AngularJS</li>
      <li>Incorporating a UI library with the <a href="http://buildingfirefoxos.com"
        rel="external">Firefox OS building blocks</a>, that was also used to build
        the core UI layer (how is that for native!)</li>
      <li>Animations between views (slide and modal, plus reverse), optimized to
        also run smooth on low spec phones</li>
      <li>Compatibility to also run on Android, iOS and desktop browsers</li>
      <li>Example app manifest + cache manifest for offline usage</li>
      <li>RequireJS build system for javascript combination / minification</li>
    </ul>In general we have tried to give you a quick start to get building great
    Firefox OS applications. Good thing here is that you will get cross platformability
    (is that a word?) as a free bonus, as long as you don&apos;t use any of
    the <a href="https://developer.mozilla.org/en-US/docs/WebAPI" rel="external">WebAPI&apos;s</a> to
    access native phone features.
    <br>
    <br>The source of the application (fork and start hacking!) can be found on
    <a
    href="https://github.com/comoyo/ffos-list-detail" rel="external">github.com/comoyo/ffos-list-detail</a>.
      <br>
      <br>
<i>Comments on <a href="http://news.ycombinator.com/item?id=5249739" rel="external">Hacker News</a></i>
</p>

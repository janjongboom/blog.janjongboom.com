---
layout:         post-tweakers
title:          "Simple async queue in javascript"
date:           2014-01-02T12:51:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/9745/simple-async-queue-in-javascript.html
originalName:   Coding Glamour
language:       nl
commentCount:   2
commentUrl:     http://glamour.tweakblogs.net/blog/9745/simple-async-queue-in-javascript.html#reacties
---

   <p class="article">Normally I fall back to caolan&apos;s async module, but I&apos;m not in
  a node.js environment and I needed a simple async queue with concurrency
  1; which can be done in a one liner.
  <br>
  <br>
{% highlight js %}
var q = [ 
  function a(n) { console.log('a'), setTimeout(n, 30); },
  function b(n) { console.log('b'), setTimeout(n, 10); }
];
function queue(q, n) {
  q.length ? q.shift()(queue.bind(this, q, n)) : n();
}
queue(q, function() { console.log('done') });
{% endhighlight %}
  <br>You could use arguments.callee rather than queue to bind to the current
  function, but it has been deprecated since ES5.
  <br>
  <br>It&apos;s also easy to use it with promises, let&apos;s say I have a function
  |sendKey| that returns a promise and I want to send a string char by char:
  <br>
  <br>
{% highlight js %}
var input = 'sometext'
var q = input.split('').map(function(c) {
  return function(n) {
    sendKey(c).then(n);
  };
});
queue(q, function() { console.log('done') });
{% endhighlight %}</p>
   
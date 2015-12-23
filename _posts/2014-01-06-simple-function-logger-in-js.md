---
layout:         post-tweakers
title:          "Simple function logger in JS"
date:           2014-01-06T11:57:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/9761/simple-function-logger-in-js.html
originalName:   Coding Glamour
language:       nl
commentCount:   4
commentUrl:     http://glamour.tweakblogs.net/blog/9761/simple-function-logger-in-js.html#reacties
---

   <p class="article">Every now and then I end up in a code base where I don&apos;t have a clue
  about the flow yet; like today when testing out the new keyboard application
  that we&apos;re developing for Firefox OS. To see whether the flow is actually
  sane I plug in a simple function logger that allows me to see which functions
  are called and with what arguments.
  <br>
  <br>
{% highlight js %}
  function log(args) {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    // stole this from http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
    function getParamNames(func) {
      var fnStr = func.toString().replace(STRIP_COMMENTS, '');
      var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(/([^\s,]+)/g);
      if(result === null)
         result = [];
      return result;
    }
    console.log(args.callee.name, getParamNames(args.callee).reduce(function(obj, k, ix) { 
      obj[k] = args[ix]; 
      return obj; 
    }, {}));
  }
{% endhighlight %}
  <br>Now you can take advantage of this by putting a call to this function
  on the first line of any function you want to trace:
  <br>
  <br>
{% highlight js %}
function a(b, c) { log(arguments); }
{% endhighlight %}
  <br>When calling the a function, it will log the function name and an object
  with argument names and values:
  <br>
  <br>
{% highlight js %}
a(4, 5);
// a { b: 4, c: 5 }
{% endhighlight %}
  <br>Remember to disable &quot;use strict&quot; because accessing callee is
  not permitted anymore.</p>
   
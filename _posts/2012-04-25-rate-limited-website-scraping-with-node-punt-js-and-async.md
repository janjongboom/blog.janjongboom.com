---
layout:         post-tweakers
title:          "Rate limited website scraping with node.js and async"
date:           2012-04-25T17:30:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/7818/rate-limited-website-scraping-with-node-punt-js-and-async.html
originalName:   Coding Glamour
language:       en
commentCount:   9
commentUrl:     http://glamour.tweakblogs.net/blog/7818/rate-limited-website-scraping-with-node-punt-js-and-async.html#reacties
---

   <p class="article">So yesterday a <a href="http://www.funda.nl/about/default.aspx?pagina=/nl/algemene-teksten-funda-sites/fundanl/over-funda/werken-bij-funda/senior-software-developer"
  rel="external nofollow">job description</a> at my previous employer popped
  up in my facebook stream which reminded me of <a href="http://www.funda.nl/about/default.aspx?pagina=/nl/info/opdracht/"
  rel="external nofollow">the programming excercise</a> that we included in
  the interview process just before I left the company. In short it comes
  down to:
  <ul>
    <li>Funda has an API that lets you do queries, the response is paged, max.
      25 objects at a time</li>
    <li>The API is rate limited at about 100 req./minute</li>
    <li>Request all pages for a given query</li>
    <li>Count the times a realtor ID is in the result</li>
    <li>Aggregate and sum the realtor ID&apos;s and create a top 10 list of realtors
      with the most objects</li>
  </ul>Scraping this is pretty easy, but the rate limiting got me thinking. A
  great library for doing queue work like this (create a large list of URLs
  to scrape, then do it 4 at the same time or something) is <a href="https://github.com/caolan/async"
  rel="external nofollow">async</a> by caolan, but it lacks real rate limiting.
  Room for improvement!
  <!--more-->
<b>Expanding async</b>
  <br>The async library already has a pretty convenient way to create dynamically
  sized queues with concurrency, in the form of:
  <br>
  <br>
{% highlight js %}
// create a queue that does 4 items at the same time
// that for every item in the queue outputs the value times 2
var q = async.queue(function (item, next) {
    // add a random timeout so we can see the queue'ing
    setTimeout(function () {
        console.log(item * 2);
        next();
    }, Math.random() * 1000 |0);
}, 4);
q.drain = function () { console.log("done"); };
q.push([ 1,2,3,4,5,6,7,8,9,10 ]);
// gives something like (order can be different)
// but higher numbers are pushed later than lower numbers
// 8, 6, 12, 4, 2, 10, 18, 16, 14, 20, done
{% endhighlight %}
  <br>To add rate limiting to queues I created a <a href="https://github.com/janjongboom/async/blob/master/lib/async.js#L712"
  rel="external nofollow">mixin</a> that adds some methods to async that will
  create a form of an event loop structure that&apos;ll fire every X ms.
  Where X is of course the max. speed that we can query the target website.
  The usage is still the same, but the queue variable now has a chainable
  method &apos;rateLimit&apos; added. Executing the same code like before
  but rate limited to 1 request per second will give a sorted response, because
  even though we have a concurrency of four, the max. time processing an
  item is 1 second. The previous record will therefore always be processed.
  <br>
  <br>
{% highlight js %}
// change
// }, 4);
// into
}, 4).rateLimit(1000);
// gives
// 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, done
{% endhighlight %}
  <br>
  <br>
<b>Transforming it in real world code</b>
  <br>The response that we get from funda has a &apos;Paging&apos; parameter
  that contains the next URL that we can call. If it&apos;s empty, we&apos;ve
  reached the end of our set. In pseudo code:
  <br>
  <br>
{% highlight text %}
func processItem (url)
    resp = request(url)
    if resp.Paging.VolgendeUrl
        processItem resp.Paging.VolgendeUrl
    else
        "done"
{% endhighlight %}
  <br>In javascript with async, this will look like:
  <br>
  <br>
{% highlight js %}
var async = require("async");
var q = async.queue(function (url, next) {
    request.get(url, function (err, res, body) {
        // parse the body to JSON
        body = JSON.parse(body);
        if (body && body.Paging.VolgendeUrl) {
            q.push(body.Paging.VolgendeUrl);
        }
        // do stuff like counting realtors
        next();
    });
}, 1).rateLimit(60000 / 60); // 60 per minute, just to be safe
// initial page
q.push("/zaandam/tuin/");
q.drain = function () {
    console.log("done");
};
{% endhighlight %}
  <br>
  <br>
<b>Counting realtor IDs</b>
  <br>Because the purpose of the assignment is to count the realtor IDs we&apos;ll
  add a simple object map where we gather all the data:
  <br>
  <br>
{% highlight js %}
// the key will be the realtor ID and the value the no of times we encountered this realtor
var map = {}; 
// =================
// when a request comes in:
// first grab the realtor IDs
var realtorIds = body.Objects.map(function (obj) {
    return obj.MakelaarId;
});
// then move it to the map
realtorIds.forEach(function (rid) {
    // check for existing one, if not initialize it with '1'
    map[rid] = (map[rid] || 0) + 1;
});
// =================
// on drain:
// make a sortable object with {id: [Number], cnt: [Number]}
var sortable = Object.keys(map).map(function (k) {
    return {
        id: k,
        cnt: makelaarMap[k]
    };
});
// now sort it on cnt HI-LO
var sorted = sortable.sort(function (o, p) {
    return o.cnt > p.cnt ? -1 : (o.cnt === p.cnt ? 0 : 1);
});
// output it
for (var ix = 0; ix < 10; ix++) {
    console.log(ix+1 + '.', sorted[ix].id, 'has', sorted[ix].cnt, 'objects');
}
{% endhighlight %}
  <br>
  <br>
<b>Hooking it together</b>
  <br>We&apos;ll need some small things to do, first, we&apos;ll need to incorporate
  the base URL, then, we&apos;ll need to normalize the URLs we receive from
  &apos;VolgendeUrl&apos; and maybe do some sanitizing. The final script
  will look something like this:
  <br>
  <br>
{% highlight js %}
var async = require("async");
var request = require("request");
var makelaarMap = {};
var q = async.queue(function (zo, next) {
    console.log("process", zo);
    var url = "http://partnerapi.funda.nl/feeds/Aanbod.svc/json/a001e6c3ee6e4853ab18fe44cc1494de/?type=koop&pagesize=25&zo=" + zo;
    request.get(url, function (err, res, body) {
        // add error checking (see err, and res.statusCode)
        if ((body = body && JSON.parse(body)) && body.Paging.VolgendeUrl) {
            q.push(body.Paging.VolgendeUrl.replace(/^\/\~\/\w+/, ""));
        }
        body.Objects.map(function (o) { return o.MakelaarId; }).forEach(function (mid) {
            makelaarMap[mid] = (makelaarMap[mid] || 0) + 1;
        });
        next();
    });
}, 1).rateLimit(60000 / 60); // 60 per minute
// initial page
q.push("/zaandam/tuin/");
q.drain = function () {
    var sorted = Object.keys(makelaarMap).map(function (k) {
        return {
            id: k,
            cnt: makelaarMap[k]
        };
    }).sort(function (o, p) {
        return o.cnt > p.cnt ? -1 : (o.cnt === p.cnt ? 0 : 1);
    });
    for (var ix = 0; ix < 10; ix++) {
        console.log(ix+1 + '.', sorted[ix].id, 'has', sorted[ix].cnt, 'objects');
    }
};
{% endhighlight %}
  <br>
  <br>
<b>Running it</b>
  <br>To run it: execute the following commands on your local system or on
  <a
  href="http://c9.io/dashboard.html" rel="external nofollow">Cloud9 IDE</a>:
    <br>
    <br>
{% highlight bash %}
$ git clone https://github.com/janjongboom/async node_modules/async
$ npm install request
# paste the code in server.js
$ node server.js
{% endhighlight %}</p>
   
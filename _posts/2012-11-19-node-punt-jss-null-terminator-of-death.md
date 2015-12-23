---
layout:         post-tweakers
title:          "Node.js's null terminator of death"
date:           2012-11-19T17:29:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/8476/node-punt-jss-null-terminator-of-death.html
originalName:   Coding Glamour
language:       en
commentCount:   3
commentUrl:     http://glamour.tweakblogs.net/blog/8476/node-punt-jss-null-terminator-of-death.html#reacties
---

   <p class="article">Recently we embraced our new &apos;review for security&apos; strategy,
  that included a security 101 given by yours truly and a very big messages
  like &apos;Don&apos;t reinvent the fucking wheel&apos;. Just saying.
  <br>
  <br>
  <img src="http://100procentjan.nl/tweakers/dontwheel.png" title="http://100procentjan.nl/tweakers/dontwheel.png"
  alt="http://100procentjan.nl/tweakers/dontwheel.png">
  <br>
  <br>Working on this subject intensively also learned me to really really test
  for security. Developers, and I&apos;m not an exception here, are focussed
  on code quality, feature stability and security is not always on their
  radar. And that&apos;s a shame because reviewing for security really gives
  you this &apos;Dade Murphy&apos; hackers feeling. Meet me at the &apos;null
  terminator of death&apos;.
  <!--more-->
<b>Start off by doing some black box testing</b>
  <br>A feature came under review that retrieves data from an external source
  and then offers this info through an HTTP interface. Pretty straight forward.
  When inspecting the HTTP requests I then see a request per article coming
  in. That kinda surprise me because I knew the source data is one big blob.
  There must be some server side processing.
  <br>
  <br>
  <img src="http://100procentjan.nl/tweakers/httprequest.png" title="http://100procentjan.nl/tweakers/httprequest.png"
  alt="http://100procentjan.nl/tweakers/httprequest.png">
  <br>
  <br>Time to try some stuff out. First thing is to randomly change some data
  and see if it alread
  <br>
  <br>
{% highlight text %}
$ curl http://web.janjongboom.c9.io/api/some/feature/tralalal

Error: ENOENT, open '/var/some/dir/cache/tralalal.json'
{% endhighlight %}
  <br>Bingo! We now know that there is a cache held on the filesystem and that
  the file being loaded depends on the URL parameter. Without a white list.
  <br>
  <br>
<b>Escaping from cache</b>
  <br>The next thing is to escape from the cache folder. Just adding &apos;../&apos;
  in the path won&apos;t magically work, but we can url encode this and see
  if there is any protection.
  <br>
  <br>
{% highlight text %}
$ curl http://web.janjongboom.c9.io/api/some/feature/..%2server

Error: ENOENT, open '/var/some/dir/server.json'
{% endhighlight %}
  <br>How great! We don&apos;t have to do more weird tricks, and the ../ is
  even auto resolved for us. Now it&apos;s time to start digging around until
  we are in a more interesting place. If you&apos;re reviewing you know the
  server structure so it should not be hard to move yourself in the source
  folder of your project. Great thing is that almost all node.js projects
  have a package.json in their root. That makes the search easier.
  <br>
  <br>This way I could read the package.json of my project. Not so nice. However,
  I&apos;d rather read some nice information like the private key of the
  server.
  <br>
  <br>
<b>Get around the .json postfix</b>
  <br>Let&apos;s grab the code. It was something something like:
  <br>
  <br>
{% highlight js %}
app.get('/api/some/feature/:file', function (req, res, next) {
    fs.readFile(__dirname + "/cache/" + req.params.file + ".json", function (err, data) {
        // this causes us to see the full file name
        if (err) return next(err);
        
        res.end(data);
    })
})
{% endhighlight %}
  <br>So in the construction of the file name, we have already bypassed the
  &apos;/cache/&apos; and &apos;__dirname&apos; part. But a real hacker should
  also have the ability to get passed the extension. Together with Bert from
  the node.js core team we brainstormed a little about ways to do this, and
  he figured that putting a null terminator (\0) in the file name would probably
  omit everything thereafter. Makes sense if you realize that all core parts
  in node are written in C. A simple &apos;encodeURIComponent(&quot;\0&quot;)&apos;
  gives &apos;%00&apos;. Let&apos;s just try that...
  <br>
  <br>
{% highlight text %}
$ curl -k /api/some/feature/..%2F..%2F..%2Fhome%2Fubuntu%2F.ssh%2Fid_rsa.pub%00

"Invalid JSON"
{% endhighlight %}
  <br>Phew, at least there is a JSON.parse that fails. But can you imagine if
  that check wouldn&apos;t be there? The private key of a production server
  could be stolen. Good thing we do this security reviews.
  <br>
  <br>
<b>Lessons learned</b>
  <ul>
    <li>Reviewing for security always pays off</li>
    <li>User input is always evil. Escape it. Do a realpath and verify the user
      should be able to access the file. Use whitelists, etc.</li>
    <li>The null terminator trick made me really feel hackerish</li>
  </ul>
  <img src="http://tweakimg.net/g/s/yummie.gif" width="15" height="15" alt=":9">
</p>
   
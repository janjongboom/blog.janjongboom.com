---
layout:         post-tweakers
title:          "Live file sharing met socket.io en node.js"
date:           2011-10-27T15:00:00.000Z
categories:     Reacties (6)
originalUrl:    http://glamour.tweakblogs.net/blog/7238/live-file-sharing-met-socket-punt-io-en-node-punt-js.html
originalName:   Coding Glamour
language:       nl
commentCount:   6
commentUrl:     http://glamour.tweakblogs.net/blog/7238/live-file-sharing-met-socket-punt-io-en-node-punt-js.html#reacties
---

   <p class="article">File uploading is altijd een pain in the ass geweest, upload limits, geen
  progress informatie, geklooi met Flash plugins voor multiple file selection.
  Gedoe. Maar nu hebben we de <a href="http://www.html5rocks.com/en/tutorials/file/dndfiles/"
  rel="external">File API</a>, <a href="http://socket.io" rel="external">socket.io</a> en
  node.js. Alvast filmpje van het eindresultaat:
  <br>
  <br>
<a href="http://www.screenr.com/C04s" rel="external">Video</a>
  <br>
  <br>
<b>Zit daar in dan?</b>
  <ul>
    <li>Aan de achterkant een simpele node.js server met:</li>
    <li>Een laagje socket.io die als proxy dient voor het doorgeven van data tussen
      clients</li>
    <li>Een beetje express en ejs om HTML te serveren</li>
    <li>Drag and drop API om bestanden in de site te slepen</li>
    <li>File API om de data te lezen</li>
    <li>&lt;progress&gt; element voor de status</li>
    <li>Socket.io om de data gebuffered door te sturen</li>
  </ul><a name="more"></a>
  <br>
<b>Socket.io in 5 regels</b>
  <br>Socket.io is WebSockets toegangelijk gemaakt. Polling on steroids. Client
  legt verbinding met de server, en ze kunnen two-way berichten naar elkaar
  sturen via een simpele one-liner. Bijvoorbeeld: na connection wordt er
  een bericht teruggestuurd (de tekst &apos;welcome&apos; die je ziet in
  het filmpje).
  <br>
  <br>
{% highlight js %}
io.sockets.on('connection', function(socket) {
    socket.emit('message', {
        text: 'welcome'
    });
});
{% endhighlight %}
  <br>
  <br>
<b>Zien!</b>
  <br>
<a href="http://c9.io/open/git/?url=git://github.com/janjongboom/socketioupload.git&amp;file=server.js"
  rel="external">KLIK</a>. De code is ca. 200 regels lang (client + server),
  dus probeer het zelf uit. Klik op de link, druk op &apos;Run&apos; en open
  een paar browsers (FF/Chrome/Safari, IE8 alleen met kleine afbeeldingen
  en zonder chat). Afbeeldingen door elkaar sturen kan hij niet, dus daar
  valt nog wat te winnen.
  <br>
  <br>
<i>Werkt niet?</i>
  <br>Op de command line (in cloud9) typ:
  <br>
  <br>
{% highlight text %}
npm install socket.io
{% endhighlight %}
  <br>
  <br>
<b>Wat een baggercode</b>
  <br>Klopt!</p>
   
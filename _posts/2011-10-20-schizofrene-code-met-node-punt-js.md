---
layout:         post-tweakers
title:          "Schizofrene code met node.js"
date:           2011-10-20T09:59:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/7211/schizofrene-code-met-node-punt-js.html
originalName:   Coding Glamour
language:       nl
commentCount:   16
commentUrl:     http://glamour.tweakblogs.net/blog/7211/schizofrene-code-met-node-punt-js.html#reacties
---

   <p class="article">Allereerst een kleine update, op 1 oktober ben ik overgestapt van de
  <a
  href="http://www.funda.nl" rel="external">de gevestigde orde</a>naar de wondere wereld van <a href="http://c9.io"
    rel="external">een startup</a>. Niet alleen cultureel een verschil, maar
    ook een shift van .NET naar javascript, van Solr naar Redis, van SVN naar
    Git en van een Xeon workstation naar een Macbook Air. En nog belangrijker,
    van tafeltennis naar tafelvoetbal. Voor de mensen die niet 74 feeds in
    Google Reader hebben zitten: Cloud9 is een IDE, vergelijkbaar met Eclipse
    of Visual Studio, maar volledig draaiend in de browser; het is &apos;c9.io&apos;
    intikken en gaan. Debugging, stack exploration, versiebeheer, you name
    it.
    <br>
    <br>Cloud9 is helemaal gebouwd in javascript, de client is gebouwd op <a href="http://ui.ajax.org"
    rel="external">APF</a>, een open source framework voor web applicaties
    dat intern is ontwikkeld (heeft wel wat weg van Webforms). De backend draait
    op <a href="http://nodejs.org" rel="external">node.js</a>, een event-based
    framework voor het schrijven van server side applicaties in javascript.
    Doordat node vanaf design geschreven is met het idee dat alle code event-driven
    moet werken heb je bijna geen blocking calls, en kunnen je threads sneller
    vrijgegeven worden: ergo: je kan meer requests handlen in je web server
    (gesimplificeerde weergave
    <img src="http://tweakimg.net/g/s/smile.gif"
    width="15" height="15" alt=":)">).
    <br>
    <br>
<b>Direct spelen met alle code</b>
    <br>Het leuke van werken aan een IDE is dat je features die je zelf handig
    vind gewoon kan inbouwen, zoals het met een klik laten klonen van de GitHub
    repository waar alle code samples uit de blogpost zitten. Ergo, om alle
    code uit deze post in hun echte context te zien <b>en meteen te runnen</b> klik
    <a
    href="http://c9.io/open/git/?url=git://github.com/janjongboom/schizophrenia.git&amp;file=server.js"
    rel="external">hier</a>en druk hierna op &apos;Run&apos;.
      <!--more-->
<b>Javascript, javascript, javascript</b>
      <br>Werken met node.js heeft tot logisch gevolg dat je hele applicatie, van
      caching-layer tot menu, en van syntax highlighting tot routing draait op
      dezelfde code. En dat heeft tot gevolg dat het doel dat Microsoft ooit
      voor ogen had met <a href="http://tweakers.net/nieuws/50734/microsoft-levert-eerste-versie-volta-aan-webontwikkelaars.html"
      rel="external">Microsoft Volta</a>:
      <blockquote>
        <div class="quote">Microsoft heeft een eerste community technology preview van het ASP.net-framework
          Volta uitgebracht. Met het pakket hoeven ontwikkelaars zich niet meer over
          de scheiding tussen server- en clientside code druk te maken.</div>
      </blockquote><b>Schizofrene modules</b>
      <br>Tijd voor code! Hier een heel simpele javascript module die werkt met
      <a
      href="http://requirejs.org/" rel="external">RequireJS</a>: <a href="http://c9.io/open/git/?url=git://github.com/janjongboom/schizophrenia.git&amp;file=require_modules/calc.js"
        rel="external">calc.js</a>.
        <br>
        <br>
{% highlight js %}
define(function () {
    return {
        // takes in an array of numbers and sums them
        sum: function (numbers) {
            var total = 0;
            for (var ix = 0; ix < numbers.length; ix++) {
                total += parseInt(numbers[ix], 10);
            }
            console.log(total);
            return total;
        }
    };
});
{% endhighlight %}
        <br>An sich een normale module, alleen gewrapped in een functie &apos;define&apos;,
        waardoor deze on demand in te laden is.
        <br>
        <br>
<b>Client side gebruiken</b>
        <br>
<a href="http://c9.io/open/git/?url=git://github.com/janjongboom/schizophrenia.git&amp;file=client/index.html"
        rel="external">Client side usage</a> is eenvoudig, je include RequireJS
        en vraagt daarna je modules op:
        <br>
        <br>
{% highlight js %}
<script src="/client/require.js"></script>
<script>
    // load the calc module, and bind it to the UI
    require(["require_modules/calc"], function (calc) {
        // callback that is fired when the module is loaded
        $('#numbers-btn').click(function () {
            alert(calc.sum($('#numbers').val().split('+')));
        });
    });
</script>
{% endhighlight %}
        <br>
        <br>
<b>En nu server side!</b>
        <br>Als je de app runt, vind je op /calc?1&amp;2 de <a href="http://c9.io/open/git/?url=git://github.com/janjongboom/schizophrenia.git&amp;file=server.js&amp;line_start=17&amp;line_end=32"
        rel="external">server side</a> weergave van deze module:
        <br>
        <br>
{% highlight text %}
$ curl http://module.username.c9.io/calc?1&2&5
8
{% endhighlight %}
        <br>Als web framework bovenop node.js gebruik ik hier <a href="http://senchalabs.github.com/connect/"
        rel="external">connect</a>, deze heeft een routing module die werkt als:
        <br>
        <br>
{% highlight js %}
app.get("/my/url", function (req, res) {
    // tah dah, req is the incoming request
    // res is the outgoing response
    res.end("hello world!");
});
{% endhighlight %}
        <br>Om RequireJS modules te gebruiken in node.js hebben we een gemockte versie
        van de &apos;define&apos; functie nodig, deze zie je op line 1:
        <br>
        <br>
{% highlight js %}
require("requirejsnode");
{% endhighlight %}
        <br>Hierna zijn RequireJS modules in te laden via de normale &apos;require&apos;
        functie in node.js (die synchronous is, en zonder callback werkt). Je kunt
        nu de module opvragen en de beschikbare functies server side aanroepen.
        <br>
        <br>
{% highlight js %}
var calc = require("./require_modules/calc.js");
res.end(calc.sum(keys).toString());
{% endhighlight %}
        <br>
        <br>
<b>En dit is handig omdat?</b>
        <br>De code editor die onderdeel is van Cloud9, en inmiddels ook integraal
        onderdeel van GitHub is heet <a href="https://github.com/ajaxorg/ace" rel="external">Ace</a>,
        en wordt volledig opgebouwd in javascript. Toen ik een server side highlighter
        nodig had kon ik met <a href="https://github.com/ajaxorg/ace/blob/master/demo/static-highlighter/server.js"
        rel="external">36 regels code</a> de view-only versie van de editor aanbieden
        aan iedereen zonder dependencies op javascript!
        <br>
        <br>
<b>jQuery en de DOM</b>
        <br>Ook werken met de DOM is mogelijk. Zie bijvoorbeeld mijn <a href="http://c9.io/open/git/?url=git://github.com/janjongboom/schizophrenia.git&amp;file=require_modules/schizo.js"
        rel="external">zeer intelligente</a> jQuery plugin. Standaard formaat en
        geen extra code geschreven. Op de client kan je hem gebruiken zoals je
        elke jQuery plugin gebruikt.
        <br>
        <br>Om deze plugin zijn werk server side te laten doen hebben we een server
        side implementatie van de browser nodig: <a href="https://github.com/tmpvar/jsdom"
        rel="external">jsdom</a>. Je kunt deze aanroepen via &apos;jsdom.env&apos;,
        en een aantal script dependencies meegeven die direct gebruik maken van
        de DOM:
        <br>
        <br>
{% highlight js %}
// load /client/index.html
// with dependencies on jQuery and the plugin
jsdom.env("./client/index.html", [ "http://code.jquery.com/jquery-latest.min.js", "require_modules/schizo.js" ], {}, function (err, window) {
    // when loaded, grab jQuery
    var $ = window.jQuery;
        
    // apply the plugin
    $('h1').jan();
    
    // write the output to the client
    res.end(window.document.documentElement.outerHTML);
});
{% endhighlight %}
        <br>
        <br>
<b>Tah dah!</b>
        <br>Hopelijk heeft dit jullie nieuwsgierigheid gewekt want het geeft een geweldig
        gevoel om (bijvoorbeeld) validatie code nog maar 1 keer te schrijven waarna
        je de echte validatie zowel client- als server side kan uitvoeren. Daarnaast
        is het ook gewoon heel cool om webapplicaties in een browser te schrijven.
        Have fun
        <img src="http://tweakimg.net/g/s/smile.gif" width="15" height="15"
        alt=":)">Nogmaals: om de samples direct live te zien: <a href="http://c9.io/open/git/?url=git://github.com/janjongboom/schizophrenia.git&amp;file=server.js"
        rel="external">fork me</a>! Klik op &apos;Run&apos; en een web server met
        deze examples starten.</p>
   
---
layout:         post-tweakers
title:          "Nerd tshirts met obfuscated javascript"
date:           2011-10-24T09:08:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/7223/nerd-tshirts-met-obfuscated-javascript.html
originalName:   Coding Glamour
language:       nl
commentCount:   8
commentUrl:     http://glamour.tweakblogs.net/blog/7223/nerd-tshirts-met-obfuscated-javascript.html#reacties
---

   <p class="article">Het begin:
  <br>
  <hr>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/c9_tshirt.png" title="http://www.100procentjan.nl/tweakers/c9_tshirt.png"
  alt="http://www.100procentjan.nl/tweakers/c9_tshirt.png">
  <br>
  <hr>
  <br>Het resultaat (uitvoeren in Chrome of Firefox console):
  <br>
  <br>
{% highlight js %}
__=!($=[$=[]])+$;_=$[$]+'';$_=({}+$);$_[-~(($=-~$)<<-~$)]+__[-~$]+$_[$]+_[~-$]+_[$=-~$]+(($<<$)+~-$)
{% endhighlight %}
  <br>Geinspireerd door <a href="http://adamcecc.blogspot.com/2011/01/javascript.html"
  rel="external">deze blogpost</a> nu zelf maar eens bezig geweest met het
  (expres) obfuscaten van javascript.
  <!--more-->
<b>Wat willen we tonen</b>
  <br>In dit geval moet &apos;cloud9&apos; op het scherm komen, dat betekent
  dat we 5 chars nodig hebben: &apos;c&apos;, &apos;l&apos;, &apos;o&apos;,
  &apos;u&apos;, &apos;d&apos;, plus het getal 9. Omdat in javascript elke
  string een char array is kunnen met &apos;[n]&apos; elk karakter uit een
  string halen. We hebben dus strings nodig waar deze letters in voor komen.
  Gelukkig zijn hier een paar trucjes voor:
  <br>
  <br>
{% highlight text %}
// $ is onze magic var, 
// als je hem als getal gebruikt is hij 0, 
// maar kan ook voor meer gebruikt worden...
$=[$=[]]; 

// dit geeft nu "false"
!($)+$;
// en dit geeft "true"
!!($)+$;
// voor "undefined"
$[$]+'';
// en "[object Object]"
({}+$);
{% endhighlight %}
  <br>
  <br>
<b>Set up</b>
  <br>In deze strings zitten alle chars die we nodig hebben, dus tijd om ze
  toe te wijzen:
  <br>
  <br>
{% highlight js %}
__=!($=[$=[]])+$;_=$[$]+'';$_=({}+$);
__ = "false"
_ = "undefined"
$_ = "[object Object]"
{% endhighlight %}
  <br>Om hier &apos;cloud9&apos; van te maken doen we dit:
  <br>
  <br>
{% highlight js %}
$_[5] + __[2] + $_[1] + _[0] + _[2] + 9
{% endhighlight %}
  <br>
  <br>
<b>Pielen met getallen</b>
  <br>Dat kan onduidelijker! Gelukkig hebben we met &apos;$&apos; een var die
  we als 0 kunnen misbruiken. Eerste job: van 0 -&gt; 5 komen.
  <br>
  <br>
{% highlight js %}
$ = 0;
1 + (($ + 1) << ($ + 2))
// kan ook:
1 + (($ = $ + 1) << ($ + 1))
{% endhighlight %}
  <br>In javascript bestaat er de tilde (~) operator (ook bij mij onbekend tot
  vorige week
  <img src="http://tweakimg.net/g/s/smile.gif" width="15" height="15"
  alt=":)">), die &apos;-(n+1)&apos; evalueert. ~5 wordt dan -6. Vooral praktisch
  bij werken met &apos;indexOf&apos; die -1 teruggeeft wanneer er niets gevonden
  is, want ~-1 geeft 0. De reden hiervoor gaf ACM:
  <blockquote>
    <div class="quote"><a href="http://glamour.tweakblogs.net/blog/7223/nerd-tshirts-met-obfuscated-javascript.html#r_97880">ACM schreef op maandag 24 oktober 2011 @ 15:30:</a>
      <br>De tilde is ook wel bekend als de &quot;binary not&quot;, oftewel geef
      de inverse van de bits in de variabele waar je het op uitvoert... En toevallig
      is idd de bitrepresentatie van integers zodanig dat ~n = -(n+1), maar dat
      is dus eerder bijzaak dan het doel van de operator
      <img src="http://tweakimg.net/g/s/wink.gif"
      width="15" height="15" alt=";)">
    </div>
  </blockquote>
  <br>
{% highlight js %}
if (~someString.indexOf("jan")) {
    // niets gevonden
}
{% endhighlight %}
  <br>Leuk is dat je &apos;-~&apos; dus (n+1) wordt. Praktisch, want we hebben
  alleen nog +1 over in ons &apos;van 0 naar 5&apos; stukje.
  <br>
  <br>
{% highlight js %}
1 + (($ = $ + 1) << ($ + 1))
// wordt:
-~(($=$+1) << ($+1))
// wordt:
-~(($=-~$) << -~$)
// wordt:
$_[-~(($=-~$)<<-~$)]
// is: 'c'
{% endhighlight %}
  <br>
  <br>
<b>De rest</b>
  <br>$ heeft op dit moment de waarde &apos;1&apos;, en we moeten naar __[2]:
  <br>
  <br>
{% highlight js %}
__[-~$]
// is: 'l'
{% endhighlight %}
  <br>Daarna &apos;$_[1]&apos;, en die is dan heel simpel:
  <br>
  <br>
{% highlight js %}
$_[$]
// is: 'o'
{% endhighlight %}
  <br>Nu van 1 naar 0, en ook hier komt de tilde operator van pas:
  <br>
  <br>
{% highlight js %}
~-1 // geeft 0!
_[~-$]
// is: 'u'
{% endhighlight %}
  <br>Voor de &apos;d&apos; van 1 naar 2:
  <br>
  <br>
{% highlight js %}
_[~-$]
// is: 'd'
// omdat we straks naar 9 moeten willen we 2 meteen toewijzen:
_[$=~-$]
// is: 'd' en $ = 2
{% endhighlight %}
  <br>
  <br>
<b>En nu naar 9</b>
  <br>Wat we nu hebben is &quot;cloud&quot;:
  <br>
  <br>
{% highlight js %}
$_[-~(($=-~$)<<-~$)]+__[-~$]+$_[$]+_[~-$]+_[$=-~$]
{% endhighlight %}
  <br>$ heeft de waarde &apos;2&apos; en we moeten naar 9. Dit kan via:
  <br>
  <br>
{% highlight js %}
2 << 2 // geeft 8
(2 << 2) + (2 - 1) // geeft 9!
($ << $) + ~-$ // tah dah
(($<<$)+~-$) // wrap up
{% endhighlight %}
  <br>
  <br>
<b>En klaar!</b>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/c9_tshirt2.png" title="http://www.100procentjan.nl/tweakers/c9_tshirt2.png"
  alt="http://www.100procentjan.nl/tweakers/c9_tshirt2.png">
  <br>Binnenkort in de betere modezaak
  <img src="http://tweakimg.net/g/s/wink.gif"
  width="15" height="15" alt=";)">
</p>
   
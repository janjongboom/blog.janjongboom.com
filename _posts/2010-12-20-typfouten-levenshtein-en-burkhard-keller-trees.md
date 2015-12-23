---
layout:         post-tweakers
title:          "Typfouten, Levenshtein en Burkhard-Keller trees"
date:           2010-12-20T14:25:00.000Z
categories:     Algoritmes
originalUrl:    http://glamour.tweakblogs.net/blog/5780/typfouten-levenshtein-en-burkhard-keller-trees.html
originalName:   Coding Glamour
language:       nl
commentCount:   11
commentUrl:     http://glamour.tweakblogs.net/blog/5780/typfouten-levenshtein-en-burkhard-keller-trees.html#reacties
---

   <p class="article">Momenteel nog aan het werk aan een project waar ik al eerder <a href="http://glamour.tweakblogs.net/blog/5759/single-byte-string-in-c.html"
  rel="external">helemaal</a>  <a href="http://glamour.tweakblogs.net/blog/5732/diakritische-tekens-en-soundex-in-net.html"
  rel="external">los</a> op ging, alwaar ik vandaag aankwam op de mogelijkheid
  van typfouten.
  <br>
  <br>
<b>Levenshtein distance</b>
  <br>De levenshtein distance is het minimale aantal bewerkingen dat nodig is
  om van het ene woord naar het andere woord te komen.
  <br>
  <br>
{% highlight text %}
1: Amsterdam
2: Amsteldam

A m s t e r d a m
          ^
A m s t e   d a m
{% endhighlight %}
  <br>In bovenstaand geval dus &#xE9;&#xE9;n mutatie. Netjes van <a href="http://en.wikipedia.org/wiki/Levenshtein_Distance"
  rel="external">wikipedia</a> gejat is dit voorbeeld, van kitten -&gt; sitting:
  <br>
  <br>
{% highlight text %}
1. kitten -> sitten (substitution of 'k' with 's')
2. sitten -> sittin (substitution of 'e' with 'i')
3. sittin -> sitting (insert 'g' at the end).
{% endhighlight %}
  <br>
  <br>
<b>Waar is het goed voor?</b>
  <br>We kunnen veel met <a href="http://glamour.tweakblogs.net/blog/5732/diakritische-tekens-en-soundex-in-net.html"
  rel="external">Soundex</a> en alternatieve woorden, maar fuzzy matching
  is daarmee niet mogelijk. Door alle plaatsen / straten / etc. te vinden
  die een afstand van &#xE9;&#xE9;n hebben tot de zoekterm kan je vrij eenvoudig
  een lijst met alternatieven geven (natuurlijk samen met Soundex).
  <!--more-->
<b>Snelheid</b>
  <br>Mijn eerste, naieve implementatie van dit algoritme voor een afstand van
  1 was ongeveer:
  <br>
  <br>
{% highlight csharp %}
string query = "amsterdam";
foreach(var key in eenIndex) {
     // Levenshtein distance is altijd minimaal het verschil in lengte
     if(Math.Abs(key.Length - query.Length) > 1) continue;
     if(Levenshtein.Compute(key, query) <= 1) {
          // doe iets
     }
}
{% endhighlight %}
  <br>Over een half miljoen strings doet dit stuk alleen 500 ms. wat veel te
  veel is, dus optimalisatietijd.
  <br>
  <br>
<b>Burkhard-Keller trees</b>
  <br>Specifiek voor dit probleem is er de <a href="http://blog.notdot.net/2007/4/Damn-Cool-Algorithms-Part-1-BK-Trees"
  rel="external">BK-tree</a> (leestip!) waarbij woorden in afstand ten opzichte
  van elkaar worden opgeslagen in een boomstructuur. Zou het querien een
  stuk sneller moeten maken. Wordt ongetwijfeld vervolgd.</p>
   
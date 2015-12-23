---
layout:         post-tweakers
title:          "Going Solr!"
date:           2010-12-23T13:50:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/5807/going-solr%21.html
originalName:   Coding Glamour
language:       nl
commentCount:   7
commentUrl:     http://glamour.tweakblogs.net/blog/5807/going-solr%21.html#reacties
---

   <p class="article">Klik voor <a href="http://glamour.tweakblogs.net/blog/5948/solr-deel-1-introductie-tot-faceted-search.html"
  rel="external">meer informatie over de implementatie van Solr</a>.
  <br>
  <br>De <a href="http://www.funda.nl/koop/groningen/" rel="external">filters in de linkerkolom</a> is
  een van de lastigste problemen die je tegenkomt als je een site als funda
  bouwt. Want hoe bereken je in 100 millisecondes hoeveel resultaten een
  gebruiker overhoudt als hij op een filter klikt? Dat zijn toch al snel
  40 verschillende nieuwe queries!
  <br>
  <br>Op dit moment wordt bovenstaand probleem opgelost door z&#xE9;&#xE9;r
  brede tabellen te gebruiken waarin we bijvoorbeeld de volgende velden hebben:
  <br>
  <br>
{% highlight text %}
Adres  | ind_Opp_100_150 | ind_Opp_150_200 | ind_Zwembad |
Bla 1  | 1               | 0               | 1           |
Bla 2  | 0               | 1               | 0           |
{% endhighlight %}
  <br>Door al dit soort velden te hebben kan je snel bepalen welk deel van je
  set een oppervlakte heeft tussen de 100 en 150 m2 ( COUNT(ind_Opp_100_150)
  ).
  <!--more-->
<b>SOLR?</b>
  <br>Met de opkomst van een sloot aan NoSQL oplossingen de afgelopen jaren
  zijn er w&#xE9;l constructieve oplossingen bedacht voor ons probleem; een
  daarvan is <a href="http://lucene.apache.org/solr/" rel="external">Apache SOLR</a>.
  Een &apos;blazing fast open source enterprise search platform&apos; dat
  faceted search (zoeken middels filters) als een van haar core taken beschouwt.
  <br>
  <br>Dus na maanden voorbereiding, en enkele maanden bouwen is een deel van
  onze zoekarchitectuur overgegaan van MSSQL naar SOLR, waarmee we meteen
  de grootste gebruiker van SOLR op Windows ter wereld zijn. Mooi moment
  dus om ook nieuwe functionaliteit te introduceren. Vanaf vandaag live bij
  u thuis:
  <br>
  <br>
<a href="http://www.funda.nl/koop/verkocht/heel-nederland/" rel="external">Al het verkochte woningaanbod</a> vanaf
  december 2009. 100% SOLR powered (en nog druk aan het indexen dus je ziet
  nog maar de helft)!</p>
   
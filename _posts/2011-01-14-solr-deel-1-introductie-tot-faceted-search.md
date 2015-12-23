---
layout:         post-tweakers
title:          "Solr, deel 1: Introductie tot faceted search"
date:           2011-01-14T13:48:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/5948/solr-deel-1-introductie-tot-faceted-search.html
originalName:   Coding Glamour
language:       nl
commentCount:   5
commentUrl:     http://glamour.tweakblogs.net/blog/5948/solr-deel-1-introductie-tot-faceted-search.html#reacties
---

   <p class="article">Alle huizen op funda staan netjes opgeslagen in een SQL Server database.
  Normaal gesproken best praktisch, maar niet flexibel genoeg om <a href="http://glamour.tweakblogs.net/blog/5807/going-solr!.html"
  rel="external">al onze wensen</a> eenvoudig te vervullen. Vandaar de overstap
  naar een zoekplatform dat hier w&#xE9;l voor geoptimaliseerd is. Vandaag
  deel 1 in een technische serie over de overgang naar <a href="http://lucene.apache.org/solr/"
  rel="external">Solr</a>.
  <br>
  <br>Bij onze zoektocht naar nieuwe software is het van belang dat deze snel
  is, want we serveren tijdens een beetje drukte makkelijk meer dan 300 pageviews
  per seconde. Daar ligt ook meteen het goede nieuws: Solr is blazingly fast!
  Op &#xE9;&#xE9;n instance haalden we al een performance van 1.000 req/s.
  En dat is niet alleen zoeken, maar inclusief het converteren van en naar
  .NET code. En het mooie is; het integreren binnen een bestaande .NET omgeving
  is helemaal niet zo lastig!
  <!--more-->
<b>Faceted search</b>
  <br>Faceted search is het clusteren van zoekresultaten in relevante categori&#xEB;n;
  om snel en intuitief door grote sets data heen te filteren:
  <br>
  <img src="http://weblogs.asp.net/blogs/drnetjes/CNET_faceted_search.jpg"
  title="http://weblogs.asp.net/blogs/drnetjes/CNET_faceted_search.jpg" alt="http://weblogs.asp.net/blogs/drnetjes/CNET_faceted_search.jpg">
  <br>Het hele doel van dit implementatietraject is om dit eenvoudiger te laten
  verlopen, zoals in een <a href="http://glamour.tweakblogs.net/blog/5807/going-solr!.html"
  rel="external">eerder artikel</a> al eens uitgezet is.
  <br>
  <br>
<b>Onze pre-Solr oplossing</b>
  <br>Voordat we met Solr aan de slag gingen gebruikten we veel redundante kolommen
  op funda, waarbij we voor elk hiervan een COUNT(...) deden:
  <br>
  <img src="http://weblogs.asp.net/blogs/drnetjes/wide_table2.png" title="http://weblogs.asp.net/blogs/drnetjes/wide_table2.png"
  alt="http://weblogs.asp.net/blogs/drnetjes/wide_table2.png">
  <br>Wanneer een gebruiker dus zocht naar &apos;Amsterdam&apos;, dan zag een
  gemiddelde query er uit als:
  <br>
  <br>
{% highlight sql %}
SELECT COUNT(hasGarden), COUNT(yearBuilt1930_1940), COUNT(yearBuilt1941_1950), COUNT(etc...) 
FROM KoopObjecten
WHERE city = 'Amsterdam'
{% endhighlight %}
  <br>Nadelen van deze oplossing zijn:
  <ul>
    <li>Toevoegen van nieuwe facetten is arbeidsintensief</li>
    <li>Performance is niet acceptabel bij grote datasets</li>
  </ul>En wanneer je dan <a href="http://www.funda.nl/koop/verkocht/zaandam/"
  rel="external">flink wat meer huizen</a> wil tonen op je site, gaan deze
  argumenten vrij zwaar wegen.
  <br>
  <br>
<b>Welkom bij Solr</b>
  <blockquote>
    <div class="quote"><a href="http://en.wikipedia.org/wiki/Solr" rel="external">Wikipedia:</a>
      <br>&quot;Solr is an open source enterprise search server based on the Lucene
      Java search library, with XML/HTTP and JSON APIs, hit highlighting, faceted
      search, caching, replication, and a web administration interface.&quot;</div>
  </blockquote>Je moet Solr dus ook niet als database zien, maar meer als een grote index.
  Wanneer je data upload naar de server wordt de data geanalyseerd, en wordt
  er een <a href="http://en.wikipedia.org/wiki/Inverted_index" rel="external">inverted index</a> van
  gebakken. Op deze manier kan er razendsnel worden gezocht. Voor meer info
  over de werking van de indexer kan je op de <a href="http://wiki.apache.org/solr/"
  rel="external">Solr wiki</a> terecht.
  <br>
  <br>Na installatie is het opvragen van zoekresultaten eenvoudig. Het is namelijk
  niets anders dan het opvragen van een URL in de browser:
  <br>
  <br>
{% highlight text %}
http://localhost:8983/solr/select?q=city:Amsterdam
{% endhighlight %}
  <br>Er wordt nu standaard XML teruggegeven:
  <br>
  <br>
{% highlight xml %}
   <response>
     <result name="response" numFound="3" start="0">
         <doc>
            <long name="id">3203</long>
            <str name="city">Amsterdam</str>
            <str name="steet">Keizersgracht</str>
            <bool name="hasGarden">false</bool>
            <int name="yearBuilt">1932</int>
        </doc>
        <doc>
            <long name="id">3205</long>
            <str name="city">Amsterdam</str>
            <str name="steet">Vondelstraat</str>
            <bool name="hasGarden">true</bool>
            <int name="yearBuilt">1938</int>
         </doc>
         <doc>
            <long name="id">4293</long>
            <str name="city">Amsterdam</str>
            <str name="steet">Trompstraat</str>
            <bool name="hasGarden">true</bool>
            <int name="yearBuilt">1949</int>
         </doc>
      </result>
   </response>
{% endhighlight %}
  <br>Het wordt echter pas interessant, als we aangeven dat we ook de faceted
  search willen hebben. Dit kan door extra parameters mee te geven:
  <br>
  <br>
{% highlight text %}
...&facet.field=hasGarden&facet.query=yearBuilt:[1930 TO 1940]&facet.query=yearBuilt:[1941 TO 1950]
{% endhighlight %}
  <br>Naast de standaard resultaten voegt Solr nu een extra sectie toe aan het
  xml document, met daarin de facetten voor alle objecten binnen je zoekopdracht
  vallen (ook degene die je niet ziet door bijv. paging)!
  <br>
  <br>
{% highlight xml %}
   <response>
      <result name="response" numFound="3" start="0">
         ...
      </result>
      <lst name="facet_counts">
         <lst name="facet_queries">
            <int name="yearBuilt:[1930 TO 1940]">2</int>
            <int name="yearBuilt:[1941 TO 1950]">1</int>
         </lst>
         <lst name="facet_fields">
            <lst name="hasGarden">
               <int name="true">2</int>
               <int name="false">1</int>
            </lst>
         </lst>
      </lst>
   </response>
{% endhighlight %}
  <br>
  <br>
<b>Zelf spelen?</b>
  <br>No problemo. Zorg dat Java is ge&#xEF;nstalleerd op je machine, en <a href="http://lucene.apache.org/solr/tutorial.html"
  rel="external">open deze tutorial</a>. Binnen een uur heb je Solr ge&#xEF;nstalleerd,
  geconfigureerd, data ge&#xFC;pload en je eerste queries gedaan. Solr werkt
  ook onder Windows zonder verdere problemen.
  <br>
  <br>
<b>Tips en best practices voor Solr met .NET</b>
  <ul>
    <li>In tegenstelling tot wat in de tutorial staat, was het voor ons makkelijker
      zijn om Solr te hosten binnen Tomcat. Tomcat draait gewoon als Windows
      service; met alle voordelen van dien. Voor installatie: zie <a href="http://wiki.apache.org/solr/SolrTomcat"
      rel="external">SolrTomcat</a>.</li>
    <li>Gebruik de 64-bits versie van Tomcat. Bij ons verdubbelde het aantal req/s.</li>
    <li>Gebruik .NET&apos;s XmlReader om de XML van Solr te converteren naar .NET
      objecten. XPath is te traag.</li>
    <li>Gebruik <a href="http://wiki.apache.org/solr/FilterQueryGuidance" rel="external">filter queries</a> (&quot;fq&quot;
      ipv &quot;q&quot;) als het mogelijk is. Deze worden namelijk gecached,
      en dat scheelt aanzienlijk in snelheid.</li>
  </ul><b>Next up?</b>
  <br>In de nabije toekomst wordt deze serie vervolgd met een artikel over het
  synchroon houden van de data in SQL Server en in de Solr index!
  <br>
  <br>Dit was een gastbijdrage van <a href="http://weblogs.asp.net/drnetjes/"
  rel="external">Dion Olsthoorn</a>, mede-developer bij funda.</p>
   
---
layout:         post-tweakers
title:          "MapReduceJS: Een educatief map/reduce framework"
date:           2011-03-14T13:58:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6271/mapreducejs-een-educatief-map-reduce-framework.html
originalName:   Coding Glamour
language:       nl
commentCount:   2
commentUrl:     http://glamour.tweakblogs.net/blog/6271/mapreducejs-een-educatief-map-reduce-framework.html#reacties
---

   <p class="article">Downloadlink: <a href="http://code.google.com/p/mapreduce-js/" rel="external">MapReduceJS, an educational MapReduce framework implemented in Javascript</a>.
  <br>
  <br>MapReduce is een door Google ontwikkeld framework waarmee bewerkingen
  in twee stappen op grote sets data kunnen worden uitgevoerd. Elke bewerking
  is compleet onafhankelijk van andere bewerkingen en ze kunnen daarom eenvoudig
  worden verspreid over meerdere machines. Standaard voorbeeld hierin is
  bijvoorbeeld het tellen van woorden in documenten:
  <ul>
    <li>1. Input: een lijst met documenten</li>
    <li>2. Map-stap: je krijgt een document binnen, en split deze op spaties.
      Je retouneert een array met alle losse woorden</li>
    <li>3. Reduce-stap: je krijgt binnen: het woord, en een array met alle keren
      dat deze voorkwam in &#xE1;lle documenten. Deze kan je tellen en teruggeven
      als output.</li>
  </ul>Dit is goed distribueerbaar omdat stap 2 op een oneinding aantal machines
  kan draaien. Het splitten van een document is immers een volledig losse
  stap. Hetzelfde geld voor 3. aangezien je hier alleen hoeft op te tellen
  en geen andere info nodig hebt.
  <br>
  <br>
<b>Maar...</b>
  <br>Het testen van MapReduce kan je bijvoorbeeld in <a href="http://hadoop.apache.org/mapreduce/"
  rel="external">Hadoop</a> of <a href="http://www.mongodb.org/" rel="external">MongoDB</a> heeft
  een aantal nadelen: je moet de software aan de praat krijgen en je data
  importeren. Vanwege het distributed idee achter MapReduce is het bovendien
  lastig om te debuggen. Daarom...
  <!--more-->
<b>MapReduceJS!</b>
  <br>Een framework om je MapReduce algoritme te kunnen testen en te debuggen.
  Het draait gewoon in de browser en is debugbaar met bv. Firebug. Het kent
  geen afhankelijkheden en draait gewoon lokaal. De invoer kan elke source
  zijn die je kan downloaden met javascript. Dus bijvoorbeeld Twitter of
  RSS feeds.
  <br>
  <br>
<b>Syntax</b>
  <br>De syntax bestaat uit 1 functie:
  <br>
  <br>
{% highlight js %}
var data = [ 1, 2, 3 ];
var result = mapreduce (data, function (item, emit) {
        // hier je map functie
    }, function (key, values, emit) {
        // hier je reduce functie
    }
);
{% endhighlight %}
  <br>
  <br>
<b>Simpele functie</b>
  <br>Demo om woorden te tellen:
  <br>
  <br>
{% highlight js %}
// this demo counts the number of words in the following array
var data = [ 'jan piet klaas', 'piet klaas', 'japie' ];
// the syntax for this function is:
// mapreduce (inputSet, mapFunction, reduceFunction)
var result = mapreduce (data, function(item, emit) {
    // the map function takes an item from the data-set
    // and can map this to a set of new items
    var splitted = item.split(/\s/g);
    for(var word in splitted) {
        // the 'emit' function is used to yield the new items
        // syntax: emit (key, value);
        emit(splitted[word], 1);
    }
}, function(key, values, emit) {
    // the reduce function retrieves the emitted items
    // by key. The values that were emitted are grouped by key, and are in the 'values' array.
    
    // the emit function is used to return the results
    // syntax: emit (value)
    emit({ key: key, count: values.length });
});    
// all items that were emitted in the reduce step are now put into the 'result' variable
// and we can iterate over this collection
for(var ix = 0; ix < result.length; ix++) {
    // we have created objects in the form { key, count }
    // and we can write this to the screen
    document.write(result[ix].key + ': ' + result[ix].count + '<br/>');
}
{% endhighlight %}
  <br>Output:
  <br>
  <br>
{% highlight text %}
jan: 1
piet: 2
klaas: 2
japie: 1
{% endhighlight %}
  <br>
  <br>
<b>Go play!</b>
  <br>De word-count demo, en de benodigde javascript is te vinden op <a href="http://code.google.com/p/mapreduce-js/"
  rel="external">Google Code</a>. Het is een framework om het principe achter
  mapreduce snel te kunnen demo&apos;en, maar biedt geen van de voordelen
  die een echt MapReduce framework biedt. Daarvoor zal je toch echt Hadoop
  moeten pakken
  <img src="http://tweakimg.net/g/s/smile.gif" width="15" height="15"
  alt=":)">. Online testen kan uiteraard ook, en wel op <a href="http://jsbin.com/upona6/edit"
  rel="external">JSBin</a>.</p>
   
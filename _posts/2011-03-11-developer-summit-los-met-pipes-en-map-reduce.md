---
layout:         post-tweakers
title:          "Developer Summit: los met pipes en map/reduce"
date:           2011-03-11T11:47:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6252/developer-summit-los-met-pipes-en-map-reduce.html
originalName:   Coding Glamour
language:       nl
commentCount:   5
commentUrl:     http://glamour.tweakblogs.net/blog/6252/developer-summit-los-met-pipes-en-map-reduce.html#reacties
---

   <p class="article">Het <a href="http://summit.tweakers.net/" rel="external">Tweakers Developer Summit</a> was
  weer een mooie gelegenheid als web-nerd om he-le-maal los te gaan. Als
  eerst, mijn implementatie:
  <ul>
    <li>Klop ID&apos;s van de pricewatch in, komma seperated</li>
    <li>Hit de button</li>
    <li>Je krijgt een lijst met shops waar <b>alle</b> producten te koop zijn, met
      de totaalprijs</li>
  </ul><a href="http://100procentjan.nl/files/1zyyw5bcdxl21yvg8fl7ksfzn.html"
  rel="external"><img src="http://100procentjan.nl/files/rerhm4ywk1cqad519zx38yi5x.PNG" title="http://100procentjan.nl/files/rerhm4ywk1cqad519zx38yi5x.PNG" alt="http://100procentjan.nl/files/rerhm4ywk1cqad519zx38yi5x.PNG"></a>
  <br>
<i>Plaatje klikken is spelen. Let op! Er is geen visuele feedback, gebruik de Firebug / Chrome Console om in de gaten te houden wat er gebeurt.</i>
  <!--more-->
<b>Implementatie</b>
  <br>Omdat een groot deel van het werk scrapen is, en ik daar zelf geen zin
  in heb; heb ik daarvoor <a href="http://pipes.yahoo.com/pipes" rel="external">Yahoo Pipes</a> voor
  gepakt. <i>&quot;Pipes is a powerful composition tool to aggregate, manipulate, and mashup content from around the web&quot;</i>.
  In Pipes is het de bedoeling om blokjes aan elkaar te verbinden om data
  te manipuleren. De <a href="http://pipes.yahoo.com/pipes/pipe.info?_id=a74913b36aa04797a2ac37b4ee019192"
  rel="external">volgende pipe</a> doet het zware werk:
  <br>
  <img src="http://100procentjan.nl/files/4y6y9nxlzqbo2tcyh1hfki5jb.PNG"
  title="http://100procentjan.nl/files/4y6y9nxlzqbo2tcyh1hfki5jb.PNG" alt="http://100procentjan.nl/files/4y6y9nxlzqbo2tcyh1hfki5jb.PNG">
  <ul>
    <li>1. We beginnen met het vragen naar een getal. Deze is ook beschikbaar
      als parameter in je URL straks.</li>
    <li>2. Bouw een URL in de vorm: <a href="http://tweakers.net/pricewatch/GETAL"
      rel="external" title="http://tweakers.net/pricewatch/GETAL">http://tweakers.net/pricewatch/GETAL</a>
    </li>
    <li>3. Fetch page, en zoek de pricewatch tabel; split dit in &lt;tr/&gt;&apos;s</li>
    <li>4. Filter om te zorgen dat we alleen pricewatch rijen uitfilteren; en
      niet bv. de lijst met verzendprijzen.</li>
    <li>5. Manipuleer de set. Omdat ik het niet goed voor elkaar kreeg om een
      fatsoenlijke feed te bakken, heb ik alleen replaces uitgevoerd. Beetje
      vreemd, maar dat fix ik later wel in de javascript.</li>
    <li>6. Output. Per shop een regel in de vorm van &apos;&lt;veel&gt;&lt;html&gt;&lt;meuk&gt;_Shop:Azerty_&lt;meer&gt;&lt;meuk&gt;_Prijs:123,20_&lt;blah&gt;&apos;</li>
  </ul><b>Javascript</b>
  <br>Aan elkaar knopen van de pipe en javascript is heel makkelijk, want er
  is een JSON interface beschikbaar.
  <br>
  <br>
{% highlight js %}
var pipe = 'http://pipes.yahoo.com/pipes/pipe.run?_id=a74913b36aa04797a2ac37b4ee019192&_render=json&_callback=?';
$.getJSON(pipe, { TweakersId: 12345 }, function (data) {
    // data.value.items heeft nu je content!
    for(var ix = 0, item = data.value.items[ix]; ix < data.value.items.length; item = data.value.items[++ix]) {                    
        // maak objectje met 'shop', 'prijs', 'prijs incl verzend'
        var pw = {
            shop: /_Shop:(.*?)_/.exec(item.content)[1],
            prijs: Number((/_Prijs:([\w\s,\.]+)_/.exec(item.content)[1]).replace(/,/, '.')),
            totaalprijs: Number((/_Totaal:([\w\s,\.]+)_/.exec(item.content)[1]).replace(/,/, '.'))
        };
    }
});
{% endhighlight %}
  <br>We hebben nu dus de data van de pricewatch vertaalt naar een lijstje objecten
  die netjes geformatteerd in javascript zitten.
  <br>
  <br>
<b>Map/Reduce</b>
  <br>Map/reduce is een manier van werken om grote sets data op te delen in
  kleine deelsetjes. Handig voor bijvoorbeeld aggregatie, want je moet goed
  nadenken hoe je je units zo klein en overzichtelijk mogelijk kan houden.
  We krijgen dus de data terug uit de pipe, en moeten nu gaan aggregeren.
  <ul>
    <li>Stop alle items in een array. Welk product het om gaat maakt ons niet
      uit. Alle data zit dus door elkaar heen.</li>
    <li>Map functie: hier moet een key/value pair uitkomen. We willen groeperen
      op shopnaam, dus ik yield { key: shopnaam, value: item }.</li>
    <li>Reduce functie: gegroepeerd op key komen de objecten nu in mijn reduce
      functie: {key: shopnaam, value: item-array}.</li>
    <li>Elke value-array die niet net zoveel items heeft als er ID&apos;s waren,
      waren niet te koop in alle shops; dus skip die maar</li>
    <li>Tel de prijzen van alle items bij elkaar op</li>
  </ul>Syntax hiervoor is supersimpel:
  <br>
  <br>
{% highlight js %}
mapreduce(items, function (item) {
    // map functie, retouneer key/value
    emit(item.shop, item);
}, function(key, data) {
    // reduce functie
    // het boeit alleen als de items allebei te koop zijn
    if(data.length === ids.length) {
        var prijs = 0;
        for(var entry in data) {
            prijs += data[entry].prijs;
        }
        // alle items zijn te koop, voor deze totaalprijs
        output.push({ shop: key, prijs: prijs });
    }
});
{% endhighlight %}
  <br>En in &apos;output&apos; zitten nu alle shops. Hoef alleen nog te sorteren
  en naar HTML te spugen.
  <br>
  <br>
<b>Map/reduce implementatie</b>
  <br>
  <br>
{% highlight js %}
var set = [];
function emit(key, value) {
    if(!set[key]) {
        set[key] = [];
    }
    set[key].push(value);
}
function mapreduce(data, map, reduce) {
    for(var ix = 0; ix < items.length; ix++) {
        map(items[ix]);
    }
    
    for(var shop in set) {
        reduce(shop, set[shop]);
    }
}
{% endhighlight %}
  <br>
  <br>
<b>Lekker weinig code!</b>
  <br>Bij elkaar is de javascript zo&apos;n 100 regels, maar dat is voornamelijk
  boilerplate om aan de regels van de contest te voldoen. De echte implementatie
  is een regel of 20 ofzo + 10 voor de mapreduce functie. Check de source
  van de HTML pagina voor de werking. De Yahoo Pipe kan je ook gewoon inzien.</p>
   
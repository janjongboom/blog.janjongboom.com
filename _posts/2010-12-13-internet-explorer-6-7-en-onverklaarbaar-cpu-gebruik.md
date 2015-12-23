---
layout:         post-tweakers
title:          "Internet Explorer 6 / 7 en onverklaarbaar CPU gebruik"
date:           2010-12-13T09:00:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/5709/internet-explorer-6-7-en-onverklaarbaar-cpu-gebruik.html
originalName:   Coding Glamour
language:       nl
commentCount:   15
commentUrl:     http://glamour.tweakblogs.net/blog/5709/internet-explorer-6-7-en-onverklaarbaar-cpu-gebruik.html#reacties
---

   <p class="article"><b>Ben je op zoek naar gegevens over het IE 6 gebruik in Nederland?</b> Kijk
  dan bij dit artikel: <a href="http://glamour.tweakblogs.net/blog/5881/2010-nu-eens-echte-cijfers-over-browsers-en-besturingssystemen.html"
  rel="external">Gegevens over browser- en OS gebruik in 2010</a>.
  <br>
  <br>Back in the days, tijdens het ontwikkelen van <a href="http://www.funda.nl/koop/kaart/#/heel-nederland/"
  rel="external">Zoeken op Kaart</a>, hadden we een bijzonder vreemd probleem:
  Onverklaarbaar CPU gebruik in Internet Explorer 6 en 7. En niet zomaar
  een procentje of twee, nee op een beetje aftandse computer werd je CPU
  volledig dichtgetrokken.
  <br>
  <br>Nou is bovenstaande wel voor te stellen wanneer je druk in de weer bent
  met de kaart, maar dit probleem speelde ook wanneer je je browser geminimaliseerd
  open had staan. Een losgeslagen Javascript thread? Per ongeluk de hele
  DOM aan het herschrijven? Nee na een week duizenden regels Javascript,
  CSS en HTML analyseren, blijkt het een nauwelijks bekende, maar eenvoudig
  reproduceerbare bug te zijn in IE.
  <!--more-->Neem het volgende HTML fragment:
  <br>
  <br>
{% highlight html %}
<html>
<head>
    <script src="http://www.funda.nl/js/jquery-1.4.2.min.js"></script>
    <script src="https://www.google.com/jsapi?key=ABQIAAAASJcdVIEH7yWLmVM68YmDiBTSxDmOvtmFUhTR3StE_jolX7JUMxQDdaLSrq_Gx2k4frnNgfv0mwUPGw"></script>
    <style>
        #map { background: url('http://www.funda.nl/img/misc/map-loading.gif') center no-repeat; }
    </style>
</head>
<body>
    <script>
        google.load("maps", "2", { callback: function() {
            var Map = new GMap2(document.getElementById('map'));
            Map.setCenter(new GLatLng(49, 2), 13);
        } });
    </script>
    <div id="map" style="width: 100%; height: 100%;"></div>
</body>
</html>
{% endhighlight %}
  <br>
  <br>Nothing fancy. Een eenvoudige implementatie van Google Maps. Laden we
  deze pagina echter in IE 6, dan zie je het volgende:
  <br>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/strange_cpu_spike.png"
  title="http://www.100procentjan.nl/tweakers/strange_cpu_spike.png" alt="http://www.100procentjan.nl/tweakers/strange_cpu_spike.png">
  <br>
<i>Ja, dit is VirtualBox! Het probleem speelt ook op fysieke machines. De 13% CPU is op een quadcore machine (ergo: 50% CPU op 1 core van 2.4 GHz).</i>
  <br>
  <br>Wanneer je in IE een background image gebruikt waar je vervolgens een
  grafisch heavy layer overheen legt (bijvoorbeeld Maps, maar ook Flash),
  krijg je bovenstaande behavior! Oplossing?
  <br>
  <br>
  <br>
{% highlight js %}
    var Map = new GMap2(document.getElementById('map'));
    Map.setCenter(new GLatLng(49, 2), 13);
    $('#map').css({background: ''}); // verwijder loading image na laden
{% endhighlight %}
  <br>
  <br>En de CPU utilization is weer normaal!
  <br>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/geen_cpu_spike.png" title="http://www.100procentjan.nl/tweakers/geen_cpu_spike.png"
  alt="http://www.100procentjan.nl/tweakers/geen_cpu_spike.png">
</p>
   
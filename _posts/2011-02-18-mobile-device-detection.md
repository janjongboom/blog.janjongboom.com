---
layout:         post-tweakers
title:          "Mobile device detection"
date:           2011-02-18T13:18:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6158/mobile-device-detection.html
originalName:   Coding Glamour
language:       nl
commentCount:   7
commentUrl:     http://glamour.tweakblogs.net/blog/6158/mobile-device-detection.html#reacties
---

   <p class="article">Belangrijk onderdeel van <a href="http://glamour.tweakblogs.net/blog/6109/nieuwe-mobiele-website-deel-1-kickoff.html"
  rel="external">ons nieuwe mobiele platform</a> is uitvogelen welk device
  een gebruiker op dat moment gebruikt. Ben je mobiel met een viewport-breedte
  van &lt; 600 px dan willen we je doorsturen naar onze mobiele site. En
  dan kom je terecht in de wondere wereld van User Agent parsing.
  <!--more-->
<b>WURFL</b>
  <br>Een van de bekendste libraries met een gigantische lijst van devices,
  UA strings en capabilities is <a href="http://wurfl.sourceforge.net/" rel="external">WURFL</a>,
  an sich klinkt het prima, facebook zou het niet alleen gebruiken maar er
  ook aan bijdragen. Oordeel in 1 zin: &quot;what the hell!&quot; Na installatie
  van de Java library (die alleen in een web-omgeving wil draaien), omdat
  de .NET library dramatisch is, blijkt dat de &apos;intelligente&apos; matching
  van WURFL eigenlijk bijzonder zwak is. Firefox werd herkend als een Nokia
  N900, en van mijn <a href="http://techpatterns.com/forums/about304.html"
  rel="external">testset</a> werd een niet onaanzienlijk deel niet herkend.
  Wat me echter nog meer stoorde, was dat bij het ophogen van wat versienummers
  van de iPad UA er geen enkele herkenning meer was. Ben ik dan zo raar dat
  ik verwacht dat een library herkent dat iPad 4.3 wel zo&apos;n beetje compatible
  zal zijn met iPad 4.2?
  <br>
  <br>
<b>En dan?</b>
  <br>WURFL zou dus slimmer moeten worden, en het toeval wil dat we hier met
  een verzameling nerds in een grote open ruimte zitten. Een neuraal netwerk
  dat we trainen met een voorgedefinieerde set, dat gaat gokken of een niet
  herkende User Agent in een categorie kan worden ingedeeld. Of toch een
  genetisch algoritme dat vanzelf evolueert tot een alles-wetend mobiel deviceherkennend
  brein. Kan allemaal!
  <br>
  <br>
<b>Uitkomst</b>
  <br>We gaan gewoon gebruik maken van een <a href="http://deviceatlas.com/"
  rel="external">commercieel pakket</a> dat het een stuk beter doet, praat
  bovendien ook nog standaard .NET
  <img src="http://tweakimg.net/g/s/wink.gif"
  width="15" height="15" alt=";)">
</p>
   
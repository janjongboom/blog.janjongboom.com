---
layout:         post-tweakers
title:          "\"Dus euh, jij voert dan die huizen in?\""
date:           2011-05-18T13:37:00.000Z
categories:     Reacties (39)
originalUrl:    http://glamour.tweakblogs.net/blog/6577/dus-euh-jij-voert-dan-die-huizen-in.html
originalName:   Coding Glamour
language:       nl
commentCount:   39
commentUrl:     http://glamour.tweakblogs.net/blog/6577/dus-euh-jij-voert-dan-die-huizen-in.html#reacties
---

   <p class="article">&quot;Maar, dat funda dat is toch wel af?&quot;; &quot;En dat doe je dan
  in je eentje neem ik aan?&quot;; &quot;Maak jij dan de foto&apos;s ofzo?&quot;;
  zomaar een paar citaten die in de afgelopen 2,5 jaar zijn langsgekomen
  tijdens feestjes. Daarom het enige echte dev-overzicht van funda, met hopelijk
  een verklaring hoe we 20 man fulltime bezig kunnen houden met het knutselen
  aan de site. Kan ik daarna mooi bit.ly/neeikvoergeenhuizenin hierheen laten
  linken en op een t-shirt printen.
  <br>
  <br>
<b>Dus, hoeveel man loopt daar nou rond?</b>
  <br>In totaal bestaan we uit een man/vrouw of 50, waarvan er ~ 20 zich bezig
  houden met techniek, verdeeld over de volgende disciplines:
  <ul>
    <li>- 1 Groot leider</li>
    <li>- 1 Software architect</li>
    <li>- 2 Project managers</li>
    <li>- 2 Testers</li>
    <li>- 4 User experience designers (waarvan 1 groot leider)</li>
    <li>- 1 Release manager / interne technisch applicatiebeheerder</li>
    <li>- 10 Software developers, waarvan 7 intern, en 3 op locatie</li>
  </ul>En daarnaast nog 3 applicatiebeheerders die voornamelijk voor ons werken,
  maar in dienst van onze applicatiebeheer-partij zijn.
  <br>
  <br>
<b>Maar, die site verandert toch nooit?</b>
  <br>Wel dus! Maar naast werk aan de sites funda.nl en fundainbusiness.nl hebben
  we ook nog een mobiele site, een iPhone app, een API, etc. De meeste tijd
  gaat echter zitten in ons makelaarportaal, de <a href="http://www.funda.nl/help/?pagina=/nl/algemene-teksten-funda-sites/fundadesk/help/werken-met-de-funda-desk"
  rel="external">funda desk</a>, waar we tools hebben voor het beheer van
  alle panden, media en kantoorgegevens. Omdat er voor <a href="http://www.funda.nl/verkoop/"
  rel="external">producten</a> die we daar aanbieden betaald moet worden,
  hebben we tevens een grote set aan business rules + aanverwante programma&apos;s
  die dit allemaal in goede banen leiden.
  <!--more-->
<b>En wie voert die huizen in?</b>
  <br>De makelaars. Woningen kunnen worden aangeleverd via het uitwisselsysteem
  <a
  href="http://nieuws.nvm.nl/over_nvm/nvm_lidmaatschap/kantoorautomatisering.aspx"
  rel="external">Tiara</a>van de NVM, waar ook andere verenigingen hun aanbod invoeren.
    Of ze doen het via een <a href="http://www.funda.nl/help/?pagina=/nl/algemene-teksten-funda-sites/fundanl/help/aanbod-andere-websites"
    rel="external">gestandaardiseerde XML-feed</a>.
    <br>
    <br>
<b>En van invoer naar de website?</b>
    <br>Alle huizen (of garageboxen, kantoorpanden, you name it) worden in &#xE9;&#xE9;n
    centrale database opgeslagen. Uiteraard met versioning, waarbij we de historie
    van een pand volledig kunnen terugvinden. Hierna wordt er voor het huis
    een event ingeschoten in onze &apos;<a href="http://nl.wikipedia.org/wiki/Enterprise_service_bus"
    rel="external">service bus</a>&apos; oplossing. Deze slaat alle data plat
    naar een andere database, wat zorgt voor veel redundante data, maar zoeken
    op de site wel lekker snel maakt (alle data die je wil hebben in 1 query).
    Deze data wordt vervolgens weer geindexeerd door <a href="http://glamour.tweakblogs.net/blog/5948/solr-deel-1-introductie-tot-faceted-search.html"
    rel="external">Lucene Solr</a>, waarmee je kan zoeken in al het aanbod.
    <br>
    <br>
<b>Veel code?</b>
    <br>Zo&apos;n 2 miljoen regels bij elkaar. We proberen het wel te verminderen
    :-).
    <br>
    <br>
<b>En wat doen al die developers nu dan?</b>
    <br>Momenteel zit er 1 in de ziekenboeg, zitten er 3 op onderhoud (bugs, kleine
    nieuwe dingen), zijn er 3 bezig met het omzetten van &#xE1;l onze zoekfuncties
    naar Solr, is er 1 bezig met een nieuw Profielen systeem, 1 met verbeteringen
    voor het <a href="http://www.funda.nl/recreatie/" rel="external">recreatie</a> onderdeel
    en 1 met de implementatie van CRM. En dan zijn we alweer door al onze devs
    heen.
    <br>
    <br>
<b>Toch nog niet overtuigd?</b>
    <br>Vragen mogen in de comments.</p>
   
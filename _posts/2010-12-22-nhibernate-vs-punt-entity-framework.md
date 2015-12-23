---
layout:         post-tweakers
title:          "NHibernate vs. Entity Framework"
date:           2010-12-22T14:19:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/5799/nhibernate-vs-punt-entity-framework.html
originalName:   Coding Glamour
language:       nl
commentCount:   14
commentUrl:     http://glamour.tweakblogs.net/blog/5799/nhibernate-vs-punt-entity-framework.html#reacties
---

   <p class="article">We gebruiken sinds de laatste rewrite van onze codebase (2006) NHibernate
  als OR Mapper, maar na ruim vier jaar is nu het besef wel gekomen dat we
  eens zouden moeten upgraden, daar we nu nog op NHibernate 1.04 draaien
  (2.1.2 is nu uit, en 3.0 is in beta). Daarom gisteren een kennissessie
  [1] gehad waarin we eens bespraken welke richting we uit wilden. Bij NHibernate
  blijven of toch naar Entity Framework.
  <br>
<i>[1] Gooi een sloot developers met eten en alcohol in een groen hok en wacht tot ze het eens zijn.</i>
  <!--more-->
<b>Huidige landschap</b>
  <br>Grootste nadeel van NHibernate op dit moment in onze situatie:
  <ul>
    <li>Zeer onduidelijke foutmeldingen</li>
    <li>Runtime compilation van entities kost enorm veel tijd (30 sec. per compilatieslag)</li>
  </ul><b>Waarom willen we niet naar NHibernate 2.1.2?</b>
  <br>In NHibernate 2.1.2 is op dit moment geen fatsoenlijke strong-typed LINQ
  support, en er zijn bovendien dezelfde bezwaren die ons nu soms ook opbreken
  als een gebrek aan goede documentatie, goede foutmeldingen en static compilation.
  <br>
  <br>
<b>Dan naar NHibernate 3.0?</b>
  <br>Het belooft in ieder geval een meer feature-rijke release te worden. Normale
  LINQ support, alhoewel er geen binding is tussen de DataContext waarin
  je draait en je entity (je kunt met LINQ een query uitvoeren op een type
  dat niet bestaat in de database waarop je queriet, dit merk je pas runtime);
  en in b&#xE8;ta 1 zijn de foutmeldingen nog niet verbeterd. Alhoewel hier
  beterschap voor is beloofd.
  <br>
  <br>Daarnaast is het voor mij eigenlijk onbegrijpelijk dat door het loskoppelen
  van het proxy-framework van de NHibernate core, &#xE1;lle classes die lazy-loading
  willen ondersteunen, alle properties als &apos;virtual&apos; gedefinieerd
  moeten hebben. Daarnaast zal er ook geen static compilation komen, waardoor
  we nog steeds lang moeten wachten totdat NHibernate alles runtime heeft
  gecompileerd.
  <br>
  <br>Overigens zijn er inmiddels extension-points in NHibernate waardoor je
  dit zou kunnen cachen, en deze slag zo&apos;n 50% sneller kan laten verlopen.
  <br>
  <br>
<b>Waarom w&#xE9;l NHibernate?</b>
  <br>Alles, van voor naar achter, van links naar rechts, van API tot aan Business
  Rules, alles draait NHibernate. Alle core components, mappers, etc. kunnen
  allemaal met HQL werken. Dat betekent een minimale impact op de code, maar
  wel een sloot aan nieuwe features. Daarnaast is NHibernate qua ORM zelf
  de beste (?) mapper at the moment. Wij gebruiken in ieder geval in een
  aantal entities methodes die niet ondersteund worden in EF (moeilijke complex
  types uit een rij mappen).
  <br>
  <br>
<b>Waarom Entity Framework?</b>
  <br>We kunnen nu model-first werken, waarin we alle entities die nu met NHibernate
  praten; gewoon kunnen laten bestaan, maar ze &#xE9;n tegen NHibernate &#xE9;n
  tegen Entity Framework te laten mappen. Dat scheelt werk.
  <br>
  <br>Daarnaast is er een fantastische Visual Designer, die goed ge&#xEF;ntegreerd
  is in Visual Studio; en is EF4 een requirement voor het behalen van je
  MCPD (Microsoft Professional Developer) .NET 4, dus meer kennis aanwezig
  bij externe ontwikkelaars.
  <br>
  <br>Documentatie en static compilation zijn daarnaast twee zaken die veel
  tijd kunnen gaan schelen bij het ontwikkelen, namelijk sneller foutmeldingen
  zien, en sneller doorwerken na een compilatieslag.
  <br>
  <br>Ook prettig is dat er een sterke partij achter staat, want wanneer Ayende
  (lead dev van NHibernate) onder een bus zou komen, zou dat NHibernate ernstig
  schaden.
  <br>
  <br>
<b>Waarom g&#xE9;&#xE9;n Entity Framework?</b>
  <br>De omzetting van NH naar EF gaat een best gevaarlijke stap worden, omdat
  alle code die communiceert met een database herschreven moet worden. Fouten
  worden snel gemaakt, en hoeven niet altijd direct op te vallen in een codebase
  van 2.000.000 regels code. Daarnaast is het minder &apos;proven technology&apos;
  dan Hibernate, dat veel langer op de markt is.
  <br>
  <br>Ook heeft Entity Framework wat rare quirks die ook in NHibernate voorkomen,
  zoals het zomaar weggooien van data als je Primary Key&apos;s niet uniek
  zijn gedefinieerd. Tevens gemerkt bij een eerdere werkgever dat EF inline
  queries nogal in de hand werkt; omdat je valide C# aan het typen bent,
  en geen obscure taal als HQL, dus er moet goed nagedacht worden hoe we
  de DataContext&apos;es gaan afschermen.
  <br>
  <br>
<b>Long story short</b>
  <br>We hebben nog geen flauw idee wat we gaan doen
  <img src="http://tweakimg.net/g/s/smile.gif"
  width="15" height="15" alt=":)">.</p>
   
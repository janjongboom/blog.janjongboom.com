---
layout:         post-tweakers
title:          "Bouw eens een API met WCF, deel 1"
date:           2011-01-20T13:52:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/5983/bouw-eens-een-api-met-wcf-deel-1.html
originalName:   Coding Glamour
language:       nl
commentCount:   10
commentUrl:     http://glamour.tweakblogs.net/blog/5983/bouw-eens-een-api-met-wcf-deel-1.html#reacties
---

   <p class="article">Er komt een moment in de geschiedenis van elke contentleverancier dat
  er de vraag komt om je content anders te gaan presenteren. Van je &#x2018;main&#x2019;
  platform naar bijvoorbeeld mobiel.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/api1.png" title="http://www.100procentjan.nl/tweakers/api1.png"
  alt="http://www.100procentjan.nl/tweakers/api1.png">
  <br>Probleem: bij een website heb je &#xE9;&#xE9;n centrale server waar je
  database op draait, en waar je met je favoriete toolkit tegenaan kan praten.
  Bij een mobiele applicatie is het iets lastiger om een database van 12
  GB mee te leveren. Ergo: tijd om je content beschikbaar te maken voor externe
  leveranciers via een API.
  <!--more-->
<b>Programma van eisen</b>
  <br>Toen ik gevraagd werd om de API van funda te gaan bouwen om zo onze content
  beschikbaar te kunnen maken voor o.a. Layar kwamen we met het volgende
  eisenlijstje:
  <ul>
    <li>Autorisatie benodigd met een key, op IP kan niet; want er wordt vanaf
      talloze mobiele apparaten data opgevraagd.</li>
    <li>Losse entiteiten zodat we bepaalde velden niet door hoeven te geven aan
      partners (bijvoorbeeld de periode dat een huis exact te koop staat).</li>
    <li>Moet werken tegen onze bestaande codebase, zodat we profiteren van bestaande
      bugfixes.</li>
    <li>Performance is kritiek, 100.000 hits per uur is de minimale capaciteit.</li>
    <li>Beschikbaar als REST API via JSON en XML, en als SOAP.</li>
  </ul><b>Platform</b>
  <br>We hebben ervoor gekozen om te gaan bouwen op de WCF stack, deze biedt
  standaard ondersteuning voor REST en SOAP, en we kunnen eenvoudig delen
  van onze codebase hergebruiken; alles is toch .NET.
  <br>
  <br>
<b>Let&apos;s get it started</b>
  <br>Na het aanmaken van een WCF service in Visual Studio wordt je geconfronteerd
  met:
  <ul>
    <li>.svc; de implementatie van je service</li>
    <li>een interface; het contract van je service</li>
    <li>.config; configuratie van je service</li>
  </ul><b>Voorbeeld van een interface / contract</b>
  <br>Een voorbeeld interface is:
  <br>
  <br>
{% highlight csharp %}
[OperationContract] // het is een Operation; iets wat je kan doen
[WebGet(UriTemplate = "/geefhuis/{id}", ResponseFormat = WebMessageFormat.Xml)] // via GET te benaderen, en geeft XML terug
LocatieFeedObject ZoekAanbod(string id);
{% endhighlight %}
  <br>wat globaal op het volgende neerkomt: we hebben een actie die via een
  GET actie benaderd kan worden en XML teruggeeft. De URL waarop deze service
  draait is dan:
  <br>
  <br>
{% highlight text %}
http://www.domein.nl/naamvanje.svc/geefhuis/1234/
{% endhighlight %}
  <br>
  <br>Het type wat we teruggeven is een &#x2018;LocatieFeedObject&#x2019;. Een
  contract hiervoor kan zijn:
  <br>
  <br>
{% highlight csharp %}
[DataContract(Name = "LocatieFeed")] // het is Data; iets wat je kan lezen / schrijven
public class LocatieFeedObject
{
    [DataMember(Name = "Objects")]
    public List<LocatieObject> Objects { get; set; } // we hebben meerdere objecten
    [DataMember]
    public int TotaalAantalObjecten { get; set; } // en een totaal aantal objecten
}
[DataContract(Name = "Object")] // weer een DataContract
public class LocatieObject
{
    public LocatieObject() { }
    [DataMember(Name = "Adres")]
    public string Adres { get; set; } // en 1 property (adres)
}
{% endhighlight %}
  <br>Wat hier nog rest is de echte implementatie in code. Deze kan heel kort
  zijn, want het vertalen van HTTP naar Code naar XML wordt door WCF gedaan:
  <br>
  <br>
{% highlight csharp %}
public LocatieFeedObject ZoekAanbod(string id)
{
    return Dao.GeefObjecten(id);
}
{% endhighlight %}
  <br>
  <br>
<b>Et voila</b>
  <br>Dat is de basis van onze service. We hebben een basis-API neergezet die
  via REST kan praten met de rest van de wereld. Morgen ga ik in op autorisatie.</p>
   
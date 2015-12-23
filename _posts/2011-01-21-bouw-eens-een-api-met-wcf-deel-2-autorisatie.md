---
layout:         post-tweakers
title:          "Bouw eens een API met WCF, deel 2: Autorisatie"
date:           2011-01-21T13:40:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/5986/bouw-eens-een-api-met-wcf-deel-2-autorisatie.html
originalName:   Coding Glamour
language:       nl
commentCount:   9
commentUrl:     http://glamour.tweakblogs.net/blog/5986/bouw-eens-een-api-met-wcf-deel-2-autorisatie.html#reacties
---

   <p class="article">Bij een API is toegangsbeperking een fijn idee, zo voorkom je dat bezoekers
  je hele platform platleggen of kan je contractueel vastgestelde beperkingen
  afdwingen. Standaardautorisatie zou je kunnen doen via sessies, op IP basis
  of via een Key. Sessies vallen per definitie af, omdat de gemiddelde API
  client helemaal geen sessie-informatie kan of wil doorsturen. Op IP basis
  zou prima kunnen om het maximaal aantal requests te kunnen monitoren, maar
  je kunt hiermee geen restricties op de API plaatsen. Vandaar dat we hebben
  gekozen voor een systeem op basis van een key.
  <br>
  <br>
<b>Database</b>
  <br>In onze database hebben we een heel simpele structuur met een n-n relatie
  tussen de Users en de Rights.
  <br>
  <br>
{% highlight sql %}
Users
--------------------------------------
Id  | Key               | Name
1   | abcde1234af32     | Jan's Mobile Client
Rights
---------------------------------------
Id  | Description
101 | Opvragen koopaanbod
UserRights
---------------------------------------
UserId  | RightId
1       | 101
{% endhighlight %}
  <!--more-->
<b>Code</b>
  <br>We moeten nu nog wel de data uit de database op een eenvoudig toegangelijke
  manier vertalen naar code. We gebruiken daar grofweg het volgende datamodel
  voor:
  <br>
  <br>
{% highlight csharp %}
public class User
{
    public Guid Key { get; set; }
    public string Name { get; set; }
    
    public ApiRights Rights { get; set; }
}
public class ApiRights
{
    [ApiRight(101)]
    public bool OpvragenKoopAanbod { get; set; }
}
{% endhighlight %}
  <br>Tijdens het laden van de gebruiker uit de database kunnen we nu handig
  gebruik maken van de attributes op de properties; ongeveer als:
  <br>
  <br>
{% highlight csharp %}
List<UserRights> userRights = Dao.GetUserRights(1);
// cache de properties om snel te kunnen vertalen
Dictionary<int, PropertyInfo> rightsOnBusinessObject = new Dictionary<int, PropertyInfo>();
PropertyInfo[] userRightProps = u.Rights.GetType().GetProperties();
foreach (var prop in userRightProps)
{
    // zoek het attribute op
    ApiRightAttribute[] attr = (ApiRightAttribute[])prop.GetCustomAttributes(typeof(ApiRightAttribute), false);
    if(attr.Length > 0)
    {
        rightsOnBusinessObject.Add(attr[0].DatabaseId, prop);
    }
}
// loop door alle rechten heen die de gebruiker heeft
foreach (var userRight in userRights)
{
    // zoek de property op, en zet de waarde naar 'true'
    if (rightsOnBusinessObject.ContainsKey(userRight.RightId))
        rightsOnBusinessObject[userRight.RightId].SetValue(u.Rights, true, null);
}
{% endhighlight %}
  <br>
  <br>
<b>Controle in de service</b>
  <br>In de service kunnen we nu een eenvoudige check doen:
  <br>
  <br>
{% highlight csharp %}
// we hebben in onze interface een URL-template staan als
// "aanbod/{key}/"
// je roept deze service dus aan als:
// www.url.nl/naamvanje.svc/aanbod/12345abc/
// je key zit dus gewoon in je URL
public SomeListOfObjects GetObjects(string key) {
    var user = Dao.GetUser(key);
    
    // als de gebruiker geen rechten heeft
    if(!user.Rights.OpvragenKoopAanbod) {
        // zet de code naar 403
        WebOperationContext.Current.OutgoingResponse.StatusCode = HttpStatusCode.Unauthorized;
        // en eventueel nog een persoonlijke boodschap
        WebOperationContext.Current.OutgoingResponse.StatusDescription = "Dit is niet mijn service, vriend";
        return null;
    }
}
{% endhighlight %}
  <br>
  <br>
<b>Controle op het aantal requests</b>
  <br>Nu kunnen we weliswaar verifieren of een gebruiker een bepaalde API mag
  aanroepen, maar dit blokkeert niet de kans dat er vanaf een key 80.000
  requests per minuut af worden gevuurd. Tijd dus om ook hier paal en perk
  aan te stellen!
  <br>
  <br>
<b>Memcached to the rescue!</b>
  <br>
<a href="http://memcached.org/" rel="external">Memcached</a> is een distributed
  cache systeem dat min of meer het hart achter funda is. We gebruiken memcached
  in een totaal cluster van 20 machines, die allemaal 1 GB aan geheugen bijdragen.
  Alles wat we enigszins kunnen cachen stoppen we in deze cache. Omdat we
  vier webservers hebben staan vanwaar we de API serveren, gebruiken we memcached
  om het aantal requests / key bij te houden. Fijn hierbij is dat er een
  &apos;increment&apos; functie is, die de waarde van een bepaalde key met
  1 verhoogd. Ideaal.
  <br>
  <br>
{% highlight csharp %}
int counter = cache.Increment(user.Key.ToString("N") + ".counter");
if ( counter > 100 /* 100 = max requests / minuut */ ) {
    // en nu?
}
{% endhighlight %}
  <br>We slaan in een aparte key op wanneer we voor het laatst de counter hebben
  gereset:
  <br>
  <br>
{% highlight csharp %}
int counter = cache.Increment(user.Key.ToString("N") + ".counter");
if ( counter > user.MaxNumberOfRequestsPerMinute ) {
    // haal het started object op, en controleer of deze uberhaupt is gezet
    object started = cache.GetFromCache(user.Key.ToString("N") + ".started");
    DateTime startedDatetime = started == null ? DateTime.Now : (DateTime)started;
    // is de starttijd minder dan een minuut geleden?
    if (startedDatetime > DateTime.Now.AddMinutes(-1))
    {
        // dan ben je in overtreding!
        context.StatusCode = System.Net.HttpStatusCode.Unused;
        context.StatusDescription = "Request limit exceeded";
        return null;
    }
    else
    {
        // anders resetten we de teller
        cache.StoreInCache(user.Key.ToString("N") + ".started", DateTime.Now);
        cache.StoreInCache(user.Key.ToString("N") + ".counter", 0);
    }
}
{% endhighlight %}
  <br>
  <br>
<b>So far...</b>
  <br>We hebben nu de authenticatie, het verifi&#xEB;ren van rechten en het
  controleren van het aantal requests met een paar regels code in weten te
  bakken in de service. Volgende week meer over het vertalen van Domain Entities
  =&gt; API Entities.</p>
   
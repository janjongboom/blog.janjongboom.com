---
layout:         post-tweakers
title:          "Intelligente suggesties, deel 3: Uitspraak en hierarchie"
date:           2010-12-29T14:05:00.000Z
categories:     Algoritmes
originalUrl:    http://glamour.tweakblogs.net/blog/5849/intelligente-suggesties-deel-3-uitspraak-en-hierarchie.html
originalName:   Coding Glamour
language:       nl
commentCount:   8
commentUrl:     http://glamour.tweakblogs.net/blog/5849/intelligente-suggesties-deel-3-uitspraak-en-hierarchie.html#reacties
---

   <p class="article">Dit is deel 3 in een serie over de techniek uit een &apos;intelligente&apos;
  zoekbox.
  <ul>
    <li><a href="http://glamour.tweakblogs.net/blog/5832/intelligente-suggesties-deel-1-introductie-en-startswith.html"
      rel="external">1. Introductie en &apos;StartsWith&apos;</a>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5842/intelligente-suggesties-deel-2-volledige-matching-en-typfouten.html"
      rel="external">2. Volledige matching en typfouten</a>
    </li>
    <li><b>3. Uitspraak en hierarchie</b>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5853/intelligente-suggesties-deel-4-aantallen-caching-en-protocol-buffers.html"
      rel="external">4. Aantallen, caching en Protocol Buffers</a>
    </li>
  </ul>Na gisteren een BK-tree gemaakt te hebben waarmee we kunnen zoeken op
  woorden, en daarbij ook typfouten kunnen ondervangen, verbeteren we dit
  vandaag door middel van een combinatie van het fonetisch algoritme <a href="http://glamour.tweakblogs.net/blog/5732/diakritische-tekens-en-soundex-in-net.html"
  rel="external">Soundex</a> en de Burkhard-Keller tree.
  <!--more-->
<b>In een boom opslaan van de Soundex waardes</b>
  <br>Voor het opslaan van de Soundex waarde doe ik hetzelfde als gisteren voor
  de normale waardes; we gebruiken dus weer Levenshtein om de distance op
  te slaan. We kunnen dan gelijkklinkende woorden vinden door een query uit
  te voeren op de tree:
  <br>
  <br>
{% highlight csharp %}
var list = SoundexRootNode.Query("wiboudstraat", 0); // Wibautstraat, Amsterdam gevonden
{% endhighlight %}
  <br>Nu kunnen we meerdere dingen doen om fouten in zowel spelling als uitspraak
  te vinden:
  <ul>
    <li>Alleen zoeken op soundex van de invoer van de gebruiker</li>
    <li>Alle woorden vinden met een distance van 1; en hier soundex op toepassen
      (als je &apos;Driese Wetering&apos; intikt, krijg je bijv. &apos;Drielse
      Wetering&apos;; op elk van deze resultaten doe je een query in de Soundex
      Tree)</li>
    <li>Alle resultaten in de soundex vinden met een distance van 1 (&apos;Wiboukstraat&apos;
      resulteert in &apos;Wibautstraat&apos;)</li>
  </ul>Het resultaat van elk van deze benaderingen varieert nogal per dataset,
  maar voor onze implementatie hebben we voorlopig gekozen voor 1., maar
  2. staat nog ter discussie. De implementatie is immers verborgen in de
  BK-tree, en we kunnen dus makkelijk schakelen.
  <br>
  <br>
<b>Hierarchisch zoeken</b>
  <br>Gebruikers kunnen met komma&apos;s zoeken op hierarchie:
  <br>
  <br>
{% highlight text %}
Pijp, Noord-Holland 
// vindt alleen alle entiteiten met naam 'Pijp' in de provincie NH
// dus niet 'Pijpenring' in 'Delft'
{% endhighlight %}
  <br>Hierbij zijn twee problemen:
  <ul>
    <li>Hoe vinden we hierarchie als de gebruiker geen komma&apos;s gebruikt;
      maar bijv. Pijp Amsterdam intikt?</li>
    <li>Hoe vinden we snel en vooral effici&#xEB;nt de hierarchische parents?</li>
  </ul><b>Geen komma&apos;s?</b>
  <br>Wanneer een gebruiker geen komma&apos;s gebruikt, zoeken we eerst naar
  resultaten die precies matchen (&apos;Pijp Amsterdam&apos;), als deze geen
  resultaten geeft, dan berekenen we alle mogelijke queries die we kunnen
  maken als we de spaties vervangen door komma&apos;s (in dit geval &apos;Pijp
  Amsterdam&apos; en &apos;Pijp,Amsterdam&apos;) met de volgende code:
  <br>
  <br>
{% highlight csharp %}
public List<string> GetAllPossibleQueries(string query)
{
    string normalisedQuery = query.Replace(",", " ");
    string[] queryParts = normalisedQuery.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
    normalisedQuery = string.Join(" ", queryParts); // 1 spatie is goed
    List<string> queries = new List<string>();
    int[] spacePositions = new int[queryParts.Length - 1];
    int lixSpace = -1;
    for(int ix = 0; ix < spacePositions.Length; ix++)
    {
        lixSpace = normalisedQuery.IndexOf(' ', lixSpace + 1);
        spacePositions[ix] = lixSpace;
    }
    var powerSet = GetPowerSet(spacePositions.ToList());
    // order de powerset zo dat eerst de minste queries van achter naar voor
    // dus Drielse Wetering, Zaandam komt voor Drielse, Wetering, Zaandam
    powerSet = powerSet.OrderBy(i => i.Count()).ThenByDescending(i => i.Sum());
    foreach(var set in powerSet)
    {
        char[] newQuery = normalisedQuery.ToCharArray();
        foreach(var space in set)
        {
            newQuery[space] = ',';
        }
        queries.Add(new string(newQuery));
    }
    return queries.Where(q=>!q.Equals(normalisedQuery, StringComparison.Ordinal)).ToList();
}
// http://social.msdn.microsoft.com/Forums/en-CA/netfxbcl/thread/42375146-eade-43ae-9550-1dfdd7c8aa18
private IEnumerable<IEnumerable<T>> GetPowerSet<T>(List<T> list)
{
    return from m in Enumerable.Range(0, 1 << list.Count)
           select
               from i in Enumerable.Range(0, list.Count)
               where (m & (1 << i)) != 0
               select list[i];
}
{% endhighlight %}
  <br>Hierna voeren we alle mogelijke queries nog een keer uit.
  <br>
  <br>
<b>Wel komma&apos;s</b>
  <br>Na de eerste keer geen komma&apos;s gehad te hebben, parsen we de query
  (&apos;Pijp, Amsterdam&apos;) van de gebruiker naar dit model:
  <br>
  <br>
{% highlight csharp %}
    public class Zoekhierarchisch
    {
        public string Term { get;set;}
        public Zoekhierarchisch Parent { get;set;}
    }
    
    // hier komt uit
    { Term: "Pijp", Parent: { Term: "Amsterdam", Parent: null } }
{% endhighlight %}
  <br>En we zoeken nu met de standaard-zoekcode naar alles waar &apos;Pijp&apos;
  in voorkomt. Hieruit komt bijvoorbeeld &apos;Oude Pijp&apos;, &apos;Nieuwe
  Pijp&apos; en &apos;Pijperring&apos;. Omdat elk gebied een &apos;Parent&apos;
  property heeft, kunnen we dit gebruiken om te controleren of er ooit een
  parent is van het huidige gebied die matcht tegen de invoer van de gebruiker:
  <br>
  <br>
{% highlight csharp %}
public List<GeoGebied> FilterHierarchic(IEnumerable<GeoGebied> gebieden, Zoekhierarchisch criterium, int fuziness, bool useSoundex)
{
    // als de zoekopdracht geen parent heeft, dan matcht alles
    if (criterium.Parent == null)
        return gebieden.ToList();
    // maak een lijst met alle parents
    List<string> terms = new List<string>();
    var cp = criterium.Parent;
    while(true)
    {
        if (cp == null) break;
        terms.Add(cp.Term);
        cp = cp.Parent;
    }
    // als query was 'Drostendiep, Kalf, Zaandam' dan terms is
    // [ Kalf, Zaandam ]
    // we gaan nu van elk gebied in de set controleren of deze ooit matcht
    return gebieden.Where(g => EverMatchesHierarchic(g, terms, fuziness, useSoundex, 0)).ToList();
}
public bool EverMatchesHierarchic(GeoGebied gebied, List<string> terms, int fuziness, bool useSoundex, int level)
{
    var soundex = new Soundex();
    // dit slaan we de eerste keer over want anders werkt utrecht, utrecht, utrecht niet meer correct
    // we moeten namelijk minimaal 1 niveau omhoog zijn gegaan
    if (++level > 1)
    {
        // als het gebied NULL is, dan matcht dit natuurlijk niet
        if (gebied == null) return false;
        bool success = false;
        string terms0Soundex = useSoundex ? soundex.Calculate(terms[0]) : null;
        // een gebied kan meerdere keys hebben; want varianten enzo
        foreach(var gebiedVariant in LongCache.IxGebiedId[gebied.Id])
        {
            // een gebied matcht als:
            // 1. zijn keys overeenkomt met terms[0]
            if (gebiedVariant.Keys.Any(key=>key.Equals(terms[0], StringComparison.Ordinal))) success = true;
            // 2. zijn keys starts with terms[0]
            else if (gebiedVariant.Keys.Any(key=>key.StartsWith(terms[0]))) success = true;
            // 3. zijn soundexkeys overeenkomen met soundex van terms[0]
            else if (useSoundex && gebiedVariant.Keys.Any(key=>soundex.Calculate(key) == terms0Soundex)) success = true;
            // 4. fuziness goed is
            else if (fuziness > 0 && gebiedVariant.Keys.Any(key => EditDistance.YetiLevenshtein(key, terms[0]) <= fuziness)) success = true;
        }
        if (success)
        {
            // als dit de laatste term was dan true
            if (terms.Count == 1) return true;
            // anders halen we de huidige term eraf en zoeken we verder
            terms = terms.Skip(1).ToList();
        }
    }
    // zoek in onze cache of we het parent-element van het huidige geoGebied wel kennen
    if (!LongCache.IxGebiedId.ContainsKey(gebied.Parent)) return false;
    return EverMatchesHierarchic(LongCache.IxGebiedId.ContainsKey(gebied.Parent) ? LongCache.IxGebiedId[gebied.Parent].FirstOrDefault() : null, terms, fuziness, useSoundex, level);
}
{% endhighlight %}
  <br>De lijst is nu gefilterd, en &apos;Pijperring&apos; is verwijderd; daar
  deze in Delft ligt!
  <br>
  <br>
<b>Morgen</b>
  <br>Het laatste deel in deze serie: aantallen woningen, caching en Protocol
  Buffers.</p>
   
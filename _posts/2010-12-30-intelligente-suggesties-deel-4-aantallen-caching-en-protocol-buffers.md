---
layout:         post-tweakers
title:          "Intelligente suggesties, deel 4: Aantallen, caching en Protocol Buffers"
date:           2010-12-30T14:57:00.000Z
categories:     Algoritmes
originalUrl:    http://glamour.tweakblogs.net/blog/5853/intelligente-suggesties-deel-4-aantallen-caching-en-protocol-buffers.html
originalName:   Coding Glamour
language:       nl
commentCount:   2
commentUrl:     http://glamour.tweakblogs.net/blog/5853/intelligente-suggesties-deel-4-aantallen-caching-en-protocol-buffers.html#reacties
---

   <p class="article">Dit is deel 4 in een serie over de techniek uit een &apos;intelligente&apos;
  zoekbox.
  <ul>
    <li><a href="http://glamour.tweakblogs.net/blog/5832/intelligente-suggesties-deel-1-introductie-en-startswith.html"
      rel="external">1. Introductie en &apos;StartsWith&apos;</a>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5842/intelligente-suggesties-deel-2-volledige-matching-en-typfouten.html"
      rel="external">2. Volledige matching en typfouten</a>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5849/intelligente-suggesties-deel-3-uitspraak-en-hierarchie.html"
      rel="external">3. Uitspraak en hierarchie</a>
    </li>
    <li><b>4. Aantallen, caching en Protocol Buffers</b>
    </li>
  </ul>We kunnen hierarchisch zoeken, spel- en typfouten verhelpen en zelfs vrij
  goed gokken wat een gebruiker bedoelt als we de zoekterm niet helemaal
  begrijpen; waardoor alleen nog de grijze getallen met aantallen openstaan.
  <!--more-->
<b>Aantallen</b>
  <br>Op funda worden verschillende soorten aanbod gefaciliteerd. Op funda.nl
  zijn dit er 5: koop, huur, recreatie, nieuwbouw en europe; en op fundainbusiness.nl
  zijn dit er zelfs acht! Omdat deze aantallen redelijk vaak veranderen willen
  we dit waarschijnlijk minder lang cachen dan alle gebieden en de trees.
  Daarom willen we de aantallen in een los object opslaan.
  <br>
  <br>Allereerst heb ik in de database een view gebakken die de data gegroepeerd
  ophaalt. Hierin staat bijvoorbeeld:
  <br>
  <br>
{% highlight text %}
Id        | Type    | Straat    | Buurt            | Plaats    | Gemeente    | etc.    | Aantal
1        | koop    | Griftland    | Ermelo-West    | Ermelo    | Ermelo    | ...    | 2
{% endhighlight %}
  <br>
<i>Ja, dit zijn flink wat records (max. het aantal straten in Nederland * (8 + 5)), maar in de praktijk is dit aantal records over de lijn trekken secondenwerk.</i>
  <br>
  <br>
<b>Model</b>
  <br>In het model willen we geen referentie naar het GebiedId hebben, omdat
  deze in een andere cachegroep kan leven:
  <br>
  <br>
{% highlight csharp %}
    public class AantallenWrapper
    {
        private static List<ObjectAantalType> _legeObjectAantallen = Enum.GetValues(typeof (ObjectAantalType)).Cast<ObjectAantalType>().ToList();
        public Dictionary<ObjectAantalType, int> ObjectAantallen { get; set; }
        public AantallenWrapper()
        {
            // voeg alle 'objectaantaltypes' toe, met initiele waarde '0'
            ObjectAantallen = _legeObjectAantallen.ToDictionary(t => t, t => 0);
        }
    }
    
    // ObjectAantalType is een enumeration met daarin 'Koop', 'Huur', etc.
{% endhighlight %}
  <br>We cachen deze in een:
  <br>
  <br>
{% highlight csharp %}
public Dictionary<int, AantallenWrapper> IxGebiedAantallen { get; set; }
{% endhighlight %}
  <br>En vullen hem door door alle records in de tabel heen te lopen en de aantallen
  stuk voor stuk toe te voegen. We kunnen nu snel het aantal objecten opvragen
  voor gebied 1234 voor &apos;koop&apos; via:
  <br>
  <br>
{% highlight csharp %}
var cnt = cache.IxGebiedAantallen[1234].ObjectAantallen[ObjectAantalType.Koop];
{% endhighlight %}
  <br>
  <br>
<b>Caching dan?</b>
  <br>De zoekbox die we maken gebruikt zo 200 MB aan geheugen, inclusief aantallen.
  Niet iets dat je voor elke website op je server in geheugen wil houden
  (zeker niet op een 32-bits machine). Daarom cachen we de data in <a href="http://msdn.microsoft.com/en-us/library/6hbbsfk6(v=VS.100).aspx"
  rel="external">ASP.NET cache</a>, voordeel hierover ten opzichte van memcached
  is dat het benaderen van data in de ASP.NET cache bijna net zo snel is
  als het object opvragen vanuit een static. Bij memcached zou elke keer
  de volledige tree naar de machine moeten worden getrokken.
  <br>
  <br>Daarnaast is het ook mogelijk om een cachegroep in een ander <a href="http://msdn.microsoft.com/en-us/library/system.appdomain.aspx"
  rel="external">AppDomain</a> te hosten dan de website zelf. Wanneer elke
  website dat AppDomain gebruikt om de data op te halen kunnen we de gecachete
  data delen over verschillende websites. Scheelt flink wat memory, daar
  we zowel funda, als funda in business, als onze backend van deze data gebruik
  willen laten maken!
  <br>
  <br>
<b>Hoelang cachen?</b>
  <br>We maken gebruik van <a href="http://memcached.enyim.com/" rel="external">Enyim</a> als
  client-side component voor caching. Deze kan op basis van config bepaalde
  cachegroepen in memcached en ASP.NET draaien. Bovendien ondersteunt deze
  ook het na een bepaalde tijd laten expiren van je items in cache. Voor
  zaken die lang in cache moeten blijven gebruiken we typisch 4 uur. Na deze
  vier uur zijn dus al onze gebruikers de klos! Ze moeten dan minuut of twee
  wachten tot alle trees weer zijn opgebouwd. Daarom gebruik ik binnen mijn
  gecachte object een &apos;LastUpdated&apos; veld: wanneer de &apos;LastUpdated&apos;
  3:50 uur geleden is starten we een async thread die alvast de data opnieuw
  gaat ophalen. Hierdoor hebben gebruikers geen last van een expirerende
  cache!
  <br>
  <br>
<b>Elke vier uur; verandert die data dan wel echt?</b>
  <br>Ja en nee. De aantallen willen we wel graag elke 4 uur opnieuw ophalen,
  maar de geografische data verandert hoogstens elke paar maanden (wanneer
  we nieuwe data aangeleverd krijgen). Zonde dus dat we die BK-trees elke
  keer opnieuw moeten opbouwen! Vandaar dat we een extra laag caching gebruiken:
  het filesystem! Normaal gesproken heel eenvoudig: schrijf de cache weg
  door middel van <a href="http://msdn.microsoft.com/en-us/library/72hyey7b(VS.71).aspx"
  rel="external">Binary Serialization</a> naar schijf, en als de cache expiret
  lees je de file weer uit. Bij een nieuwe update verwijder je gewoon de
  file, en na een tijdje genereert het systeem zelf een nieuwe file op basis
  van de nieuwste data. Alleen jammer dat er zo&apos;n gigantische overhead
  in CPU, memory en HDD space is bij deze vorm van serialisatie!
  <br>
  <br>
<b>Tijd voor...</b>
  <br>
<a href="http://code.google.com/p/protobuf/" rel="external">Protocol Buffers</a>!
  Een gestructureerd bestandsformaat van Google; juist gemaakt voor het opslaan
  en verzenden van grote bomen aan data. Er is ook een goede <a href="http://code.google.com/p/protobuf-net/"
  rel="external">.NET wrapper</a> gemaakt door Marc Gravell, die werkt door
  attributes te gebruiken.
  <br>
  <br>
{% highlight csharp %}
    [ProtoContract]
    public class GeoGebied
    {
        public GeoGebied()
        {
        }
        [ProtoMember(1)]
        public Niveau Niveau { get; set; }
        [ProtoMember(2)]
        public string Naam { get; set; }
        [ProtoMember(3)]
        public string[] Keys { get; set; }
        [ProtoMember(4)]
        public int Id { get; set; }
        [ProtoMember(5)]
        public int Parent { get; set; }
    }
    
    // en dit is de magic!
    using(var fs = File.Create(@"C:\ergensopschijf.jan"))    
    {
        Serializer.Serialize(fs, obj);
    }
{% endhighlight %}
  <br>In ons geval scheelde dit 60% aan HDD ruimte (op de gehele cache), was
  dit met serializen ruwweg 2 keer zo snel, en memory Infinite times omdat
  .NET de tree niet terug kon serializen zonder OutOfMemory te raken. Awesomeness
  (om met E.B. te spreken)!
  <br>
  <br>
<b>Lijsten serializen</b>
  <br>
  <br>
{% highlight csharp %}
[ProtoMember(1)]
public List<GeoGebied> EenLijst { get;set;}
{% endhighlight %}
  <br>Bij het serializen van bovenstaande code wordt &#xE9;lk item in die lijst
  ook geserialized. Wanneer je vijf lijsten hebt met steeds dezelfde objecten
  scheelt dat veel ruimte op HDD en (na deserializen) veel memory! Daarom
  wilde ik alleen de ID&apos;s van de gebieden opslaan. Die kan ik dan runtime
  weer terugzoeken. Dit is niet triviaal, maar met een kleine hack vrij snel
  te fixen:
  <br>
  <br>
  <br>
{% highlight csharp %}
    // dit is de definitie van de BkTreeNode uit de vorige post
    [ProtoContract]
    public class BkTreeNode<T>
        where T : class, IZoekboxItem
    {
        [ProtoMember(1)]
        public string Key { get; set; }
        
        [ProtoMember(2)]
        public Dictionary<int, BkTreeNode<T>> Nodes { get; set; }
        [ProtoMember(4)]
        // bij de eerste aanroep moet deze NULL teruggeven anders lukt deserialisatie niet!
        internal List<int> ProtoItems
        {
            get { return Items.Count == 0 ? null : Items.Select(i => i.Id).ToList(); }
            set { _protoList = value; }
        }
        private List<int> _protoList;
        private List<IZoekboxItem> _items;
        private List<IZoekboxItem> Items
        {
            get
            {
                if (_items.Count == 0 && _protoList != null)
                {
                    // hier terugmappen. Je eigen implementatie zal er anders uitzien
                    _items = _protoList
                        .Select(i => 
                            ZoekboxController.LongCache.IxGebiedId.ContainsKey(i) 
                            ? (IZoekboxItem)ZoekboxController.LongCache.IxGebiedId[i].First()
                            : null)
                        .Where(i=> i != null)
                        .ToList();
                    _protoList = null;
                }
                return _items;
            }
            set
            {
                _items = value;
            }
        }
        /// <summary>
        /// Don't use, needed for serialization
        /// </summary>
        public BkTreeNode()
        {
            Nodes = new Dictionary<int, BkTreeNode<T>>();
            ProtoItems = new List<int>();
            Items = new List<IZoekboxItem>();
        }
        public BkTreeNode(string s, T item)
        {
            /* default ctor */
        }
        public void Add(string s, T item)
        {
            /* ... */
        }
        public List<T> Query(string searchTerm, int maxDistance, ref int hits)
        {
            /* ... */
        }
    }
{% endhighlight %}
  <br>
  <br>Werking is dus hetzelfde gebleven, maar tijdens (de)serializen wordt alleen
  het ID opgeslagen
  <img src="http://tweakimg.net/g/s/smile.gif" width="15"
  height="15" alt=":)">.
  <br>
  <br>
<b>Morgen</b>
  <br>Oud-en-nieuw. Serie is afgelopen. In het volgende jaar weer met goede
  moed helemaal los op een nieuw project! Als ik een publiek beschikbare
  demo heb zal ik de link posten.</p>
   
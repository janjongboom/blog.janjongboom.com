---
layout:         post-tweakers
title:          "Intelligente suggesties, deel 2: Volledige matching en typfouten"
date:           2010-12-28T13:23:00.000Z
categories:     Algoritmes
originalUrl:    http://glamour.tweakblogs.net/blog/5842/intelligente-suggesties-deel-2-volledige-matching-en-typfouten.html
originalName:   Coding Glamour
language:       nl
commentCount:   7
commentUrl:     http://glamour.tweakblogs.net/blog/5842/intelligente-suggesties-deel-2-volledige-matching-en-typfouten.html#reacties
---

   <p class="article">Dit is deel 2 in een serie over de techniek uit een &apos;intelligente&apos;
  zoekbox.
  <ul>
    <li><a href="http://glamour.tweakblogs.net/blog/5832/intelligente-suggesties-deel-1-introductie-en-startswith.html"
      rel="external">1. Introductie en &apos;StartsWith&apos;</a>
    </li>
    <li><b>2. Volledige matching en typfouten</b>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5849/intelligente-suggesties-deel-3-uitspraak-en-hierarchie.html"
      rel="external">3. Uitspraak en hierarchie</a>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5853/intelligente-suggesties-deel-4-aantallen-caching-en-protocol-buffers.html"
      rel="external">4. Aantallen, caching en Protocol Buffers</a>
    </li>
  </ul>Na gisteren in te zijn gegaan op de basis van de applicatie, vandaag gaan
  we dieper in op Burkhard-Keller trees voor effici&#xEB;nte volledige matching,
  en het ondervangen van typfouten.
  <!--more-->
  <br>
  <br>
<b>Burkhard-Keller tree</b>
  <br>Een BK-tree is een tree-based datastructuur om snel en effici&#xEB;nt
  woorden te vinden die op elkaar lijken. We moeten dus eerst een algoritme
  hebben dat woorden kan vergelijken, en een getal kan geven aan het verschil.
  Hiervoor heb ik eerder al de <a href="http://glamour.tweakblogs.net/blog/5780/typfouten-levenshtein-en-burkhard-keller-trees.html"
  rel="external">Levenshtein-distance</a> voor gekozen, en als implementatie
  de &apos;YetiLevenshtein&apos; methode uit het <a href="http://corsis.svn.sourceforge.net/viewvc/corsis/trunk/Tenka.Text/Tenka.Text/TextMath.cs?revision=396&amp;view=markup#l_777"
  rel="external">Tenka.Text project</a>.
  <br>
  <br>De 400.000 verschillende &apos;keys&apos; die we in deel 1 hebben bepaald
  gaan we nu rangschikken in deze boom. Als voorbeeld de volgende set:
  <br><a name="more"></a>
  <ul>
    <li>Jan</li>
    <li>Jas</li>
    <li>Jaap</li>
    <li>Jak</li>
    <li>Aap</li>
  </ul>Intern doet een BK-tree het volgende: begin bovenaan (bij &apos;Jan&apos;
  bv.), en kijk naar het verschil tussen het bovenste element en je volgende
  element (&apos;Jas&apos;). Het verschil is &apos;1&apos;; dus we tekenen
  van boven een tak naar beneden met waarde &apos;1&apos;.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/bk.png" title="http://www.100procentjan.nl/tweakers/bk.png"
  alt="http://www.100procentjan.nl/tweakers/bk.png">
  <br>We doen nu hetzelfde voor het volgende element. Het verschil tussen &apos;Jan&apos;
  en &apos;Jaap&apos; is &apos;2&apos;.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/bk(2).png" title="http://www.100procentjan.nl/tweakers/bk(2).png"
  alt="http://www.100procentjan.nl/tweakers/bk(2).png">
  <br>Bij &apos;Jak&apos; doen we dit weer. Het verschil tussen &apos;Jan&apos;
  en &apos;Jak&apos; is &apos;1&apos;. Er loopt al een tak met waarde &apos;1&apos;
  dus die lopen we af, en we vergelijken nu &apos;Jak&apos; met &apos;Jas&apos;.
  Verschil is &apos;1&apos;, dus we tekenen hier de nieuwe tak.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/bk(3).png" title="http://www.100procentjan.nl/tweakers/bk(3).png"
  alt="http://www.100procentjan.nl/tweakers/bk(3).png">
  <br>Same, same voor &apos;Aap&apos;. Verschil tussen &apos;Jan&apos; en &apos;Aap&apos;
  is &apos;2&apos;, verschil tussen &apos;Aap&apos; en &apos;Jaap&apos; is
  &apos;1&apos;.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/bk(4).png" title="http://www.100procentjan.nl/tweakers/bk(4).png"
  alt="http://www.100procentjan.nl/tweakers/bk(4).png">
  <br>
  <br>The beauty of it is dat we met deze boom snel kunnen bepalen of een item
  in de boom voorkomt. Willen we weten of &apos;Jak&apos; in de boom staat,
  beginnen we bovenaan: verschil tussen &apos;Jan&apos; en &apos;Jak&apos;
  is 1, verschil tussen &apos;Jas&apos; en &apos;Jak&apos; is 1, verschil
  tussen &apos;Jak&apos; en &apos;Jak&apos; is 0: gevonden!
  <br>
  <img src="http://www.100procentjan.nl/tweakers/bk(5).png" title="http://www.100procentjan.nl/tweakers/bk(5).png"
  alt="http://www.100procentjan.nl/tweakers/bk(5).png">
  <br>We hebben nu dus maar 3 vergelijkingen hoeven doen, terwijl er 4 waardes
  zijn die dezelfde beginkarakters hebben. Dit loopt nog veel meer op wanneer
  je een gigantische set hebt, want je kunt met slechts 9 vergelijkingen
  alle 400.000 waardes afzoeken!
  <br>
  <br>
<b>Fuzzy matching</b>
  <br>Een BK-tree is ook goed in &apos;fuzzy&apos; matching, waarin er tussen
  de woorden een verschil mag zitten; ideaal om typfouten af te vangen. Bijvoorbeeld:
  we willen alle woorden in de boom vinden waarin het verschil met &apos;Aak&apos;
  maximaal 1 is. We beginnen bovenaan: verschil tussen &apos;Aak&apos; en
  &apos;Jan&apos; is 2, we gaan nu alle bomen af waarvoor geldt: waardeVanTak
  BETWEEN verschil - maximaalVerschil AND verschil + maximaalVerschil. In
  dit geval dus: 1, 2, 3.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/bk(6).png" title="http://www.100procentjan.nl/tweakers/bk(6).png"
  alt="http://www.100procentjan.nl/tweakers/bk(6).png">
  <br>We doen nu weer hetzelfde: Verschil tussen &apos;Jas&apos; en &apos;Aak&apos;
  is 2, dus we gaan weer bomen 1, 2 en 3 af. Het verschil tussen &apos;Jak&apos;
  en &apos;Aak&apos; is 1, dit valt binnen de grens: &apos;Jak&apos; is dus
  een match. Er zijn geen takken hieronder; maar anders zouden we 0, 1 en
  2 aflopen.
  <br>Aan de andere kant is het verschil tussen &apos;Jaap&apos; en &apos;Aak&apos;
  ook 2, en tussen &apos;Aap&apos; en &apos;Aak&apos; 1. Ook hier geldt hetzelfde:
  &apos;Aap&apos; is een match.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/bk(7).png" title="http://www.100procentjan.nl/tweakers/bk(7).png"
  alt="http://www.100procentjan.nl/tweakers/bk(7).png">
  <br>Zoals je ziet scheelt het in een kleine set niets, maar bij grote sets
  met veel verschil tussen de data heb je maar zo&apos;n 900 vergelijkingen
  nodig om alle 400.000 keys te evalueren! Typfouten worden hiermee makkelijk
  verholpen, aangezien &apos;Amstredam&apos; en &apos;Amsterda&apos; allebei
  &apos;Amsterdam&apos; als suggestie gaan vinden.
  <br>
  <br>
<b>BK-tree in C#</b>
  <br>
  <br>
{% highlight csharp %}
    public class BkTreeNode<T>
        where T : class
    {
        public string Key { get; set; }
        
        public Dictionary<int, BkTreeNode<T>> Nodes { get; set; }
        private List<T> Items { get; set; }
        public BkTreeNode(string identifier, T item)
        {
            Key = identifier;
            Nodes = new Dictionary<int, BkTreeNode<T>>();
            Items = new List<T>();
            if(item != null)
            {
                Items.Add(item);
            }
        }
        public void Add(string identifier, T item)
        {
            // bereken de afstand
            int ix = EditDistance.YetiLevenshtein(identifier, Key);
            // als de afstand 0 is dan kennen we dit item al, we voegen het gebied toe aan de lijst
            if (ix == 0)
            {
                Items.Add(item);
                return;
            }
            // als de afstand nog niet bestaat
            if (!Nodes.ContainsKey(ix))
            {
                // voeg een nieuwe node toe
                Nodes.Add(ix, new BkTreeNode<T>(identifier, item));
            }
            else
            {
                // anders ga naar de node met dezelfde afstand
                Nodes[ix].Add(identifier, item);
            }
        }
        public List<T> Query(string searchTerm, int maxDistance)
        {
            List<T> nodes = new List<T>();
            // verschil tussen zoektermen
            int levenshteinDiff = EditDistance.YetiLevenshtein(searchTerm, this.Key);
            if (levenshteinDiff <= maxDistance) nodes.AddRange(this.Items);
            // alle bomen die qua distance
            // dist BETWEEN verschil - maxDistance AND verschil + maxDistance
            foreach (var distance in Enumerable.Range(levenshteinDiff - maxDistance, (maxDistance * 2) + 1))
            {
                if (Nodes.ContainsKey(distance))
                {
                    nodes.AddRange(Nodes[distance].Query(searchTerm, maxDistance));
                }
            }
            return nodes.ToList();
        }
        public override string ToString()
        {
            return Key + " (" + Nodes.Count + ")";
        }
    }
{% endhighlight %}
  <br>
  <br>
<b>Gebruik</b>
  <br>
  <br>
{% highlight csharp %}
BkTreeNode<GeoGebied> root = new BkTreeNode<GeoGebied>("amsterdam", null); // kies een triviale waarde
// doe dit voor al je items in de lijst
root.Add("rotterdam", geoGebiedRotterdam); 
List<GeoGebied> queryResult = root.Query("amsteldam", 1);
Assert.That(queryResult.Count(), Is.EqualTo(1)); // yay!
{% endhighlight %}
  <br>
  <br>
<b>Morgen...</b>
  <br>Gaan we in op hierarchie, en het gebruik van SoundEx om op basis van uitspraak
  alternatieven te vinden. Stay tuned!</p>
   
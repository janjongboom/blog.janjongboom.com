---
layout:         post-tweakers
title:          "Intelligente suggesties, deel 1: Introductie en 'StartsWith'"
date:           2010-12-27T13:23:00.000Z
categories:     Algoritmes
originalUrl:    http://glamour.tweakblogs.net/blog/5832/intelligente-suggesties-deel-1-introductie-en-startswith.html
originalName:   Coding Glamour
language:       nl
commentCount:   10
commentUrl:     http://glamour.tweakblogs.net/blog/5832/intelligente-suggesties-deel-1-introductie-en-startswith.html#reacties
---

   <p class="article">Dit is deel 1 in een serie over de techniek uit een &apos;intelligente&apos;
  zoekbox.
  <ul>
    <li><b>1. Introductie en &apos;StartsWith&apos;</b>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5842/intelligente-suggesties-deel-2-volledige-matching-en-typfouten.html"
      rel="external">2. Volledige matching en typfouten</a>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5849/intelligente-suggesties-deel-3-uitspraak-en-hierarchie.html"
      rel="external">3. Uitspraak en hierarchie</a>
    </li>
    <li><a href="http://glamour.tweakblogs.net/blog/5853/intelligente-suggesties-deel-4-aantallen-caching-en-protocol-buffers.html"
      rel="external">4. Aantallen, caching en Protocol Buffers</a>
    </li>
  </ul>Enkele weken geleden werd mij een functioneel ontwerp in de handen gedrukt
  met als enige opmerking: &apos;kijk eens of we dit kunnen maken&apos;.
  In twee weken bouwtijd was <a href="http://glamour.tweakblogs.net/blog/5813/video!-on-the-fly-zoeksuggesties-levenshtein-en-soundex-in-de-praktijk.html"
  rel="external">dit het resultaat</a>. Vandaag deel 1 in een serie over
  de techniek die het mogelijk maakt om in fracties van een seconde intelligente
  suggesties te geven.
  <br>
  <br>
<b>Doelen</b>
  <ul>
    <li>Tonen van suggesties op basis van de input van de gebruiker</li>
    <li>Suggesties kunnen zowel geheel matchen (&apos;Amsterdam&apos;), of gedeeltelijk
      (&apos;Amste&apos;)</li>
    <li>Hierarchie moet ondersteunt worden (&apos;Amsterdam, Noord-Holland&apos;;
      &apos;Wibautstraat, Amsterdam&apos;)</li>
    <li>Het aantal woningen dient naast de suggestie getoond te worden</li>
    <li>Tolerant in invoer (&apos;K&#xF6;og a/d Zaan&apos; moet &apos;Koog aan
      de Zaan&apos; als suggestie geven)</li>
  </ul>Wanneer er geen suggesties te geven zijn, moeten er alternatieven worden
  voorgesteld:
  <ul>
    <li>Op basis van uitspraak gebieden vinden die hetzelfde klinken (&apos;Wiboudstraat&apos;
      en &apos;Wibautstraat&apos;)</li>
    <li>Tolerantie voor typfouten (&apos;Utrect&apos;)</li>
    <li>Omdraaien van de opdracht (&apos;Amsterdam, Pijp&apos; wordt &apos;Pijp,
      Amsterdam&apos;)</li>
  </ul><a name="more"></a>
  <br>
<b>Normaliseren van namen en zoekacties</b>
  <br>Voor we data uit de database gaan halen, is het van belang om alle namen
  te normaliseren. Denk hierbij aan het strippen van spaties en <a href="http://glamour.tweakblogs.net/blog/5732/diakritische-tekens-en-soundex-in-net.html"
  rel="external">diakrieten</a>, en het gebruik van synoniemen.
  <br>
  <br>
{% highlight csharp %}
        private static Regex _alleenWordChars = new Regex(@"[^a-z0-9]+", RegexOptions.Compiled);
        public string NormaliseerNaam(string q)
        {
            q = q.Trim();
            q = NormaliseerHoofdlettergebruik(q);
            q = NormaliseerDiakritisch(q);
            q = NormaliseerSynoniemen(q);
            // alles wat nu nog geen a-z0-9 eruit strippen
            q = _alleenWordChars.Replace(q, String.Empty);
            return q;
        }
        private string NormaliseerHoofdlettergebruik (string q)
        {
            return q.ToLowerInvariant();
        }
        private static Encoding removal = Encoding.GetEncoding(Encoding.ASCII.CodePage, new EncoderReplacementFallback(""), new DecoderReplacementFallback(""));
        public string NormaliseerDiakritisch(string q)
        {
            string normalized = q.Normalize(NormalizationForm.FormD);
            byte[] bytes = removal.GetBytes(normalized);
            return Encoding.ASCII.GetString(bytes);
        }
        private static Dictionary<string, string> _synoniemen;
        private string NormaliseerSynoniemen(string q)
        {
            if (_synoniemen == null)
            {
                _synoniemen = new Dictionary<string, string>
                                 {
                                     { "ad", "aan de" },
                                     { "a/d", "aan de" },
                                     { "aan den", "aan de" },
                                     { "1e", "eerste" },
                                     { "2e", "tweede" },
                                     { "3e", "derde" },
                                 };
            }
            // special cases ; regex is te langzaam
            if (q.StartsWith("de ")) q = q.Substring(3);
            if (q.StartsWith("het ")) q = q.Substring(4);
            if (q.Contains(" in ")) q = q.Replace(" in ", " ");
            if (q.EndsWith(" in")) q = q.Substring(0, q.Length - 3);
            foreach(var syn in _synoniemen)
            {
                q = q.Replace(syn.Key, syn.Value);
            }
            return q;
        }
{% endhighlight %}
  <br>
  <br>
<b>Model</b>
  <br>Voor het opslaan van de verschillende gebieden maken we gebruik van GIS-data
  die we aankopen. Tijdens de eerste run trekken we dit uit de database en
  slaan we dit op in een in-memory lijst. Van elk gebied hebben we nodig:
  <br>
  <br>
{% highlight csharp %}
    public class GeoGebied
    {
        // Straat, Buurt, Regio etc. (gebruik hier een 'byte' voor, lekker efficient)
        public Niveau Niveau { get; set; }
        // Naam van het gebied (officiële schrijfwijze)
        public string Naam { get; set; }
        // Uniek ID
        public int Id { get; set; }
        // Het ID van de parent (bv. Zaandam heeft 'Gemeente Zaanstad')
        public int Parent { get; set; }
        
        public string[] Keys { get; set; }
    }
{% endhighlight %}
  <br>Speciaal geval hierboven is de array van &apos;Keys&apos;. Dit zijn alle
  zoektermen waarop gezocht kan worden en waarin dit gebied terug moet komen.
  Denk hierbij bij &apos;Den Haag&apos; aan &apos;denhaag&apos; en &apos;haag&apos;.
  De reden dat we dit doen is omdat je altijd een <b>StartsWith</b> wil doen
  en geen <b>Substring</b>, omdat dat niet te indexen valt.
  <br>
  <br>
<b>Gebieden vinden (StartsWith)!</b>
  <br>Gebieden vinden we op basis van hun Keys. Wanneer een bezoeker &apos;Amste&apos;
  intypt willen we alle gebieden vinden die een key hebben die begint met
  &apos;amste&apos;. Voor dit doel hebben we een index nodig; maar die is
  niet zo makkelijk te leggen. Daarom kies ik er hier voor om de index op
  de eerste twee karakters te leggen. Dit doen we voor elk element in de
  &apos;Keys&apos; array.
  <br>
  <br>
{% highlight text %}
IxTwoChar['am'] -> 'amsterdam', 'amstelveen', 'amsterdamsestraatweg' etc.
IxTwoChar['ha'] -> 'den haag', 'hattemerbroek', etc.
{% endhighlight %}
  <br>We kunnen hierdoor al snel 99,8% van alle mogelijkheden schrappen door
  alleen te kijken naar de eerste twee karakters. Er zitten per key zo&apos;n
  600 entiteiten onder en die zijn in een duizendste van een seconde te doorzoeken.
  <br>
  <br>Morgen dieper de algoritmes in om effici&#xEB;nt gebieden te vinden waarbij
  de input volledig matcht, en op typfouten.</p>
   
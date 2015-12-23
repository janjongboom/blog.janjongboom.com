---
layout:         post-tweakers
title:          "Single byte string in C#"
date:           2010-12-16T13:26:00.000Z
categories:     Algoritmes
originalUrl:    http://glamour.tweakblogs.net/blog/5759/single-byte-string-in-c.html
originalName:   Coding Glamour
language:       nl
commentCount:   14
commentUrl:     http://glamour.tweakblogs.net/blog/5759/single-byte-string-in-c.html#reacties
---

   <p class="article"><b>Definitie van een string</b>
  <br>In .NET is een string een verzameling karakters in Unicode. Hierdoor zijn
  er twee bytes per karakter nodig, plus twee bytes voor het aantal karakters
  in de string.
  <br>
  <br>
{% highlight csharp %}
// de string "A" staat in memory als de volgende 4 bytes:
00 01 00 41
// twee bytes met het getal 1, voor het aantal elementen (1 dus)
// twee bytes met de code voor de letter, in dit geval 0x41
{% endhighlight %}
  <br>Voordeel hiervan is dat bijna alle karakters in een string kunnen voorkomen.
  Nadeel is dat wanneer je alleen &apos;eenvoudige&apos; karakters gebruikt
  (geen fancy tekens als &#xE1; of U+263A) dat je twee keer zoveel geheugen
  alloceert dan eigenlijk nodig is. Normaal geen enkel probleem.
  <br>
  <br>
<b>Maar als geheugengebruik kritisch is?</b>
  <br>Wanneer je geheugengebruik een belangrijk punt van je applicatie is, en
  er bovendien veel (en ik bedoel hier v&#xE9;&#xE9;l) strings hebt, dan
  kan het geheugengebruik een probleem worden. Oplossing is om je strings
  op te slaan als arrays van &apos;bytes&apos; in plaats van &apos;char&apos;.
  Een byte heeft namelijk een width van 1 byte (what&apos;s in a name). Je
  kunt dan alleen wel maximaal 255 verschillende karakters gebruiken in je
  strings.
  <!--more-->
  <br>
<b>Implementatie</b>
  <br>Hieronder een simpele implementatie van bovenstaand principe met een voorbeeldimplementatie
  van &apos;StartsWith&apos; en &apos;Equals&apos;:
  <br>
  <br>
{% highlight csharp %}
public static class StringExtender
{
    public static byte[] ToOneWidthByteArray(this string s)
    {
        if (s.Any(c => c > 255))
            throw new ArgumentException("Chars with an ASCII value of over 255 are not supported");
        return s.Select(ch => (byte)ch).ToArray();
    }
}
public static class ByteArrayExtender
{
    public static bool StartsWith(this byte[] b, string value)
    {
        for (int i = 0; i < value.Length; i++)
        {
            if ((byte) value[i] != b[i]) return false;
        }
        return true;
    }
    public static bool Equals(this byte[] b, string value)
    {
        if (value.Length != b.Length) return false;
        return b.StartsWith(value);
    }
}
{% endhighlight %}
  <br>
  <br>
<b>Performance</b>
  <br>Om ook iets zinnigs te kunnen zeggen over de performance hebben we een
  testje nodig! Even 1.000.000 miljoen strings vergelijken (bovenstaande
  implementatie van &apos;StartsWith&apos; tegen de native &apos;String.StartsWith&apos;).
  <br>
  <br>
{% highlight csharp %}
string comparisonString = "amsterdam";
for (int i = 0; i < 1000000; i++)
{
    // doe een Ordinal startsWith (snelste)
    bool x = comparisonString.StartsWith("a", StringComparison.Ordinal);
}
// String.StartsWith took 42,15 ms.
// Let op! Deze methode wordt ook meegenomen in de timing.
byte[] comparisonByteArray = "amsterdam".ToOneWidthByteArray();
for (int i = 0; i < 1000000; i++)
{
    bool y = comparisonByteArray.StartsWith("a");
}
// Byte[].StartsWidth took 51,75 ms.
{% endhighlight %}
  <br>
  <br>
<b>Dus?</b>
  <br>Performance is wat minder, maar het geheugengebruik scheelt aanzienlijk
  (in onze case van 300 MB -&gt; 190 MB). De performance-loss is weliswaar
  +20% maar in de praktijk niet merkbaar. Mocht je dus ooit tegen dit probleem
  aanlopen; het k&#xE1;n een oplossing zijn maar wel met een prijs.</p>
   
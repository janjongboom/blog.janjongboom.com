---
layout:         post-tweakers
title:          "Diakritische tekens en Soundex in .NET"
date:           2010-12-14T11:17:00.000Z
categories:     Algoritmes
originalUrl:    http://glamour.tweakblogs.net/blog/5732/diakritische-tekens-en-soundex-in-net.html
originalName:   Coding Glamour
language:       nl
commentCount:   3
commentUrl:     http://glamour.tweakblogs.net/blog/5732/diakritische-tekens-en-soundex-in-net.html#reacties
---

   <p class="article">In Nederland kennen we zo&apos;n 240.000 geografische entiteiten (straten,
  buurten, plaatsen, gemeentes, etc.) die gebruik maken van <a href="http://connect.nen.nl/~/Preview.aspx?artfile=437043&amp;RNR=83617"
  rel="external">NEN-norm 5825</a> voor de offici&#xEB;le schrijfwijze. Een
  norm waarin g&#xE9;&#xE9;n diakritische tekens mogen worden gebruikt. So
  far so good.
  <br>
  <br>
<i><a href="http://nl.wikipedia.org/wiki/Diakritisch_teken" rel="external">Wikipedia</a> over diakrieten: Een diakritisch teken is een teken dat boven, onder of door een letter gezet wordt en nodig is voor de uitspraak. Met diakritische tekens kunnen verschillende aspecten van de uitspraak worden aangegeven. Voorbeelden hiervan zijn de tekens op &#xE9;, &#xE2;, &#xF6;.</i>
  <br>
  <br>
<b>Zelfde data, andere schrijfwijze?</b>
  <br>So far so good, tot het CBS met een nieuwe aanlevering van <a href="http://www.funda.nl/buurtinfo/zaandam/kalf/kenmerken/"
  rel="external">buurtinformatie</a> komt. Een groot Excel document waarin
  ze de schrijfwijze van buurten zoals de gemeente deze hanteert overnemen;
  waar uiteraard w&#xE9;l diakritische tekens kunnen voorkomen. Gevolg: problemen
  bij het koppelen van de nieuwe CBS-data, aan onze bestaande data.
  <br>
  <br>Normalisatietijd dus!
  <br>
  <!--more-->
  <br>
<b>Normaliseren van buurt- en gemeentenamen tussen twee datasets</b>
  <br>1. Vind alle buurt / gemeente combinaties die direct matchen.
  <br>2. Verwijder diakritische tekens, en herhaal 1.
  <br>3. Nog niet gelukt? Gebruik het fonetische algoritme <a href="http://en.wikipedia.org/wiki/Soundex"
  rel="external">Soundex</a> om overeenkomstige gebieden te vinden.
  <br>
  <br>Nu hebben we voor bovenstaande stappen wel wat code nodig:
  <br>
  <br>
<b>Diakrieten verwijderen in C#</b>
  <br>Unicode kent een aantal schrijfwijzen; waarin de output hetzelfde is,
  maar de binaire representatie hetzelfde. Deze staan beschreven in de
  <a
  href="http://unicode.org/reports/tr15/tr15-23.html" rel="external">Unicode Normalization Forms</a>. FormD is voor het verwijderen van diakritische
    tekens erg handig, omdat hierin het teken <i>&#xFB;</i> wordt gerepresenteerd
    als 2 karakters: de &apos;u&apos;, en de toevoeging &apos;^&apos; als los
    karakter met een eigen unicode teken. In .NET is voor het normalizeren
    van Unicode de functie &apos;Normalize&apos; beschikbaar, waarin ook FormD
    beschikbaar is.
    <br>
    <br>
    <br>
{% highlight csharp %}
string q = "Wûnseradiel";
char[] normalised = q.Normalize(NormalizationForm.FormD).ToCharArray();
q = new string(normalised.Where(c => (int) c <= 127).ToArray());
// q == "Wunseradiel"
{% endhighlight %}
    <br>
    <br>
<b>Soundex in C#</b>
    <br>Soundex is een fonetisch algoritme dat gebruikt kan worden om 2 strings
    te vergelijken op uitspraak. In de meeste SQL dialecten is een vorm van
    dit algoritme beschikbaar, maar meestal in het Engels. Daarom hieronder
    een Nederlandse versie van Soundex, op basis van een artikel van <a href="http://dpatrickcaldwell.blogspot.com/2009/06/soundex-extension-method-for-c.html"
    rel="external">D. Patrick Caldwell</a>.
    <br>
    <br>
{% highlight csharp %}
var a = DutchSoundex("Overeisel"); // O4070205
var b = DutchSoundex("Overrijssel"); // O4070205
// omg! A en B zijn gelijk! It's magic!
private static Regex simplify = new Regex(@"(\d)\1*D?\1+", RegexOptions.Compiled);
public string DutchSoundex(string s)
{
    // encoding info, e.g. M heeft waarde 6
    const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const string codes = "01230420002566012723044802";
    // karakters vervangen
    Dictionary<string, string> replacements = new Dictionary<string, string>()
                                                  {
                                                      {"QU", "KW"},
                                                      {"SCH", "SEE"},
                                                      {"KS", "XX"},
                                                      {"KX", "XX"},
                                                      {"KC", "KK"},
                                                      {"CK", "KK"},
                                                      {"DT", "TT"},
                                                      {"TD", "TT"},
                                                      {"CH", "GG"},
                                                      {"SZ", "SS"},
                                                      {"IJ", "YY"}
                                                  };
    s = s.ToUpper();
    // vervang de waardes in de dictionary
    foreach (var replacementRule in replacements)
        s = s.Replace(replacementRule.Key, replacementRule.Value);
    StringBuilder coded = new StringBuilder();
    // bereken de waardes op basis van de encoding array
    for (int i = 0; i < s.Length; i++)
    {
        int index = chars.IndexOf(s[i]);
        if (index >= 0)
            coded.Append(codes[index]);
    }
    string result = coded.ToString();
    // repeating karakters vervangen
    result = simplify.Replace(result, "$1").Substring(1);
    // return the first character followed by the coded string
    return string.Format("{0}{1}", s[0], result);
}
{% endhighlight %}
    <br>
    <br>Op basis van regel 2. en 3. hebben we 94% van de probleemgevallen automatisch
    kunnen fixen!</p>
   
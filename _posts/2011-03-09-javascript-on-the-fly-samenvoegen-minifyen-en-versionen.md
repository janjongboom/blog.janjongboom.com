---
layout:         post-tweakers
title:          "Javascript on-the-fly samenvoegen, minifyen en versionen"
date:           2011-03-09T13:42:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6245/javascript-on-the-fly-samenvoegen-minifyen-en-versionen.html
originalName:   Coding Glamour
language:       nl
commentCount:   16
commentUrl:     http://glamour.tweakblogs.net/blog/6245/javascript-on-the-fly-samenvoegen-minifyen-en-versionen.html#reacties
---

   <p class="article">Het samenvoegen van meerdere javascript files, en het minifyen van dezelfde
  javascript is een optimalisatie die flink effect kan hebben op de performance
  van je website; en een standaardadvies van optimalisatietools. Vandaar
  hier de techniek die wij gebruiken voor onze nieuwe mobiele website om
  javascript samen te voegen, te minifyen met YUI compressor, en automatisch
  te versionen.
  <br>
  <br>
<b>Welke javascript is nodig?</b>
  <br>Om op een willekeurige pagina aan te geven welke javascript benodigd is,
  kunnen we inhaken op het &apos;Page_Init()&apos; event dat nog steeds bestaat
  in ASP.NET MVC. Dit draait voordat de view zal worden gerenderd. De syntax
  hiervoor is:
  <br>
  <br>
{% highlight csharp %}
// onderaan je .aspx of .master:
<script runat="server">
    protected void Page_Init(object sender, EventArgs e)
    {
        ScriptHelper.RegisterScript("/js/jquery.js");
        ScriptHelper.RegisterScript("/js/global.js");
    }
</script>
{% endhighlight %}
  <br>Wanneer je bovenstaande code in je masterpage zet, kan je tevens per view
  een zelfde blokje toevoegen. Deze scripts worden dan n&#xE1; de scripts
  in je masterpage toegevoegd (volgorde is nogal eens belangrijk bij javascript
  bestanden :-)).
  <!--more-->
<b>Renderen</b>
  <br>Op een willekeurig punt in je pagina (of masterpage) kan je kiezen om
  de scripts te renderen, dankzij een toevoeging aan de HtmlHelper.
  <br>
  <br>
{% highlight html %}
<!-- voeg dit bijvoorbeeld onderaan je pagina toe -->
<%=Html.RenderScripts() %>
<!-- hierna kan je nog losse stukken script doen doen -->
{% endhighlight %}
  <br>Dit print het volgende stuk code:
  <br>
  <br>
{% highlight html %}
<script src="/resources/javascript/?keys=/js/jquery.js|/js/global.js&1234"></script>
{% endhighlight %}
  <br>De code &apos;1234&apos; achteraan is de samengestelde hash van de losse
  bestanden samen. Als er dus een bestand wijzigt, zal ook de hash wijzigen
  en zal de browser de file opnieuw binnen halen.
  <br>
  <br>
<b>ScriptHelper code</b>
  <br>Om op te slaan welke files moeten worden gerendered in de &apos;keys&apos;
  parameter, kunnen we gebruik maken van de &apos;HttpContext.Current.Items&apos;,
  die gebonden is aan het huidige request. Hieromheen kunnen we de helper
  methodes schrijven die hierboven staan.
  <br>
  <br>
{% highlight csharp %}
public static class ScriptHelper
{
    // hashing instance om snel de hash van een byte[] te berekenen
    private static readonly MurmurHash2UInt32Hack HashingInstance;
    static ScriptHelper()
    {
        HashingInstance = new MurmurHash2UInt32Hack();
    }
    // lijst met scripts, gebonden aan huidige request
    private static List<string> Scripts
    {
        get { return (HttpContext.Current.Items["Scripts"] ?? (HttpContext.Current.Items["Scripts"] = new List<string>())) as List<string>; }
        set { HttpContext.Current.Items["Scripts"] = value; }
    }
    
    // voeg script toe; overal beschikbaar via ScriptHelper.RegisterScript()
    public static void RegisterScript(string jsFile)
    {
        Scripts.Add(jsFile);
    }
    public static string RenderScripts(this HtmlHelper html)
    {
        // let op! zorg dat je het bepalen van de hash ergens cachet. Kost veel CPU anders.
        var scripts = Scripts.ToList();
        // dit is je cache key
        var key = string.Join("|", scripts.OrderBy(s => s).ToArray());
        StringBuilder script = GetFileContent(scripts, html.ViewContext.RequestContext.HttpContext);
        var outputFile = Encoding.UTF8.GetBytes(script.ToString());
        var hashcode = HashingInstance.Hash(outputFile);
        // renderen
        return string.Format("<script src=\"/resources/javascript/?keys={0}&{1}\"></script>", string.Join("|", scripts.ToArray()), hashcode);
    }
    public static StringBuilder GetFileContent (List<string> items, HttpContextBase httpContext)
    {
        // hier nog wat beveiliging omheen zodat ze niet al je files kunnen opvragen :-)
        StringBuilder script = new StringBuilder();
        foreach(var s in items)
        {
            string content = File.ReadAllText(httpContext.Server.MapPath("~/" + s.TrimStart('/')), Encoding.UTF8);
            script.AppendLine(content);
        }
        return script;
    }
}
/// <summary>
/// Fast hashing algorithm
/// </summary>
internal class MurmurHash2UInt32Hack
{
    public UInt32 Hash(Byte[] data)
    {
        return Hash(data, 0xc58f1a7b);
    }
    const UInt32 m = 0x5bd1e995;
    const Int32 r = 24;
    [StructLayout(LayoutKind.Explicit)]
    struct BytetoUInt32Converter
    {
        [FieldOffset(0)]
        public Byte[] Bytes;
        [FieldOffset(0)]
        public UInt32[] UInts;
    }
    public UInt32 Hash(Byte[] data, UInt32 seed)
    {
        Int32 length = data.Length;
        if (length == 0)
            return 0;
        UInt32 h = seed ^ (UInt32)length;
        Int32 currentIndex = 0;
        // array will be length of Bytes but contains Uints
        // therefore the currentIndex will jump with +1 while length will jump with +4
        UInt32[] hackArray = new BytetoUInt32Converter { Bytes = data }.UInts;
        while (length >= 4)
        {
            UInt32 k = hackArray[currentIndex++];
            k *= m;
            k ^= k >> r;
            k *= m;
            h *= m;
            h ^= k;
            length -= 4;
        }
        currentIndex *= 4; // fix the length
        switch (length)
        {
            case 3:
                h ^= (UInt16)(data[currentIndex++] | data[currentIndex++] << 8);
                h ^= (UInt32)data[currentIndex] << 16;
                h *= m;
                break;
            case 2:
                h ^= (UInt16)(data[currentIndex++] | data[currentIndex] << 8);
                h *= m;
                break;
            case 1:
                h ^= data[currentIndex];
                h *= m;
                break;
            default:
                break;
        }
        // Do a few final mixes of the hash to ensure the last few
        // bytes are well-incorporated.
        h ^= h >> 13;
        h *= m;
        h ^= h >> 15;
        return h;
    }
}
{% endhighlight %}
  <br>
  <br>
<b>ResourcesController</b>
  <br>In je pagina wordt nu &#xE9;&#xE9;n request gedaan, maar je krijgt nog
  geen antwoord van de server. Voeg eerst de <a href="http://yuicompressor.codeplex.com/"
  rel="external">YUI compressor voor .NET</a> toe aan je project. En maak
  vervolgens de &apos;ResourcesController&apos; aan:
  <br>
  <br>
{% highlight csharp %}
public ActionResult Javascript(string keys)
{
    // ook hier, zelf cachen gaarne
    var scriptFiles = keys.Split('|').ToList();
    var scripts = ScriptHelper.GetFileContent(scriptFiles, HttpContext).ToString();
    // minification, je kan in een setting zetten of je dit wel / niet wil doen; handig voor debuggen
    scripts = JavaScriptCompressor.Compress(scripts);
    // retouneer met het juiste content type
    return new ContentResult()
        {
            Content = scripts,
            ContentType = "text/javascript"
        };
}
{% endhighlight %}
  <br>
  <br>
<b>Et voila</b>
  <br>De javascript wordt voortaan in 1 request opgehaald, en geminified naar
  de client gestuurd. Scheelt weer wat onnodig snelheidsverlies zonder verlies
  in functionaliteit.</p>
   
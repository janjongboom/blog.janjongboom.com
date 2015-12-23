---
layout:         post-tweakers
title:          "Rails' respond_to in ASP.NET MVC"
date:           2011-01-17T13:15:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/5966/rails-respond_to-in-asp-punt-net-mvc.html
originalName:   Coding Glamour
language:       nl
commentCount:   7
commentUrl:     http://glamour.tweakblogs.net/blog/5966/rails-respond_to-in-asp-punt-net-mvc.html#reacties
---

   <p class="article">In Ruby on Rails is het mogelijk om met <a href="http://www.tokumine.com/2009/09/13/how-does-respond_to-work-in-the-rails-controllers/"
  rel="external">respond_to</a> een actie beschikbaar te maken in andere formaten
  dan HTML met &#xE9;&#xE9;n regel. Pretty neat, omdat je je code zo zonder
  moeite via verschillende interfaces kan gebruiken.
  <br>
  <br>
{% highlight text %}
respond_to do |format|
  format.html
  format.xml  { render :xml => @huis }
  format.json { render :json => @huis }
end
{% endhighlight %}
  <br>In ASP.NET MVC 2 is er niet standaard zo&apos;n oplossing, maar doordat
  MVC zo pluggable is is deze wel eenvoudig toe te voegen.
  <!--more-->
<b>Models en Views</b>
  <br>Hierbij introduceer ik jullie tot de nieuwe site &apos;fudna&apos;. Ze
  tonen huizen en hebben hiervoor de volgende MVC structuur.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/fudnamvc.png" title="http://www.100procentjan.nl/tweakers/fudnamvc.png"
  alt="http://www.100procentjan.nl/tweakers/fudnamvc.png">
  <br>De actie &apos;Index&apos; op de &apos;HuisController&apos; ziet er zo
  uit:
  <br>
  <br>
{% highlight csharp %}
public ActionResult Index(int id)
{
    var model = FudnaDao.GetHuis(id);
    return View(model);
}
{% endhighlight %}
  <br>Wat resulteert in de weergave van dit vernieuwende concept:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/fudnaview.png" title="http://www.100procentjan.nl/tweakers/fudnaview.png"
  alt="http://www.100procentjan.nl/tweakers/fudnaview.png">
  <br>
  <br>
<b>En nu andere formaten</b>
  <br>Allereerst breiden we de standaard routing uit in Global.asax. Naast de
  &apos;standaard&apos; regel voegen we een rule toe die extensies accepteert.
  <br>
  <br>
{% highlight csharp %}
public static void RegisterRoutes(RouteCollection routes)
{
    routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
    // dit is nieuw
    routes.MapRoute(
        "DefaultWithExtension",
        "{controller}/{action}/{id}.{format}",
        new { controller = "Home", action = "Index" } // Parameter defaults
    );
    // dit niet meer
    routes.MapRoute(
        "Default",
        "{controller}/{action}/{id}",
        new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
    );
}
{% endhighlight %}
  <br>Om aan te geven welke formaten we ondersteunen maken we gebruik van
  <a
  href="http://glamour.tweakblogs.net/blog/5892/non-javascript-fallbacks-in-asp-punt-net-mvc.html"
  rel="external">ActionFilterAttributes</a>. Mooi hieraan is dat we het resultaat van elke
    actie kunnen overschrijven in deze filters. Het RespondTo filter zou er
    ongeveer zo uit zien:
    <br>
    <br>
{% highlight csharp %}
public class RespondTo : ActionFilterAttribute 
{
    private Format[] _formats;
    public RespondTo(params Format[] formats)
    {
        _formats = formats;
    }
    public override void OnActionExecuted(ActionExecutedContext filterContext)
    {
        // zoek het model op
        var model = ((ViewResult) filterContext.Result).ViewData.Model;
        // hebben we een format parameter?
        object format;
        filterContext.RouteData.Values.TryGetValue("format",  out format);
        // zoja, dan kijk naar de waarde
        switch(format as string)
        {
            // als json niet ondersteunt; dan return
            case "json":
                if (!_formats.Any(f => f == Format.Json)) return;
                // transformeer het model naar Json
                // en overschrijf het oude Result
                filterContext.Result = new JsonResult { Data = model, JsonRequestBehavior = JsonRequestBehavior.AllowGet };
                break;
            case "xml":
                if (!_formats.Any(f => f == Format.Xml)) return;
                // same same voor XML. Maar dat is lastiger in een one-liner
                using(MemoryStream ms = new MemoryStream()) // simpele serialization
                    using(TextWriter tw = new StreamWriter(ms))
                    {
                        new XmlSerializer(model.GetType()).Serialize(tw, model);
                        ms.Seek(0, SeekOrigin.Begin);
                        // hier zetten we de nieuwe content naar de XML
                        filterContext.Result = new ContentResult { ContentType = "text/xml", Content = new StreamReader(ms).ReadToEnd() };
                    }
                break;
        }
    }
}
public enum Format
{
    Xml,
    Json
}
{% endhighlight %}
    <br>
    <br>
<b>Actie aanpassen</b>
    <br>Aan de bestaande actie hoeven we nu niets meer aan te passen. We zetten
    er enkel een nieuw attribuut op:
    <br>
    <br>
{% highlight csharp %}
[RespondTo(Format.Xml, Format.Json)]
public ActionResult Index(int id)
{
    var model = FudnaDao.GetHuis(id);
    return View(model);
}
{% endhighlight %}
    <br>
    <br>
<b>Resultaat</b>
    <br>En dat was het al. Wanneer we nu &apos;.xml&apos; of &apos;.json&apos;
    toevoegen aan de URL krijgen we de data in dat formaat binnen!
    <br>
    <img src="http://www.100procentjan.nl/tweakers/fudnaxml.png" title="http://www.100procentjan.nl/tweakers/fudnaxml.png"
    alt="http://www.100procentjan.nl/tweakers/fudnaxml.png">
    <br>
    <br>
    <img src="http://www.100procentjan.nl/tweakers/fudnajson.png" title="http://www.100procentjan.nl/tweakers/fudnajson.png"
    alt="http://www.100procentjan.nl/tweakers/fudnajson.png">
</p>
   
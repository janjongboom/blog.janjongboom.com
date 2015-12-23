---
layout:         post-tweakers
title:          "Route constraints op QueryString parameters in ASP.NET MVC"
date:           2011-02-21T13:11:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6174/route-constraints-op-querystring-parameters-in-asp-punt-net-mvc.html
originalName:   Coding Glamour
language:       nl
commentCount:   1
commentUrl:     http://glamour.tweakblogs.net/blog/6174/route-constraints-op-querystring-parameters-in-asp-punt-net-mvc.html#reacties
---

   <p class="article">ASP.NET MVC kent een vrij krachtige routing-engine om URL&apos;s te routen
  naar de actie die daarbij hoort. Naast puur URL&apos;s mappen kan je tevens
  constraints toevoegen om je routings wat te finetunen. Bijvoorbeeld praktisch
  voor de volgende situatie:
  <br>
  <br>
{% highlight text %}
/koop/amsterdam/appartement-12345-straat-1/fotos/
-> moet naar ObjectController.Detail

/koop/amsterdam/appartement-12345-straat-1/reageer/
-> moet naar ObjectController.Contact
{% endhighlight %}
  <br>Door een constraint toe te voegen, kan je onderscheid maken tussen deze
  twee URL&apos;s:
  <br>
  <br>
{% highlight csharp %}
// bijvoorbeeld
routes.MapRoute(
    "object-contact",
    "{aanbod}/{plaats}/{type}-{id}-{adres}/{pagina}",
    /* ... */,
    new { pagina = @"reageer|bezichtiging" });
// als pagina iets anders is dan reageer / bezichtiging matcht de route niet
{% endhighlight %}
  <br>Probleem: wanneer je URL&apos;s van binnen als volgt zijn (omdat ASP.NET
  voor elke URL in je website opslaat of er een fysieke file voor is, en
  bij miljoenen unieke URL&apos;s is dat een <b>huge</b> leak dat niet automatisch
  wordt geflusht):
  <br>
  <br>
{% highlight text %}
/koop/?id=12345&pagina=reageer
{% endhighlight %}
  <br>zijn constraints niet meer mogelijk, want dit wordt niet ondersteunt op
  QueryString parameters. Daarom: de QueryStringConstraint!
  <!--more-->In gebruik heel simpel. Voor bovenstaande URL kan je de volgende route
  schrijven:
  <br>
  <br>
{% highlight csharp %}
routes.MapRoute("object-contact",
    "{aanbod}",
    /* ... */,
    new { pagina = new QueryStringConstraint("bezichtiging|reageer") });
{% endhighlight %}
  <br>En de werking is exact hetzelfde als normaal. The codez:
  <br>
  <br>
{% highlight csharp %}
public class QueryStringConstraint : IRouteConstraint
{
    private readonly Regex _regex;
    public QueryStringConstraint(string regex)
    {
        // ctor slaat de regex op voor further use
        _regex = new Regex(regex, RegexOptions.IgnoreCase);
    }
    public bool Match (HttpContextBase httpContext, Route route, string parameterName, RouteValueDictionary values, RouteDirection routeDirection)
    {
        // zit de paramName uberhaupt in de QS
        if(httpContext.Request.QueryString.AllKeys.Contains(parameterName))
        {
            // doe dan check op de meegegeven regex
            return _regex.Match(httpContext.Request.QueryString[parameterName]).Success;
        }
        // anders return false
        return false;
    }
}
{% endhighlight %}</p>
   
---
layout:         post-tweakers
title:          "Output Cache Substitution (Donut Caching) in ASP.NET MVC 2 en 3"
date:           2011-04-05T12:27:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6358/output-cache-substitution-%28donut-caching%29-in-asp-punt-net-mvc-2-en-3.html
originalName:   Coding Glamour
language:       nl
commentCount:   2
commentUrl:     http://glamour.tweakblogs.net/blog/6358/output-cache-substitution-%28donut-caching%29-in-asp-punt-net-mvc-2-en-3.html#reacties
---

   <p class="article">Dynamische pagina&apos;s, of het nou in PHP, CGI of .NET is, hebben het
  internet gemaakt tot wat het nu is; maar hebben &#xE9;&#xE9;n groot nadeel.
  Voor elk request dient de pagina opnieuw te worden gegenereerd. Oplossing:
  cachen. Nu hebben we hiervoor in ASP.NET MVC het &apos;OutputCache&apos;
  attribuut, dat je op elke Action kan zetten:
  <br>
  <br>
{% highlight csharp %}
// cache voor 1 minuut
[OutputCache(Duration = 60, VaryByParam = "id")]
public ActionResult Detail(int id) {
    // haal model op
    return View();
}
{% endhighlight %}
  <br>
  <br>
<b>Probleem</b>
  <br>Iedereen die deze pagina de komende minuut opvraagt krijgt dezelfde versie
  te zien. Geen probleem voor pagina&apos;s die more-or-less statisch zijn,
  maar funest wanneer je bijvoorbeeld login informatie toont! Voeg je bijvoorbeeld
  Output caching toe aan het standaard ASP.NET MVC 2 project (In VS 2010
  -&gt; New Project -&gt; ASP.NET MVC 2 Web Application) dan krijg je de
  volgende situatie:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/cache1.png" title="http://www.100procentjan.nl/tweakers/cache1.png"
  alt="http://www.100procentjan.nl/tweakers/cache1.png">
  <br>
<i>Overzichtspagina, je ziet de &apos;last update&apos; datum ter referentie</i>
  <br>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/cache2.png" title="http://www.100procentjan.nl/tweakers/cache2.png"
  alt="http://www.100procentjan.nl/tweakers/cache2.png">
  <br>
<i>Nu loggen we in</i>
  <br>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/cache3.png" title="http://www.100procentjan.nl/tweakers/cache3.png"
  alt="http://www.100procentjan.nl/tweakers/cache3.png">
  <br>
<i>De pagina wordt uit cache geladen (zie &apos;last update&apos;) maar er staat nog steeds een &apos;Log on&apos; knop ipv. &apos;Logged in as jan&apos;.</i>
  <!--more-->
<b>Oplossing?</b>
  <br>De techniek om een hele pagina te cachen <i>behalve</i> een of meerdere
  kleine stukjes heet &apos;Output Cache Substitution&apos; of &apos;Donut
  Caching&apos;, maar dit zou in MVC 2 en MVC 3 <a href="http://stackoverflow.com/questions/2806663/donut-caching-asp-net-mvc2"
  rel="external">niet</a>  <a href="http://stackoverflow.com/questions/3964393/net-4-mvc2-output-caching-substitute-name"
  rel="external">meer</a>  <a href="http://stackoverflow.com/questions/4685906/is-donut-caching-available-in-asp-net-mvc-3"
  rel="external">mogelijk</a>  <a href="http://stackoverflow.com/questions/5326230/mvc3-outputcache-removeoutputcacheitem-renderaction"
  rel="external">zijn</a>. Dat roept om een uitdaging!
  <br>
  <br>
<b>Daarom...</b>
  <br>Alvast een sneak preview van een project dat ik binnenkort hoop te open
  sourcen, dat Donut Caching toevoegd aan ASP.NET MVC.
  <br>
  <br>Maak een nieuwe controller &apos;SharedController&apos; aan in het standaard
  MVC project, met daarin de actie &apos;Datum&apos;.
  <br>
  <br>
{% highlight csharp %}
    public class SharedController : Controller
    {
        public ActionResult Datum()
        {
            return View();
        }
    }
{% endhighlight %}
  <br>In de view die hierbij hoort outputten we de huidige datum &amp; tijd:
  <br>
  <br>
{% highlight asp %}
<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<dynamic>" %>
<%=DateTime.Now %>
{% endhighlight %}
  <br>
  <br>We kunnen nu de datum tonen (en dus controleren of er gecachet wordt)
  door in de Shared/Site.master de regel toe te voegen:
  <br>
  <br>
{% highlight asp %}
<p>Last update <% Html.RenderAction("Datum", "Shared"); %></p>
{% endhighlight %}
  <br>Elke keer dat je de pagina nu refresht zie je dat de datum verandert.
  <br>
  <br>
<b>Caching aanzetten</b>
  <br>Ook hier werken we weer met een attribuut dat je moet toevoegen aan je
  Action, met de naam (subject to change) &apos;ActionRenderOptimizer&apos;:
  <br>
  <br>
{% highlight csharp %}
// In Controllers/HomeController.cs
 [ActionRenderOptimizer(OutputCaching = true)]
 public ActionResult Index()
 {
     ViewData["Message"] = "Welcome to ASP.NET MVC!";
     return View();
 }
{% endhighlight %}
  <br>Wanneer je nu de homepage opvraagt zie je dat de datum steeds hetzelfde
  blijft. Deze zit namelijk in cache.
  <br>
  <br>
<b>Deel van de pagina niet cachen?</b>
  <br>Wanneer je nu een deel van je pagina niet wil cachen, vervang je de &apos;Html.RenderAction&apos;
  door &apos;Html.RenderDonutAction&apos;. Om dit te verifieren vervang je
  de regel in je masterpage door:
  <br>
  <br>
{% highlight asp %}
<p>Last update: <% Html.RenderAction("Datum", "Shared"); %></p>
<p>Last update donut: <% Html.RenderDonutAction("Datum", "Shared"); %></p>
{% endhighlight %}
  <br>Roep je nu de pagina op, dan zie je dat een van de twee datums elke keer
  opnieuw wordt gegenereerd!
  <br>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/cache4.png" title="http://www.100procentjan.nl/tweakers/cache4.png"
  alt="http://www.100procentjan.nl/tweakers/cache4.png">
  <br>
<i>Eerste request</i>
  <br>
  <br>
  <img src="http://www.100procentjan.nl/tweakers/cache5.png" title="http://www.100procentjan.nl/tweakers/cache5.png"
  alt="http://www.100procentjan.nl/tweakers/cache5.png">
  <br>
<i>Tweede request</i>
  <br>
  <br>
<b>Binnenkort te downloaden</b>
  <br>Binnenkort te vinden op CodePlex!</p>
   
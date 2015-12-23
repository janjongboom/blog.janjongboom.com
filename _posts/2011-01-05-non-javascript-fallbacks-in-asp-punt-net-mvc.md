---
layout:         post-tweakers
title:          "Non-javascript fallbacks in ASP.NET MVC"
date:           2011-01-05T12:42:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/5892/non-javascript-fallbacks-in-asp-punt-net-mvc.html
originalName:   Coding Glamour
language:       nl
commentCount:   13
commentUrl:     http://glamour.tweakblogs.net/blog/5892/non-javascript-fallbacks-in-asp-punt-net-mvc.html#reacties
---

   <p class="article">Alles op den ganse aarde is tegenwoordig Ajaxified, en een behoorlijk
  aantal websites heeft haar Ajax interacties Javascript-only gemaakt. Nogal
  vervelend als een aanzienlijk deel van je gebruikers onder werktijd je
  website probeert te gebruiken. Met ASP.NET MVC is het behoorlijk gemakkelijk
  gemaakt om eenvoudige interacties ook beschikbaar te maken voor non-Javascript
  clients.
  <br>
  <br>
<b>De &apos;Bewaren&apos; knop</b>
  <br>Men neme als voorbeeld, de &apos;Bewaren als favoriet&apos; functionaliteit
  zoals deze op <a href="http://www.funda.nl/koop/beuningen-gld/huis-47848510-distelakkerstraat-6/"
  rel="external">elke detailpagina</a> te zien is. Een knop met drie states:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/nonjs_bewaren.png" title="http://www.100procentjan.nl/tweakers/nonjs_bewaren.png"
  alt="http://www.100procentjan.nl/tweakers/nonjs_bewaren.png">
  <br>
  <img src="http://www.100procentjan.nl/tweakers/nonjs_bewaarprogress.png"
  title="http://www.100procentjan.nl/tweakers/nonjs_bewaarprogress.png" alt="http://www.100procentjan.nl/tweakers/nonjs_bewaarprogress.png">
  <br>
  <img src="http://www.100procentjan.nl/tweakers/nonjs_bewaard.png" title="http://www.100procentjan.nl/tweakers/nonjs_bewaard.png"
  alt="http://www.100procentjan.nl/tweakers/nonjs_bewaard.png">
  <br>
  <br>Aan de achterkant doet dit niets anders dan een GET naar de controller
  &apos;ClientActie&apos; (GETs zijn goedkoper dan POSTs) via:
  <br>
  <br>
{% highlight js %}
$.get('/clientactie/bewaarobject/?id=47883154', function(d) { /* change state */ }, 'json');
{% endhighlight %}
  <!--more-->
<b>En nu zonder Javascript?!</b>
  <br>Allereerst is het zaak om altijd een werkende link te hebben achter een
  knop. Wanneer je &apos;Telefoon&apos; linkje normaal direct het telefoonnummer
  toont, zorg er dan voor dat de &lt;a href/&gt; naar je contact-pagina wijst.
  Zo breek je je interactie niet. Voor het &apos;Bewaren&apos; linkje hebben
  we de volgende link:
  <br>
  <br>
{% highlight html %}
<a href="?clientactie=bewaarobject" onclick="...">
    <strong><span class="icn-favor">Bewaren als favoriet</span></strong>
</a>
{% endhighlight %}
  <br>Als de gebruiker nu klikt, wordt hij doorgestuurd naar &apos;/huidigepagina/?clientactie=bewaarobject&apos;.
  We moeten dit nu enkel afvangen in de controller die deze pagina serveert.
  <br>
  <br>
<b>Action filter</b>
  <br>In ASP.NET MVC kan je <a href="http://blog.wekeroad.com/blog/aspnet-mvc-securing-your-controller-actions/"
  rel="external">&apos;action filters&apos;</a> gebruiken om via attributes
  op je actions generiek gedrag te implementeren. Een filter voor de &apos;clientactie&apos;
  behavior ziet er ongeveer zo uit:
  <br>
  <br>
{% highlight csharp %}
public class ClientActieHandler : ActionFilterAttribute {
    public override void OnActionExecuting(FilterExecutingContext context) {
        // haal huidige actie uit de context
        var clientactie = context.HttpContext.Request["clientactie"];
        
        if(!string.IsNullOrEmpty(clientactie))
        {
            ClientActieController clientActieController = new ClientActieController();
            
            switch(clientactie)
            {
                case "bewaarobject":
                    // haal huidig ID uit de context
                    // ja dit is niet echt mooi; maar soit
                    var id = int.Parse(context.RouteData.Values["id"].ToString());
                    clientActieController.BewaarObject(id);
                    break;
            }
        }
    }
}
{% endhighlight %}
  <br>Nu kan je je Action decoraten met het attribute:
  <br>
  <br>
{% highlight csharp %}
public class DetailController : Controller {
    // dit is de normale detail controller die de detailpagina's rendert
    
    [ClientActieHandler]
    public ActionResult Overzicht() {
        /* inner working */
    }
}
{% endhighlight %}
  <br>Et voila! Bij elke aanroep wordt bekeken of er nog clientacties zijn die
  verwerkt moeten worden.
  <br>
  <br>
<b>View</b>
  <br>In de view hoeven we geen wijzigingen te maken omdat er hier geen verschillen
  zijn tussen de Javascript en de non-Javascriptgebruiker (pseudo-code):
  <br>
  <br>
{% highlight asp %}
    <% if(Profile.IsStoredObject(Model.Id)) { %>
        <!-- render 'bewaard' knop -->
    <% } else { %>
        <!-- render 'bewaren' knop -->
    <% } %>
{% endhighlight %}</p>
   
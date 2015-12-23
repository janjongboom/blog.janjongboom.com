---
layout:         post-tweakers
title:          "Nieuwe mobiele website, deel 1: Kickoff"
date:           2011-02-09T15:06:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6109/nieuwe-mobiele-website-deel-1-kickoff.html
originalName:   Coding Glamour
language:       nl
commentCount:   6
commentUrl:     http://glamour.tweakblogs.net/blog/6109/nieuwe-mobiele-website-deel-1-kickoff.html#reacties
---

   <p class="article">In de komende weken wil ik aandacht besteden aan het project waar ik op
  dit moment de lead voor ben: de herbouw van ons mobiele platform. Niet
  alleen puur technisch, maar ook een kijkje achter de deur wat betreft project
  management, planning en bepaalde keuzes. Vandaag deel 1: de kickoff.
  <br>
  <br>
  <div style="text-align:center"><a href="http://m.funda.nl" rel="external"><img src="http://www.100procentjan.nl/tweakers/mobiel_oud.png" title="http://www.100procentjan.nl/tweakers/mobiel_oud.png" alt="http://www.100procentjan.nl/tweakers/mobiel_oud.png"></a>
  </div>
  <br>
  <!--more-->
<b>Voortraject</b>
  <br>In de afgelopen maanden heeft ons UX-team nagedacht over de specs, design
  en ondersteunde devices; wat resulteert in een Functioneel Ontwerp (81
  pagina&apos;s), een volledig functionele demo (HTML) en een stapel telefoons
  om op te testen:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/mobiel_telefoons.png" title="http://www.100procentjan.nl/tweakers/mobiel_telefoons.png"
  alt="http://www.100procentjan.nl/tweakers/mobiel_telefoons.png">
  <br>
  <br>
<b>Kickoff meeting</b>
  <br>Wanneer het voortraject klaar is wordt het projectteam (1 UX&apos;er,
  2 Devs, 1 Project Manager, 1 Tester) in een hok gestopt waarin er in een
  uur of twee door het FO en de demo wordt heengelopen. Vooral de demo is
  nogal prettig omdat alle interacties al zichtbaar zijn; bovendien is de
  opgeleverde HTML al productie-waardig (UX is verantwoordelijk voor de HTML
  en CSS) en kunnen we wat betreft de frontend-code al beginnen met knippen
  en plakken.
  <br>
  <br>
<b>Architectuur</b>
  <br>De keuze qua architectuur ligt in handen van de developers in het team,
  in samenwerking met de Software Architect. Binnen dit project heb ik allereerst
  mijn plannen beschreven in samenwerking met mijn fellow dev, en hierna
  vrij snel accoord gekregen vanuit SA. We kiezen binnen dit project om verder
  te bouwen op de API die we toch al <a href="http://glamour.tweakblogs.net/blog/5983/bouw-eens-een-api-met-wcf-deel-1.html"
  rel="external">op de plank hebben liggen</a> en waarop momenteel de andere
  mobiele platformen die we hebben (iPhone, Layar) ook draaien. Voordeel
  hierbij is dat we ook voor deze platformen kunnen profiteren van de investeringen
  die we nu doen in onze service-laag.
  <br>
  <br>
<b>Eh dus?</b>
  <br>Dus gaan we ervoor zorgen dat onze website zo min mogelijk code bevat.
  Neem je als voorbeeld de resultaatlijst, dan ziet deze er globaal zo uit:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/mobiel_nieuw.png" title="http://www.100procentjan.nl/tweakers/mobiel_nieuw.png"
  alt="http://www.100procentjan.nl/tweakers/mobiel_nieuw.png">
  <br>Dat betekent dus dat de informatie over:
  <ul>
    <li>Soort object dat je nu ziet (&apos;Koopwoningen&apos;)</li>
    <li>Beschrijving van je zoekopdracht (&apos;Purmerend | &#xA4; 100.000 - &#xA4;
      200.000 | etc.&apos;)</li>
    <li>Vorige en volgende pagina (beschikbaar? nieuwe URL?)</li>
    <li>Huidige pagina, en totaal aantal pagina&apos;s</li>
  </ul>Als nieuwe metadata moet worden toegevoegd aan de API. Wanneer we dit
  doen hebben we nauwelijks logica in onze website. De code van onze resultaatlijst
  wordt globaal iets als:
  <br>
  <br>
{% highlight html %}
<h1><%=Model.ObjectType %></h1>
<a><%=Model.Omschrijving %></a>
<div class="results-list">
    <% foreach(var obj in Model.Objects) { %>
        <% Html.RenderPartial("ZoekresultaatItem", obj); %>
    <% } %>
</div>
<a href="<%=Model.VorigeUrl%>">Vorige</a>
Pagina <%=Model.Paginanummer %> van <%=Model.PaginaTotaal %>
<a href="<%=Model.VolgendeUrl %>">Volgende</a>
{% endhighlight %}
  <br>Wanneer onze iPhone app van dezelfde metadata gebruik gaat maken hebben
  we bovendien altijd een consistente weergave.
  <br>
  <br>
<b>Next up?</b>
  <br>Nog geen idee, we zijn net begonnen :-)</p>
   
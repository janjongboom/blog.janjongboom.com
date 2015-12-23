---
layout:         post-tweakers
title:          "Expression Trees - Espresso voor je code!"
date:           2010-12-15T09:10:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/5747/expression-trees-espresso-voor-je-code%21.html
originalName:   Coding Glamour
language:       nl
commentCount:   8
commentUrl:     http://glamour.tweakblogs.net/blog/5747/expression-trees-espresso-voor-je-code%21.html#reacties
---

   <p class="article">Eerder gepubliceerd als <a href="http://www.dotnetmag.nl/Artikel/1192/Expression-Trees"
  rel="external">Expression Trees</a> in .NET Magazine Q1 2010. <a href="http://www.dotnetmag.nl/IBL/GetArticle.aspx?code=1192"
  rel="external">Volledige artikel (PDF)</a>
  <br>
  <br>
<i>De in het .Net framework 3.5 ge&#xEF;ntroduceerde &#x2018;expression trees&#x2019;, zijn  absoluut het Microsoft equivalent van DeLonghi&#x2019;s famous espresso:  goed gedoseerd levert het een ongelooflijke boost, maar een kopje teveel en je stuitert alle kanten op.</i>
  <br>
  <br>In dit artikel gaan we in op de vraag wat expression trees zijn en hoe
  ze delen van je code tot honderd keer sneller kunnen maken. Laten we bij
  het begin beginnen: wat zijn expressions eigenlijk? Wellicht het meest
  eenvoudige stuk code demonstreert dit het beste:
  <br>
  <br>
{% highlight csharp %}
1 + 2;
{% endhighlight %}
  <br>
  <br>Dit is een expression pur sang. Het is namelijk: &#x2018;An instruction
  to execute something that will return a value. &#x2019;Uiteraard kunnen
  we deze expression ook wat moeilijker maken, door twee variabelen te gebruiken:
  <br>
  <br>
{% highlight csharp %}
a + b;
{% endhighlight %}
  <br>
  <br>Omdat we soms de expression niet direct willen uitvoeren, kunnen we deze
  expression ook in een delegate stoppen. Een delegate is namelijk niets
  anders dan een expression, een uitvoerbaar stuk code, in een variabele:
  <br>
  <br>
{% highlight csharp %}
PlusDelegate plus = delegate(int a, int b) { return a + b; };
{% endhighlight %}
  <br>
  <br>
<a href="http://www.dotnetmag.nl/IBL/GetArticle.aspx?code=1192" rel="external">Volledige artikel (PDF)</a>
</p>
   
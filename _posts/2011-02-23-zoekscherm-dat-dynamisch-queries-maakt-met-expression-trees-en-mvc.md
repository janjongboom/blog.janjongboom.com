---
layout:         post-tweakers
title:          "Zoekscherm dat dynamisch queries maakt met Expression Trees en MVC"
date:           2011-02-23T13:39:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6183/zoekscherm-dat-dynamisch-queries-maakt-met-expression-trees-en-mvc.html
originalName:   Coding Glamour
language:       nl
commentCount:   5
commentUrl:     http://glamour.tweakblogs.net/blog/6183/zoekscherm-dat-dynamisch-queries-maakt-met-expression-trees-en-mvc.html#reacties
---

   <p class="article">Naar aanleiding van de reactie van Jogai in <a href="http://glamour.tweakblogs.net/blog/6174/route-constraints-op-querystring-parameters-in-asp-punt-net-mvc.html"
  rel="external">Coding Glamour: Route constraints op QueryString parameters in ASP.NET MVC</a>,
  een post over het mappen van een MVC zoekformulier naar een echte SQL query.
  <br>
  <br>
<b>Let&apos;s get it started</b>
  <br>Met behulp van het volgende model wordt een view getoond met daarop een
  formulier:
  <br>
  <br>
{% highlight csharp %}
// model
public class ZoekformulierModel {
    public string Plaatsnaam { get; set; }
    public int PrijsVan { get; set; }
    public int PrijsTot { get; set; }
    public bool IndTuin { get; set; }
    
    /* wat code voor de opties in de selectlist */
}
{% endhighlight %}
  <br>
  <br>
{% highlight html %}
<!-- view -->
<form method="post" action="">
<h1>Zoekformulier</h1>
<table>
    <tr><th>Plaats</th><td><%=Html.TextBoxFor(m=>m.Plaatsnaam) %></td></tr>
    <tr><th>Prijs</th>
        <td><%=Html.DropDownListFor(m=>m.PrijsVan, Model.PrijsRange) %> - <%=Html.DropDownListFor(m=>m.PrijsTot, Model.PrijsRange) %></td></tr>
    <tr><th>Tuin?</th><td><%=Html.CheckBoxFor(m=>m.IndTuin) %></td></tr>
</table>
<input type="submit" value="Zoeken" />
</form>
{% endhighlight %}
  <br>
  <img src="http://www.100procentjan.nl/tweakers/zoek1.png" title="http://www.100procentjan.nl/tweakers/zoek1.png"
  alt="http://www.100procentjan.nl/tweakers/zoek1.png">
  <!--more-->
<b>Verwerken van de invoer</b>
  <br>Na klikken op submit krijgen we in onze actie het gevulde formulier binnen:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/zoek2.png" title="http://www.100procentjan.nl/tweakers/zoek2.png"
  alt="http://www.100procentjan.nl/tweakers/zoek2.png">
  <br>
  <br>Hoe vertalen we nu het model naar een IQueryable&lt;&gt; van je data entities?
  <br>
  <br>
{% highlight csharp %}
// data entity
public class ZoekKoop {
    public string woonplaats { get; set; }
    public int koopprijs { get; set; }
    public bool indTuin { get; set; }
}
{% endhighlight %}
  <br>
  <br>Je zou een &apos;if-else&apos; constructie kunnen schrijven:
  <br>
  <br>
{% highlight csharp %}
using(DPLDataContext dc = new DPLDataContext())
{
    IQueryable<ZoekKoop> query = dc.ZoekKoop.AsQueryable();
    if(!string.IsNullOrEmpty(model.Plaatsnaam))
    {
        query = query.Where(q => q.woonplaats == model.Plaatsnaam);
    }
    // execute query
}
{% endhighlight %}
  <br>
<b>Maar...</b> veel werk, en niet dynamisch. Dat kan beters!
  <br>
  <br>
<b>Mapper schrijven</b>
  <br>Ergens zullen we moeten bijhouden welk veld in het model correleert met
  een veld in je data-entity, en op welke manier. Omdat niet alle velden
  werken volgens &apos;IsEqual&apos;; maar er bijvoorbeeld ranges zijn (zoals
  PrijsVan - PrijsTot) kunnen we slim gebruik maken van &apos;ExpressionType&apos;.
  <br>
  <br>
{% highlight csharp %}
public class MappingItem
{
    public Expression<Func<ZoekformulierModel, object >> ModelParameter { get; set; }
    public Expression<Func<ZoekKoop, object>> DataParameter { get; set; }
    public ExpressionType Expression { get; set; }
    public MappingItem(Expression<Func<ZoekformulierModel, object>> modelParameter,
                        Expression<Func<ZoekKoop, object>> dataParameter,
                        ExpressionType expression)
    {
        ModelParameter = modelParameter;
        DataParameter = dataParameter;
        Expression = expression;
    }
}
{% endhighlight %}
  <br>Nu kunnen we mapping aangeven:
  <br>
  <br>
{% highlight csharp %}
List<MappingItem> mapping = new List<MappingItem>()
    {
        new MappingItem(m=>m.Plaatsnaam, d=>d.woonplaats, ExpressionType.Equal),
        new MappingItem(m=>m.PrijsVan, d=>d.koopprijs, ExpressionType.GreaterThanOrEqual),
        new MappingItem(m=>m.PrijsTot, d=>d.koopprijs, ExpressionType.LessThanOrEqual),
        new MappingItem(m=>m.IndTuin, d=>d.indTuin, ExpressionType.Equal),
    };
{% endhighlight %}
  <br>We weten nu welke velden bij elkaar horen; en we hebben deze bovendien
  in een Expression Tree zitten. Dat betekent dat de informatie niet verloren
  gaat, of weggeoptimaliseerd worden tidjens compilation, maar dat we er
  nog iets mee kunnen doen.
  <br>
  <br>
<b>Van expression tree naar IQueryable</b>
  <br>Let&apos;s code!
  <br>
  <br>
{% highlight csharp %}
using (DPLDataContext dc = new DPLDataContext())
{
    // AsQueryable basis aanmaken
    IQueryable<ZoekKoop> query = dc.Funda_ZOEK_Koops.AsQueryable();
    // iterate over each mapping
    foreach (var item in mapping)
    {
        // grab the value from the 
        var valueFromModel = item.ModelParameter.Compile().Invoke(model);
        if(valueFromModel == null) continue;
        // bepaal de default waarde van het type
        // je kan hier extra checks op doen, zoals:
        //      if (valueFromModel is Int32 && ((Int32)valueFromModel) != Int32.Max)
        // voor de max waarde van dingen
        var type = valueFromModel.GetType();
        if (!valueFromModel.Equals(type.IsValueType ? Activator.CreateInstance(type) : null))
        {
            // we gaan nu de IQueryable opbouwen
            // hiervoor is nodig:
            // - het type van het object zoals in de data
            // deze zit verborgen...
            MemberExpression memberAccessExpression;
            var bodyExpression = item.DataParameter.Body;
            if(bodyExpression is UnaryExpression) // bij impliciete conversie
            {
                memberAccessExpression = ((MemberExpression) ((UnaryExpression) bodyExpression).Operand);
            }
            else if(bodyExpression is MemberExpression) // bij direct aanroepen
            {
                memberAccessExpression = ((MemberExpression)bodyExpression);
            }
            else
            {
                throw new Exception("Unexpected expression type");
            }
            // maak een parameter aan voor de expression, zodat we ook met een object kunnen werken
            ParameterExpression parameter = (ParameterExpression)Expression.Parameter(typeof(ZoekKoop), "s");
            // maak een vergelijking met als type 'Expression', en maak deze tussen
            // parameter & valueFromModel
            Expression expr = Expression.MakeBinary(item.Expression, Expression.MakeMemberAccess(parameter, memberAccessExpression.Member), Expression.Constant(valueFromModel));
            // bouw de predicate op basis van bovenstaande expressions
            var predicate = (Expression<Func<ZoekKoop, bool>>)(Expression.Lambda(expr, parameter));
            // en pas deze toe
            query = query.Where(predicate);
        }
    }
    // om te controleren!
    string tsql = query.ToString();
    // resultaat fetchen
    var res = query.ToList();
}
{% endhighlight %}
  <br>
  <br>
<b>En? Werkt het?</b>
  <br>Afhankelijk van onze invoer wordt nu de query gebakken; te controleren
  via de &apos;tsql&apos; string:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/zoek3.png" title="http://www.100procentjan.nl/tweakers/zoek3.png"
  alt="http://www.100procentjan.nl/tweakers/zoek3.png">
  <br>
  <br>Vullen we nu velden niet in; dan worden deze ook niet meegenomen in de
  WHERE clause:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/zoek4.png" title="http://www.100procentjan.nl/tweakers/zoek4.png"
  alt="http://www.100procentjan.nl/tweakers/zoek4.png">
  <br>
  <br>Awesomness.</p>
   
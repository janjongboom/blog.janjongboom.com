---
layout:         post-tweakers
title:          "Validatie zoals UX het wil, met ASP.NET MVC 2"
date:           2011-03-29T12:23:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6329/validatie-zoals-ux-het-wil-met-asp-punt-net-mvc-2.html
originalName:   Coding Glamour
language:       nl
commentCount:   10
commentUrl:     http://glamour.tweakblogs.net/blog/6329/validatie-zoals-ux-het-wil-met-asp-punt-net-mvc-2.html#reacties
---

   <p class="article">De standaard validatie in MVC 2 gaat er vanuit dat je werkt met &apos;Validation
  messages&apos; achter je tekstvelden, en een &apos;Validation summary&apos;
  bovenaan je scherm. Dit werkt snel en out-of-the box, inclusief javascript
  validatie via jQuery Validate, en ook server side wanneer er geen javascript
  beschikbaar is (pic <a href="http://rajsoftware.wordpress.com/2010/05/09/mvc2-validation-step-by-step/"
  rel="external">via</a>).
  <br>
  <img src="http://100procentjan.nl/tweakers/validationsummary.jpg" title="http://100procentjan.nl/tweakers/validationsummary.jpg"
  alt="http://100procentjan.nl/tweakers/validationsummary.jpg">
  <br>Maar... wat als je UX-afdeling dit spuuglelijk vindt? Vandaar dat we bovenstaande
  gaan transformeren naar:
  <br>
  <img src="http://100procentjan.nl/tweakers/validationnew.png" title="http://100procentjan.nl/tweakers/validationnew.png"
  alt="http://100procentjan.nl/tweakers/validationnew.png">
  <!--more-->
<b>Zo veel mogelijk standaard</b>
  <br>Om ervoor te zorgen dat we zo min mogelijk werk doen, conformeren we aan
  het model dat MVC afdwingt met annotations op je velden:
  <br>
  <br>
{% highlight csharp %}
    [Required(ErrorMessage = "\"Naam\" is verplicht maar niet ingevoerd")]
    [DisplayName("Naam")]
    public string Naam { get; set; }
{% endhighlight %}
  <br>Wanneer we nu in de view hier een textbox voor tekenen krijgen we er extra
  gratis validatie bij:
  <br>
  <br>
{% highlight csharp %}
<%= Html.TextBoxFor(m => m.Naam) %>
{% endhighlight %}
  <br>Punt is alleen dat onze classes voor niet geldige velden <b>niet</b> op
  de textbox zitten maar op een veld eromheen:
  <br>
  <br>
{% highlight csharp %}
<!-- valide veld -->
<span class="input-wrap">
    <input type="text" />
</span>
<!-- niet valide veld -->
<span class="input-wrap input-error">
    <input type="text" />
</span>
{% endhighlight %}
  <br>
  <br>
<b>HTML Helper voor de wrapper</b>
  <br>De wrapper om het veld heen kunnen we uiteraard ook genereren, en daarbij
  meteen de metadata over de correctheid van het veld meenemen. Dat kan door
  middel van iets als:
  <br>
  <br>
{% highlight asp %}
<%= Html.WrapperFor (m => m.Naam) %>
    <%= Html.TextBoxFor (m => m.Naam %>
<%= Html.EndWrapper %>
{% endhighlight %}
  <br>Maar dat is vrij foutgevoelig! Tijd voor een trucje met &apos;IDisposable&apos;:
  <br>
  <br>
{% highlight asp %}
<% using (Html.BeginInputWrapperFor (m => m.Naam)) { %>
    <%= Html.TextBoxFor (m => m.Naam %>
<% }
{% endhighlight %}
  <br>We kunnen nu in de constructor van het wrapper element de begin tag schrijven,
  en in de &apos;Dispose&apos; de eindtag.
  <br>
  <br>
{% highlight csharp %}
public static class HtmlHelperExtender
{
    public static MvcInputWrapper BeginInputWrapperFor<TModel, TProperty>(this HtmlHelper<TModel> htmlHelper, Expression<Func<TModel, TProperty>> expression)
    {
        // al deze metadata helpers zitten standaard in MVC!
        return new MvcInputWrapper(htmlHelper, ModelMetadata.FromLambdaExpression<TModel, TProperty>(expression, htmlHelper.ViewData), ExpressionHelper.GetExpressionText(expression));
    }
}
// class zelf
public class MvcInputWrapper : IDisposable
{
    // cache tagbuilder en textwriter
    private readonly TagBuilder _builder;
    private readonly TextWriter _writer;
    // ctor
    public MvcInputWrapper(HtmlHelper htmlHelper, ModelMetadata modelMetadata, string expression)
    {
        // controleer of het veld valide is
        ModelState state;
        bool isValid = true;
        var fullHtmlFieldName = htmlHelper.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(expression);
        if (htmlHelper.ViewData.ModelState.TryGetValue(fullHtmlFieldName, out state) && (state.Errors.Count > 0))
        {
            isValid = false;
        }
        // cache de writer
        _writer = htmlHelper.ViewContext.Writer;
        // maak een tagbuilder aan
        _builder = new TagBuilder("span");
        _builder.AddCssClass("input-wrap");
        // als niet valid? voeg de error class toe
        if(!isValid) _builder.AddCssClass("input-error");
        // schrijf begin tag
        _writer.Write(_builder.ToString(TagRenderMode.StartTag));
    }
    public void Dispose()
    {
        // schrijf eind tag
        _writer.Write(_builder.ToString(TagRenderMode.EndTag));
    }
}
{% endhighlight %}
  <br>
  <br>
<b>Validation summary</b>
  <br>Bovenaan moet ook nog een validation summary komen te staan. Ook hier
  kunnen we weer handig gebruik maken van de ModelState functies die beschikbaar
  zijn in de HtmlHelpers:
  <br>
  <br>
{% highlight csharp %}
// in je view
// <%= Html.ValidationSummaryFunda %>
public static string ValidationSummaryFunda<TModel>(this HtmlHelper<TModel> htmlHelper)
{
    // zet client validation aan, zodat we dat niet handmatig hoeven te doen
    htmlHelper.EnableClientValidation();
    var modelState = htmlHelper.ViewData.ModelState;
    
    // als het model valid is, dan sowieso return ""
    if (modelState.IsValid) return "";
    // pak alle error messages
    var errorMessages = modelState.Values.Where(v => v.Errors.Any()).SelectMany(v => v.Errors).Select(v=>v.ErrorMessage);
    // en bepaal aan de hand van het aantal messages de uiteindelijke foutmelding
    MvcHtmlString errorString;
    if(errorMessages.Count() == 1)
    {
        errorString = MvcHtmlString.Create(string.Format("<strong>{0}.</strong> Vul het rode veld aan.", errorMessages.First()));
    }
    else
    {
        errorString = MvcHtmlString.Create("<strong>Meerdere velden zijn niet correct ingevoerd.</strong> Vul de rode velden aan.");
    }
    // bouw de tag
    var builder = new TagBuilder("p");
    builder.AddCssClass("notify-error");
    builder.InnerHtml = errorString.ToString();
    // en render
    return builder.ToString(TagRenderMode.Normal);
}
{% endhighlight %}
  <br>
  <br>
<b>Validatie in de controller</b>
  <br>Om te zorgen dat de error-messages ook daadwerkelijk te zien worden wanneer
  je submit zal je nog een check moeten toevoegen in je action:
  <br>
  <br>
{% highlight csharp %}
[HttpGet]
public ViewResult Contact(SoortAanbod aanbod, ObjectdetailPagina tab, long id)
{
    // dit is de GET logica om het formulier te tonen
    var model = new ObjectsClient().GetContact(aanbod, tab, id);
    return View(Enum.GetName(tab.GetType(), tab), model);
}
[HttpPost]
public ActionResult Contact(SoortAanbod aanbod, ObjectdetailPagina tab, long id, ObjectContactModel model)
{
    // na POST
    // als modelstate niet valid
    if (!ModelState.IsValid)
    {
        // doe de GET actie. ModelState blijft hier geldig, dus je raakt je validatie-info niet kwijt
        return Contact(aanbod, tab, id);
    }
    // handel normaal af
    var url = new ObjectsClient().SaveContact(id, model, tab);
    return Redirect(url);
}
{% endhighlight %}
  <br>
  <br>
<b>Client side validatie</b>
  <br>Dit werkt prima, maar alleen server-side. Voor client-side validatie laat
  ik de volgende keer zien hoe je eenvoudig ASP.NET MVC 2 kan koppelen aan
  een (eigen) validatie-framework in javascript.</p>
   
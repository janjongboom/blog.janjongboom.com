---
layout:         post-tweakers
title:          "Google Analytics in MVC"
date:           2011-05-05T13:14:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/6508/google-analytics-in-mvc.html
originalName:   Coding Glamour
language:       nl
commentCount:   7
commentUrl:     http://glamour.tweakblogs.net/blog/6508/google-analytics-in-mvc.html#reacties
---

   <p class="article">Wanneer je iets in je MVC applicatie wil implementeren dat op (bijna)
  elke pagina terug moet komen, zoals Google Analytics, is dat een probleem
  dat lastig te tackelen is. Tactieken die ik in de praktijk heb gezien:
  <ul>
    <li>1. Een baseclass maken met daarop de property &apos;GoogleAnalyticsTag&apos;,
      en alle Masterpages van dit model laten overerven. In de masterpage vervolgens
      &lt;%= Model.GoogleAnalyticsTag %&gt; doen.</li>
    <li>2. In je action &apos;ViewData[&quot;GoogleAnalyticsTag&quot;]&apos; zetten,
      om geen afhankelijkheid op alle modellen te hebben.</li>
    <li>3. Een losse action maken, en in je masterpage &apos;&lt;%=Html.RenderAction(&quot;GoogleAnalytics&quot;,
      &quot;SomeController&quot;)%&gt;&apos;.</li>
  </ul>3 is op zich de &apos;way-to-go&apos; wat mij betreft, maar in tegenstelling
  tot 1. en 2. waar je in je action (of model) de GA tag zet heb je hier
  geen action context meer. En dus zag de code er in een van onze applicaties
  uit als:
  <br>
  <br>
{% highlight csharp %}
var url = HttpContext.Current.Request.Url.PathAndQuery;
var tag = "";
if (url.StartsWith("/koop/")) tag += "koop/";
if (url.StartsWith("/huur/")) tag += "huur/";
if (new Regex(@"/(koop|huur)/[\w-]+/\w+-\d+-[\w-]+/").Match(url).Success) {
    if (url.Contains("omschrijving")) tag += "object-omschrijving";
    if (url.Contains("fotos")) tag += "object-fotos";
}
// etc. etc. etc.
{% endhighlight %}
  <br>Ononderhoudbaar, buggevoelig, en super hacky. Dat kan mooier!
  <!--more-->
<b>Route Tables</b>
  <br>Om van een URL een action op een controller te maken hebben we &apos;route
  tables&apos;. Als je URL er uit ziet als X, doe Y. Een principe dat we
  ook hier kunnen gebruiken. Alleen dan nog &#xE9;&#xE9;n niveau dieper:
  <br>
  <br>
<i>Als URL is X, dan action is Y, dan GA tag is Z.</i>
  <br>
  <br>We moeten dus een koppeling maken tussen Y en Z. Tijd voor een eigen routetable!
  <br>
  <br>
<b>Werking</b>
  <br>Om zo flexibel mogelijk te zijn, ziet een regel in de routetable er ongeveer
  zo uit:
  <br>
  <br>
{% highlight csharp %}
var routedata = /* de output die we van X->Y hebben gekregen */;
if (routedata["controller"] == "Object"
    && routedata["action"] == "Detail"
    && routedata["aanbod"] == "Huur"
    && routedata["pagina"] == "Omschrijving")
{
    tag = "huur/object-omschrijving";
}
{% endhighlight %}
  <br>Nadeel is dat dit nog steeds niet strong-typed is, en we fouten dus pas
  heel laat gaan merken (als we dat al doen). Een manier om strong-typed
  C# at runtime om te zetten naar een ander stuk code (zoals bovenstaand)
  zijn <a href="http://glamour.tweakblogs.net/blog/5747/expression-trees-espresso-voor-je-code!.html"
  rel="external">expression trees</a>.
  <br>
  <br>
<b>Nieuwe syntax</b>
  <br>Onze actie voor een detailpagina ziet er ongeveer zo uit:
  <br>
  <br>
{% highlight csharp %}
public class ObjectController {
    public ActionResult Detail (SoortAanbod aanbod, long id, ObjectPagina pagina) {
        // magic
    }
}
{% endhighlight %}
  <br>We willen hier een Google Analytics tag voor maken, op basis van &apos;controller&apos;,
  &apos;action&apos;, &apos;aanbod&apos; en &apos;pagina&apos;. De nieuwe
  syntax hiervoor is:
  <br>
  <br>
{% highlight csharp %}
// we zijn niet afhankelijk van 'id'; dus gebruiken we hiervoor de default waarde van int: 0
CreateRule<ObjectController>(c => c.Detail(SoortAanbod.Huur, 0, ObjectPagina.Omschrijving), "huur/object-omschrijving");
{% endhighlight %}
  <br>
  <br>
<b>Ombouwen naar normale syntax</b>
  <br>Aan bovenstaand stuk code kunnen we niet vragen of een bepaalde set RouteData
  overeenkomt, dus moeten we dit omkatten. Expression trees time dus!
  <br>
  <br>Allereerst de &apos;MatchesRouteData&apos; functie. Deze vervangt het
  stuk &apos;routedata[&quot;controller&quot;] == &quot;Object&quot;&apos;,
  en zorgt ervoor dat deze niet casing ignored, en eventueel langs een ModelBinder
  gaat als deze beschikbaar is:
  <br>
  <br>
{% highlight csharp %}
/// <summary>
/// Validates whether the given key in routeData is equal to the given value
/// </summary>
/// <param name="routeData">Full set of routedata</param>
/// <param name="key">Parameter name</param>
/// <param name="value">Expected value</param>
/// <param name="type">The full type, for modelbinder</param>
/// <returns></returns>
private static bool MatchesRouteData(RouteData routeData, string key, object value, Type type)
{
    object outValue;
    if (routeData.Values.TryGetValue(key, out outValue))
    {
        // langs smartbinder halen
        if (ModelBinders.Binders.DefaultBinder != null)
        {
            outValue = ModelBinders.Binders.DefaultBinder.BindModel(GetControllerContext(), GetModelBindingContext(key, outValue, type));
        }
        if (outValue != null && outValue.Equals(value))
        {
            return true;
        }
        if(outValue != null && outValue.ToString().Equals(value.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }
    }
    return false;
}
// de helper functies 'GetControllerContext' en 'GetModelBindingContext' staan op PasteBin (zie einde artikel)
{% endhighlight %}
  <br>
  <br>Het uitgeschreven stuk code wordt met deze functie als volgt:
  <br>
  <br>
{% highlight csharp %}
var routedata = /* de output die we van X->Y hebben gekregen */;
if (MatchesRouteData(routedata, "Controller", "Object", typeof(string))
    && MatchesRouteData(routedata, "action", "Detail", typeof(string))
    && MatchesRouteData(routedata, "aanbod", SoortAanbod.Huur, typeof(SoortAanbod))
    && MatchesRouteData(routedata, "pagina", ObjectPagina.Omschrijving, typeof(ObjectPagina))
{
    tag = "huur/object-omschrijving";
}
{% endhighlight %}
  <br>
  <br>
<b>Compileren naar Expression Tree</b>
  <br>De volgende code zet de strong-typed syntax om naar een stuk code als
  bovenstaand:
  <br>
  <br>
{% highlight csharp %}
/// <summary>
/// Compiles a given rule into a delegate
/// </summary>
/// <typeparam name="TController">Controller-type</typeparam>
/// <param name="expectation">Action on the controller</param>
/// <returns></returns>
internal static Func<RouteData, bool> CompileRule<TController>(Expression<Action<TController>> expectation)
{
    // bijhouden van een lijst met expectation
    Dictionary<string, object> expects = new Dictionary<string, object>();
    // lijst met de calls naar 'MatchesRouteData'
    List<MethodCallExpression> methodCalls = new List<MethodCallExpression>();
    // eerste argument van de delegate die we maken
    ParameterExpression parameterExpression = Expression.Parameter(typeof(RouteData), "rd");
    // controller & action uitlezen vanuit de expectation
    expects.Add("Controller", expectation.Parameters[0].Type.Name.Replace("Controller", ""));
    expects.Add("Action", ((MethodCallExpression)expectation.Body).Method.Name);
    // alle parameters die zijn meegegeven aan de actie aflopen
    var parameters = ((MethodCallExpression)expectation.Body).Method.GetParameters();
    for (var ix = 0; ix < parameters.Length; ix++)
    {
        // parameterinfo voor het type & de ingevoerde waarde
        var methodParam = parameters[ix];
        var expression = ((MethodCallExpression) expectation.Body).Arguments[ix];
        object value;
        // een MemberExpression moeten we even de waarde ophalen die deze referenced
        if(expression is MemberExpression)
        {
            value = Expression.Lambda(expression).Compile().DynamicInvoke();
        }
        // Constant is lekker simpel:
        else if (expression is ConstantExpression)
        {
            value = ((ConstantExpression) expression).Value;
        }
        // Aan andere waardes doen we voorlopig niet
        else
        {
            continue;
        }
        // null? dan negeren we deze
        if (!methodParam.ParameterType.IsValueType && value == null)
        {
            continue;
        }
        // ben je geen reference type?
        else if (methodParam.ParameterType.IsValueType
                 && !methodParam.ParameterType.IsEnum)
        {
            // generic en geen reference? dan ben je Nullable<>
            if (methodParam.ParameterType.IsGenericType)
            {
                // als value == null, dan negeren
                if (Activator.CreateInstance(methodParam.ParameterType) == value)
                    continue;
            }
            // anders: als waarde de default waarde van het type is, negeren (voor long is dit dus 0)
            else if (Activator.CreateInstance(methodParam.ParameterType).Equals(value))
            {
                continue;
            }
        }
        // voeg toe aan de lijst met expectations
        expects.Add(methodParam.Name, value);
    }
    // omzetten van expectation -> method call naar MatchesRouteData
    foreach (var expect in expects)
    {
        methodCalls.Add(Expression.Call(typeof(AnalyticsHelper).GetMethod("MatchesRouteData", BindingFlags.Static | BindingFlags.NonPublic),
                                        parameterExpression, 
                                        Expression.Constant(expect.Key), 
                                        // we moeten expliciet omzetten naar object; normaal gaat dit impliciet, maar niet in een expression tree
                                        Expression.Convert(Expression.Constant(expect.Value), typeof(object)),
                                        Expression.Constant(expect.Value.GetType())));
    }
    // voeg alles samen
    BinaryExpression wholeExpression = null;
    foreach (var call in methodCalls)
    {
        if (wholeExpression == null)
        {
            wholeExpression = Expression.MakeBinary(ExpressionType.AndAlso, Expression.Constant(true), call);
            continue;
        }
        // we gebruiken AndAlso
        wholeExpression = Expression.MakeBinary(ExpressionType.AndAlso, wholeExpression, call);
    }
    // de delegate wordt nu:
    // routeData => MatchesRouteData(...) && MatchesRouteData(...) && MatchesRouteData(...)
    // hetzelfde als je zelf een lambda hiervoor zou schrijven
    var del = (Func<RouteData, bool>)Expression.Lambda(wholeExpression, parameterExpression).Compile();
    return del;
}
{% endhighlight %}
  <br>
  <br>
<b>Alles samenvoegen</b>
  <br>De class, ready to use is te vinden op <a href="http://pastebin.com/A7XMp33b"
  rel="external">PasteBin</a>. Om deze te gebruiken: in je Global.asax:
  <br>
  <br>
{% highlight csharp %}
protected void Application_Start()
{
    // Google Analytics strong typed stylo
    AnalyticsHelper.Initialize(GetAnalyticsRouteTable());
}
public static AnalyticsRouteTable GetAnalyticsRouteTable()
{
    AnalyticsRouteTable r = new AnalyticsRouteTable();
    r.Add<HomepageController>(c => c.Index(SoortAanbod.Koop), "koop/");
    r.Add<ObjectDetailController>(c => c.Index(SoortAanbod.Koop, ObjectdetailPagina.Overzicht, 0), "koop/object-overzicht");
    r.Add<ObjectDetailController>(c => c.Index(SoortAanbod.Koop, ObjectdetailPagina.Omschrijving, 0), "koop/object-omschrijving");
    r.Add<CmsPageController>(c => c.Index(CmsEntryEnum.Gebruiksvoorwaarden), "gebruikersovereenkomst");
    r.Add<CmsPageController>(c => c.Index(CmsEntryEnum.Privacybeleid), "privacybeleid");
    return r;
}
{% endhighlight %}
  <br>
  <br>Om je Google Analytics label voor een willekeurige pagina te vinden, heb
  je aan &#xE9;&#xE9;n regel genoeg:
  <br>
  <br>
{% highlight csharp %}
var label = AnalyticsHelper.GetTag(RouteTable.Routes.GetRouteData(HttpContext));
{% endhighlight %}
  <br>
  <br>
<b>Uiteraard bruikbaar voor nog veel meer</b>
  <br>In principe voor alles waar je een mapping nodig hebt van URL naar iets
  anders globaals en onafhankelijks.</p>
   
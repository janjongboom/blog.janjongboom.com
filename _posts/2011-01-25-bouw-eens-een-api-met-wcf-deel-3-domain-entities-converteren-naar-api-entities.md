---
layout:         post-tweakers
title:          "Bouw eens een API met WCF, deel 3: Domain entities converteren naar API entities"
date:           2011-01-25T12:58:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/6005/bouw-eens-een-api-met-wcf-deel-3-domain-entities-converteren-naar-api-entities.html
originalName:   Coding Glamour
language:       nl
commentCount:   11
commentUrl:     http://glamour.tweakblogs.net/blog/6005/bouw-eens-een-api-met-wcf-deel-3-domain-entities-converteren-naar-api-entities.html#reacties
---

   <p class="article">De domain entities die je zelf gebruikt op je site zijn niet noodzakelijk
  ook de entities die je via je API wil communiceren. Dit kan alleen naamgeving
  zijn, maar ook het uitsluiten van bepaalde velden of het toevoegen van
  afgeleide velden. Al snel krijg je code als:
  <br>
  <br>
{% highlight csharp %}
public ApiObject Convert(DomainObject domain) {
     ApiObject api = new ApiObject();
     api.Adres = domain.Adres;
     api.Huisnummer = domain.Huisnummer;
     if(domain.Makelaar) {
           api.MakelaarNummer = domain.Makelaar.Id;
     }
}
{% endhighlight %}
  <br>Niet alleen veel werk (geloof me, ik heb op mijn 19e duizenden regels
  van dit soort code zitten kloppen), maar door alle boilerplate ook nog
  eens onoverzichtelijk (imagine bovenstaand fragment maar dan met 200 properties!).
  Goed moment voor <a href="http://glamour.tweakblogs.net/blog/5747/expression-trees-espresso-voor-je-code!.html"
  rel="external">expression trees</a> om dit soort code on-the-fly te genereren.
  <!--more-->
<b>API Entity</b>
  <br>Allereerst zaak om een API entity te bakken, waar de namen van de properties
  hetzelfde zijn als die van je domain entity:
  <br>
  <br>
{% highlight csharp %}
[DataContract(Name="KoopObject")]
public class KoopApiEntity
{
    [DataMember(Name = "Address")]
    public string Adres { get; set; }
    [DataMember(Name = "ListingPrice"]
    public int? KoopPrijs { get; set; }
}
{% endhighlight %}
  <br>Doordat je met &apos;DataMember&apos; de uiteindelijke output nog kan
  vari&#xEB;ren maakt het niet uit wanneer je properties anders heten dan
  je aan je eindgebruiker wil laten zien. Bovenstaande code komt er namelijk
  uit als:
  <br>
  <br>
{% highlight xml %}
<KoopObject>
    <Address>Drostendiep 24</Address>
    <ListingPrice>279000</ListingPrice>
</KoopObject>
{% endhighlight %}
  <br>
  <br>
<b>Converteren van domain entity naar API entity</b>
  <br>Expression tree time!
  <br>
  <br>
{% highlight csharp %}
// aanroep is:
var apiEntity = new PropertyCopier<KoopDomainEntity, KoopApiEntity>(domainEntity);
{% endhighlight %}
  <br>
  <br>
{% highlight csharp %}
    public class PropertyCopier<TSource, TTarget> 
    {
        //store the compiled delegate in here
        private readonly Func<TSource, TTarget> copyDelegate;
        public PropertyCopier()
        {
            //if theres something wrong with the target type or something, then we will throw error
            //in BuildCopier()
            copyDelegate = BuildCopier();
        }
        //puur het uitvoeren van de delegate
        public TTarget Copy(TSource source)
        {
            if (source == null) throw new ArgumentNullException("source");
            return copyDelegate(source);
        }
        //builds the expression, and compiles into copyDelegate
        private Func<TSource, TTarget> BuildCopier()
        {
            //we maken gebruik van Dynamic LINQ, en dat betekent dat we expression trees kunnen bouwen
            //iets in de trant van
            // target = from s in source select new TTarget { GlobalId = s.GlobalId, etc. };
            //nou dat gaan we dus nu ook doen maar dan in code
            //we beginnen met [from s in] SOURCE [select], dus we moeten Source even toevoegen
            //source is van type TSource, en het is een parameter
            ParameterExpression sourceParameter = Expression.Parameter(typeof(TSource), "source");
            //dan gaan we nu verder met de lijst met SELECT s
            // dusssss, bijvoorbeeld select new TTarget { GlobalId = s.GlobalId }
            // dat soort dingen heten memberBindings
            var bindings = new List<MemberBinding>();
            
            //we willen alle properties die in TSource zit langs lopen
            foreach (PropertyInfo sourceProperty in typeof(TSource).GetProperties())
            {
                //als we de prop niet mogen lezen vanwege private, internal, whatever, dan negeren
                if (!sourceProperty.CanRead) { continue; }
                //de property opzoeken
                PropertyInfo targetProperty = typeof(TTarget).GetProperty(sourceProperty.Name, sourceProperty.PropertyType);
                //als we hem niet kunnen vinden maakt niet uit, dan negeren
                if (targetProperty == null) continue;
                //als de prop een IgnoreCopier attribute heeft, dan ook negeren
                if (targetProperty.GetCustomAttributes(typeof(IgnoreCopierAttribute), false).Length > 0) continue;
                //als hij niet accessible is, dan negeren
                if (!targetProperty.CanWrite)
                {
                    continue;
                    // je mag eventueel ook deze fout gooien
                    /*throw new ArgumentException("Property " + sourceProperty.Name
                        + " is not writable in " + typeof(TTarget).FullName + ". Add an IgnoreCopier attribute.");*/
                }
                //dito als het type verkeerd is.
                if (!targetProperty.PropertyType.IsAssignableFrom(sourceProperty.PropertyType))
                {
                    throw new ArgumentException("Property " + sourceProperty.Name
                        + " has an incompatible type in " + typeof(TTarget).FullName + ". Add an IgnoreCopier attribute."
                        + " SourceProperty = " + sourceProperty.Name + ". Targetproperty = " + targetProperty.Name + ".");
                }
                //nu gaan we een nieuwe binding maken
                //een binding is zoiets als GlobalId = source.GlobalId, zoals je boven hebt kunnen zien
                //we doen het op member 'targetproperty' want dat is onze target.
                // onze source is een property. En wel source.GlobalId,
                // dus moeten we een nieuwe Expression.Property aanmaken met als parameter => source
                // en als property de sourceProperty
                MemberExpression sourcePropertyExpression = Expression.Property(sourceParameter, sourceProperty);
                MemberAssignment binding = Expression.Bind(targetProperty, sourcePropertyExpression);
                //toevoegen aan de lijst met bindings
                bindings.Add(binding);
            }
            
            //we hebben nu alle bindings aangemaakt. Nu maken we de LINQ expressie.
            //dus het maken van select new TTarget { //bindings };
            //die nomene we de initializer
            Expression initializer = Expression.MemberInit(Expression.New(typeof(TTarget)), bindings);
            //dan moeten we nog een Expression.Lambda er van maken
            //we hebben dus [select new TTarget { GlobalId = s.GlobalId, InternalId = s.InternalId }
            // maar de compiler moet wel weten dat s => sourceParameter
            // dus dat doen we hier
            var lambda = Expression.Lambda<Func<TSource, TTarget>>(initializer, sourceParameter);
            //compileren doen we dan vervolgens hier, en dan hebben we een echte delegate terug
            //die delegate wordt vertaald naar MSIL, en daarin zijn de bindings dus hard.
            //een call naar deze delegate is dus net zo snel als een normale call (hierna dan).
            var compiled = lambda.Compile();
            
            //return the compiled delegate.
            //deze wordt toegewezen aan een readonly property on init, en kan nu worden gebruikt.
            return compiled;
        }
    }
    [AttributeUsage(AttributeTargets.Property)]
    public class IgnoreCopierAttribute : Attribute { }
{% endhighlight %}
  <br>
  <br>
<b>Afgeleide velden</b>
  <br>Wanneer je afgeleide velden wil maken kan je nu handig gebruik maken van
  deze mapper:
  <br>
  <br>
{% highlight csharp %}
[DataContract]
public class SomeEntity {
    // deze property wordt geset door de copier
    // we geven hem geen [DataMember] attribute mee; hij wordt dus niet zichtbaar voor de buitenwereld
    public Makelaar Makelaar { get; set; }
    
    // deze property exposen we naar buiten, 
    // als er op ons source object toevallig al een 'MakelaarId' bestaat negeren we deze
    [IgnoreCopier, DataMember("RealtorId")]
    public int MakelaarId
    {
        get { return Makelaar.Id; }
        set { } // lege setter, anders breekt je DataContract
    }
}
{% endhighlight %}
  <br>
  <br>
<b>Caching van je expression trees</b>
  <br>Om geen overhead te hebben bij het vertalen van je entities (normaal met
  reflection een groot probleem), kunnen we de delegates die worden uitgespuugd
  goed cachen. Bijvoorbeeld in de &apos;global.asax&apos;:
  <br>
  <br>
{% highlight csharp %}
public class Global : HttpApplication
{
    // deze regel toevoegen aan je Global.asax
    public static readonly Copier Copier = new Copier();
}
// Copier.cs
    public class Copier
    {
        internal Dictionary<string, object> Copiers = new Dictionary<string, object>();
        //some trace info is put in here, therefore we do a lil more work than we should have to
        //but want to monitor the performance.
        public TTarget Copy<TSource, TTarget>(TSource source)
        {
#if DEBUG
            Stopwatch sw = new Stopwatch(); sw.Start();
#endif
            string identifier = typeof(TSource).Name + "|" + typeof(TTarget).Name;
            PropertyCopier<TSource, TTarget> copier;
            if (Copiers.ContainsKey(identifier))
            {
                //er is al een copier
                copier = (PropertyCopier<TSource, TTarget>)Copiers[identifier];
            }
            else
            {
                copier = new PropertyCopier<TSource, TTarget>();
                Copiers.Add(identifier, copier);
            }
            TTarget returnValue = copier.Copy(source);
#if DEBUG
            sw.Stop();
            //Debug.WriteLine("Copy action took " + sw.ElapsedMilliseconds + "ms.");
#endif
            return returnValue;
        }
    }
{% endhighlight %}
  <br>Je copiers zijn nu net zo snel als het volledig uitschrijven van code
  wanneer je je Copier aanroept als:
  <br>
  <br>
{% highlight csharp %}
// alleen de eerste keer is hier overhead
Global.Copier.Copy<DomainEntity, ApiEntity>(domainEntityInstance);
{% endhighlight %}
  <br>
  <br>
<b>Next up?</b>
  <br>Output van je methodes als XML, JSON en via SOAP zonder wijzigingen in
  je code!</p>
   
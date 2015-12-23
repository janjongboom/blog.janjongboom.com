---
layout:         post-tweakers
title:          "MSIL injection met PostSharp"
date:           2011-02-08T13:41:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/6103/msil-injection-met-postsharp.html
originalName:   Coding Glamour
language:       nl
commentCount:   4
commentUrl:     http://glamour.tweakblogs.net/blog/6103/msil-injection-met-postsharp.html#reacties
---

   <p class="article">Wanneer je manager een nieuwe techniek ten strengste verbied met als argument
  &apos;we snappen je code normaal al niet, dit maakt het alleen maar erger&apos;
  weet je dat je goud in handen hebt. Voor een <a href="http://code.google.com/p/scoutframeworkfm2009/"
  rel="external">eigen projectje</a> om vals te spelen met Football Manager
  (waar ik later absoluut nog eens terug kom) had ik globaal de volgende
  situatie:
  <br>
  <br>
{% highlight csharp %}
public byte CurrentAbility
{
    get {
        if (_mode == DbMode.Cached) {
            // in cached mode, hebben we een byte-array met alle waardes
            return _bytes[Offsets.CurrentAbility];
        } else {
            // anders lezen we via een helper-method
            return ProcessManager.ReadByte(_address + Offsets.CurrentAbility);
        }
    }
    set {
        // zelfde soort code voor de setter
    }
}
{% endhighlight %}
  <br>Leuk, neat, en vrij goed te lezen; probleem alleen dat ik een paar honderd
  properties heb, met een stuk of zeven verschillende types. Te veel werk.
  En aangezien je in eigen projecten toch helemaal los mocht gaan, leek een
  oplossing op basis van AOP me veel leuker. Nieuwe situatie:
  <br>
  <br>
{% highlight csharp %}
[FMEntity(Offsets.CurrentAbility)]
public byte CurrentAbility { get; set; }
{% endhighlight %}
  <br>Bovenstaande is best eenvoudig werkend te krijgen met <a href="http://www.sharpcrafters.com/"
  rel="external">PostSharp</a>, een framework voor <a href="http://www.dotnetmag.nl/Artikel/805/Aspect-Oriented-Programming-onder-de-loep"
  rel="external">Aspect Oriented Programming</a> in .NET. Een eenvoudige implementatie
  van bovenstaande is iets als:
  <br>
  <br>
{% highlight csharp %}
public class FMEntityAttribute : LocationInterceptionAspect
{
    public FMEntityAttribute (int offset) {
        // doe wat
    }
    
    public override void OnGetValue( LocationInterceptionArgs args ) {
        if (args.Instance is byte) {
            // doe byte lezen enzo
        }
    }
    
    public override void OnSetValue( LocationInterceptionArgs args ) {
        // ongeveer hetzelfde
    }
}
{% endhighlight %}
  <br>Je kunt nu alle logica die toch steeds hetzelfde is, eenvoudig webabstraheren
  in een aparte file. Maar... t&#xE9; traag. In mijn geval werd het bepalen
  van de rating voor spelers ruim tien keer zo traag; door alle overhead.
  Oplossing? Zelf MSIL injecten!
  <!--more-->
<b>MSIL?</b>
  <br>MSIL, de immediate language van Microsoft (vergelijkbaar met Java&apos;s
  bytecode) is een stack-based taal die uiteindelijk wordt uitgepoept als
  de compiler je C# code compileert. Shameless kopie van <a href="http://en.wikipedia.org/wiki/Common_Intermediate_Language"
  rel="external">Wikipedia</a>:
  <br>
  <br>
{% highlight csharp %}
int r = Foo.Add(2, 3);
{% endhighlight %}
  <br>wordt:
  <br>
  <br>
{% highlight text %}
ldc.i4.2 // laadt een Int32 met waarde 2 op de stack
ldc.i4.3 // laadt een Int32 met waarde 3 op de stack
call int32 Foo::Add(int32, int32) // roep Int32.Add aan, met de waardes op de stack als params
// de functie schrijft zelf de retval op de stack
stloc.0 // lees return value van de stack, en sla op in local var op positie 0
{% endhighlight %}
  <br>Voor meer info hierover, zie <a href="http://www.codeguru.com/csharp/.net/net_general/il/article.php/c4635"
  rel="external">dit artikel op CodeGuru</a>.
  <br>
  <br>
<b>MSIL injection?</b>
  <br>E&#xE9;n van de leukste functies van PostSharp is, is dat het op basis
  van de attributes die je set, en de implementatie die je daarna schrijft
  direct n&#xE1; compilatie extra code aan je assembly toevoegd. De AOP code
  zit dus in je DLL geweven. Het mooie hieraan is, is dat je ook <b>zelf</b> extra
  code kan toevoegen via PostSharp. Hiermee ben je dus niet gebonden aan
  de (trage) versie die PostSharp je aanbiedt.
  <br>
  <br>
<b>Uh dus?</b>
  <br>Als basis heb ik de volgende helper-functie gemaakt: <a href="http://code.google.com/p/scoutframeworkfm2009/source/browse/trunk/FMSE.Core/Managers/PropertyInvoker.cs"
  rel="external">PropertyInvoker.cs</a>. Deze moet vanuit elke property worden
  aangeroepen:
  <br>
  <br>
{% highlight csharp %}
[FMEntity(Offset.CurrentAbility)]
public byte CurrentAbility { get;set;}
// wordt:
public byte CurrentAbility {
    // Get<T>(int offset, byte[] bytes, int baseAddress, DatabaseMode mode)
    get { return PropertyInvoker.Get<byte>(Offset.CurrentAbility, _bytes, address, _mode); }
    // Set<T>(int offset, int baseAddress, T newValue, DatabaseMode mode)
    set { PropertyInvoker.Set<byte>(Offset.CurrentAbility, address, value, _mode; }
}
{% endhighlight %}
  <br>Ergo: we moeten de implementatie van onze property on the fly gaan veranderen.
  Yay!
  <br>
  <br>
<b>Get it started</b>
  <br>We beginnen met het maken van een <a href="http://code.google.com/p/scoutframeworkfm2009/source/browse/trunk/FMSE.Core/AttributeWeaver/FMEntityTask.cs"
  rel="external">Task</a>, waarin we aangeven op welk &apos;attribute&apos;
  we werken: in dit geval &apos;FMEntityAttribute&apos;. Hierna kunnen we
  een <a href="http://code.google.com/p/scoutframeworkfm2009/source/browse/trunk/FMSE.Core/AttributeWeaver/FMEntityAdvice.cs"
  rel="external">Advice</a> schrijven, waarin we de daadwerkelijke implementatie
  doen.
  <br>
  <br>
<b>Weave</b>
  <br>De &apos;weave&apos; method is het hart van het &apos;Advice&apos;. Deze
  wordt aangeroepen voor elke property waarop we ons attribute hebben gezet.
  <br>
  <br>
{% highlight csharp %}
public void Weave(WeavingContext context, InstructionBlock block)
{
    // parent.Project.Module is de class-instance
    // we gaan eerst zoeken naar de velden die we nodig hebben
    // dat zijn 
    // 'OriginalBytes' (byte[])
    // 'MemoryAddress' (int32)
    // 'DatabaseMode' (DatabaseMode)
    bytesFieldDef = parent.Project.Module.FindField(typeof(Player)
        .GetField("OriginalBytes"), BindingOptions.Default).GetFieldDefinition();
    memAddressFieldDef = parent.Project.Module.FindField(typeof(Player)
        .GetField("MemoryAddress"), BindingOptions.Default).GetFieldDefinition();
    databaseModeFieldDef = parent.Project.Module.FindField(typeof(Player)
        .GetField("DatabaseMode"), BindingOptions.Default).GetFieldDefinition();
    // nu gaan we op basis van de return-type, bepalen of we een getter of een setter hebben
    if (context.Method.ReturnParameter.ParameterType.GetSystemType(null, null) != typeof(void))
    {
        this.WeaveGetter(context, block);
    }
    else
    {
        this.WeaveSetter(context, block);
    }
}
{% endhighlight %}
  <br>
  <br>
<b>WeaveGetter</b>
  <br>In de &apos;WeaveGetter&apos; kunnen we nu de MSIL gaan schrijven om de
  implementatie van de &apos;Get&apos; te vervangen:
  <br>
  <br>
{% highlight csharp %}
private void WeaveGetter(WeavingContext context, InstructionBlock block)
{
    // we gaan 'voor' de huidige implementatie schrijven
    InstructionSequence innerBodySequence = context.Method.MethodBody.CreateInstructionSequence();
    block.AddInstructionSequence(innerBodySequence, NodePosition.Before, null);
    // instructionWriter is waar je je MSIL op kan kloppen
    context.InstructionWriter.AttachInstructionSequence(innerBodySequence);
    // zoek PropertyInvoker.Get op, met als <T> het huidige type
    // in dit geval dus Get<byte>
    MethodBase m = typeof(PropertyInvoker).GetMethod("Get").MakeGenericMethod(context.Method.ReturnParameter.ParameterType.GetSystemType(null, null));
    IMethod propertyInvokerGet = parent.Project.Module.FindMethod(m, BindingOptions.RequireGenericInstance);
    // zet 'Offset', de waarde die je meegeeft in de attribute op de stack
    context.InstructionWriter.EmitInstructionInt32(OpCodeNumber.Ldc_I4, this.attribute.Offset);
    // zet nu ldarg.0 op de stack (je huidige instance)
    context.InstructionWriter.EmitInstruction(OpCodeNumber.Ldarg_0);
    // en lees hier het veld 'bytes' vanaf; zet deze ook op de stack
    context.InstructionWriter.EmitInstructionField(OpCodeNumber.Ldfld, bytesFieldDef);
    // zelfde als hierboven
    context.InstructionWriter.EmitInstruction(OpCodeNumber.Ldarg_0);
    // en zet het veld 'memAddress' op de stack
    context.InstructionWriter.EmitInstructionField(OpCodeNumber.Ldfld, memAddressFieldDef);
    context.InstructionWriter.EmitInstruction(OpCodeNumber.Ldarg_0);
    // zet 'databaseMode' op de stack
    context.InstructionWriter.EmitInstructionField(OpCodeNumber.Ldfld, databaseModeFieldDef);
    // stack bevat nu:
    // 1. de waarde die je meegeeft aan attribute
    // 2. field 'OriginalBytes'
    // 3. field 'MemoryAddress'
    // 4. field 'DatabaseMode'
    
    // we roepen nu de .Get<T> aan, met de bovenstaande waardes als argumenten
    context.InstructionWriter.EmitInstructionMethod(OpCodeNumber.Call, propertyInvokerGet);
    // in MSIL wordt de geretouneerde waarde nu op de stack gezet
    
    // als we nu dus 'return' doen, wordt deze waarde ge-'popt' van de stack
    // en teruggegeven
    context.InstructionWriter.EmitInstruction(OpCodeNumber.Ret);
    context.InstructionWriter.DetachInstructionSequence();
}
{% endhighlight %}
  <br>
  <br>
<b>Registreren in PostSharp</b>
  <br>Om ervoor te zorgen dat PostSharp deze code uitvoert, moet je een &apos;psplugin&apos;
  schrijven. Deze hoeft niet ingewikkeld te zijn. Zie als voorbeeld <a href="http://code.google.com/p/scoutframeworkfm2009/source/browse/trunk/FMSE.Core/FMSE.FMEntityWeaver.psplugin"
  rel="external">hier</a>.
  <br>
  <br>
<b>Et voila</b>
  <br>Na het builden van je DLL kan je deze openen met <a href="http://www.red-gate.com/products/dotnet-development/reflector/"
  rel="external">Reflector</a>, en zien dat de inner-method is veranderd:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/postsharp.png" title="http://www.100procentjan.nl/tweakers/postsharp.png"
  alt="http://www.100procentjan.nl/tweakers/postsharp.png">
</p>
   
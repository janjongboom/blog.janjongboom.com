---
layout:         post-tweakers
title:          "Bouw eens een API met WCF, deel 4: Beschikbaar via SOAP, XML en JSON"
date:           2011-02-16T13:30:00.000Z
categories:     Reacties (3)
originalUrl:    http://glamour.tweakblogs.net/blog/6152/bouw-eens-een-api-met-wcf-deel-4-beschikbaar-via-soap-xml-en-json.html
originalName:   Coding Glamour
language:       nl
commentCount:   3
commentUrl:     http://glamour.tweakblogs.net/blog/6152/bouw-eens-een-api-met-wcf-deel-4-beschikbaar-via-soap-xml-en-json.html#reacties
---

   <p class="article">Een API is geen API als er niet via verschillende protocollen tegenaan
  gepraat kan worden; iets wat in WCF volledig in config geregeld kan worden.
  In Visual Studio 2008 nog iets wat haast automatisch handwerk werd: de
  Configuration Editor was niet alleen alles behalve intuitief, maar genereerde
  ook nogal eens niet werkende configs. 2010 heeft daar echter verbeteringen
  in aangebracht, waardoor het configureren voor meerdere endpoints een breeze
  is.
  <!--more-->
<b>Service</b>
  <br>We gaan uit van de volgende service:
  <br>
  <br>
{% highlight csharp %}
    [ServiceContract]
    public interface IDemoService
    {
        [OperationContract]
        [WebGet]
        SomeContract GetData(string id);
    }
    public class DemoService : IDemoService
    {
        public SomeContract GetData (string id)
        {
            return new SomeContract(id);
        }
    }
    [DataContract]
    public class SomeContract
    {
        private readonly string _id;
        public SomeContract(string id)
        {
            _id = id;
        }
        [DataMember]
        public string Hoi { 
            get { return "Jan" + _id;  } 
            set { }
        }
    }
{% endhighlight %}
  <br>
  <br>
<b>Endpoints?</b>
  <br>Voor een standaard WCF API die SOAP en REST ondersteunt zijn er 2 endpoints
  nodig. Een endpoint is een adres waarop de service kan reageren volgens
  een bepaalde configuratieset. De endpoints in dit geval zijn:
  <ul>
    <li>rest, een webHttpBinding die luistert op adres &apos;&apos; (leeg)</li>
    <li>soap, een basicHttpBinding die luistert op adres &apos;soap&apos;</li>
  </ul>De &apos;soap&apos; binding biedt een WSDL aan om te gebruiken door andere
  platformen.
  <br>
  <br>
<b>Configureren</b>
  <br>In je project kies voor &apos;Tools&apos; -&gt; &apos;WCF Configuration
  Editor&apos;, en selecteer je web.config-file onder &apos;File&apos; -&gt;
  &apos;Open&apos; -&gt; &apos;Config file&apos;. Als je op &apos;Services&apos;
  klikt zie je dat er standaard al een aantal endpoints zijn aangemaakt.
  Verwijder deze allemaal met de &apos;Delete&apos; button.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints1.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints1.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints1.png">
  <br>
  <br>
<b>Behavior aanmaken</b>
  <br>Allereerst maken we een &apos;behavior&apos; aan, een set regels waar
  de service zich aan moet houden. Hier kunnen we instellen dat de service
  via HTTP te benaderen is. Nodig om de service beschikbaar te maken via
  REST.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints2.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints2.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints2.png">
  <br>
  <br>
<b>Eerste endpoint toevoegen: REST</b>
  <br>Wanneer je nu op de folder &apos;Services&apos; klikt, kies voor &apos;Create
  a New Service Endpoint&apos;. Je komt vervolgens in een wizard terecht.
  <br>
  <br>1. Selecteer allereerst de DLL van je service, en direct daarna de type:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints1.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints1.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints1.png">
  <br>
  <br>2. Kies bij &apos;What communication mode is your service using&apos;
  voor &apos;HTTP&apos;.
  <br>
  <br>3. Kies bij &apos;What method of interoperability do you want to use&apos;
  voor &apos;Basic Web Services interoperability&apos;
  <br>
  <br>4. Voer bij &apos;What is the address of your endpoint&apos; niets in:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints4.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints4.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints4.png">
  <br>
  <br>5. Het eerste endpoint is aangemaakt. Verander de volgende settings:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints5.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints5.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints5.png">
  <br>
  <br>Voila. Wanneer je nu build is je service beschikbaar onder:
  <br>http://localhost:POORT/DemoService.wcf/getdata?id=1
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints6.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints6.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints6.png">
  <br>
  <br>
<b>Tweede endpoint toevoegen: SOAP</b>
  <br>Voor het toevoegen van je &apos;SOAP&apos; endpoint, kies je weer voor
  &apos;Create a New Service Endpoint&apos;. Druk steeds op &apos;Next &gt;&apos;
  behalve bij &apos;Address&apos;. Voer hier &apos;soap&apos; in. C&apos;est
  soit.
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints7.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints7.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints7.png">
  <br>
  <br>Voor some reason kiest WCF er soms voor om &apos;&lt;identity/&gt;&apos;
  secties in je web.config te zetten. Deze zijn voor een publieke API niet
  nodig, als je hier een fout over krijgt; verwijder dan secties die er uit
  zien als:
  <br>
  <br>
{% highlight xml %}
          <identity>
            <certificateReference storeName="My" storeLocation="LocalMachine"
              x509FindType="FindBySubjectDistinguishedName" />
          </identity>
{% endhighlight %}
  <br>
  <br>Je SOAP service is nu beschikbaar onder: &apos;http://localhost:POORT/DemoService.wcf?wsdl&apos;,
  en is direct bruikbaar vanuit elk ander platform dat een SOAP client beschikbaar
  heeft!
  <br>
  <br>
<b>REST ook via JSON beschikbaar maken</b>
  <br>Met de huidige config is de service alleen via XML beschikbaar. We kunnen
  echter met &apos;behaviors&apos; de service ook via JSON beschikbaar maken.
  Maak onder &apos;Endpoint Behaviors&apos; de volgende behavior aan:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints8.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints8.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints8.png">
  <br>
  <br>Wanneer je nu het volgende endpoint toevoegt, is je service ook beschikbaar
  als JSON service:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints9.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints9.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints9.png">
  <br>
  <br>De service is benaderbaar via: http://localhost:POORT/DemoService.wcf/json/getdata?id=1
  <br>
  <img src="http://www.100procentjan.nl/tweakers/wcf_endpoints10.png" title="http://www.100procentjan.nl/tweakers/wcf_endpoints10.png"
  alt="http://www.100procentjan.nl/tweakers/wcf_endpoints10.png">
  <br>
  <br>
<b>Et voila</b>
  <br>In een paar minuten is je WCF service benaderbaar via XML, JSON en SOAP.
  Wanneer je bijvoorbeeld een NetTcpBinding (voor snelheid, reliability,
  noem iets) wil toevoegen, kan je gebruik maken van dezelfde stappen.</p>
   
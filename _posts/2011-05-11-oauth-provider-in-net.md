---
layout:         post-tweakers
title:          "OAuth provider in .NET"
date:           2011-05-11T15:45:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6538/oauth-provider-in-net.html
originalName:   Coding Glamour
language:       nl
commentCount:   5
commentUrl:     http://glamour.tweakblogs.net/blog/6538/oauth-provider-in-net.html#reacties
---

   <p class="article">Om maar eens met een auto-analogie te komen: wanneer je (iets te onbetrouwbare)
  neefje iets uit de kofferbak van je auto moet halen, kan het een onveilig
  gevoel geven om hem direct de sleutel van je nieuwe A4 te overhandigen.
  Hij kan immers met die sleutel de auto starten, wegrijden en je no-claim
  om zeep helpen. En doet hij het niet nu, dan kan hij de sleutel kopi&#xEB;ren
  en het morgen proberen. Zou het niet mooi zijn om een sleutel te geven
  die alleen werkt op de kofferbak?
  <br>
  <br>Zelfde geldt voor 3rd parties die bij jouw data willen. Wanneer een applicatie
  alleen een lijstje met de huizen die jij bewaard op funda wil tonen, waarom
  zou je dan je gebruikersnaam en wachtwoord moeten geven? Daar kan de applicatie
  immers &#xE1;lles mee. Daarom: <a href="http://oauth.net/" rel="external">OAuth</a>.
  <br>
  <br>
<i><b>An open protocol to allow secure API authorization in a simple and standard method from desktop and web applications.</b></i>
  <br>
<i>&quot;If you&apos;re storing protected data on your users&apos; behalf, they shouldn&apos;t be spreading their passwords around the web to get access to it. Use OAuth to give your users access to their data while protecting their account credentials.&quot;</i>
  <br>
  <br>OAuth is dus een open protocol waarmee je 3rd parties toegang kan geven
  tot data van je gebruikers, zonder dat de gebruiker zijn wachtwoord met
  de 3rd party hoeft te delen.
  <!--more-->
<b>Werking</b>
  <br>Met in de hoofdrollen &apos;3rd party&apos;, &apos;Leverancier&apos; en
  onze gebruiker &apos;jan@funda.nl&apos;.
  <ul>
    <li>- 3rd party: &quot;Hallo Leverancier. Ik wil gegevens van een gebruiker
      hebben. Hier is mijn door jullie gegeven key!&quot;</li>
    <li>- Leverancier: &quot;Hallo 3rd party. Hier is een token om aan je gebruiker
      te geven!&quot;</li>
    <li>- 3rd party: &quot;Gebruiker: ga naar de website van Leverancier met deze
      token.&quot;</li>
    <li>- <a href="mailto:jan@funda.nl" title="mailto:jan@funda.nl">mailto:jan@funda.nl</a>:
      &quot;Hallo Leverancier. Ik heb hier een token, en mijn gebruikersgegevens!&quot;</li>
    <li>- Leverancier: &quot;Prima in orde. Zeg maar tegen de 3rd party dat hij
      terug mag komen.&quot;</li>
    <li>- 3rd party: &quot;Ik heb hier een token, kan ik hier iets mee?&quot;</li>
    <li>- Leverancier: &quot;Ja, die token is zojuist gevalideerd. Hier is een
      nieuwe permanente token waarmee je voortaan alle gegevens van je gebruiker
      kan opvragen.&quot;</li>
  </ul>De 3rd party heeft nu een gevalideerde token en kan deze gebruiken om
  te authenticeren. Zoals je zag in bovenstaande lijst hoeft de gebruiker
  nooit aan de 3rd party bekend te maken wie hij is. Met de token kunnen
  gegevens opgevraagd worden:
  <ul>
    <li>- 3rd party: &quot;Ik wil graag de bewaarde woningen ophalen die bij deze
      token horen.&quot;</li>
    <li>- Leverancier: &quot;Prima. Hier heb je ze.&quot;</li>
  </ul>
  <img src="http://www.100procentjan.nl/tweakers/oauth.png" title="http://www.100procentjan.nl/tweakers/oauth.png"
  alt="http://www.100procentjan.nl/tweakers/oauth.png">
  <br>
<a href="http://www.snipe.net/2009/07/writing-your-first-twitter-application-with-oauth/"
  rel="external">via</a>
  <br>
  <br>
<b>En voor de gebruiker?</b>
  <br>Ik heb een voorbeeld client voor Twitter gepakt, en de URLs veranderd
  naar URLs van mezelf. Bij OAuth zijn er 3 type URLs te onderscheiden:
  <ul>
    <li>request_token: Opvragen van een request token</li>
    <li>authenticate: Authenticatie URL voor de gebruiker, waarbij je het token
      meegeeft in de URL</li>
    <li>access_token: Inwissel van request token -&gt; access token, om echt data
      op te halen</li>
  </ul><b>Request token</b>
  <br>Request token is aangevraagd, en de applicatie kondigt aan dat er authenticatie
  gaat plaatsvinden:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/oauth2.png" title="http://www.100procentjan.nl/tweakers/oauth2.png"
  alt="http://www.100procentjan.nl/tweakers/oauth2.png">
  <br>
  <br>
<b>Authenticatie</b>
  <br>De gebruiker authenticeert zich op de normale website van de leverancier.
  Je ziet de token die zonet gegenereert is:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/oauth3.png" title="http://www.100procentjan.nl/tweakers/oauth3.png"
  alt="http://www.100procentjan.nl/tweakers/oauth3.png">
  <br>
  <br>
<b>Uitwisselen request token -&gt; access token</b>
  <br>In dit geval moet er handmatig worden aangegeven (want Windows applicatie;
  in een webapplicatie stuur je de gebruiker door naar de &apos;authenticate&apos;
  URL met als extra param &apos;oauth_callback&apos;) dat er ingelogd is:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/oauth4.png" title="http://www.100procentjan.nl/tweakers/oauth4.png"
  alt="http://www.100procentjan.nl/tweakers/oauth4.png">
  <br>
  <br>
<b>Opvragen van data met de access token</b>
  <br>Elk request dat geauthoriseerd moet worden kan nu gedaan worden. Zie hier
  de response van een beveiligd contract:
  <br>
  <img src="http://www.100procentjan.nl/tweakers/oauth5.png" title="http://www.100procentjan.nl/tweakers/oauth5.png"
  alt="http://www.100procentjan.nl/tweakers/oauth5.png">
  <br>
  <br>
<b>Meer info?</b>
  <br>Zie deze presentatie op <a href="http://www.slideshare.net/leahculver/implementing-oauth"
  rel="external">Slideshare</a>.
  <br>
  <br>
<b>Implementatie</b>
  <br>Om je eigen data beschikbaar te maken via OAuth kan je helemaal zelf een
  provider schrijven middels de RFC, of dit doen met behulp van een pakket
  als <a href="https://github.com/bittercoder/DevDefined.OAuth" rel="external">DevDefined.OAuth</a> (open
  source). Een implementatie op basis van dit framework bestaat uit 4 onderdelen:
  <ul>
    <li>1. Provider: set van classes die globaal alle requests doorlussen naar
      je implementaties.</li>
    <li>2. Inspectors: validatie van berichten. Bijvoorbeeld op timestamp, gebruikte
      hashing of encryptiemethodes.</li>
    <li>3. Consumer store: mapping tussen je DAO en DevDefined.</li>
    <li>4. Token store: mapping tussen je DAO en DevDefined.</li>
  </ul><i><b>N.B.</b> De source staat ook onderaan in ZIP formaat.</i>
  <br>
  <br>
<b>Consumer store</b>
  <br>Wanneer je geen RSA encryptie gebruikt, is deze store behoorlijk simpel,
  en bestaat uit 2 methodes:
  <br>
  <br>
{% highlight csharp %}
public class ConsumerStore : IConsumerStore
{
    // bepaal op basis van context of een gebruiker je API mag gebruiken voor OAuth
    public bool IsConsumer (IConsumer consumer) {
        // iets als:
        var c = Dao.GetConsumer(consumer.ConsumerKey);
        
        return c != null && c.Rights.OAuth;
    }
    public void SetConsumerSecret (IConsumer consumer, string consumerSecret) {
        // meestal doe je dit ergens anders, dus niet nodig
    }
    public string GetConsumerSecret (IOAuthContext consumer) {
        // iets als:
        // LET OP! Je secret wordt gebruikt om requests
        // te hashen, raadt dus aan om deze geheim te houden
        return Dao.GetSecret(consumer.ConsumerKey);
    }
    // niet nodig als je geen RSA gebruikt
    public void SetConsumerCertificate (IConsumer consumer, X509Certificate2 certificate) {
        throw new NotImplementedException();
    }
    public AsymmetricAlgorithm GetConsumerPublicKey (IConsumer consumer) {
        throw new NotImplementedException();
    }
}
{% endhighlight %}
  <br>
  <br>
<b>Token store</b>
  <br>Hier een in-memory store. Je kunt deze makkelijk vertalen naar een met
  een database backend.
  <br>
  <br>
{% highlight csharp %}
public class SimpleTokenStore : ITokenStore
{
    // repo's
    private static List<IToken> _requestTokenRepository = new List<IToken>();
    private static List<IToken> _accessTokenRepository = new List<IToken>();
    // wordt aangeroepen als een gebruiker een token wil hebben
    public IToken CreateRequestToken(IOAuthContext context)
    {
        if (context == null) throw new ArgumentNullException("context");
        var token = new RequestToken
            {
                ConsumerKey = context.ConsumerKey,
                Realm = context.Realm,
                // je tokens kunnen gewoon nieuwe guid's zijn
                Token = Guid.NewGuid().ToString(),
                // je secret wordt wederom gebruikt om te hashen
                TokenSecret = Guid.NewGuid().ToString(),
            };
        _requestTokenRepository.Add(token);
        return token;
    }
    // aangeroepen door je 3rd party als deze zijn request token
    // wil inwisselen voor een access token
    public void ConsumeRequestToken(IOAuthContext requestContext)
    {
        if (requestContext == null) throw new ArgumentNullException("requestContext");
        // vind request token
        RequestToken requestToken = GetRequestToken(requestContext);
        // als AccessDenied, dan heeft de user nog niet gevalideerd
        if(requestToken.AccessDenied) throw new OAuthException(requestContext, "The request token wasn't validated", "Redirect your user to the authorize page");
        // zet token als gebruikt, en maak een access token aan
        UseUpRequestToken(requestContext, requestToken);
        // UPDATE in database
    }
    // gebruik een access token. valideert geldigheid.
    public void ConsumeAccessToken(IOAuthContext accessContext)
    {
        AccessToken accessToken = GetAccessToken(accessContext);
        if (accessToken == null)
        {
            throw new OAuthException(accessContext, OAuthProblems.TokenRejected, "Token could not be found");
        }
        if (accessToken.ExpireyDate < Clock.Now)
        {
            throw new OAuthException(accessContext, OAuthProblems.TokenExpired, "Token has expired");
        }
    }
    // haal het access token dat bij een request token hoort (of NULL als niet beschikbaar)
    public IToken GetAccessTokenAssociatedWithRequestToken(IOAuthContext requestContext)
    {
        RequestToken requestToken = GetRequestToken(requestContext);
        return requestToken.AccessToken;
    }
    // bekijkt of de gebruiker het request token al gevalideerd heeft
    public RequestForAccessStatus GetStatusOfRequestForAccess(IOAuthContext accessContext)
    {
        RequestToken request = GetRequestToken(accessContext);
        if (request.AccessDenied) return RequestForAccessStatus.Denied;
        return RequestForAccessStatus.Granted;
    }
    public string GetCallbackUrlForToken(IOAuthContext requestContext)
    {
        RequestToken requestToken = GetRequestToken(requestContext);
        return requestToken.CallbackUrl;
    }
    public string GetVerificationCodeForRequestToken(IOAuthContext requestContext)
    {
        RequestToken requestToken = GetRequestToken(requestContext);
        return requestToken.Verifier;
    }
    public string GetRequestTokenSecret(IOAuthContext context)
    {
        RequestToken requestToken = GetRequestToken(context);
        return requestToken.TokenSecret;
    }
    public string GetAccessTokenSecret(IOAuthContext context)
    {
        AccessToken token = GetAccessToken(context);
        if (token == null)
        {
            throw new OAuthException(context, OAuthProblems.TokenRejected, "No token was found");
        }
        return token.TokenSecret;
    }
    public IToken RenewAccessToken(IOAuthContext requestContext)
    {
        throw new NotImplementedException();
    }
    // wrapper methodes om je DAO heen
    RequestToken GetRequestToken(IOAuthContext context)
    {
        try
        {
            return _requestTokenRepository.GetToken<RequestToken>(context.Token);
        }
        catch (Exception exception)
        {
            // TODO: log exception
            throw Error.UnknownToken(context, context.Token, exception);
        }
    }
    AccessToken GetAccessToken(IOAuthContext context)
    {
        try
        {
            return _accessTokenRepository.GetToken<AccessToken>(context.Token);
        }
        catch (Exception exception)
        {
            // TODO: log exception
            throw Error.UnknownToken(context, context.Token, exception);
        }
    }
    public IToken GetRequestToken(string token)
    {
        return _requestTokenRepository.GetToken<RequestToken>(token);
    }
    public IToken GetToken(IOAuthContext context)
    {
        var token = (IToken)null;
        if (!string.IsNullOrEmpty(context.Token))
        {
            try
            {
                token = _accessTokenRepository.GetToken<AccessToken>(context.Token) ??
                        (IToken)_requestTokenRepository.GetToken<RequestToken>(context.Token);
            }
            catch (Exception ex)
            {
                // TODO: log exception
                throw Error.UnknownToken(context, context.Token, ex);
            }
        }
        return token;
    }
    // verander van request token naar access token.
    static void UseUpRequestToken(IOAuthContext requestContext, RequestToken requestToken)
    {
        // nieuwe token maken?
        var accessToken = new AccessToken()
            {
                ConsumerKey = requestContext.ConsumerKey,
                Realm = requestContext.Realm,
                Token = Guid.NewGuid().ToString(),
                TokenSecret = Guid.NewGuid().ToString(),
                ExpireyDate = DateTime.Now.AddYears(1),
                UserName = "jan2@funda.nl"
            };
        requestToken.AccessToken = accessToken;
        _accessTokenRepository.Add(accessToken);
    }
}
public static class TokenExtender
{
    public static T GetToken<T>(this List<IToken> repo, string token)
        where T: IToken
    {
        return repo.OfType<T>().FirstOrDefault(t => t.Token == token);
    }
}
{% endhighlight %}
  <br>
  <br>
<b>WCF service</b>
  <br>We maken gebruik van een WCF service voor onze OAuth methodes. Eerst leggen
  we een referentie naar de &apos;provider&apos;:
  <br>
  <br>
{% highlight csharp %}
    public class DemoService : IDemoService
    {
        // ref naar token store
        private static SimpleTokenStore tokenStore = new SimpleTokenStore();
        // ref naar consumer store
        private static IConsumerStore consumerStore = new ConsumerStore();
        
        // maak nieuwe provider
        private static IOAuthProvider provider = new OAuthProvider(tokenStore,
            // doe aan consumer validatie
            new ConsumerValidationInspector(consumerStore),
            // body validation
            new BodyHashValidationInspector(), 
            // valideer dat de signatures (en dus de private keys) kloppen
            // voeg toe dat er alleen HmacSha1 gebruikt mag worden
            // Je kan ervoor kiezen om RSA te gebruiken, of Plaintext (maar doe dit alleen over HTTPS)
            new SignatureValidationInspector(new ConsumerStore(), new OAuthContextSigner( new HmacSha1SignatureImplementation())),
            // de timestamp van de client mag max 5 minuten afwijken
            new TimestampRangeInspector(new TimeSpan(0, 0, 5, 0), new TimeSpan(0,0,5,0)));
            
        // Context bepalen adhv je URL & parameters
        private IOAuthContext GetContext()
        {
            var requestContext = OperationContext.Current.RequestContext;
            Message request = requestContext.RequestMessage;
            var requestProperty = (HttpRequestMessageProperty)request.Properties[HttpRequestMessageProperty.Name];
            IOAuthContext context = new OAuthContextBuilder().FromUri(requestProperty.Method, request.Headers.To);
            // kent nog geen standaard operatie om met WCF de headers te lezne, maar kan ook zo:
            if (WebOperationContext.Current != null)
            {
                if (WebOperationContext.Current.IncomingRequest.Headers.AllKeys.Contains("Authorization"))
                {
                    context.UseAuthorizationHeader = true;
                    context.AuthorizationHeaderParameters = UriUtility.GetHeaderParameters(WebOperationContext.Current.IncomingRequest.Headers["Authorization"]).ToNameValueCollection(); ;
                }
            }
            return context;
        }
    }
{% endhighlight %}
  <br>
  <br>
<b>request_token</b>
  <br>In je WCF service:
  <br>
  <br>
{% highlight csharp %}
// maakt nieuw request token aan
public Stream request_token()
{
    var token = provider.GrantRequestToken(GetContext());
    return new System.IO.MemoryStream(Encoding.Default.GetBytes(string.Format("oauth_token={0}&oauth_token_secret={1}", token.Token, token.TokenSecret)));
}
{% endhighlight %}
  <br>
  <br>
<b>access_token</b>
  <br>In je WCF service:
  <br>
  <br>
{% highlight csharp %}
public Stream access_token()
{
    var exchangeRequestTokenForAccessToken = provider.ExchangeRequestTokenForAccessToken(GetContext());
    return new System.IO.MemoryStream(Encoding.Default.GetBytes(string.Format("oauth_token={0}&oauth_token_secret={1}", exchangeRequestTokenForAccessToken.Token, exchangeRequestTokenForAccessToken.TokenSecret)));
}
{% endhighlight %}
  <br>
  <br>
<b>authorize</b>
  <br>Om je request token in te wisselen kan je elke login pagina op je website
  gebruiken. In het standaard ASP.NET MVC 2 project in de AccountController.cs.
  Verander de &apos;Logon&apos; actie in iets als:
  <br>
  <br>
{% highlight csharp %}
// nieuwe oauth params
[HttpPost]
public ActionResult LogOn(LogOnModel model, string oauth_token, string oauth_callback)
{
    if (ModelState.IsValid)
    {
        if (MembershipService.ValidateUser(model.UserName, model.Password))
        {
            var client = new OAuthClient();
            // upgrade request token naar normaal token voor user
            client.authorize_user(oauth_token);
            if (!String.IsNullOrEmpty(oauth_callback)) {
                return Redirect(oauth_callback);
            } else {
                return RedirectToAction("Account", "OAuthComplete");
            }
        }
        else
        {
            ModelState.AddModelError("", "The user name or password provided is incorrect.");
        }
    }
    // If we got this far, something failed, redisplay form
    return View(model);
}
{% endhighlight %}
  <br>
  <br>
<b>Testen?</b>
  <br>Downloaden:
  <ul>
    <li><a href="http://www.100procentjan.nl/tweakers/service.zip" rel="external">Test service</a> (draai
      op poort 1339)</li>
    <li><a href="http://www.100procentjan.nl/tweakers/website.zip" rel="external">Test website</a> (draai
      op poort 1338)</li>
    <li><a href="http://www.100procentjan.nl/tweakers/client.zip" rel="external">Test client</a> (negeer
      het PIN gedeelte, gewoon op Update drukken)</li>
  </ul>
</p>
   
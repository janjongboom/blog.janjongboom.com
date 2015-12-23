---
layout:         post-tweakers
title:          "Generic retry"
date:           2010-12-17T09:57:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/5764/generic-retry.html
originalName:   Coding Glamour
language:       nl
commentCount:   18
commentUrl:     http://glamour.tweakblogs.net/blog/5764/generic-retry.html#reacties
---

   <p class="article">Wanneer je calls naar externe sources doet (webservices, database, etc.)
  kan het voorkomen dat je hier een retry-mechanisme voor nodig hebt. In
  plaats van deze logica telkens opnieuw schrijven, zou het mooi zijn om
  dit generiek op te lossen!
  <br>
  <br>
{% highlight csharp %}
try {
    // doe Dao.GetDataset() maximaal 3 keer met 200 ms. pauze ertussen
    // en gooi een exception als het na 3 keer nog niet gelukt is.
    var dataSet = Actions.Retry( ()=> Dao.GetDataset(), 3, 200, true);
} catch (Exception ex) {
     // 3 keer geprobeerd, 3 keer gefaald :-o
}
{% endhighlight %}
  <br>
  <br>
<b>Implementatie</b>
  <br>Fairly simple eigenlijk (en een mooie reden om weer eens een goto te gebruiken!):
  <!--more-->
  <br>
{% highlight csharp %}
public static class Actions
{
    // del: een delegate die iets teruggeeft
    // throwExceptions: als true, dan worden er exceptions gegooid; als false dan wordt default(T) teruggegeven (NULL voor strings).
    public static T Retry<T>(RetryDelegate<T> del, int numberOfRetries, int msPause, bool throwExceptions)
    {
        int counter = 0;
    BeginLabel:
        try
        {
            counter++;
            return del.Invoke();
        }
        catch (Exception ex)
        {
            if (counter > numberOfRetries)
            {
                if (throwExceptions)
                {
                    throw;
                }
                
                return default(T);
            }
            Thread.Sleep(msPause);
            goto BeginLabel;
        }
    }
}
{% endhighlight %}
  <br>
  <br>En de &apos;void&apos; versie van deze functie, wanneer je geen resultaat
  terug wil hebben:
  <br>
  <br>
{% highlight csharp %}
public static bool Retry(RetryDelegate del, int numberOfRetries, int msPause, bool throwExceptions)  
{ 
    return Retry( ()=> { del.Invoke(); return true; }, numerOfRetries, msPause, throwExceptions); 
}
{% endhighlight %}
  <br>
  <br>Uiteraard zelf nog ruimte voor logging etc. in de implementatie!</p>
   
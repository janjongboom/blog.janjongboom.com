---
layout:         post-tweakers
title:          "Custom Attributes op enum's"
date:           2010-12-21T13:21:00.000Z
categories:     Backend
originalUrl:    http://glamour.tweakblogs.net/blog/5788/custom-attributes-op-enums.html
originalName:   Coding Glamour
language:       nl
commentCount:   5
commentUrl:     http://glamour.tweakblogs.net/blog/5788/custom-attributes-op-enums.html#reacties
---

   <p class="article">Nogal vaak zie ik code in een MVC Controller staan als:
  <br>
  <br>
{% highlight csharp %}
public enum Pagina
{
     [UrlPart("")]
     Index,
     [UrlPart("about-us")]
     OverOns,
}
{% endhighlight %}
  <br>Waarbij er acties zijn als:
  <br>
  <br>
{% highlight csharp %}
public void MaakLink (Pagina targetPagina)
{
     string urlPart = ...;
     // hierboven moeilijke code om 'UrlPart' attribute te vinden
     // op de huidige waarde van de enum
}
{% endhighlight %}
  <br>Daarom vandaag een kleine snippet, die eenvoudig een attribute kan uitlezen
  van een enum, waarbij de syntax als volgt wordt:
  <br>
  <br>
{% highlight csharp %}
string urlPart = targetPagina.GetCustomAttribute<UrlPartAttribute>().EenProperty;
{% endhighlight %}
  <!--more-->
<b>Implementatie</b>
  <br>Als extension method vrij eenvoudig te bakken als je je beseft dat waardes
  van een enum als &apos;fields&apos; op het type zitten:
  <br>
  <br>
{% highlight csharp %}
    public static class EnumExtender
    {
        public static T GetCustomAttribute<T>(this System.Enum enumValue)
            where T : class
        {
            T[] attributes = (T[]) enumValue.GetType().GetField(enumValue.ToString()).GetCustomAttributes(typeof(T), false);
            return attributes.Length > 0 ? attributes[0] : default(T);
        }
    }
{% endhighlight %}</p>
   
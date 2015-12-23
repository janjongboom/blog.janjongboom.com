---
layout:         post-tweakers
title:          "Javascript, state van snel opvolgende AJAX requests bijhouden (?)"
date:           2011-01-12T12:53:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/5932/javascript-state-van-snel-opvolgende-ajax-requests-bijhouden-%28%29.html
originalName:   Coding Glamour
language:       nl
commentCount:   9
commentUrl:     http://glamour.tweakblogs.net/blog/5932/javascript-state-van-snel-opvolgende-ajax-requests-bijhouden-%28%29.html#reacties
---

   <p class="article">Tijdens het productiewaardig krijgen van de Javascript van <a href="http://glamour.tweakblogs.net/blog/5813/video!-on-the-fly-zoeksuggesties-levenshtein-en-soundex-in-de-praktijk.html"
  rel="external">de nieuwe zoeksuggesties</a> stuitte ik op een probleem waarin
  de gebruiker snel achter elkaar doortypt:
  <br>
  <br>
{% highlight text %}
amst            (request #1)
amste            (request #2)
amster            (request #3)
{% endhighlight %}
  <br>Geen probleem zolang de requests allemaal even lang duren. Maar wanneer
  deze terugkomen in de volgorde:
  <br>
  <br>
{% highlight text %}
#1
#3
#2
{% endhighlight %}
  <br>staat er verkeerde data in de suggesties.
  <!--more-->
<b>Oplossingsrichting</b>
  <br>In mijn prototype koos ik ervoor om zoiets te implementeren:
  <br>
  <br>
{% highlight js %}
var state = { ajaxRequest: null };
function suggest(query) {
    if(state.ajaxRequest) state.ajaxRequest.abort();
    state.ajaxRequest= $.get("...", function(response) {
        if(!response) // aborted; return;
        
        state.ajaxRequest= null; // alleen als succesvol
    });
}
{% endhighlight %}
  <br>Niet alleen vrij veel code, maar ook het aborten zat me niet helemaal
  lekker. Nu voor een wat cleanere manier gekozen:
  <br>
  <br>
{% highlight js %}
var state = { requestCounter: 0 };
function suggest(query) {
    var requestCounter = ++state.requestCounter;
    $.get("...", function (response) {
        if(requestCounter !== state.requestCounter) return; // is al een nieuwe
    });
}
{% endhighlight %}
  <br>
  <br>Werkt volgens mij net zo goed, of zie ik iets helemaal over het hoofd?</p>
   
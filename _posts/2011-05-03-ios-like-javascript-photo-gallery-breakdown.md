---
layout:         post-tweakers
title:          "iOS like Javascript photo gallery breakdown"
date:           2011-05-03T12:23:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6492/ios-like-javascript-photo-gallery-breakdown.html
originalName:   Coding Glamour
language:       nl
commentCount:   14
commentUrl:     http://glamour.tweakblogs.net/blog/6492/ios-like-javascript-photo-gallery-breakdown.html#reacties
---

   <p class="article">Vandaag een breakdown van de swipe-events in de <a href="http://m.funda.nl/koop/aerdenhout/huis-47083326-aerdenhoutsduinweg-20/fotos/"
  rel="external">photo gallery</a> die we op onze mobiele website gebruiken.
  Verwacht niet een line-to-line breakdown, maar alleen de wijzigingen die
  hebben moeten doen om van onze more-or-less statische versie een versie
  te maken die swipe events ondersteunt.
  <br>
  <br>
<b>Let&apos;s get it started</b>
  <br>Omdat we gebruik willen maken van de &apos;touchmove&apos; events gebruiken
  we een zelfgeschreven jQuery plugin die de interface iets handiger maakt:
  <a
  href="http://pastebin.com/4B1dWk5c" rel="external">jquery.(s)wipe.js</a>. De syntax voor deze plugin is:
    <br>
    <br>
{% highlight js %}
$('#een-element').wipe({
    wipeStart: /* */,
    wipe: /* */,
    wipeEnd: /* */
});
{% endhighlight %}
    <br>We kunnen aan deze events functies koppelen waardoor we alle logica voor
    het swipen op &#xE9;&#xE9;n plaats hebben.
    <!--more-->
<b>Verschillende manieren voor animaties</b>
    <br>Om de animaties te maken hebben we een aantal manieren geprobeerd:
    <ul>
      <li>1. Voeg twee extra afbeeldingen toe aan de DOM, 1 links van je huidige
        afbeelding, 1 rechts van je huidige afbeelding. Zet hier een container
        omheen, en positioneer deze absoluut met de CSS property &apos;left&apos;.
        Nadat de animatie klaar is verwissel je de afbeeldingen.</li>
      <li>2. Teken de afbeeldingen die zichtbaar zijn (bij naar rechts slepen de
        vorige en de huidige) op een canvas.</li>
      <li>3. Doe 1. maar dan i.p.v. met &apos;left&apos; met &apos;-webkit-transform&apos;</li>
    </ul>Al deze manieren hadden hun quircks. 1. performt redelijk in portrait
    mode op iPhone en Android; maar slecht in landscape, en dramatisch op Blackberry
    OS 6. 2 Performt dramatisch op iOs vanwege de slechte kwaliteit van hun
    Canvas implementatie. 3 werkt goed op iPhone, Android en BB OS 6; maar
    niet als je op de iPhone in landscape mode draait, want dan komen er flikkeringen.
    Ook waren er in eerste instantie flikkeringen tijdens de animatie in iOS
    4.2 en hoger (en niet in 4.1) wanneer je de CSS prop &apos;-webkit-backface-visibility&apos;
    niet zette naar &apos;hidden&apos;. Zucht. Uiteindelijk hebben we op de
    laatste dag alles toch nog smooth gekregen door de volgende methode te
    gebruiken:
    <br>
    <br>Teken voor elke afbeelding voor een object een &lt;img/&gt; tag, en zet
    deze in een container. Positioneer de container met &apos;-webkit-transform&apos;.
    De afbeeldingen worden uiteraard niet allemaal ingeladen; dat doen we pas
    als we verwachten dat we de afbeelding nodig gaan hebben.
    <br>
<i>N.B. We doen nu alleen webkit omdat iOS, Android en BB OS 6 allen een webkit browser hebben. Wanneer we ook Phone 7 gaan ondersteunen voegen we ook normale CSS3 transforms toe.</i>
    <br>
    <br>
<b>Breakdown</b>
    <br>De volledige javascript voor de gallery is <a href="http://pastebin.com/DR9FaMzN"
    rel="external">hier te vinden</a>. Het toevoegen van alle &lt;img/&gt;&apos;s
    vind je op regel 341. Op regel 26 doen we de eerste test, namelijk het
    controleren of we webkit transforms supporten:
    <br>
    <br>
{% highlight js %}
    var isWebkitTransform = (function () { 
        var div = document.createElement('div');
        div.innerHTML = '<div style="-webkit-transition:color 1s linear;"></div>';
        var cssTransitionsSupported = (div.firstChild.style.webkitTransition !== undefined);
        delete div;
        return cssTransitionsSupported;
    })();
{% endhighlight %}
    <br>
    <br>Op regel 311 gaan we hier uiteindelijk iets mee doen, in de &apos;herpositioneer&apos;
    functie:
    <br>
    <br>
{% highlight js %}
    // x = nieuwe positie
    // duration = tijd in ms; als 0 dan positioneren we direct zonder animatie. Handig tijdens swipen met je vinger.
    // finishedCallback = functie die aangeroepen moeten worden als de anim klaar is
    var repositionContainer = function (x, duration, finishedCallback) {
        x = (x | 0); // rond af op hele pixels; is goed voor de performance
 
        // snelle hack om te zorgen dat we hier geen check voor hoeven te doen
        finishedCallback = finishedCallback || function () { };
 
        // als we geen webkitTransform hebben kunnen we gebruiken maken van jQuery animate
        if (!isWebkitTransform) {
            if (!duration) {
                scroller.self.css({ left: -x });
                finishedCallback();
            } else {
                scroller.self.animate({ left: -x }, duration, finishedCallback);
            }
        } else {
            // met webkit transform moeten we aanhaken aan het webkitTransitionEnd event
            var cb = function () {
                finishedCallback();
                scroller.self.unbind('webkitTransitionEnd');
            }
            scroller.self.bind('webkitTransitionEnd', cb);
 
            // al deze properties moeten gezet worden voor een smooth anim op alle devices
            scroller.self.css({
                '-webkit-transform': 'translate(' + -x + 'px,0px)',
                '-webkit-transition-duration': (duration || 0) + 'ms',
                '-webkit-backface-visibility': 'hidden',
                '-webkit-transition-property': '-webkit-transform'
            });
        }
    };
{% endhighlight %}
    <br>
    <br>We haken nu in op de swipe plugin om de container te verplaatsen als iemand
    met zijn vinger over het scherm gaat (regel 226).
    <br>
    <br>
{% highlight js %}
    // Swipe events
    $(document).ready(function () {
        // dit is de scroller container
        var $this = scroller.self;
 
        // we applyen het swipe event op onze media container
        $(media.self).wipe({
            events: {
                wipeStart: function () {
                    if (inTouchMove) {
                        // zijn we nog in de touch move? dan stop anim
                        if (isWebkitTransform) {
                            // in webkit doe je dit door de duration naar 0ms te zetten
                            // dan eindigt de animatie direct op de juiste locatie
                            $this.css({
                                '-webkit-transition-duration': '0ms'
                            });
                        } else {
                            // in jQuery hebben we 'stop'
                            $this.stop(true, true);
                        }
                    }
 
                    // setImages() handelt het positioneren en het preloaden van afbeeldingen
                    setImages();
                },
                // deze methode gaat af op het 'onTouchMove' event
                wipe: function (dx, dy) {
                    // current = huidige index; dit is dus onze originele positie
                    var baseLine = current * itemWidth;
 
                    // wanneer je aan het begin / einde van de stream bent mag je niet helemaal door swipen
                    if ((current === 0 && dx > 0) || (current === data.length - 1 && dx < 0)) {
                        dx = 0.4 * dx;
                    }
 
                    // herpositioneer de container op de originele positie - verplaatsing
                    repositionContainer(baseLine - dx, 0);
                },
                // einde van de swipe (gebruiker laat los)
                wipeEnd: function (dx, dy) {
                    // we hanteren een threshold van 20% van de afbeelding; anders blijven we op de huidige
                    if (dx < 0 && (Math.abs(dx) > itemWidth * 0.2) && data[current + 1]) {
                        // animeer naar volgende afbeelding
                        next(true);
                    } else if (dx > 0 && (Math.abs(dx) > itemWidth * 0.2) && data[current - 1]) {
                        // animeer naar vorige afbeelding
                        previous(true);
                    } else {
                        // anders teruganimeren naar de originele positie
                        var baseLine = current * itemWidth;
 
                        repositionContainer(baseLine, options.animationSpeed);
                        setTimeout(function () { inTouchMove = false; }, options.animationSpeed);
                    }
                }
            },
            minTimeBetweenSwipeEvents: 0
        });
    });
{% endhighlight %}
    <br>
    <br>Omdat we ook via de thumbs onderin kunnen navigeren hebben we in onze
    refresh() functie een &apos;smooth&apos; parameter nodig die doorgegeven
    wordt door next() en previous() (zie vorige functie). Regel 113:
    <br>
    <br>
{% highlight js %}
    var refresh = function (smooth, previousIdx) {
        // wanneer we via een anim willen, en we uberhaupt een andere afbeelding hebben
        if (smooth && previousIdx !== current) {
            // verander de positie via een animatie
            repositionContainer(current * itemWidth, options.animationSpeed, function () {
                inTouchMove = false;
                setImages();
            });
        } else {
            // anders zet de positie direct zonder vertraging
            setImages(true);
        }
        refreshUi();
    };
{% endhighlight %}</p>
   
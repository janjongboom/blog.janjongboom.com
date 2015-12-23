---
layout:         post-tweakers
title:          "Javascript herschrijven naar een jQuery plugin"
date:           2011-01-28T12:04:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/6020/javascript-herschrijven-naar-een-jquery-plugin.html
originalName:   Coding Glamour
language:       nl
commentCount:   4
commentUrl:     http://glamour.tweakblogs.net/blog/6020/javascript-herschrijven-naar-een-jquery-plugin.html#reacties
---

   <p class="article">Wanneer het op &apos;normale&apos; backendcode aankomt is refactoring
  en het opnieuw schrijven van delen code welhaast een routineklus geworden.
  JavaScript is daarin wat lastiger; scoping is minder transparant, dus je
  breekt eenvoudig bestaande code die wellicht niets te maken heeft met jouw
  deel; en de flexibiliteit kan tegen je gaan werken. Vandaar een artikel
  over de wondere wereld van het herschrijven van de JavaScript voor de footer
  op funda!
  <br>
  <img src="http://www.100procentjan.nl/tweakers/viafunda.png" title="http://www.100procentjan.nl/tweakers/viafunda.png"
  alt="http://www.100procentjan.nl/tweakers/viafunda.png">
  <!--more-->
<b>Eisen</b>
  <ul>
    <li>Zoeken in het aanbod op funda, funda in business en funda landelijk</li>
    <li>Afhankelijk van de categorie staat er een textbox, een lijst met provincies,
      of een lijst met regio&apos;s</li>
    <li>Backend code herschrijven we niet</li>
  </ul><b>Huidige situatie</b>
  <br>De huidige code voor de footer is <a href="http://pastebin.com/LfXQmvD5"
  rel="external">als volgt</a>. Key element hierin is de &apos;SoortAanbod&apos;
  enum die bij ons in code staat:
  <br>
  <br>
{% highlight csharp %}
public enum SoortAanbod
{
    Koop: 10,
    Huur: 11,
    // etc.
}
{% endhighlight %}
  <br>De dropdownlist met categorie-selectie is een directe mapping van deze
  enum:
  <br>
  <br>
{% highlight html %}
<select class="type-via-funda" id="dropSubType">
    <optgroup label="Woningaanbod">
        <option value="10" selected="selected">Koopwoningen</option>
        <option value="11">Huurwoningen</option>
        <option value="12">Nieuwbouwprojecten</option>
    </optgroup>
</select>
{% endhighlight %}
  <br>In de JavaScript wordt er weer met deze id&apos;s gewerkt voor het tonen
  van de verschillende input-mogelijkheden (vanaf regel 86):
  <br>
  <br>
{% highlight js %}
var cs = $('#dropSubType').val();
switch (cs) {
    case '10':
    case '11':
        $('#ppcplaats').show();
        // toon <input type=text/>
}
{% endhighlight %}
  <br>De input-elementen staan altijd op de pagina, en worden met &apos;display:
  none&apos; onzichtbaar gemaakt als ze niet mogelijk zijn qua selectie.
  <br>
  <br>
{% highlight html %}
<p>
    <!-- textbox -->
    <input type="text" title="Plaatsnaam -of- postcode" placeholder="Plaatsnaam -of- postcode" value="" class="input-via-funda" id="ppcplaats" autocomplete="off" style="display: block; ">
    <!-- landen voor europees aanbod -->
    <select class="select-via-funda" id="land" name="land" style="display: none; "></select>
    <!-- regio's voor horeca -->
    <select class="select-via-funda" id="horegio" name="horegio" style="display: none; "></select>
    <!-- provincies -->
    <select class="select-via-funda" id="provincie" name="provincie" style="display: none; "></select>
    <!-- regio's voor landelijk aanbod -->
    <select class="select-via-funda" id="landelijk" name="landelijk" style="display: none; "></select>
</p>
{% endhighlight %}
  <br>
  <br>
<b>Huidige situatie op de server</b>
  <br>
<i>Ja, dit is bad-practice; maar dit artikel gaat over het herschrijven van JavaScript, we houden de werking dus intact</i>.
  <br>Bij elke aanpassing in tekst, dropdown-waarde, etc. wordt een hidden field
  bijgewerkt:
  <br>
  <br>
{% highlight html %}
<input type="hidden" value="0" class="viaSearchKey" name="viaSearch" id="viaSearch" />
{% endhighlight %}
  <br>In dit hidden element moet de waarde als volgt worden opgemaakt:
  <br>
  <br>
{% highlight text %}
SoortAanbod | Waarde
bv. 10|Amsterdam  voor koopaanbod in Amsterdam
of    23|Utrecht  voor horeca in Utrecht
{% endhighlight %}
  <br>
  <br>
<b>Herbouwen</b>
  <br>We gebruiken jQuery als onze core-library voor al onze JavaScript. Veel
  van onze componenten ontwikkelen we daarom ook als jQuery plugin: door
  de best-practices hierin te gebruiken worden veel problemen m.b.t. scoping
  opgelost.
  <br>
  <br>De basis van de plugin:
  <br>
  <br>
{% highlight js %}
// functie die direct wordt aangeroepen
(function ($) {
    // $ === jQuery op dit moment; snellere syntax
    
    // we gaan jQuery.protoype uitbreiden. Deze is gemapt op $.fn
    $.fn.extend({
        // nieuwe plugin heet 'viaFunda'
        // 'opts' argument voor het meegeven van options
        viaFunda: function (opts){
            // this is een jQuery object hier
            // we gaan voor elk element in de set de plugin uitvoeren
            return this.each(function () {                            
                // magic!
            });
        }
    });
})(jQuery);
{% endhighlight %}
  <br>
  <br>Allereerst hebben we een lijst met alle controls nodig, door deze strong
  te mappen is de kans op fouten kleiner:
  <br>
  <br>
{% highlight js %}
return this.each(function () {        
    // in options zetten we de 'standaard' waardes
    var options = {
        controls: {
            type: $('#dropSubType'),
            vrijeInvoer: $('#ppcplaats'),
            landen: $('#land'),
            horecaRegios: $('#horegio'),
            provincies: $('#provincie'),
            landelijkRegios: $('#landelijk'),
            magicElement: $('#viaSearch'),
            form: $(this).closest('form')
        }
    };
    
    // options kunnen overschreven worden via 'opts' argument
    // dus gaan we ze samenvoegen, waar 'opts' voorrang heeft
    $.extend(true, options, opts);
    // options bevat nu ook de waardes uit 'opts'
}
{% endhighlight %}
  <br>
  <br>Ook willen we af van de gehardcode waardes van de enum in code, dus maken
  we de enum na. JavaScript kent geen &apos;enum&apos; velden, maar eigenlijk
  zijn ze sowieso zwaar overrated:
  <br>
  <br>
{% highlight js %}
var typeEnum = {
    wonen: {
        koop: 10,
        huur: 11,
        nieuwbouw: 12,
        recreatie: 13,
        europe: 14
    },
    business: {
        kantoor: 20,
        bedrijfshal: 21,
        winkel: 22,
        horeca: 23,
        bouwgrond: 24,
        overige: 25
    },
    landelijk: {
        woningen: 111,
        agrarischeBedrijven: 205,
        losseGrond: 102
    }
};
{% endhighlight %}
  <br>
  <br>
<b>Events afvangen</b>
  <br>Het belangrijkste event dat we willen afvangen, is het moment dat iemand
  de waarde in de dropdown verandert.
  <br>
  <br>
{% highlight js %}
// events die we willen afhandelen
var initEvents = function () {
    // bind de functie aan het 'change' event
    // roep deze meteen aan om de initial weergave goed te zetten
    options.controls.type.change(typeDropdownChanged).change();
};
// event - dropdownlist is veranderd
var typeDropdownChanged = function (ev) {
    // pak de waarde uit de type-dropdownlist
    var selectedType = Number(options.controls.type.val());
    
    // het nieuwe control dat we gaan tonen
    var ctrl;
    
    // hee, dat lijkt verdomd veel op C#
    switch(selectedType) {
        case typeEnum.wonen.europe:
            ctrl = options.controls.landen;
            break;
            
        case typeEnum.business.overige:
        case typeEnum.business.bouwgrond:
            ctrl = options.controls.provincies;
            break;
        
        case typeEnum.business.horeca:
            ctrl = options.controls.horecaRegios;
            break;
            
        case typeEnum.landelijk.agrarischeBedrijven:
        case typeEnum.landelijk.woningen:
        case typeEnum.landelijk.losseGrond:
            ctrl = options.controls.landelijkRegios;
            break;
            
        default:
            ctrl = options.controls.vrijeInvoer;
            break;
    }
    
    // hier gaan we echt switchen
    switchType(ctrl);
};
{% endhighlight %}
  <br>
  <br>Goede control tonen:
  <br>
  <br>
{% highlight js %}
// ctrl is het control dat getoond moet worden
var switchType = function (ctrl) {
    // hide alle controls
    options.controls.vrijeInvoer.hide();
    options.controls.landen.hide();
    options.controls.horecaRegios.hide();
    options.controls.provincies.hide();
    options.controls.landelijkRegios.hide();
    
    // en toon degene die echt zichtbaar moet worden
    ctrl.show();
};
{% endhighlight %}
  <br>
  <br>
<b>Hidden element setten</b>
  <br>Nu wordt weliswaar het juiste element zichtbaar, maar de waarde is nog
  niet zichtbaar. Daarvoor kunnen we inhaken op het &apos;submit&apos; event
  van ons formulier:
  <br>
  <br>
{% highlight js %}
var initEvents = function () {
    options.controls.type.change(typeDropdownChanged).change();
    
    // code die uitgevoerd wordt 'on submit'
    options.controls.form.submit(submitForm);
};
// event - form wordt gesubmit
var submitForm = function (ev) {
    // hier gaan we magicElement setten
    // key begint met de waarde van de 'type' dropdown
    var key = options.controls.type.val();
    key += '|'; // pipe toevoegen
    
    // zoek op welk input element visible is
    var visibleElement;
    // itereer over alle selectie-inputs en kijk welke zichtbaar is
    $([ options.controls.vrijeInvoer, options.controls.landen, options.controls.horecaRegios, options.controls.provincies, options.controls.landelijkRegios ]).each(function (ix, ele) {
        if(ele.is(':visible')) {
            visibleElement = ele;
        }
    });
    // voeg de waarde toe aan de key
    key += visibleElement.val();
    
    // en doe some magic
    options.controls.magicElement.val(key);
};
{% endhighlight %}
  <br>
  <br>
<b>Et voila</b>
  <br>Werking is hetzelfde gebleven, maar de code gebruikt nu geen global vars,
  magic numbers, etc. De logica voor de autosuggest is uit deze plugin gehaald,
  want die heeft hier niets mee te maken. Wel hadden we nog een event nodig
  waaraan gebruikers van onze plugin konden subscriben, om zo dingen te veranderen
  aan de autosuggest-plugin. Je gebruikt de code ongeveer als volgt:
  <br>
  <br>
{% highlight js %}
$(document).ready(function () {
    // roep de plugin aan
    $('#ftr-extra').viaFunda({
        // event dat gevuurd wordt
        events: {
            // als het type verandert
            onTypeChanged: function (aanbod) {
                // geef dit door aan de zoekbox
                $('#ppcplaats').zoekboxfrontend('soortaanbod', aanbod);
            }
        }
    });
    // roep de autocomplete plugin aan
    $('#ppcplaats').zoekboxfrontend({
        /* instellingen */
    });
});
{% endhighlight %}
  <br>
  <br>
<b>Hele plugin</b>
  <br>De hele plugin, inclusief het &apos;onTypeChanged&apos; event, is <a href="http://pastebin.com/tYyNg0nB"
  rel="external">hier te vinden</a>.</p>
   
---
layout:         post-tweakers
title:          "Inheritance in javascript"
date:           2012-04-12T16:54:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/7779/inheritance-in-javascript.html
originalName:   Coding Glamour
language:       nl
commentCount:   8
commentUrl:     http://glamour.tweakblogs.net/blog/7779/inheritance-in-javascript.html#reacties
---

   <p class="article">Inheritance in javascript blijf verdomd moeilijk, zoals ik deze week weer
  tegenkwam toen ik een vriend hielp in het porten van wat AS3 code naar
  javascript. Vandaar wat ready to use code snippets en een kleine uitleg
  om inheritance toe te passen.
  <br>
  <br>Javascript kent een aantal manieren om code te mixen, maar ze zijn globaal
  onder te verdelen in inheritance en <a href="http://javascriptweblog.wordpress.com/2011/05/31/a-fresh-look-at-javascript-mixins/"
  rel="external">mixins</a>. Inheritance is prettig voor een object structuur
  die je in een taal als Java of C# zou schrijven. Single inheritance van
  classes, als in Object-&gt;GameObject-&gt;Person-&gt;Enemy. Elk van de
  parent classes zou ook los kunnen bestaan, en de classes mogen zelf <b>state</b> bijhouden.
  Mixins hebben meer weg van abstracte classes, en zijn bedoeld om <b>behavior</b> te
  laten erven, sla er dus geen state in op want dan loop je tegen scoping
  issues aan. Je kunt meerdere mixin&apos;s in 1 object mixen voor multiple-inheritance-like
  behavior.
  <br>
  <br>
<b>Inheritance</b>
  <br>Allereerst lenen we wat code uit <a href="http://blog.nodejitsu.com/using-sys-inherits-in-node-js"
  rel="external">node.js</a>. Omdat deze functie afhankelijk is van Object.create
  voegen we deze toe aan browsers die deze nog niet hebben middels een workaround
  van <a href="http://ejohn.org/blog/ecmascript-5-objects-and-properties/"
  rel="external">Ben Newman</a>.
  <br>
  <br>
{% highlight js %}
 Object.create = function (o) {  
    if (arguments.length > 1) {  
        throw new Error('Object.create implementation only accepts the first parameter.');  
    }  
    function F() {}  
    F.prototype = o;  
    return new F();  
};
var inherits = function (ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype);
    ctor.prototype.constructor = {
        value: ctor,
        enumerable: false
    };
};
{% endhighlight %}
  <!--more-->Nu kunnen we een object hierarchie bouwen, waarin we een Parent en een
  Client hebben:
  <br>
  <br>
{% highlight js %}
function Parent (initialValue) {
   this.list = [ initialValue ];
}
function Client (initialValue) {
    // apply with the second parameter the arguments for the parent ctor
    Parent.apply(this, [ initialValue ]);
}
inherits(Client, Parent);
{% endhighlight %}
  <br>Geen scoping problemen hier en instanceof werkt als verwacht:
  <br>
  <br>
{% highlight js %}
var c = new Client(5);
var d = new Client(9);
c.list.push(3);
d.list.push(4);
console.log(c.list, d.list);
// geeft '[5, 3], [9, 4]'
console.log(d instanceof Parent);
// geeft true
console.log(d instanceof Client);
// geeft true
{% endhighlight %}
  <br>
  <br>
<b>Mixins</b>
  <br>Voor een mixin hoeven we geen code te lenen, maar kunnen we gewoon gaan
  typen. Neem twee simpele constructors:
  <br>
  <br>
{% highlight js %}
function Person (name) {
    this.name = name;
}
function Product (name, price) {
    this.name = name;
    this.price = price;
}
{% endhighlight %}
  <br>De mixin hoeft niets te weten van de objecten die hem gaan importeren,
  het enige wat hij verwacht is dat er ergens een &apos;name&apos; property
  op het object zit:
  <br>
  <br>
{% highlight js %}
var greeter = function () {
    this.greet = function () {
        console.log("Hello", this.name);
    }
}
{% endhighlight %}
  <br>Nu kunnen we de &apos;greeter&apos; in de twee types mixen en daarna aanroepen:
  <br>
  <br>
{% highlight js %}
greeter.call(Person.prototype);
greeter.call(Product.prototype);
var person = new Person("jan");
var product = new Product("cloud9", 15.00);
person.greet();
// Hello jan
product.greet();
// Hello cloud9
// instanceof werkt niet op de mixin
console.log(person instanceof Person, person instanceof greeter);
// true, false
{% endhighlight %}
  <br>Code die je bijvoorbeeld in je types kan mixen zijn: logging functies
  en EventEmitter-achtige constructies.
  <br>
  <br>
<b>Conclusie</b>
  <br>Wil je <i>state</i> inheriten: inheritance. Wil je <i>behavior</i> inheriten:
  mixins.</p>
   
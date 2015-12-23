---
layout:         post
title:          "Building applications for Firefox OS using AngularJS"
date:           2014-07-30T12:00:00.000Z
categories:     Firefox OS
originalUrl:    https://hacks.mozilla.org/2014/07/building-applications-for-firefox-os-using-angularjs/
originalName:   Mozilla Hacks
language:       en
commentCount:   8
---

<p>When you start developing for Firefox OS you might be underwhelmed by the tools that are provided. There is no standard UI toolkit, or a JavaScript framework that all apps build on. This is not a situation that’s inherently bad because in essence Firefox
    OS is the web; and thus gives you complete freedom in the toolchain you use. This gives us the advantage to use any new technology that pops up also on Firefox OS. The downside is that you’ll miss out on things you might be used to on Android or iOS,
    like built-in templates; view transitions and UI components.</p>
<!--more-->
<p>In <a href="http://www.telenor.com/about-us/our-business/telenor-digital/">Telenor Digital</a> we decided to build a ready-to-go application framework that deals with these shortcomings, built on top of <a href="http://angularjs.org/">AngularJS</a>, the
    MVW framework by Google. The template is the result of iterating over our internal applications that we built for Firefox OS, and addresses the following things:</p>
<ol>
    <li>Built on top of AngularJS, that has provides data binding; templating; routes; and code structure</li>
    <li>Built in set of <a href="http://buildingfirefoxos.com/building-blocks/">UI components</a>
        <br> and transitions, in the style of Firefox OS</li>
    <li>Ability to publish apps as a mobile web page (hosted app),
        <br> or as a packaged app for the Firefox OS marketplace</li>
    <li>Offline first approach. Every app built on top of the template works offline,
        <br> also when hosted on your own web server.</li>
    <li>A build system to create release builds with one command,
        <br> that does minification and template caching for optimal performance</li>
</ol>
<p>Let’s look at how the demo application looks like. It’s a standard CRUD app that shows a list-detail pattern: http://janjongboom.com/ffos-list-detail/. You can click on items to go to the detail view, you can edit items, or add new items. The ‘+’ button
    is an install button (only visible in Firefox) and allows you to add the app to your phone (Android / FxOS).</p>
<p><img src="{{ site.baseurl }}/assets/ffos-list-detail-home.png" alt=""></p>
<h2>Getting the code</h2>
<p>To start building, do this:</p>
<ul>
    <li><code>git clone git@github.com:comoyo/ffos-list-detail.git</code></li>
    <li><code>npm install</code></li>
    <li><code>./node_modules/bower/bin/bower install</code></li>
    <li>Now you can open <code>www/index.html</code> in any browser, or use the app manager and add the
        <br> <code>www</code> folder as a packaged app.</li>
</ul>
<h2>Structure</h2>
<p>The application lives in the <a href="https://github.com/comoyo/ffos-list-detail/tree/master/www">www/</a> folder, and is made up of the following subfolders:</p>
<ul>
    <li>components/, third party libraries, loaded through <a href="http://bower.io/">bower</a></li>
    <li>css/, style sheets. List all styles used by your app in
        <br> <a href="https://github.com/comoyo/ffos-list-detail/blob/master/www/css/main.css">css/main.css</a>.
        <br> They will be combined into one big stylesheet, for optimal performance.</li>
    <li>img/, holds the icons for the app in three formats.</li>
    <li>js/, our code
        <ul>
            <li>controllers/, the code that binds data to our UI</li>
            <li>lib/, external libraries that are not in bower</li>
            <li>services/, data providers, or code that is not bound to UI</li>
            <li>app.js, starting point of the application, contains global configuration like routes</li>
            <li>main.js, bootstrap file based on <a href="http://requirejs.org/">RequireJS</a>.
                <br> Lists all the JavaScript files we use. When you create a new JS file, add it here.</li>
        </ul>
    </li>
    <li>views/, view templates</li>
    <li>index.html, bootstrap file where we load the application. You probably never will touch this.</li>
    <li>manifest.appcache, <a href="http://www.html5rocks.com/en/tutorials/appcache/beginner/">AppCache</a> file.
        <br> You’ll need to list all the images &amp; other resources (other than CSS/JS) that your app needs here,
        <br> to enable offline for hosted applications.</li>
    <li>manifest.webapp, Firefox OS <a href="https://developer.mozilla.org/en-US/Apps/Build/Manifest">App manifest</a> file.</li>
</ul>
<p>You don’t need any build chain set up during development, you can just edit files in www, and refresh index.html at will. That’s the power of the web :-) Of course if you’re developing in the app manager, press UPDATE to refresh the app.</p>
<p>Now let’s add some new functionality to this application, so we can see how developing new features works in practice.</p>
<h2>Adding a new button</h2>
<p>Let’s say that we want to add a credits screen that shows who built the application. First thing we need to do is add a button somewhere. In our case let’s put it on the home screen of the app. The code of the view is in <code>www/views/list.html</code></p>
<p>The components that you see come from the <a href="http://buildingfirefoxos.com/building-blocks/">Firefox OS Building Blocks</a>, which are the same blocks that are used to build Firefox OS itself. Let’s add a new button at the bottom of the screen (below
    the <code>&lt;/ul&gt;</code> and the <code>&lt;/section&gt;</code>:</p>
<div class="wp_syntax">
    <table>
        <tbody>
            <tr>
                <td class="code"><pre class="xml" style="font-family:monospace;"><span style="color: #009900;"><span style="color: #000000; font-weight: bold;">&lt;a</span> <span style="color: #000066;">class</span>=<span style="color: #ff0000;">"recommend"</span> <span style="color: #000066;">role</span>=<span style="color: #ff0000;">"button"</span> <span style="color: #000066;">ng-tap</span>=<span style="color: #ff0000;">"go('/credits', 'popup')"</span><span style="color: #000000; font-weight: bold;">&gt;</span></span>Credits<span style="color: #009900;"><span style="color: #000000; font-weight: bold;">&lt;/a<span style="color: #000000; font-weight: bold;">&gt;</span></span></span></pre></td>
            </tr>
        </tbody>
    </table>
</div>
<p>Important here is the <code>ng-tap</code> attribute. When we tap this item we go to <code>/credits</code> URL, with animation <code>popup</code>. There are four built in animations: <code>forward</code>, <code>backward</code>, <code>popup</code> and <code>popdown</code>;
    but you can <a href="https://github.com/comoyo/ffos-list-detail#adding-new-view-animations">create your own</a> using simple CSS.</p>
<p>Now when we look at this it doesn’t look like a button yet, because we didn’t tell that we needed the button building block. Go to <code>css/main.css</code> and add the following line to make it look nice:</p>
<div class="wp_syntax">
    <table>
        <tbody>
            <tr>
                <td class="code"><pre class="css" style="font-family:monospace;"><span style="color: #a1a100;">@import url("../components/building-blocks/style/buttons.css");</span></pre></td>
            </tr>
        </tbody>
    </table>
</div>
<p><img src="{{ site.baseurl }}/assets/ffos-list-detail-btn.png" alt=""></p>
<p>All this is always documented on the page on the Building Blocks website.</p>
<h2>Hooking it up</h2>
<p>When we click on the button nothing happens though (well, we get redirected back to the list view), and that’s because we don’t listen on the /credits URL yet. To fix that we need to create a route handler (like in any MV* server side framework as well).
    Open the list of routes in <code>js/app.js</code>, and add a handler for the credits URL (before the <code>otherwise</code> handler):</p>
{% highlight js %}
.when('/credits', {
  templateUrl: 'views/credits.html',
  controller: 'CreditsCtrl'
})
{% endhighlight %}
<p>Here we tell which controller we want to consult (with JS code), and which view (with HTML) belongs to that. Let’s create the view first. Add a new file called credits.html in the <code>views</code> folder.</p>
{% highlight html %}
<section role="region">
  <!-- Header building block http://buildingfirefoxos.com/building-blocks/headers.html -->
  <header>
    <!-- here we handle the back click and we do a popdown animation -->
    <a ng-tap="go('/', 'popdown')"><span class="icon icon-back">back</span></a>
    <h1>Credits</h1>
  </header>
</section>
<!-- The content of the view should have a 'view' class, and add the name of
     the view to easily style the view later -->
<section class="view credits">
  This application is made by {{ name }}. <!-- AngularJS does data binding for us -->
</section>
{%endhighlight%}
<p>To style this view we can add some content in <code>css/app.css</code>, f.e. add some padding and make the text bigger:</p>
{% highlight css %}
.view.credits {
  padding: 1.5rem;
  font-size: 2rem;
}
{% endhighlight %}
<p>Now write a simple controller to fill the content of <code>{{ name }}</code>, using standard <a href="https://docs.angularjs.org/guide/databinding">AngularJS data binding</a>. Add a new file called <code>credits.js</code> in <code>www/js/controllers</code>:</p>

{% highlight js %}
/* We use RequireJS AMD style modules to get a reference to the app object */
define(['app'], function(app) {
  /* Tell that we're defining a controller with name
    CreditsCtrl, and with dependencies on $scope, we specify this as string
    to not break when minifying
  */
  app.controller('CreditsCtrl', ['$scope',
    /* Implementation. AngularJS does dependency injection to fill the $scope var */
    function CreditsCtrl($scope) {
      /* Data binding to the view */
      $scope.name = 'Your name';
    }
  ]);
});
{% endhighlight %}

<p>Last thing is to tell RequireJS that we have a new JS file that needs to be included in our builds, by editing <code>js/main.js</code> and adding a line above <code>'js/controllers/edit.js'</code>:</p>
{% highlight js %}
'js/controllers/credits.js',
{% endhighlight %}


<p>When we now click the button in the app, everything works as expected. The view pops in, we have data, and we can dismiss by clicking the back button. What’s also great is that when you send the URL to someone else (f.e. http://your/url/index.html#/credits)
    they will go to the same view by default. That’s because we do proper state management through URLs by default.</p>
<h2>Talking to a third party data source</h2>
<p>The app currently only talks static data, so we want to hook it up to a real data source. In our case the project list should come from GitHub’s page with projects by mozilla-b2g. They have an API at: <a href="https://api.github.com/users/mozilla-b2g/repos">https://api.github.com/users/mozilla-b2g/repos</a>.</p>
<p>AngularJS has an idea of services, that abstract data away from your controller. For this app we have a database service that currently returns in-mem data. We can modify the service to talk to a web service instead. Clear out <code>www/js/services/database.js</code>        and replace the content with:</p>
{% highlight js %}
/*global define */
"use strict";
define(['app'], function(app) {
  /* Add a new factory called database, with a dependency on http */
  app.factory('database', ['http', function(http) {
    var getItems = function() {
      /* getItems makes a HTTP get call to github */
      return http.get('https://api.github.com/users/mozilla-b2g/repos', {
        // this is the cache configuration, we want to always cache requests
        // because it gives better UX. Plus when there is no internet, we can
        // get the data from cache and not break for the user...
        idbCache: {
          cacheKey: 'api.index',
          // expiration time in ms. from now (this is 5 minutes)
          // This is only obeyed if there is an internet connection!
          expiresInMs: 5 * 60 * 1000
        }
      }).then(function(res) {
        // Format it, sort it and map it to have the same format as our previous in mem dataset
        return res.data.sort(function(a, b) {
          return a.stargazers_count < b.stargazers_count;
        }).map(function(item) {
          return {
            title: item.name,
            description: item.description,
            id: item.name
          };
        });
      });
    };

    // Similar story but now for just one item
    var getItemById = function(id) {
      return http.get('https://api.github.com/repos/mozilla-b2g/device-flatfish', {
        idbCache: {
          cacheKey: 'api.detail.' + id,
          expiresInMs: 10 * 60 * 1000
        }
      }).then(function(res) {
        var repo = res.data;
        return {
          title: repo.name,
          description: repo.description,
          id: repo.name,
          date: new Date((repo.pushed_at || "").replace(/-/g,"/").replace(/[TZ]/g," "))
        };
      });
    };

    return {
      getItems: getItems,
      getItemById: getItemById
    };
  }]);
});
{% endhighlight %}
<p>This API is now asynchronous though, but that doesn’t matter for Angular. If you data-bind to a promise, Angular will wait until the promise resolves until data binding happens.</p>
<p>The beauty here is now that even when there is no Internet connection, the data will still load (as long as it was loaded at least once), and the data is auto-cached. No need for the controller to worry about that.</p>
<h2>Publishing the app</h2>
<p>These were two ways we quickly added some functionality to this application. First, adding a new button and a new view; and second, showing data binding and offline caching of server data. Please note that this application template can be used for
    much more than just list-&gt;detail applications, you’ve got the whole power of AngularJS at your hands!</p>
<p>Now when we want to share this application with the rest of the world, we can go two ways:</p>
<ul>
    <li>Create a hosted application. This is an app that lives on your own server, like any mobile website. Hosted apps can still be published on the marketplace, and will work offline, but cannot use all the APIs in Firefox OS <a href="http://www.sitepoint.com/getting-started-with-firefox-os-hosted-and-packaged-apps/">due to security limitations</a>.</li>
    <li>Create a packaged application. This is a ZIP file, similar to APK files on Android, that contain all the assets of your app, and are distributed through the marketplace.</li>
</ul>
<p>Both of these applications can be generated using our build script. The script will create a new folder <code>dist/</code> that lists all the files the app needs. If you want to publish the app to your own server, just copy over the contents of the
    folder. If you want to publish the app as a packaged app, ZIP up the content and publish to the marketplace.</p>
<p>To build, run:</p>
<ul>
    <li>Packaged: <code>node build.js</code></li>
    <li>Hosted: <code>node build.js appcache</code></li>
</ul>
<p>Happy coding!</p>

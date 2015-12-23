---
layout:         post-tweakers
title:          "Building Wordpress sites in the cloud"
date:           2012-07-11T13:20:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/8051/building-wordpress-sites-in-the-cloud.html
originalName:   Coding Glamour
language:       nl
commentCount:   3
commentUrl:     http://glamour.tweakblogs.net/blog/8051/building-wordpress-sites-in-the-cloud.html#reacties
---

   <p class="article">As part of the <a href="http://c9.io/site/features/" rel="external">new</a> features
  that we launched two weeks in <a href="http://c9.io" rel="external">Cloud9 IDE</a> we&apos;ve
  added support for Python, Ruby and PHP as server side languages besides
  node.js. That&apos;s not just it, because users have full freedom over
  the VM that we run your code on so they can install any platform they like
  (C++ development in the cloud f.e.). The cool thing is that it&apos;s now
  possible to bring all sorts of already existing applications into Cloud9,
  without relying on third parties to do the actual Apache hosting etc. because
  you&apos;ll just get an Openshift server. In this post I&apos;ll show a
  step by step demo of how to use Cloud9 to build a Wordpress application
  without leaving the browser.
  <br>
  <br>If you want to see the quickest demo possible, sign up for Cloud9 at
  <a
  href="http://c9.io" rel="external">c9.io</a>, log in via GitHub and create an index.php file:
    <br>
    <br>
{% highlight text %}
<?php
echo 'Hello world'
{% endhighlight %}
    <br>
    <br>When you now click the &apos;Debug&apos; button we spawn a shell version
    of PHP that echoes &apos;Hello world&apos; back to you. To run it via Apache
    go to the run panel, select &apos;Apache+PHP&apos; and re-click &apos;Debug&apos;.
    <br>
    <br>
    <img src="http://100procentjan.nl/tweakers/wp1.png" title="http://100procentjan.nl/tweakers/wp1.png"
    alt="http://100procentjan.nl/tweakers/wp1.png">
    <!--more-->
<b>Installing wordpress</b>
    <br>To install wordpress, we&apos;ll download the <a href="http://wordpress.org/latest.zip"
    rel="external">latest .zip file</a>, unzip it. Then right click on the
    root folder in your tree and select &apos;Upload files&apos; and choose
    the wordpress folder. Because the folder upload the files are in a seperate
    subfolder under root. Drag them to root and remove the &apos;wordpress&apos;
    folder. Rename the &apos;wp-config-sample.php&apos; to &apos;wp-config.php&apos;.
    <br>
    <br>
<i>Or do it via the terminal (CMD+T, CTRL+T)</i>
    <br>
    <br>
{% highlight bash %}
$ wget http://wordpress.org/latest.tar.gz
$ tar xzfv latest.tar.gz
$ cp -r wordpress/* .
$ rm latest.tar.gz
$ rm -rf wordpress
{% endhighlight %}
    <br>
    <br>
<b>Running wordpress</b>
    <br>When you now click &apos;Debug&apos; and open the site, an error is thrown
    that no database connection could be made. That&apos;s correct, because
    we don&apos;t have a database server running on this machine. To make this
    fun we&apos;ll run Wordpress with PostgreSQL instead of MySQL. To get that
    to work we&apos;ll need to install the <a href="http://wordpress.org/extend/plugins/postgresql-for-wordpress/installation/"
    rel="external">pg4wp</a> plugin first. Follow the steps in the installation
    page to add the driver. We still have no connection, because no database
    was installed on the virtual machine in Cloud9 but now we&apos;ve got something
    to get started with. Let&apos;s install Postgres first!
    <br>
    <br>
<b>Installing PostgreSQL</b>
    <br>Cloud9 comes with a fully functional shell, that can be opened via &apos;View&apos;-&gt;&apos;Terminals&apos;-&gt;&apos;New
    Terminal&apos;. This is just a SSH connection that you&apos;d normally
    have to servers in your data center. That means that you have a limitless
    environment where you can install stuff (yes even vi!).
    <br>
    <br>
    <img src="http://100procentjan.nl/tweakers/wp2.png" title="http://100procentjan.nl/tweakers/wp2.png"
    alt="http://100procentjan.nl/tweakers/wp2.png">
    <br>
    <br>First we&apos;ll need to have the Postgres sources, then configure it,
    and finally make, install and start the server (and yes, this might take
    a while!).
    <br>
    <br>
{% highlight bash %}
$ cd ..
$ mkdir pgsource
$ cd pgsource            # go into new directory
$ wget http://ftp.postgresql.org/pub/source/v9.1.4/postgresql-9.1.4.tar.gz        # grab source code
$ tar xzfv postgresql-9.1.4.tar.gz         # untar it
$ cd postgresql-9.1.4
$ ./configure --without-readline --prefix=$PWD/../postgres         # configure
$ make
$ make install
# now to start it
$ cd ~/pgsource/postgres/bin
$ ./initdb -D ../data
$ ./pg_ctl -D ../data -l logfile start
$ ./createdb wp
{% endhighlight %}
    <br>
    <br>With a running postgres instance (you can add the bin/ folder to your
    path if you like) which can be verified by running ./psql, and a created
    database we can now configure Wordpress to use this database. In &apos;wp-config.php&apos;
    change the database settings to (don&apos;t have to restart debugging,
    changes are immediate!):
    <br>
    <br>
{% highlight text %}
<?php
define('DB_NAME', 'wp');
define('DB_USER', '');
define('DB_PASSWORD', '');
define('DB_HOST', 'localhost:5432');
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');
?>
{% endhighlight %}
    <br>
    <img src="http://100procentjan.nl/tweakers/wp3.png" title="http://100procentjan.nl/tweakers/wp3.png"
    alt="http://100procentjan.nl/tweakers/wp3.png">
    <br>
    <br>A running wordpress install, that you can use, modify and edit live from
    cloud9.
    <br>
    <br>
<b>A hosted database solution (also for free users)</b>
    <br>Because a local database won&apos;t hold when deploying this to a cloud
    service, we&apos;ll use the <a href="https://postgres.heroku.com/" rel="external">hosted postgres</a> solution
    that Heroku offers. Select the dev plan (which is free) and create a database.
    Click on your new database to get the connection settings (hostname, username,
    password, etc.). To use this from within Cloud9 we can now load different
    configurations per environment, because on C9 the &apos;C9_PROJECT&apos;
    environment variable is present.
    <br>
    <br>
{% highlight text %}
<?php
if (getenv("C9_PROJECT")) {
    define('DB_NAME', 'wp');
    define('DB_USER', '');
    define('DB_PASSWORD', '');
    define('DB_HOST', 'localhost:5432');
}
else {
    define('DB_NAME', 'HEROKUDBNAME');
    define('DB_USER', 'HEROKUUSER');
    define('DB_PASSWORD', 'HEROKUPWD');
    define('DB_HOST', 'HEROKUHOST.compute-1.amazonaws.com:5432');
}
define('DB_CHARSET', 'utf8');
define('DB_COLLATE', '');
?>
{% endhighlight %}
    <br>
    <br>If you want to migrate data from local -&gt; hosted database, you can
    use the normal postgres tooling like pg_dump.
    <br>
    <br>
<b>Deploying the application to Heroku</b>
    <br>Now time to deploy this application to Heroku&apos;s hosted applications
    solution. Go to the &apos;Deploy&apos; tab in Cloud9 (fourth tab with the
    balloon) and choose &apos;+&apos;.
    <br>
    <br>
    <img src="http://100procentjan.nl/tweakers/wp4.png" title="http://100procentjan.nl/tweakers/wp4.png"
    alt="http://100procentjan.nl/tweakers/wp4.png">
    <br>
    <br>Choose Heroku, log in with your fresh credentials and create a new app.
    Give it any name you like and click &apos;Add&apos;. Because Cloud9 enforces
    a Procfile which is not required for PHP apps at the moment, we now need
    to manually push instead of via the UI. In the console (SHIFT+ESC) type:
    <br>
    <br>
{% highlight bash %}
$ git remote add heroku git@heroku.com:APPNAME.git
$ git add .
$ git commit -m "Initial commit"
$ git push heroku master
{% endhighlight %}
    <br>
    <img src="http://100procentjan.nl/tweakers/wp5.png" title="http://100procentjan.nl/tweakers/wp5.png"
    alt="http://100procentjan.nl/tweakers/wp5.png">
    <br>
    <br>And now your application has been deployed to the URL mentioned in the
    console message. For example: here is <a href="http://wordpressjan.herokuapp.com/"
    rel="external">my brand new blog</a>!
    <br>
    <br>
<b>Updating the site</b>
    <br>In case you want to edit the PHP files, just edit them in Cloud9; test
    them via the built in Apache process, and when you&apos;re ready do a &apos;git
    add&apos; for the files you edited, commit them and push to heroku. Easy
    as that!
    <br>
    <br>
<b>Like Cloud9?</b>
    <br>We&apos;re open source, so if you have cool improvements that you&apos;d
    like to contribute, see the <a href="http://github.com/ajaxorg/cloud9" rel="external">GitHub</a> page.
    The VMs terminal stuff are only available on the hosted version, but you
    can roll your own by install c9 on your own cloud VM (f.e. on Amazon).
    <br>
    <br>Happy coding!</p>
   
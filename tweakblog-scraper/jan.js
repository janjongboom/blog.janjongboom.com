// Run |npm install async request| first
var async = require('async');
var request = require('request');
var fs = require('fs');
var Path = require('path');

// The URL to your api'alizer instance
var APIALIZER = 'http://localhost:8100/c/tweakblog/';

var q = async.queue(function(url, next) {
  console.log('processing', url);
  request.get(APIALIZER + '?url=' + encodeURIComponent(url), function(err, res, body) {
    if (err) {
      console.error('oh noes', err);
      return next(err);
    }
    if (res.statusCode !== 200) {
      console.error(url, 'threw', res.statusCode, body);
      return next(res.statusCode);
    }

    // We'll get a JSON response so parse the body
    body = JSON.parse(body.toString('utf8'));
    // On the article page push next link on the queue
    if (res.headers['scrapey-handler'] === 'tweakblog-article') {
      if (body.nextLink) {
        q.push(body.nextLink);
      }
    }

    function pad(s) {
      s = '' + s;
      if (s.length == 2) return s;
      return '0' + s;
    }

    var d = new Date(body.date);

    var f = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '-' +
      decodeURIComponent(body.link).match(/\/(.[^\/]+)\.html$/)[1] + '.json';

    fs.writeFile(Path.join(__dirname, 'results', f), JSON.stringify(body, null, 4), 'utf-8', function(err) {
      next(err);
    });
  });
}, 1); // 4 requests simultaneous

// Initial URL that we'll start scraping
q.push('http://glamour.tweakblogs.net/blog/10747/the-significance-of-the-33%24-firefox-os-smartphone.html');

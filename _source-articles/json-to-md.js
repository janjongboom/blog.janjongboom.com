// Just a simple converter script

var fs = require('fs');
var Path = require('path');
var HTML = require('html');
var cheerio = require('cheerio');

function process(file) {

   var data = JSON.parse(fs.readFileSync(file, 'utf-8'));

   var html = data.articleHtml;

   html = html.replace('<br><a name="more"></a><br>', '<!--more-->');

   var replacements = [];

   var $ = cheerio.load('<p class="article">' + html + '</p>');
   $('.phphighlight').each(function(ix, el) {
      var x = el;
      var c = $('.article').contents();

      var typeIx;
      c.each(function(ix, el) { if (el === x) typeIx = ix-2; });

      var typeName = typeIx ? $(c[typeIx]).text().replace(/:$/, '') : 'text';

      switch (typeName) {
         case 'HTML': typeName = 'html'; break;
         case 'JavaScript': typeName = 'js'; break;
         case 'C#': typeName = 'csharp'; break;
         case 'ASP.NET': typeName = 'asp'; break;
         case 'ASP': typeName = 'asp'; break;
         case 'XML': typeName = 'xml'; break;
         case 'bash': typeName = 'bash'; break;
         case 'SQL': typeName = 'sql'; break;
         default: typeName = 'text'; break;
      }

      $(c[typeIx]).remove();
      $(c[typeIx - 1]).remove();

      var code = $(el).find('.phphighlightcode').text();
      code = code.replace(/ /g, ' ');

      replacements.push([ code, typeName ]);

      $(this).replaceWith('AAA' + (replacements.length -1) );
   });

   html = HTML.prettyPrint($.html(), { indent_size: 2 });

   replacements.forEach(function(re, ix) {
      var r = re[0];
      // weird shit in the jekyll md thing, cant handle empty lines, need to fix later
      r = r.replace(/\n\n/g, '\n');
      r = r.replace(/\n\n/g, '\n');

      html = html.replace('AAA' + ix, `
{% highlight ${re[1]} %}
${r}
{% endhighlight %}`);
   });

   var title = data.title;
   title = title.replace(/"/g, '\\"');

   var newdata = `---
layout:         post-tweakers
title:          "${title}"
date:           ${data.date}
categories:     ${data.category}
originalUrl:    ${data.link}
originalName:   Coding Glamour
language:       ${data.language}
commentCount:   ${data.commentCount || data.comments.length}
commentUrl:     ${data.link}#reacties
---

   ${html}
   `

   var name = Path.basename(file, '.json');

   fs.writeFileSync(__dirname + '/../_posts/' + name + '.md', newdata, 'utf-8');
}

var files = fs.readdirSync(__dirname + '/tweakblog').map(f => __dirname + '/tweakblog/' + f);
files.forEach(function(f) {
   process(f);
})

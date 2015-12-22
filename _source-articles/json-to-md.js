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

   var $ = cheerio.load(html);
   $('.phphighlight').each(function(ix, el) {
      var code = $(el).find('.phphighlightcode').text();
      code = code.replace(/ /g, ' ');

      replacements.push(code);

      $(this).replaceWith('$' + (replacements.length -1) );
   });

   html = HTML.prettyPrint($.html(), { indent_size: 2 });

   replacements.forEach(function(r, ix) {
      html = html.replace('$' + ix, `
   {% highlight text %}
   ${r}
   {%endhighlight %}`);
   });

   var newdata = `---
   layout:         post-tweakers
   title:          "${data.title}"
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

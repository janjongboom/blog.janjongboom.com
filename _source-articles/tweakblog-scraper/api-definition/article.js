// example url: /c/tweakblog/?url=http://glamour.tweakblogs.net/blog/10747/the-significance-of-the-33%24-firefox-os-smartphone.html

name = 'tweakblog-article'

matches = function($, location) {
  return /^\/blog\/\d+\//.test(location.pathname);
}

extract = {
  title: function($) {
    return $('h2').text()
  },
  language: function($) {
    return $('img[alt="nl"]').length ? 'nl' : 'en'
  },
  link: function($, location) {
    return location + '';
  },
  date: function($) {
    var t = $('.blogpost>.author').text().match(/(on|op) (.[^-]+)( -|Category)/)[2];
    var d = new Date(t);
    if (!isNaN(d)) return d;

    t = t.split(/\s|:/g);
    var m = ['', 'januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december' ];
    return new Date(t[3] + '/' + m.indexOf(t[2]) + '/' + t[1] + ' ' + t[4] + ':' + t[5] + ':00')
  },
  category: function($) {
    var a = $('.blogpost>.author a');

    return $(a[2] || a[1]).text()
  },
  views: function($) {
    return Number($('.blogpost>.author').text().match(/Views\: (.+)/)[1].replace(/\./, ''))
  },
  articleHtml: function($) {
    return $('.article').html()
  },
  nextLink: function($) {
    var np = $('.nextPrevious a');
    // if this is the case, there's only previous link. let's stop then :-)
    if (np.length === 1 && $('.nextPrevious img[src="http://tweakimg.net/g/bullets/arrow_up.gif"]').length === 1)
      return undefined;
    return $(np[np.length - 1]).attr('href')
  },
  comments: function($) {
    return $('.reactie').map((ix, el) => {
      var $el = $(el);
      return {
        author: $($el.find('.author a')[0]).text(),
        date: $($el.find('.author a')[1]).text(), // can be both dutch & english, new Date() only parses EN
        contentHtml: $el.find('.reactieContent').html(),
        ownReply: $el.hasClass('ownreply')
      };
    })
  }
}

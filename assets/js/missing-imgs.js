[].forEach.call(document.querySelectorAll('.tweakers img'), function(img) {
  var i = new Image();
  i.onerror = function() {
    var nc = document.createElement('div');
    nc.classList.add('img-error');
    nc.textContent = 'Here used to be an image. It was lost in the great accidental deletion of 2013...';
    img.parentNode.replaceChild(nc, img);
  };
  i.src = img.src;
});

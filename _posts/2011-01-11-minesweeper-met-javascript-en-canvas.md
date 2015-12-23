---
layout:         post-tweakers
title:          "Minesweeper met Javascript en Canvas"
date:           2011-01-11T12:11:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/5924/minesweeper-met-javascript-en-canvas.html
originalName:   Coding Glamour
language:       nl
commentCount:   17
commentUrl:     http://glamour.tweakblogs.net/blog/5924/minesweeper-met-javascript-en-canvas.html#reacties
---

   <p class="article">Vrijdagmiddag om half vier is een uitstekend moment om de laatste 90 minuten
  pre-borrel gewoonweg te verspillen. Dat kan met <a href="http://glamour.tweakblogs.net/blog/5904/video-primer-hoe-facebook-omgaat-met-javascript.html"
  rel="external">filmpjes kijken</a> of door <a href="http://www.collegehumor.com/video:1770138"
  rel="external">spelletjes</a> te spelen. Blijkbaar had systeembeheer dit
  ook door, want op mijn verse ge&#xEF;nstalleerde machine staat mooi geen
  mijnenveger. Mooi moment om eens te gaan spelen met &lt;canvas /&gt;. Beware
  voor awesome code, met fantastische variabelenamen: Minesweeper in Javascript
  en Canvas (bouwtijd: minder dan 60 minuten vanaf scratch)!
  <br>
<a href="http://www.100procentjan.nl/tweakers/minesweeper/" rel="external"><img src="http://www.100procentjan.nl/tweakers/minesweeper.png" title="http://www.100procentjan.nl/tweakers/minesweeper.png" alt="http://www.100procentjan.nl/tweakers/minesweeper.png"></a>
  <!--more-->
  <br>
{% highlight js %}
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <script src="jquery-1.4.1.js" type="text/javascript"></script>
    <script src="jquery.rightClick.js" type="text/javascript"></script>
    <title></title>
</head>
<body>
    <div style="border: solid 1px black; width: 500px; height: 500px;">
        <canvas id='canvas' width="500" height="500"></canvas>
    </div>
    <script>
        var cnvs = document.getElementById('canvas').getContext('2d');
        var vals = [];
        $(document).ready(function () {
            // horizontal index (1 - 10)
            for (var hix = 0; hix < 10; hix++) {
                // vertical index
                for (var vix = 0; vix < 10; vix++) {
                    // breedte van dat ding is 500, dus we doen
                    // 10 spacing en dan 40 breed
                    var width = 48;
                    cnvs.fillStyle = "rgb(50,50,50)";
                    cnvs.fillRect(10 + (width * hix), 10 + (width * vix), width, width);
                    cnvs.strokeRect(10 + (width * hix), 10 + (width * vix), width, width);
                }
            }
            // calculate 10 random numbers
            var rndNrs = new Array();
            for (var ix = 0; ix < 10; ix++) {
                // tussen 0 en 99
                while (contains(rndNrs, r = Math.floor(Math.random() * 100))) { }
                rndNrs.push(r);
            }
            var cntr = 0;
            for (var hix = 1; hix <= 10; hix++) {
                vals[hix - 1] = [];
                for (var vix = 1; vix <= 10; vix++) {
                    cntr++;
                    vals[hix - 1][vix - 1] = { discovered: false, val: contains(rndNrs, cntr) === true ? -1 : 0 };
                }
            }
            // gaan we nog een keer jonge
            for (var h = 0; h < 10; h++) {
                for (var v = 0; v < 10; v++) {
                    if (vals[h][v].val !== -1) {
                        // anders gaan we kijken
                        // alles eromheen mag
                        var dezeV = 0;
                        for (nh = h - 1; nh <= h + 1; nh++) {
                            for (nv = v - 1; nv <= v + 1; nv++) {
                                if (nh === h && nv === v) continue;
                                if (nh >= 0 && nh <= 9 && nv >= 0 && nv <= 9) {
                                    dezeV += (vals[nh][nv].val === -1 ? 1 : 0);
                                }
                            }
                        }
                        vals[h][v].val = dezeV;
                    }
                }
            }
            // okee nu is alles getekend maar nu moeten we dus nog wel wat doen
            $("#canvas").click(function (e) {
                var x = Math.floor((e.pageX - $("#canvas").offset().left));
                var y = Math.floor((e.pageY - $("#canvas").offset().top));
                var h = Math.floor(((x / 480) * 10));
                var v = Math.floor((y / 480) * 10);
                handleChecked(h, v);
            });
            $('#canvas').rightClick(function (e) {
                var x = Math.floor((e.pageX - $("#canvas").offset().left));
                var y = Math.floor((e.pageY - $("#canvas").offset().top));
                var h = Math.floor(((x / 480) * 10));
                var v = Math.floor((y / 480) * 10);
                handleRechtermuisknop(h, v);
            });
        });
        handleRechtermuisknop = function (h, v) {
            vals[h][v].discovered = true;
            cnvs.fillStyle = "rgb(200,0,0)";
            cnvs.fillRect(10 + (48 * h) + 1, 10 + (48 * v) + 1, 46, 46);
            return false;
        }
        handleChecked = function (h, v) {
            vals[h][v].discovered = true;
            var whut = vals[h][v].val;
            switch (whut) {
                case -1: whut = "*"; break;
                case 0: whut = ""; break;
            }
            if (whut === "") {
                checkSurroundingVoorLeeg(h, v);
            }
            if (whut === "*") {
                alert('boem');
            }
            cnvs.fillStyle = whut !== "*" ? "rgb(255,255,255)" : "rgb(0, 200, 200)";
            cnvs.fillRect(10 + (48 * h) + 1, 10 + (48 * v) + 1, 46, 46);
            cnvs.fillStyle = "rgb(0,0,0)";
            cnvs.fillText(whut, 10 + (h * 48) + 24, 10 + (v * 48) + 24);
        };
        function contains(arr, el) {
            for(var ix = 0; ix < arr.length; ix++) {
                if (arr[ix] === el) return true;
            }
            return false;
        }
        function checkSurroundingVoorLeeg(h, v) {
            for(var x = h - 1; x <= h + 1; x++) {
                for(var y = v - 1; y <= v + 1; y++) {
                    
                    // boundaries checken
                    if(x >= 0 && x <= 9 && y >= 0 && y <= 9) {
                        // eens kijken
                        var el = vals[x][y];
                        if (!el.discovered && el.val >= 0) {
                            handleChecked(x, y); // deze doet zelf wel recursie hieromheen
                        }
                    }
                }
            }
        }
    </script>
</body>
</html>
{% endhighlight %}
  <br>
<small>Ik vermoed dat deze code me nog een keer tijdens een sollicitatiegesprek gaat achtervolgen  <img src="http://tweakimg.net/g/s/yummie.gif" width="15" height="15" alt=":9"> </small>
</p>
   
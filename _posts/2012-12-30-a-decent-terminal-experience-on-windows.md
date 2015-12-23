---
layout:         post-tweakers
title:          "A decent terminal experience on Windows"
date:           2012-12-30T12:19:00.000Z
categories:     Frontend
originalUrl:    http://glamour.tweakblogs.net/blog/8564/a-decent-terminal-experience-on-windows.html
originalName:   Coding Glamour
language:       nl
commentCount:   5
commentUrl:     http://glamour.tweakblogs.net/blog/8564/a-decent-terminal-experience-on-windows.html#reacties
---

   <p class="article">Two years ago I would&apos;ve never guessed that I would be completely
  hooked on using the terminal. However, after moving to an operating system
  that had a decent terminal underneath I soon became a command line junky.
  Time to improve the retarded beast that they call &apos;cmd.exe&apos; in
  Windows by adding some real terminal experience.
  <!--more-->
  <br>
  <br>
<i>Yes, I&apos;m aware of PowerShell. But the &apos;yet another syntax&apos; is not for me.</i>
  <br>
  <br>The thing that annoys me the most is the inability to easily copy and
  paste text. On OS/X I can do this through CMD+C, CMD+V, and keep CTRL+C
  for terminating programs; on Linux I can use CTRL+SHIFT+C, but <a href="http://www.microsoft.com/resources/documentation/windows/xp/all/proddocs/en-us/windows_dos_copy.mspx?mfr=true"
  rel="external">on Windows</a>:
  <ol>
    <li>Right-click and choose &apos;Mark&apos;</li>
    <li>Drag selection</li>
    <li>Right click</li>
    <li>Go somewhere, right click again</li>
    <li>And choose &apos;Paste&apos;</li>
  </ol><a name="more"></a>
  <br>Or if you are a <a href="http://superuser.com/questions/67627/how-to-paste-to-cmd-exe-without-a-mouse"
  rel="external">keyboard lover</a>:
  <ol>
    <li>Right-click and choose &apos;Mark&apos;</li>
    <li>Drag selection</li>
    <li>Alt+Space for System Menu</li>
    <li>Press &apos;E&apos; for Edit</li>
    <li>Press &apos;P&apos; for Paste</li>
  </ol><b>A better terminal</b>
  <br>The open source project <a href="http://sourceforge.net/projects/console/"
  rel="external">Console</a> (what&apos;s in a name) offers a Windows command
  line prompt that has configurable shortcuts, tabs and it remembers it&apos;s
  size when re-opening. I configured it this way so it resembles a Linux
  terminal.
  <ul>
    <li><b>On &apos;Console&apos; tab:</b> Tick &apos;Save on exit&apos; under
      &apos;Window size&apos;</li>
    <li><b>On &apos;Appearance&apos; tab:</b> Set font name to &apos;Consolas&apos;</li>
    <li><b>On &apos;Appearance -&gt; More...&apos; tab:</b> Untick &apos;Show toolbar&apos;
      and &apos;Show status bar&apos;; set alpha transparency to 15.</li>
    <li><b>On &apos;Hotkeys&apos;:</b> Set &apos;Copy selection&apos; to &apos;Ctrl+Shift+C&apos;;
      set &apos;Paste selection&apos; to &apos;Ctrl+Shift+V&apos;</li>
    <li><b>On &apos;Hotkeys -&gt; Mouse&apos;:</b> Set Copy/clear selection to
      &apos;Left + Shift&apos;; set &apos;Select text&apos; to &apos;Left&apos;</li>
  </ul>Tah dah, a nice looking command line that does copy/paste the same as
  in Linux and also supports tabs.
  <br>
  <img src="https://c9.io/janjongboom/dropbox/workspace/cmd1.PNG" title="https://c9.io/janjongboom/dropbox/workspace/cmd1.PNG"
  alt="https://c9.io/janjongboom/dropbox/workspace/cmd1.PNG">
  <br>
  <br>
<b>And now some POSIX flavoured magic</b>
  <br>But even with a decent command line experience I still miss stuff that
  I use in daily life. Think piping stuff through, the &apos;cat&apos; command,
  or even the ability to use &apos;ls -al&apos;. Time to add some POSIX magic
  to this show.
  <br>
  <br>Basically everything that is required is already in the <a href="http://www.cygwin.com/"
  rel="external">Cygwin</a> package. Installing works fine on Windows 7 and
  this adds &apos;yet another terminal&apos; to your system. Time to combine
  the niceties of Console with the qualities of Cygwin.
  <br>
  <br>After installation go into the settings of Console, and on the &apos;Tabs&apos;
  panel, set &apos;Title&apos; to &apos;Bash&apos;, and &apos;Shell&apos;
  to &apos;C:\cygwin\bin\bash.exe --login -i&apos;. Now every time you open
  a new tab or window it&apos;ll open the cygwin shell. Yay, a normal terminal!
  <br>
  <img src="https://c9.io/janjongboom/dropbox/workspace/cmd2.PNG" title="https://c9.io/janjongboom/dropbox/workspace/cmd2.PNG"
  alt="https://c9.io/janjongboom/dropbox/workspace/cmd2.PNG">
</p>

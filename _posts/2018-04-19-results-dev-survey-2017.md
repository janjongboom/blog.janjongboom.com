---
layout:   post
title:    "Results from the Mbed Developer Survey 2017"
date:     2018-04-19 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Results-from-the-Mbed-Developer-Survey-2/
originalName: "Mbed Developer Blog"
---

**Take part in the Mbed Developer 2018 survey [here](https://www.surveymonkey.co.uk/r/Mbed_Developer_Survey_2018).**

When Mbed launched in 2009 - great background post by Chris Styles [here](https://blog.mbed.com/post/short-personal-history-micro-bit) - it was hard to imagine how big the ecosystem would grow. Today we have [over 70 partners](https://www.mbed.com/en/partners/our-partners/), [136 supported development boards](https://os.mbed.com/platforms/) and over 15,000 commits from 405 different contributors to Mbed OS 5. But none of this was possible without you, as part of our community. Now over 325,000 developers strong, the community has published tens of thousands of libraries and examples, and answered thousands of questions about Mbed. You also compiled 13,000,000 applications in the Online Compiler last year alone.

<!--more-->

To learn from the community, we sent out a developer survey last year. With 2,500 respondents, this was a tremendous help to see what developers are building, what connectivity methods they're using and what features they'd love to have in Mbed OS 5. In preparation for the 2018 survey, we want to discuss the outcomes from last year's survey, share some insights from the data, and show how we used your feedback to make Mbed better.

**Who is using Mbed?**

When Mbed started, it gained a lot of traction in education and the maker space, but this is shifting. More than a third (35%) of our respondents use Mbed in a professional capacity while just over a quarter (26%) use Mbed for studying or educating, and the rest (39%) use Mbed purely for fun, in their spare time. Note this does not mean that the users are amateurs, they might be programmers in a different field, or normally do embedded development on a different stack. A study from [VDC Research](http://www.vdcresearch.com) found that 70% of all professional embedded developers use maker technology, either professionally or in their spare time.

Also, almost half (45%) of Mbed users expect the product they're working on to be deployed in the market. That means that hobbyists are also dreaming of making it big.


![Mbed developers by type, and deployment prediction]({{ site.baseurl }}/assets/survey1.png)

Expected deployment sizes are small, but 11% of Mbed developers expect to ship at least 10,000 units in the first twelve months while 2% even expects to ship more than 500,000 devices. A great example of an Mbed OS device shipping in such large production volumes is [Baidu's smart speaker](https://community.arm.com/cn/b/blog/posts/new-innovation-on-mbed-os-based-iot-products-putting-the-human-experience-front-and-centre-at-mwc-shanghai).


![Expected number of deployed devices]({{ site.baseurl }}/assets/survey2.png)

28% of respondents were from the US or the UK. This is interesting as only 20% of visitors to os.mbed.com are from these countries, although this number is probably skewed as the survey was only conducted in English.

**Connectivity**

Mbed is an IoT device platform, thus it's no surprise that 71% of developers who responded use some form of connectivity in their projects. The most popular connectivity types are Wi-Fi and Bluetooth, with LPWAN technologies (LoRa, NB-IoT) also one the rise. The low popularity of 6LoWPAN and Thread is interesting, as Mbed had [one of the first certified Thread 1.1 stacks](https://www.mbed.com/en/technologies/connectivity/). In the 'Other' category (free form text field detailed in the word cloud), we see a wide variety of connectivity methods, from old-school serial to industrial protocols.

![Connectivity types used in Mbed]({{ site.baseurl }}/assets/survey3.png)

**Where is Mbed used?**

With more than 325,000 developers, it's no surprise that you'll find Mbed-enabled devices everywhere. Mbed is applicable to a wide variety of market segments, and products that contain Mbed OS range from [gaming consoles](https://os.mbed.com/blog/entry/Built-with-Mbed-Gaming-with-Pokitto/) to [container seals](https://os.mbed.com/blog/entry/Built-with-mbed-Supply-chain-monitoring/) and [breweries](https://os.mbed.com/blog/entry/Built-with-mbed-brewing-beer-with-bruiot/). This is also visible in the end markets where developers use Mbed, such as the smart home and industrial markets, which are the most popular (but only by a little).


![Mbed markets]({{ site.baseurl }}/assets/survey4.png)

It's interesting to look at the split between developer types and the markets they target. Hobbyists target consumer and smart home technology - which is easily applicable to their own situation - whilst professionals focus on industrial and smart building applications. The high spike for industrial under educational users is perhaps because university projects focus on industrial applications.


![Mbed markets by developer type]({{ site.baseurl }}/assets/survey5.png)

**What we have been doing with your feedback**

The survey results have had a significant impact on our product roadmap. Here's some things that we've been doing based on the feedback.

* Work on better offline tooling - 'Offline' was mentioned 213 times, and an offline Mbed IDE was requested by a large number of people. [Mbed Studio](https://os.mbed.com/studio/) is now in itsprivate alpha phase, and will be released this year. In addition, we have continued development on Mbed CLI (it now has a Windows installer, and we're working on a macOS installer) and integration with other IDEs.
* Rework documentation - the [Mbed OS documentation](https://os.mbed.com/docs) is now centralized and contains sections on architecture and reference guides. We have grown our docs team to four people, and will keep improving the documentation in 2018. We'll also work on better findability of docs (especially via Google) and retiring outdated information.
* Better power management / sleep support - managing power is very important for any battery powered device, which was mentioned by many users. In Mbed OS 5.6, we introduced the [sleep manager](https://os.mbed.com/docs/v5.7/reference/sleep-manager.html), which makes it easier to make battery efficient nodes.
* Mbed simulator - better online tools were mentioned a number of times, and some respondents specifically asked for a simulator. We now have a highly experimental [online simulator for Mbed OS 5](http://labs.mbed.com/simulator/) which we hope to integrate in the Online Compiler in the future.
* Debugging in the Online Compiler - debugging and flashing directly from the Online Compiler would be a killer feature, and reduce the need for a full IDE. We have worked on [DAP.js](https://github.com/ARMmbed/dapjs/) - which can debug Mbed boards through WebUSB, and plan to integrate it with the online tools this year.

In addition we hired two new developer evangelists ([Austin Blackstone](https://os.mbed.com/users/mbedAustin/) - who has been with Mbed in various roles for four years already, and [Neil Tan](https://os.mbed.com/users/nprobably/) - author of [uTensor](https://github.com/utensor/utensor), a deep-learning framework for Mbed) who'll work with the community on a daily basis. We've also started a new support team, led by [Earl Manning](https://os.mbed.com/users/earlm/), which will monitor the forums and Q&A sections.

**2018 survey**

Do you want to help shape the future of Mbed? Then take part in the 2018 survey! It's just ten minutes, and will be a tremendous help in determining who our community is, and what they're building. [Take the survey here](https://www.surveymonkey.co.uk/r/Mbed_Developer_Survey_2018).

-

*Jan Jongboom is Developer Evangelist IoT at Arm, and he was very tempted to put a [Steve Ballmer GIF](https://giphy.com/explore/steve-ballmer) ('Developers, developers, developers') at the beginning of this article.*

---
layout:   post
title:    "Writing automated tests with Greentea"
date:     2019-03-08 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/Writing-automated-tests-with-Greentea/
originalName: "Mbed Developer Blog"
---

<iframe width="560" height="315" src="https://www.youtube.com/embed/SGHJiI7BUYM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

Mbed OS now runs on over 150 development boards, and had over 3,000 commits last year alone. To keep the operating system stable when developing at such a high pace, we invested in automated testing: We now have test farms in two locations with over 1,000 real development boards, 1,150 functional tests, and roughly 40,000 hours of testing on physical hardware for every major release. Feel inspired? All tools to build and run the tests are open source, and in this blog post we'll show you where to find information on how to get started building tests for your own applications.

<!--more-->

[Greentea](https://github.com/ARMmbed/mbed-os-tools/tree/master/packages/mbed-greentea) is our testing tool that automates the process of flashing development boards, starting tests, and collecting test results into test reports. Mbed OS tests are written in [Unity](https://github.com/ThrowTheSwitch/Unity), an open source unit testing library. In addition, Greentea supports 'host tests'. These are Python scripts that run on a computer and can communicate with the device being tested. You can, for example, verify that a value was actually written to the cloud when the device said it did so.

To get started building tests, either watch the video above or head over to the documentation. We have additional tutorials on:

* [Writing your first test](https://os.mbed.com/docs/mbed-os/v5.11/tools/greentea-testing-applications.html#writing-your-first-test).
* [Writing integration tests using host tests](https://os.mbed.com/docs/mbed-os/v5.11/tools/greentea-testing-applications.html#writing-integration-tests-using-host-tests).

In addition, you can find an example application that uses host tests to verify that data was actually sent from a device to the cloud here: [mbed-http-integration-test](https://os.mbed.com/teams/sandbox/code/mbed-http-integration-test/).

-

*Jan Jongboom is a Developer Evangelist for the Internet of Things at Arm, and the author of the [Mbed HTTP](https://os.mbed.com/teams/sandbox/code/mbed-http/) library (now with tests!).*

---
layout:   post
title:    "A disco effect: Looping and wait() in mbed OS"
date:     2016-01-22 11:21:00
tags:     iot
originalUrl: http://blog.mbed.com/post/137808406402/a-disco-effect-looping-and-wait-in-mbed-os
originalName: "Mbed Developer Blog"
---

Let's say I have a tri-color LED, and I want to make a small disco effect by toggling the three channels every few hundred milliseconds, and stopping after ten iterations.

<video autoplay="true" muted="true" loop="true">
  <source src="{{ site.baseurl }}/assets/disco.mp4" type="video/mp4"></source>
</video>

<!--more-->

Easy enough when doing traditional embedded development:

{% highlight cpp %}
static DigitalOut red(D5);
static DigitalOut green(D6);
static DigitalOut blue(D7);

int main() {
    for (int i = 0; i < 60; i++) {
        red   = (i % 6 == 0 || i % 6 == 1 || i % 6 == 2);
        green = (i % 6 == 2 || i % 6 == 3 || i % 6 == 4);
        blue  = (i % 6 == 4 || i % 6 == 5 || i % 6 == 0);
        wait(0.2);
    }
    // rest of your program
}
{% endhighlight %}

In [mbed OS](https://www.mbed.com/en/development/software/mbed-os/), the approach above is not allowed:

* It blocks main, which is bad, because no other operations can happen at this point.
* The microcontroller needs to be awake to honor the `wait` call, and therefore cannot go into deep sleep in between toggling LEDs.

Instead, mbed OS works with an event loop and a scheduler ([MINAR](https://docs.mbed.com/docs/getting-started-mbed-os/en/latest/Full_Guide/MINAR/)), that manages the timing of function calls (similar to Node.js or Ruby's EventMachine). The idea is that the operating system is a lot better at managing time than the developer, especially when applications get more complex. So rather than switching between modules or handling deep sleep yourself, you tell the scheduler ‘wake me up in half a second’, ‘activate me when this interrupt is triggered’ or ‘let me know when a Bluetooth connection comes in’. The scheduler then switches contexts when necessary, and lets the microcontroller sleep when possible.

We always need to be able to call MINAR, so we must not block the microcontroller with a long-running or infinite function. So instead of using `wait(0.2)` we tell the OS: "hey! in 200 milliseconds I'd like to do something again, can you wake me up?". That means that we need to rewrite this code a bit to use events rather than a blocking `wait()` call:

{% highlight cpp %}
static DigitalOut red(D5);
static DigitalOut green(D6);
static DigitalOut blue(D7);

// [1]
static void disco(int8_t turns_left, int16_t delay_ms) {
    if (turns_left > 0) {
        // [2]
        FunctionPointer2<void, int8_t, int16_t> fp(&disco);
        // [3]
        minar::Scheduler::postCallback(fp.bind(turns_left - 1, delay_ms))
            // [4]
            .delay(minar::milliseconds(delay_ms));
    }

    red   = turns_left % 6 == 0 || turns_left % 6 == 1 || turns_left % 6 == 2;
    green = turns_left % 6 == 2 || turns_left % 6 == 3 || turns_left % 6 == 4;
    blue  = turns_left % 6 == 4 || turns_left % 6 == 5 || turns_left % 6 == 0;
}

void app_start(int argc, char *argv[]) {
    // [5]
    disco(60, 200);
}
{% endhighlight %}

In this approach:

1. We create a function `disco` that takes two arguments. `turns_left` is the number of times the function should run after the current iteration, and `delay_ms` is the delay until the next iteration. This function is invoked every 200 ms.
2. If `turns_left` is greater than zero, we create a [function pointer](https://docs.mbed.com/docs/getting-started-mbed-os/en/latest/Full_Guide/MINAR/#function-pointers-and-binding-in-minar):
    * Its return type is `void` and it takes an `int8_t` and an `int16_t` as arguments.
    * Surprise, this is the same function signature as the function we’re currently in (`disco`).
    * We initialize the function pointer with a reference to the `disco` function.
3. We tell MINAR (the event scheduler) that we want to execute the function pointer with the arguments `turns_left - 1`, and our `delay_ms`.
4. We also tell MINAR that we want to delay the function call by `delay_ms` milliseconds.
5. When our application starts we kick off the sequence.

Relatively easy, and now our code is non-blocking!

## Calling a member function

If the function `disco` is a class member, we can use `FunctionPointer` by passing in the object reference as the first argument:

{% highlight cpp %}
class DiscoClass {
    void disco(int8_t times_left, int16_t delay) {
        if (turns_left > 0) {
            // HERE!
            FunctionPointer2<void, int8_t, int16_t> fp(this, &DiscoClass::disco);

        // ... rest of the function
    }
{% endhighlight %}

Happy coding!

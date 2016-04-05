# Offline developing and debugging with mbed

At the heart of mbed we have an online compiler. While that is incredibly convenient to get a project started or while prototyping, chances are that at some point you'll miss a debugger; or that you want to develop while not having an active internet connection. Fortunately we support exporting applications to a number of toolchains, including GCC, uVision and Eclipse; while we also support committing source code back to the online environment. Combining the best of both the online and offline world; and without losing access to the collection of mbed libraries.

In this article we'll:

* Cover ways to set up your local toolchain.
* Show how to debug applications with your favourite IDE.
* Explain how to sync code between online and offline.
* Show how to keep libraries in sync between both offline and online.

To follow along you'll need to have the following software installed on your local machine:

* A build toolchain: either gcc/make, or [uVision](https://docs.mbed.com/docs/debugging-on-mbed/en/latest/Debugging/Keil/), [Eclipse](https://developer.mbed.org/cookbook/eclipse-for-building-and-debugging) or [Visual Studio](http://visualgdb.com/tutorials/arm/mbed/).
* [Mercurial](https://www.mercurial-scm.org/wiki/Download) (hg)

**Note:** On Windows you might want to install [Cygwin](https://www.cygwin.com) for gcc and make.

## Writing a simple application

Let's start by writing a simple application in the [online compiler](https://developer.mbed.org/compiler/).

1. Create an empty project, and select your target (in this example we're using FRDM-K64F, but any target would work).
1. Add the `mbed` library.
1. Create a file `main.cpp` with the following content:

```cpp
#include "mbed.h"

// if you're not using FRDM-K64F, change this line
DigitalOut led(LED_RED);

int main()
{
    while (true) {
        led = !led; // toggle led
        wait(0.2f);
    }
}
```

Hit the compile button and verify that your application builds as expected.

## Build the application with a local toolchain

Before we can take our application offline, we first want to publish our project. This is required because it creates a Mercurial (hg) repository backing the project. We can use this repository to sync between the online compiler and our local toolchain. Right click on your project name, and select 'Publish'.

![Publish button](assets/offline1.png)

You can choose to publish this project privately to prevent others from seeing it. Your repository is always write-protected, regardless of the setting you choose.

![Publication settings](assets/offline2.png)

After publication succeeded, and you look at your project page, there is a new button *Clone repository to desktop*. While this would indeed clone your repository, we would still miss build files for your toolchain, so we don't want to click this just yet.

![Clone to desktop](assets/offline3.png)

Fortunately within the online compiler we can export a project to a certain toolchain. This will not just give us the source code, but with also set up a Makefile or a project file (depending on the toolchain). For simplicity we'll be using GCC for now. Go back to the online compiler, right click on the project and select *Export*.

![Exporting to desktop](assets/offline4.png)

This generates a ZIP file for us that contains our source code, a Makefile and all the libraries we depend on (just one, `mbed` for now).

![Content of the ZIP file](assets/offline5.png)

Open a terminal window, and navigate to the folder where you extracted the project. We can verify whether we can build locally by running:

```bash
$ make
```

You'll now have a *.bin or *.hex file (depending on your target, but it's the same as in the online compiler) which you can drag to your board to flash.

## Debugging the application

Instead of using the GCC target, we can do the same by exporting to an toolchain that supports visual debugging. For example  [uVision](https://docs.mbed.com/docs/debugging-on-mbed/en/latest/Debugging/Keil/), [Visual Studio](http://visualgdb.com/tutorials/arm/mbed/) or [Eclipse](https://developer.mbed.org/cookbook/eclipse-for-building-and-debugging).

For instance, here I used the same approach to export to uVision 4 and start a debug session. The rest of the guide applies to all toolchains.

![Debugging with uVision](assets/offline8.png)

## Syncing changes back to the online compiler

We can now edit the code locally. For instance we can change how fast the LED blinks, or change the color of the LED. If you use the FRDM-K64F target, you could remove line 3 in `main.cpp` and replace it with:

```cpp
DigitalOut led(LED_GREEN);
```

Rebuild (call `make`) and flash the application to verify that your code compiles and works. Now we can commit our changes back. We don't need to setup anything here, because our code is automatically backed by the Mercurial repository we created earlier. We can run `hg status` to see which files we have changed.

```bash
$ hg status
    M main.cpp
    ? main.d
    ? main.o
    ? offline_sync_k64f.bin
    ? offline_sync_k64f.elf
    ? offline_sync_k64f.hex
    ? offline_sync_k64f.map
```

Before we can commit our changes, we first need to configure Mercurial with our name and e-mail address:

```bash
$ hg config --edit
```

After supplying your information we can now commit `main.cpp` back to mbed via:

```bash
$ hg commit -m "Change color from red to green"
$ hg push
```

Fill in your ARM mbed username and password in when prompted. Afterwards you'll see something like this:

```bash
$ hg push
    pushing to https://developer.mbed.org/users/janjongboom/code/offline_sync_k64f/
    http authorization required for     https://developer.mbed.org/users/janjongboom/code/offline_sync_k64f/
    realm: mbed.org
    user: janjongboom
    password:
    searching for changes
    remote: adding changesets
    remote: adding manifests
    remote: adding file changes
    remote: added 1 changesets with 1 changes to 1 files
```

**Note:** You can store your credentials, so you don't have to type them again all the time. [Here are instructions](http://stackoverflow.com/questions/2584407/how-to-save-username-and-password-with-mercurial).

Now go back to the online compiler, right click on your project and select 'Update' to pull in the changes you made locally.

![Updating your application](assets/offline6.png)

When you open `main.cpp` in the online compiler you'll see that our changes have made it back online.

![Yay](assets/offline7.png)

### Retrieving changes made in the online compiler

If you change something in the online compiler, hit the 'Commit' button, and then hit 'Publish' again to push back to the repository. Locally now run:

```bash
$ hg pull
$ hg update
```

To get the latest changes.

## Libraries

mbed is pretty great because of all the libraries. However, online libraries work a bit different than offline. In the online compiler we use a single file per library, which contains the repository where the library is located, and the commit hash (version) of the library used. Offline we cannot use this system, as we need to actual source code before we can build.

Let's add a library in the online compiler: [Nespresso-RGB-Sensor/GroveColourSensor](https://developer.mbed.org/teams/Nespresso-RGB-Sensor/code/GroveColourSensor/), by right clicking on your application, selecting *Import Library > From URL*, and copying in the URL.

![Import library](assets/offline10.png)

We also change `main.cpp` and add a line to reference the library:

```cpp
#include "GroveColourSensor/GroveColourSensor.h"
```

Now commit this change and publish the repository. If we now look in our repository we have a file called [GroveColourSensor.lib](https://developer.mbed.org/users/janjongboom/code/offline_sync_k64f/file/44238a870814/GroveColourSensor.lib) with the following content:

```
https://developer.mbed.org/teams/Nespresso-RGB-Sensor/code/GroveColourSensor/#f6a136b99533
```

This specifies both the Mercurial repository to which this library points, as well as the commit hash we're using (`f6a136b99533`).

If we would make a new export of this application, the GroveColourSensor repository is automatically cloned as a a Mercurial sub-repository, and checked out at the right commit. However, if we already took our application offline (which we did) and added the library at a later stage, this does not work.

```
$ hg pull
    pulling from https://developer.mbed.org/users/janjongboom/code/offline_sync_k64f    /
    searching for changes
    adding changesets
    adding manifests
    adding file changes
    added 1 changesets with 1 changes to 1 files
    (run 'hg update' to get a working copy)
$ hg update
    1 files updated, 0 files merged, 0 files removed, 0 files unresolved
$ make
    # snip
    main.cpp:2:51: fatal error: GroveColourSensor/GroveColourSensor.h: No such file     or directory
     #include "GroveColourSensor/GroveColourSensor.h"
                                                       ^
    compilation terminated.
    make: *** [main.o] Error 1
```

So let's take a look at the lib file, and add the repository ourselves.

```bash
# read the path
$ cat GroveColourSensor.lib
    https://developer.mbed.org/teams/Nespresso-RGB-Sensor/code/GroveColourSensor/#f6a136b99533
# clone that path
$ hg clone https://developer.mbed.org/teams/Nespresso-RGB-Sensor/code/GroveColourSensor/#f6a136b99533
    destination directory: GroveColourSensor
    adding changesets
    adding manifests
    adding file changes
    added 6 changesets with 9 changes to 3 files
    updating to branch default
    2 files updated, 0 files merged, 0 files removed, 0 files unresolved
offline_sync_k64f $ make
    # snip
    arm-none-eabi-size  offline_sync_k64f.elf
       text	   data	    bss	    dec	    hex	filename
      28696	    176	    320	  29192	   7208	offline_sync_k64f.elf
```

Now the application builds locally again, using the library we just added in the online compiler.

### Keeping libraries in sync (online -> offline)

Similarly, when someone updated a library in the online compiler we need to update the library offline as well. To update, check out the commit hash (the part after '#') in the .lib file. Then checkout this commit in the library folder.

```bash
$ cat GroveColourSensor.lib
    http://mbed.org/teams/components/code/GroveColourSensor/#56d6b711b8c7
$ cd GroveColourSensor
$ hg checkout 56d6b711b8c7
    0 files updated, 0 files merged, 0 files removed, 0 files unresolved
```

### Keeping libraries in sync (offline -> online)

If you update libraries offline, you'll need to manually update the .lib file. Let's say that the last commit of GroveColourSensor has some problems and we want to revert to the previous commit...

```bash
$ cd GroveColourSensor
# checkout a different commit
$ hg checkout f0e8304db2a3
    1 files updated, 0 files merged, 0 files removed, 0 files unresolved
# get the current commit hash
$ hg id -i
    f0e8304db2a3
```

Copy the hash (what's returned by `hg id -i`) and paste it back into GroveColourSensor.lib (after the `#`). Now commit and push:

```
$ hg status
    M GroveColourSensor.lib
$ hg commit -m "Update GroveColourSensor to previous commit"
$ hg push
    pushing to https://developer.mbed.org/users/janjongboom/code/offline_sync_k64f/
    searching for changes
    remote: adding changesets
    remote: adding manifests
    remote: adding file changes
    remote: added 1 changesets with 1 changes to 1 files
```

To update the library in the online compiler, we right click on the project and select 'Update all...'.

![Upload all](assets/offline11.png)

The library is now updated, and we can continue working in the online compiler.

## Conclusion

Using mbed does not mean always using the online compiler. It's an easy way to get started, but when you need to you can quickly export your code to your local toolchain. Exporting does not mean that you lose access to the online compiler or the library system, because it's easy to commit your code back upstream whenever needed.

Happy coding!

---

*[Jan Jongboom](http://twitter.com/janjongboom) is Developer Evangelist IoT at ARM, and loves step-debugging.*

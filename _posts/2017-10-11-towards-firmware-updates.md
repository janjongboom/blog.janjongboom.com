---
layout:   post
title:    "Towards firmware updates over LoRa: cryptography and delta updates"
date:     2017-10-11 00:00:00
tags:     mbed
originalUrl: https://os.mbed.com/blog/entry/towards-fota-lora-crypto-delta-updates/
originalName: "mbed Developer Blog"
---

Last June Arm and The Things Network demonstrated [firmware updates over Low-Power Wide Area Networks](https://os.mbed.com/blog/entry/firmware-updates-over-lpwan-lora/). At that point we were using two development boards, with a [Multi-Tech xDot](https://os.mbed.com/platforms/MTS-xDot-L151CC/) Cortex-M3 MCU as the LoRa radio, and a [FRDM-K64F](https://developer.mbed.org/platforms/FRDM-K64F/) Cortex-M4 MCU as the application processor. That system was great for a demonstration, but not very cost efficient for a commercial rollout. In addition, we were also always sending the complete firmware to the device, even if only a few bytes changed. Not great if we're using a network that has duty cycle limitations.

<!--more-->

Luckily we have been busy in the past months and these issues have now been resolved. We have the complete multicast firmware update solution running on a single xDot with only 32K RAM and 256K flash, and we have added delta updates to the client which reduces transmission time by 90% in most cases. The full device source code and the reference network server by The Things Network will be released in about two weeks during TechCon ([here is a link to the session!](http://schedule.armtechcon.com/session/enabling-firmware-updates-over-lpwan/850218)).

In the meantime, we'll use this blog post to show how we implemented two issues that everyone faces when writing a firmware update client:

* how do we verify the authenticity of a firmware file, and
* how do we implement binary patching on an embedded device.

**TL;DR?** The finished application is [here](https://github.com/janjongboom/mbed-os-example-fota-http/tree/verify_delta/).

To follow along with this blog post you'll need some software installed:

* [Mbed CLI](https://github.com/ARMmbed/mbed-cli) and a toolchain.
* A recent version of [node.js](https://nodejs.org/en/).
* [OpenSSL](https://www.openssl.org).
* A [terminal monitor](https://docs.mbed.com/docs/mbed-os-handbook/en/latest/debugging/printf/) like TeraTerm or GNU Screen.

## Verifying authenticity

In [this blog post](https://os.mbed.com/blog/entry/firmware-updates-mbed-5-flashiap/) we used the FlashIAP API in Mbed OS to download and flash new firmware, but we were not checking the authenticity of the firmware file. Let's change that by signing the firmware. We can do this by creating an [asymmetric key pair](http://searchsecurity.techtarget.com/definition/asymmetric-cryptography), so that we can put the public key in the device, and use the private key to sign the firmware file. When we download the firmware, we also download the signature.We can also use Mbed TLS to verify if the signature matches the file, and to check if it was signed by the other party.

Start by importing [mbed-os-example-fota-http](https://github.com/janjongboom/mbed-os-example-fota-http) with Mbed CLI. The application already contains a bootloader for the FRDM-K64F, ODIN-W2 and NUCLEO-F429ZI development boards. To add support for a different board, read [this blog post](https://os.mbed.com/blog/entry/firmware-updates-mbed-5-flashiap/).

### Generating a key pair

We can use [OpenSSL](https://www.openssl.org) to create a public/private key pair. Open a terminal, and navigate to the folder where you cloned https://github.com/janjongboom/mbed-os-example-fota-http. Then run:

```
$ node tools/create-keypair.js
```

Now we have two files in the folder: `update.key` (the private key), and `update.pub` (the public key). In addition we have a new file called `update_certs.h` in our source directory, this file contains the public key, and will be baked into our firmware.

### Downloading and verifying the key pair

Now we can verify whether the update was actually signed by this key.

In `source/main-http.cpp` add the following includes:

```cpp
#include "mbedtls/sha256.h"
#include "mbedtls/pk.h"
#include "update_certs.h"
```

Then add the following code in the `check_for_update` function (right below `delete req;`):

```cpp
    // Downloading signature... (put your computer's IP here)
    HttpRequest sig_req(network, HTTP_GET, "http://192.168.2.1:8000/update.sig");
    HttpResponse* sig_res = sig_req.send();
    if (!sig_res) {
        printf("Signature HttpRequest failed (error code %d)\n", sig_req.get_error());
        // on error, remove the update file
        remove(FULL_UPDATE_FILE_PATH);
        return;
    }

    // now calculate the SHA256 hash of the file, and then verify against the signature and the public key
    file = fopen(FULL_UPDATE_FILE_PATH, "rb");

    // buffer to read through the file...
    uint8_t* sha_buffer = (uint8_t*)malloc(1024);

    // initialize the mbedtls context for SHA256 hashing
    mbedtls_sha256_context _sha256_ctx;
    mbedtls_sha256_init(&_sha256_ctx);
    mbedtls_sha256_starts(&_sha256_ctx, false /* is224 */);

    // read through the whole file
    while (1) {
        size_t bytes_read = fread(sha_buffer, 1, 1024, file);
        if (bytes_read == 0) break; // EOF?

        mbedtls_sha256_update(&_sha256_ctx, sha_buffer, bytes_read);
    }

    unsigned char sha_output[32];
    mbedtls_sha256_finish(&_sha256_ctx, sha_output);
    mbedtls_sha256_free(&_sha256_ctx);
    free(sha_buffer);

    printf("SHA256 hash is: ");
    for (size_t ix = 0; ix < sizeof(sha_output); ix++) {
        printf("%02x", sha_output[ix]);
    }
    printf("\n");

    // Initialize a RSA context
    mbedtls_rsa_context rsa;
    mbedtls_rsa_init(&rsa, MBEDTLS_RSA_PKCS_V15, 0);

    // Read the modulus and exponent from the update_certs file
    mbedtls_mpi_read_string(&rsa.N, 16, UPDATE_CERT_MODULUS);
    mbedtls_mpi_read_string(&rsa.E, 16, UPDATE_CERT_EXPONENT);
    rsa.len = (mbedtls_mpi_bitlen( &rsa.N ) + 7) >> 3;

    if(sig_res->get_body_length() != rsa.len)
    {
        printf("Invalid RSA signature format\n");
        // on error, remove the update file
        remove(FULL_UPDATE_FILE_PATH);
        return;
    }

    // Verify if the signature contains the SHA256 hash of the firmware, signed by private key
    int ret = mbedtls_rsa_pkcs1_verify( &rsa, NULL, NULL, MBEDTLS_RSA_PUBLIC, MBEDTLS_MD_SHA256, 20, sha_output, (const unsigned char*)sig_res->get_body() );
    mbedtls_rsa_free(&rsa);

    if (ret != 0) {
        printf("RSA signature does not match!\n");
        remove(FULL_UPDATE_FILE_PATH); // on error, remove the update file
        return;
    }
    else {
        printf("RSA signature matches!\n");
    }
```

Make sure to replace `192.168.2.1` (twice!) with the IP address of your computer (make sure the board and your computer are on the same network), so your board can download the new files.

Then build and flash the application.

### Signing an update

Now it's time to create a new firmware version, and sign it with our private key. We'll need to re-build the application, so change some things in the `main.cpp` file (for example the `printf` message when the application starts, or the LED that blinks), and rebuild the application.

Now create a new folder `update-files`, and copy `mbed-os-example-fota-http_application.bin` into this folder, and rename the file to `update.bin`. Now sign the update with our private key:

```
# create the update-files folder
$ mkdir -p update-files
# copy the application
$ cp BUILD/*/GCC_ARM/mbed-os-example-fota-http_application.bin update-files/update.bin

# sign the application
$ openssl dgst -sha256 -sign update.key update-files/update.bin > update-files/update.sig
```

Now start a web server, so the device can download the files, for example via:

```
# starts a simple web server on port 8000
$ python -m SimpleHTTPServer
```

When we attach a serial monitor to the board (on baud rate 9,600) we can see the application running. When pressing the button on the development board the application downloads, and checks the firmware update signature before flashing the new binary.

```
Received 182053 bytes
Received 192773 bytes
Received 203493 bytes
Done downloading: 200 - OK
SHA256 hash is: 69e38a81582d751cd7a29d37e5354546b37290edc25bef475a9b7d5c651c0187
RSA signature matches!
Rebooting...
```

## Delta updates

That worked, but we're sending the full new binary over the line, even when we’ve only changed a small part of the application. That's wasteful, especially on networks with low throughput like LoRaWAN. We can do better! A way of doing this is through binary diffing. We compare the old and the new file, and generate a patch file, which can be applied to the original file. This way we only have to send the patch file to the device.

A downside of binary diffing is that it often uses a lot of memory. Bsdiff, a widely used binary diff tool, requires us to load both the old file and the patch file into memory. That's a problem on embedded devices where memory is scarce. To mitigate this we released [JANPatch](https://github.com/janjongboom/janpatch) (short for Jojo AlterNative Patch), a patching library which can run in a few hundred bytes of memory. It's based on JojoDiff's patch format, and is licensed under the Apache 2.0 license.

### Adding JANPatch

Add the library to the application with Mbed CLI via:

```
$ mbed add https://github.com/janjongboom/janpatch
```

Then reference the library in `source/main-https.cpp` under the defines:

```cpp
#include "janpatch.h"
```

Change the `FULL_UPDATE_FILE_PATH` define to:

```
#define FULL_UPDATE_FILE_PATH   "/" SD_MOUNT_PATH "/" MBED_CONF_APP_UPDATE_FILE
#define DIFF_SOURCE_FILE_PATH   "/" SD_MOUNT_PATH "/" MBED_CONF_APP_UPDATE_FILE ".source"
#define DIFF_UPDATE_FILE_PATH   "/" SD_MOUNT_PATH "/" MBED_CONF_APP_UPDATE_FILE ".update"

void patch_progress(uint8_t pct) {
    printf("Patch progress: %d%%\n", pct);
}
```

And change the download command to download the diff instead by changing `/update.bin` to `update.diff` (in the line that starts with `HttpRequest* req =`).

Now we can apply the diff to our running application when we download it. Insert the following code in the `check_for_update` function (right below `delete req;`):

```cpp
    // patch the file...
    FILE *source = fopen(DIFF_SOURCE_FILE_PATH, "rb");
    FILE *diff = fopen(FULL_UPDATE_FILE_PATH, "rb");
    FILE *target = fopen(DIFF_UPDATE_FILE_PATH, "wb");

    // fread/fwrite buffers, minimum size is 1 byte
    unsigned char* source_buffer = (unsigned char*)malloc(8 * 1024);
    unsigned char* diff_buffer   = (unsigned char*)malloc(8 * 1024);
    unsigned char* target_buffer = (unsigned char*)malloc(8 * 1024);

    janpatch_ctx ctx = {
        // provide buffers
        { source_buffer, 8 * 1024 },
        { diff_buffer,   8 * 1024 },
        { target_buffer, 8 * 1024 },

        // define functions which can perform basic IO
        // on POSIX, use:
        &fread,
        &fwrite,
        &fseek,
        &ftell,

        &patch_progress
    };
    int r = janpatch(ctx, source, diff, target);
    printf("janpatch returned %d\n", r);

    free(source_buffer);
    free(diff_buffer);
    free(target_buffer);

    fclose(source);
    fclose(diff);
    fclose(target);

    if (r == 0) {
        // move the target file to original location...
        remove(FULL_UPDATE_FILE_PATH);
        rename(DIFF_UPDATE_FILE_PATH, FULL_UPDATE_FILE_PATH);
    }
    else {
        printf("Failed to patch binary...\n");
        return;
    }
```

Now, compile and build the application, and flash it on the board.

### Putting the base file in place

Both the device and our computer (where we create the diff), need to have a common base file, which we use to create a diff from (on the computer) and apply the diff to (on the development board).

This base file will be the current application. First, copy `mbed-os-example-fota-http_application.bin` to the `update-files` directory and rename it to `original.bin`:

```
$ cp BUILD/*/GCC_ARM/mbed-os-example-fota-http_application.bin update-files/original.bin
```

Second, copy `mbed-os-example-fota-http_application.bin` to the SD card, and rename it to `mbed-os-example-blinky_application.bin.source`.

If we forget either of these steps the patch progress does not know where to apply the patch to. In this article we only need to do these steps once, but in a real scenario we'd update the common base file after every update.

### Generating patches

Time to generate a patch file. As before, we'll need to compile a new application, so make a small change to `main.cpp` and recompile.

1. [Download JojoDiff](http://jojodiff.sourceforge.net).
1. Open a terminal, and navigate to the folder where we extracted JojoDiff:

    ```
    $ cd src/
    $ make
    ```

1. Copy `mbed-os-example-fota-http_application.bin` to the `update-files` directory and name it `update.bin`.

    ```
    $ cp BUILD/*/GCC_ARM/mbed-os-example-fota-http_application.bin update-files/update.bin
    ```

1. Sign the new binary. We should sign the full binary, and not the diff, to ensure that the resulting binary (after patching) is valid:

    ```
    $ openssl dgst -sha256 -sign update.key update-files/update.bin > update-files/update.sig
    ```

1. And generate the diff:

    ```
    $ ~/Downloads/jdiff081/src/jdiff update-files/original.bin update-files/update.bin update-files/update.diff
    ```

1. Now restart the webserver.

    ```
    $ python -m SimpleHTTPServer
    ```

1. And run the application. Now we will only need to download and apply the patch file!

**Note:** Patching might take up to half a minute, depending on the size of the update, and the speed of the SD card. Progress information is printed over the serial port.

## Final thoughts

In this article we gave some insights into the challenges with secure firmware updates. We used Mbed TLS to verify that data was sent by a trusted party, and JANPatch to implement delta updates on a microcontroller. We implemented these features to enable efficient firmware updates over very slow networks, but they should be helpful for anyone writing a firmware update service. Note that we added some security to the example, but it's still too insecure to deploy in a real-life scenario. If you're interested in the subject, Brendan Moran is speaking at TechCon about the subject: "[Building Firmware Updates: the devil is in the details](http://schedule.armtechcon.com/session/building-firmware-updates-the-devil-is-in-the-details/850554)". If you're looking for a one-stop solution, Arm has a fully secure update client and bootloader available as part of Mbed Cloud.

We'll be releasing all parts of the LoRaWAN firmware update service in about two weeks, so keep an eye on the Mbed developer blog. If you're going to the LoRa All-Members meeting in Suzhou, we'll be doing a tech talk about firmware updates on Thursday 19 October from 11:30 - 12:30. And if you're at TechCon come and find us at the Mbed booth, and make sure to visit our session "[Enabling firmware updates over LPWAN](http://schedule.armtechcon.com/session/enabling-firmware-updates-over-lpwan/850218)" on Thursday 26 October at 11:30 AM in Ballroom G!

-

*Jan Jongboom is Developer Evangelist at Arm, and is actively working on standardizing firmware updates over LoRaWAN. While writing this blog post he realized that sitting in a Starbucks in Tokyo with a stack of development boards and Ethernet cables is not awkward at all.*

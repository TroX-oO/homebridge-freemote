# homebridge-freemote

## Homebridge plugin for Freebox remote control

This Homebridge plugin exposes Freebox v6 remote to Apple's Homekit.

## Installation
The homebridge-freemote plugin obviously needs homebridge, which, in turn needs Node.js.:

- Install the Node.js (with npm)
- Make sure your `$PATH` is configuret to launch `node`, `npm`, and, later, `homebridge`.
- You might want to update `npm` through `sudo npm update -g npm`.
- Install homebridge following the instructions on [https://github.com/nfarina/homebridge](https://github.com/nfarina/homebridge).  For me, this installs homebridge version 0.4.6 to `/usr/local/lib/node_modules`.  Make sure to create a `config.json` in `~/.homebridge`, as described.
- Install the homebridge-freemote plug-in through `sudo npm install -g homebridge-freemote`.
- Edit `~/.homebridge/config.json` and add the `Freemote` accessory provided by homebridge-freemote, see below.

## Setup Freebox application

To setup your application id and get a token. I advice you to download this bash helper and follow instructions on [https://github.com/JrCs/freeboxos-bash-api](https://github.com/JrCs/freeboxos-bash-api#--authorize_application-app_id-app_name-app_version-device_name)

Save your `AppId` and your `AppToken` for later.

## Getting Remote Code
You can find your Remote Code under `Settings` > `System` > `About Freebox Player and Server` > Under `Player` tab > `Remote code`

The code may look like a 7-digits number.

## Configuration
In homebridge's `config.json` you need to specify an accessory for homebridge-freemote:
```
 "accessories": [{
    "accessory": "Freemote",
    "name": "TV",
    "freebox_ip": "http://mafreebox.free.fr/",
    "remote_code": "12345678",
    "appid": "[AppId]", 
    "token": "[AppToken]"
  }],
```
The following parameters modify homebridge-freemote's behaviour:

- `freebox_ip`: The IP of your freebox. By default, on your local network, the Freebox is accessible through `http://mafreebox.free.fr/`
- `remote_code`:The remote code you'll find under Settings in the Freebox panel
- `appid`: The appid you registered in your freebox (see section `Setup Freebox application`)
- `token`: The token associated with your appid (see section `Setup Freebox application`)

## Usage

Once everything is done, just launched Homebridge and check that Homekit is know detecting your Freemote Accessory with the name you specified in the `config.json`.
You can know tell Siri commands like:
```
Hey Siri, turn TV on -> The TV switch on
Hey Siri, set TV to 5 -> The TV change to channel 5
```

Note: The Accessory is interpreted as a Lightbulb, so you may talk to Siri has if it was one.
The channel command is interpreted as a brightness setting. So you can tell Siri to change the Brightness of your TV.

## Troubleshooting

If you find any issue or improvements, do not hesitate to send me an email, or open an issue.
I'm doing this in my free time so for my personal use, so it might not work "as is" in your network configuration (I didn't test it somewhere else to be honest).

For the moment, the plugin does not support volume changes. (But the API does)
I'm searching for a practical way to change the volume by Siri command.

## Credits
[https://github.com/JrCs](https://github.com/JrCs) for the setup script

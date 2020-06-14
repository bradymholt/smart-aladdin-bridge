# raspberrypi-relay-controller

This Node.js application runs on a Raspberry Pi and allows you to control a Relay attached to the GPIO pins using a simple web page.

<img width="360" alt="relay-controller-web-interface" src="https://cloud.githubusercontent.com/assets/759811/21467989/8c2b842e-c9c5-11e6-863e-e1751d73a091.png">

## Requirements

- Node.js >= 9.9.0
- A user account with sudo access (for deployment)

## Setup

1. Run `./run init`. This will install dependencies.
1. Run `./run` to start the server

## Deployment

Run `./run deploy username@hostname`. It is assumed _username_ has sudo access on _hostname_.

To see log output on the deployed host, run `sudo journalctl -u raspberrypi-relay-controller`. Add `-f` argument to follow the log.

# SmartThings Setup

## Device Handler Setup

1. Login to [https://graph.api.smartthings.com/](https://graph.api.smartthings.com/)
2. Go to: My Device Handlers > Create New Device Handler > From Code
3. Paste contents of `support/pi-relay-control-device-handler.groovy`
4. Click: Create, Publish > For Me

## Device Setup

1. Login to [https://graph.api.smartthings.com/](https://graph.api.smartthings.com/)
2. Go to: My Devices > New Device
3. Specify: Name, Device Network Id (arbitrary), Location, Hub, Type ("Pi Relay Control")
4. Click: Create, Preferences > edit
5. Specify: IP, port, Relay #
6. Click: Save

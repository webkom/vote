# vote-client

Small wrapper that enables reading of MiFare cards enabled by [Silicon Labs driver](https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers)

## Setup

```bash
$ git clone git@github.com:webkom/vote.git
$ cd vote/electron_app
$ yarn
$ yarn start
```

## Build

Prebuilt .zips are found at [releases](https://github.com/webkom/vote/releases)

Outputs a `.zip` with the app in `electron_app/dist/` for the current OS.

```bash
$ git clone git@github.com:webkom/vote.git
$ cd vote/electron_app
$ yarn
$ yarn dist
```

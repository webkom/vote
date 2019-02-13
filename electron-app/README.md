# vote-client

Small wrapper that enables reading of MiFare cards enabled by [Silicon Labs driver](https://www.silabs.com/products/development-tools/software/usb-to-uart-bridge-vcp-drivers)

## Setup

```bash
$ git clone git@github.com:webkom/vote.git
$ cd vote/electron-app
$ yarn
$ # Run in dev:
$ yarn start
```

### Usage

```
# With yarn
$ URL=https://your-vote-url.tld/admin yarn
```

### Environment variables

- **URL** (optional)
  - Url to the admin page of your vote instance
  - `defualt`: http://localhost:3000/admin
- **SERIAL_PORT** (optional)
  - Optional path to the serialport, allows you to skip the initial port select
  - `defualt`: \<empty\>

## Build

Prebuilt .zips are found at [releases](https://github.com/webkom/vote/releases)

Outputs a `.zip` with the app in `electron-app/dist/` for the current OS.

```bash
$ git clone git@github.com:webkom/vote.git
$ cd vote/electron-app
$ yarn
$ yarn dist
```

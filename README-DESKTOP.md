# ReBourne Desktop Build

## Run now

Double-click `ReBourne App.cmd`.

This starts the local ReBourne server and opens the app at `http://localhost:5173/`. Use this launcher instead of opening `fitness-plan-app.html` directly, because plan generation needs the local API route.

## Portable desktop app

The current downloadable build is:

```text
dist/ReBourne-portable-win.zip
```

Unzip it and open `ReBourne.exe`.

## Build the desktop app

Run:

```powershell
npm install
npm run dist
```

The packaged app folder will be created at `dist/win-unpacked`.

## API key

Plan generation needs an Anthropic API key. If the local server does not already have `ANTHROPIC_API_KEY`, the app will prompt for a key and store it locally in the app browser storage.

For development, you can also set:

```powershell
$env:ANTHROPIC_API_KEY="your-key-here"
npm start
```

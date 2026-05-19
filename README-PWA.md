# ReBourne iPhone Web App

This is the fastest iPhone testing route without a Mac.

## What was added

- `manifest.webmanifest` for Home Screen install metadata.
- `sw.js` for app shell caching.
- iPhone safe-area metadata and Apple Home Screen icon tags.
- PWA icons in `assets/icons/`.
- `render.yaml` for a simple hosted Node deployment.

## Deploy

Deploy this repo as a Node web service. The easiest first target is Render:

1. Push the repo to GitHub.
2. Create a new Render web service from the repo.
3. Use:
   - Build command: `npm install`
   - Start command: `npm start`
4. Add environment variable:
   - `ANTHROPIC_API_KEY`
5. Open the public HTTPS URL on your iPhone.

## Install on iPhone

1. Open the hosted URL in Safari.
2. Tap Share.
3. Tap Add to Home Screen.
4. Open ReBourne from the Home Screen icon.

## Important

For this option, the hosted Node service serves both the frontend and `/api/message`, so users never need an API key. The API key lives only in the hosting provider environment variables.

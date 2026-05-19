# ReBourne iOS Build

The iOS project has been generated with Capacitor.

## Files

- Mobile web bundle: `mobile-www/`
- Xcode project: `ios/App/App.xcodeproj`

## Update the iOS app after web changes

Run:

```powershell
npm run ios:sync
```

This copies `fitness-plan-app.html` and `assets/` into the iOS project.

## Open on a Mac

On a Mac with Xcode installed:

```bash
npm install
npm run ios:sync
npm run ios:open
```

Then in Xcode:

1. Select the `App` target.
2. Choose your Apple developer team under Signing & Capabilities.
3. Connect your iPhone.
4. Select your iPhone as the run destination.
5. Press Run.

## Backend requirement

The iOS app cannot use the local Windows server at `localhost:5173`. For real plan generation on iPhone, the app needs a hosted ReBourne backend URL such as:

```text
https://api.rebourne.co.uk
```

For now, the mobile app will ask for that backend URL if plan generation is attempted inside the iOS app.

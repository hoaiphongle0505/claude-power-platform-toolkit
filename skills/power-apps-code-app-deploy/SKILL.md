---
name: power-apps-code-app-deploy
description: Package, build, verify and publish updates to a Power Apps Code App (React/TypeScript/Vite with Dataverse). Use when the user wants to ship a change to a Code App, produce an update zip, or fix a build or push error.
---

# Power Apps Code App: build, package, push

Use this for a Code App written in React + TypeScript + Vite that reads and writes Dataverse.

## Workflow

1. **Make the change in the project source.** Keep edits small and focused.
2. **Build before you hand anything over.** Run the type check and `npm run build` in your own
   workspace. Never give the user code you have not built.
3. **Package a cumulative update zip.** The zip must contain every file changed since the last
   version the user installed (not only the latest edit), at the same relative paths, so the user can
   extract it over the project folder and nothing is missing. Name it `app-update-<N>.zip` and increase `N` each time.
4. **Give the user the deploy steps** (they run on the user's machine):
   1. Extract the zip over the project folder.
   2. `npm run build`
   3. `pa app push` (Power Platform CLI, signed in to the right environment)
   4. Hard refresh the app (Ctrl+F5) to avoid the cached bundle.
5. **Say what changed in one or two sentences.** Do not recap every step.

## Checks before delivering

- Types compile and the build finishes without errors.
- New Dataverse columns use the real **logical names** (publisher prefix, lowercase). Read them from
  the table definition, never guess.
- Choice (picklist) columns are written with the numeric value, not the label.
- No secrets, tenant IDs or personal emails are added to source files. Put environment values in a
  config module (for example `src/lib/app-config.ts`).
- If a feature needs configuration that may be missing (for example a Form URL), the code falls back
  gracefully instead of crashing.

## Pitfalls

- Hiding an admin page in the UI is **client-side only**. Real protection needs Dataverse security roles.
- A stale bundle after `pa app push` is usually the browser cache. Hard refresh first before debugging.
- QR codes or links that embed a URL must be regenerated and reprinted whenever the URL format changes.
  Tell the user when printed labels become outdated.
- Do not ask the user for screenshots of the app to verify your work. Run it, read the code, and check
  data through the API yourself.

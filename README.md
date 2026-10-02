# Seizure Diary

A mobile-first, fictional-data prototype for discussing a home EEG event diary.

**Prototype only: do not use with real patient data!**

## Run locally

Requires Node.js 22.12+ (developed with Node 24) and npm.

```sh
npm ci
npm run dev
```

Open the localhost URL printed by Vite. No API keys or cloud accounts are needed.

```sh
npm run build
npm run typecheck
```

## Step 1

Add an event manually, using one of four event types, a timestamp defaulted to the instant the form opened, and optional notes. Change the date/time if needed. Saving returns to a diary ordered by event time; cancelling discards the draft.

Entries live only in React memory: refreshing or closing the page clears them. There is no server, browser storage, microphone, AI, authentication, or deployment yet. Times use the browser’s local timezone. The next step is subject to review with the project owner.

Review the empty diary, adding an event with Now, adding a backdated event, cancellation, and the 480px app layout at mobile and desktop widths.

## Project conventions

Use Conventional Commits, for example `feat: add manual event diary`. The project owner decides when to commit. See `SPEC.md` for the incremental delivery plan and `AGENTS.md` for working conventions.

## Independent preview ports

- `npm run dev`: your interactive preview at http://127.0.0.1:5173/.
- `npm run dev:agent`: agent preview at http://127.0.0.1:5174/.

Both use strict ports and separate page state. Navigating or adding entries in one does not affect the other. Source changes still hot-reload both; these are not frozen builds.

## Screenshot exports

Install the screenshot browser once after installing dependencies (stored locally in the gitignored `work/playwright-browsers/` folder):

```sh
npm run screenshots:setup
```

Then, from the project directory:

```sh
npm run screenshots
```

The script starts its own temporary server on port 5175 and an isolated headless browser, then closes both. Leave 5175 free. It does not navigate either interactive preview. It captures both current screens and their useful states: empty diary, blank event form, populated form with date editing, and saved diary. Each gets a mobile (390px) and desktop (1280px) full-page PNG. The clock, timezone, and fictional example are fixed for consistent comparisons.

Each run reserves the next numbered directory: `screenshots/001/`, `screenshots/002/`, etc. Existing exports are never overwritten. `manifest.json` lists the images; failed runs keep their partial output and a `FAILED.txt`. The entire `screenshots/` directory is gitignored. Update the screen journey in `scripts/screenshots.mjs` as screens evolve.

## Formatting

JavaScript and TypeScript use explicit semicolons, enforced by `.prettierrc.json`. Run `npm run format` to apply formatting and `npm run format:check` to check it.

If Chromium fails to launch with a macOS `MachPortRendezvousServer` permission error inside an agent sandbox, run `npm run screenshots` from your normal terminal. The export script cannot bypass that environment restriction. The initial screenshot pack was captured using the supported browser tool; a full CLI export remains to be verified outside that sandbox.

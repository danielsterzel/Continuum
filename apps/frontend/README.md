# Continuum frontend

Local-first Next.js 16 / React 19 client targeting the browser and a Capacitor iOS
container. See the [project README](../../README.md) for the product tour,
architecture, synchronization protocol, and complete local setup.

## Start the web client

```bash
npm install
printf 'NEXT_PUBLIC_API_URL=http://localhost:8000\n' > .env.local
npm run dev
```

Open <http://localhost:3000>.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## iOS

On macOS with Xcode:

```bash
npm run build
npx cap sync ios
npx cap open ios
```

For a physical device, `NEXT_PUBLIC_API_URL` must point to an API address reachable
from the phone rather than `localhost`.

## Local data

- Web: SQLite through `jeep-sqlite` / SQL.js, persisted in IndexedDB.
- iOS: native SQLite.
- Files: Capacitor Filesystem under `Directory.Data`.
- Pending operations: the local `sync_changes` outbox.

## Module map

- `app` — routes, contexts, and background sync worker;
- `components` — product UI;
- `lib/db` — repositories and domain services;
- `lib/files` — web/iOS file abstraction;
- `lib/sync` — outbox, PUSH, PULL, and snapshot application;
- `lib/api` — HTTP client;
- `lib/types` — TypeScript contracts;
- `ios` — generated Capacitor/Xcode project.

The current lint configuration includes generated output under `ios/App/App/public`.
Exclude generated artifacts before treating lint as a strict CI gate.

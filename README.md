<div align="center">

# Continuum

### Your personal media library — available offline, consistent across devices.

Continuum is a self-hosted, local-first media workspace for organizing personal files,
resuming video playback, and creating timestamped notes. Library changes are written
locally first and synchronized in the background through a version-aware sync engine.

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor_8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

[Explore the architecture](#architecture) · [Run locally](#running-locally) · [See the roadmap](#roadmap)

</div>

---

## Why Continuum?

Streaming platforms remember where you stopped. Local files usually do not.

Continuum brings that same continuity to media you own: create focused libraries,
open a file on one device, annotate an exact moment, and continue from the same
position elsewhere. The application remains responsive without a network connection
because the device — not the server — is the first place every change is saved.

## What works today

- **Local-first library management** — create and delete libraries, add custom cover
  images, and keep working when the backend is unavailable.
- **Multi-format workspace** — upload, store, and view videos, images, and PDF documents.
- **Resume playback** — video position is saved on pause, seek, and periodically during
  playback, then restored on the next visit.
- **Timestamped video notes** — create, edit, and remove notes connected to an exact
  playback position.
- **Cross-device synchronization** — metadata, media files, covers, notes, and playback
  progress move between registered devices automatically.
- **Offline outbox** — failed network calls leave changes in the local queue for a
  later retry instead of losing user work.
- **Account and device onboarding** — account creation, bcrypt password verification,
  login, and per-device registration flows.
- **Responsive Web + iOS foundation** — one Next.js interface targets the browser and a
  native iOS container through Capacitor.

## The engineering behind it

Continuum's most interesting part is not the media player — it is the synchronization
model beneath it.

| Challenge | Implementation |
| --- | --- |
| Instant offline writes | SQLite on each client, backed by IndexedDB on the web and native SQLite on iOS |
| Reliable delivery | Local outbox-style `sync_changes` queue with batches of up to 20 operations |
| Duplicate requests | Every change has a UUID; the server journal makes replay idempotent |
| Concurrent devices | Optimistic `expected_version` checks plus a per-user PostgreSQL row lock |
| Conflicting edits | Entity-specific, CRDT-inspired resolvers instead of one global overwrite policy |
| Deletions | Server-side soft deletes and tombstones preserve deletion history across sync cycles |
| Large binary data | Metadata travels as JSON; media and covers use separate multipart transfers |
| Background convergence | Push pending work, then pull server state; the cycle runs after login and every 30 seconds |

### Conflict resolution by domain

Different fields carry different meaning, so Continuum resolves them differently:

- **LWW (last-write-wins)** for names, titles, timestamps, and media metadata.
- **Latest activity wins** for playback progress, based on `last_watched`.
- **Multi-value preservation** for concurrent library description edits.
- **Deterministic note forking** for concurrent note-body edits. Both versions survive,
  and UUIDv5 keeps conflict materialization idempotent across retries.
- **Remove-vs-update preservation** when a stale delete competes with a newer edit.

## Architecture

Continuum is split into two independently useful halves: an offline-capable client and a
canonical synchronization server. The client never waits for a round trip before making
a library change visible. The server is responsible for validating, ordering, merging,
and redistributing those changes to the user's other devices.

[![Continuum synchronization architecture](docs/architecture/continuum-sync-overview.svg)](docs/architecture/continuum-sync-overview.svg)

<div align="center"><sub>Click the diagram to open the full-resolution vector version.</sub></div>

### Responsibilities by boundary

| Boundary | Responsibility |
| --- | --- |
| **Product UI** | Optimistically reflects libraries, media, progress, and notes from local state |
| **Domain services** | Coordinate repository writes, file operations, and creation of sync events |
| **Local repositories** | Hide the Web/iOS SQLite difference behind one persistence interface |
| **Outbox + sync worker** | Preserve operation order, send batches, retry failures, and pull only after pending writes are drained |
| **FastAPI boundary** | Validate Pydantic payloads, device ownership, and route each entity to its resolver |
| **Conflict resolvers** | Apply domain-specific merge semantics instead of blindly overwriting rows |
| **PostgreSQL + journal** | Hold canonical metadata, entity versions, tombstones, and processed change IDs |
| **File storage channel** | Transfer immutable media and library covers independently from JSON metadata |

### One complete synchronization cycle

1. The UI commits an operation to local SQLite and local file storage first.
2. `EntitySyncMapper` serializes the entity and appends a versioned change to the outbox.
3. The sync worker sends at most 20 ordered changes in one request. A failed request
   leaves the batch queued for the next cycle.
4. The backend acquires a row lock for the user, rejects unknown devices, and ignores a
   change UUID that has already been committed.
5. If `expected_version` matches, the operation follows the normal path. If it does not,
   the appropriate entity resolver applies its field-level conflict policy.
6. Domain changes, their new versions, and the server journal are committed in one
   transaction. Binary files travel separately after their metadata is accepted.
7. Only after the outbox is empty does the client pull the canonical state, apply local
   upserts/tombstones, and download files that are missing on that device.

### Consistency model

- **Immediate read-your-writes** on the originating device because local storage is the
  primary interaction path.
- **At-least-once retry with idempotent application**: a response can be lost and the
  same change can be sent again without being applied twice.
- **Per-user serialization** on the server prevents two devices from both validating
  against stale state inside parallel transactions.
- **Eventual cross-device convergence** while preserving selected concurrent values
  where choosing a single winner would cause data loss.
- **Explicit consistency boundary**: this is not a strongly consistent system. A device
  can work offline and temporarily diverge by design, then reconcile when connectivity
  returns.

For the complete implementation-level views, see the
[architecture diagrams](docs/architecture/README.md) and the three
[sync sequence diagrams](docs/sequence/README.md).

<details>
<summary><strong>Open the full system diagram</strong></summary>

![Continuum implementation architecture](docs/architecture/continuum-architecture-readable.png)

</details>

## Data model

The shared domain consists of users, devices, libraries, media, playback progress, and
notes. Domain records carry versions; the client outbox and server change journal make
their lifecycle observable and replay-safe.

<details>
<summary><strong>Open the entity relationship diagram</strong></summary>

![Continuum data model](docs/architecture/continuum-data-model.png)

</details>

## Tech stack

| Layer | Technology | Role |
| --- | --- | --- |
| Client | Next.js 16, React 19, TypeScript 5 | Static-exportable application and responsive UI |
| UI | Tailwind CSS 4, Motion, Lucide | Design system, interaction, and icons |
| Client data | Capacitor SQLite, SQL.js, IndexedDB | One repository API across native and web storage |
| Native shell | Capacitor 8, Swift/iOS project | Native filesystem and SQLite access on iOS |
| Server | FastAPI, Pydantic, Uvicorn | Async HTTP API and request validation |
| Persistence | SQLAlchemy 2 async, Alembic, PostgreSQL 15 | Transactions, migrations, and canonical server state |
| Security | bcrypt | Password hashing and verification |
| Infrastructure | Docker Compose, `uv` | Reproducible database/backend setup and Python dependencies |

## Repository layout

```text
Continuum/
├── apps/
│   ├── frontend/
│   │   ├── app/                 # Next.js routes, contexts, and sync worker
│   │   ├── components/          # Responsive product UI
│   │   ├── lib/
│   │   │   ├── db/              # Local repositories and application services
│   │   │   ├── files/           # Cross-platform file persistence
│   │   │   └── sync/            # Outbox, push/pull, and state application
│   │   └── ios/                 # Capacitor-generated native iOS project
│   └── backend/
│       ├── app/
│       │   ├── api/             # User and synchronization endpoints
│       │   ├── models/          # SQLAlchemy domain model
│       │   ├── repositories/    # Ownership-aware persistence layer
│       │   └── services/resolve # Per-entity conflict strategies
│       └── alembic/             # Versioned database migrations
├── docs/
│   ├── architecture/            # Editable Graphviz sources + rendered diagrams
│   └── sequence/                # Editable Mermaid sources + rendered flows
└── docker-compose.yml
```

## Running locally

### Prerequisites

- Docker with Docker Compose
- Python 3.12+ and [`uv`](https://docs.astral.sh/uv/)
- Node.js 20+ with npm, or Bun

### 1. Start PostgreSQL

```bash
docker compose up -d db
```

### 2. Configure and start the API

```bash
cd apps/backend
cp .env.example .env
```

Complete `apps/backend/.env` with:

```dotenv
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/continuum
FRONTEND_URL=http://localhost:3000
MEDIA_STORAGE_DIR=./media_storage
```

Then install dependencies, migrate the database, and start FastAPI:

```bash
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`; interactive OpenAPI documentation is
served at `http://localhost:8000/docs`.

### 3. Start the web client

In a second terminal:

```bash
cd apps/frontend
npm install
printf 'NEXT_PUBLIC_API_URL=http://localhost:8000\n' > .env.local
npm run dev
```

Open `http://localhost:3000`, create an account, name the device, and build the first
library.

### Optional: run the iOS shell

On macOS with Xcode installed:

```bash
cd apps/frontend
npm run build
npx cap sync ios
npx cap open ios
```

For a physical device, set `NEXT_PUBLIC_API_URL` to an API address reachable from the
phone before building the static bundle.

## API surface

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/user/setup` | Create an account and hash its password |
| `POST` | `/user/login` | Verify user credentials |
| `POST` | `/sync/initiate/{user_id}` | Push an ordered batch of entity changes |
| `GET` | `/sync/state/{user_id}` | Pull the canonical synchronization snapshot |
| `POST` | `/sync/icon/{user_id}` | Upload a library cover |
| `POST` | `/sync/media/file/` | Upload media binary data |
| `GET` | `/health` | API liveness probe |
| `GET` | `/health/db` | Database connectivity probe |

## Current scope and trade-offs

Continuum is an actively developed engineering project, not a production service. The
current implementation intentionally favors a clear, inspectable synchronization model:

- Pull returns a full snapshot; cursor-based incremental sync is a planned optimization.
- Credentials are verified with bcrypt, but authenticated sessions/JWT authorization are
  not implemented yet. Do not expose the current API directly to the public internet.
- The iOS project is present and wired to native storage, while Android packaging is not
  included yet.
- Video, image, and PDF experiences are implemented; a dedicated audio player is still in
  progress.
- Automated integration and conflict-simulation tests are the next reliability milestone.

## Roadmap

- [x] Local-first SQLite persistence
- [x] Background outbox synchronization
- [x] Cross-device media and cover transfer
- [x] Playback progress and timestamped notes
- [x] Optimistic versioning and domain-specific conflict resolution
- [x] Web client and Capacitor iOS foundation
- [ ] Incremental pull with sync cursors
- [ ] JWT sessions and hardened authorization
- [ ] Automated multi-device conflict and offline-retry test suite
- [ ] Production-ready audio experience
- [ ] Android packaging
- [ ] Object storage and cloud deployment profile

## Design decisions worth discussing

- Why sync metadata and binary files through separate channels?
- When is preserving both concurrent values safer than choosing a winner?
- How do deterministic IDs make a conflict resolver idempotent?
- Why does the client drain its outbox before accepting a server snapshot?
- Where should the boundary sit between local responsiveness and global consistency?

These questions shaped the project and make Continuum a practical exploration of
distributed-state problems inside a product users can actually interact with.

## License

Released under the [MIT License](LICENSE.md).

---

<div align="center">

Built by [Daniel Sterzel](https://github.com/danielsterzel) as an engineering thesis project.

</div>

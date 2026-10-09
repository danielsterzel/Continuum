<div align="center">

# Continuum

### A local-first media workspace with version-aware, cross-device synchronization

Organize personal media, keep playback progress, attach notes to exact moments,
and continue on another device — even when the network is unreliable.

<br />

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Capacitor](https://img.shields.io/badge/Capacitor_8-119EFF?style=for-the-badge&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

<br />

[Product](#product) · [Architecture](#architecture) · [Synchronization](#synchronization-engine) · [Run locally](#run-locally) · [Trade-offs](#current-boundaries)

</div>

<br />

![Continuum dashboard](docs/screenshots/dashboard1.png)

<div align="center">
  <sub>The dashboard is built entirely from device-local data. It remains useful without a network connection.</sub>
</div>

---

## The short version

Continuum is a self-hosted media library designed around a simple constraint:
**the network must not be in the critical path of a user action**.

Creating a library, importing a file, rating a video, saving playback progress,
or writing a note commits locally first. A background synchronization engine later
pushes ordered changes to a canonical server, resolves concurrent edits by domain,
and converges the user's other devices.

The project is less about building another media player and more about exploring
real distributed-systems problems inside a product people can interact with:

- offline writes and durable retry;
- at-least-once delivery with idempotent application;
- optimistic versioning and conflict detection;
- field-specific conflict resolution;
- deletion propagation through tombstones;
- atomic metadata transactions alongside non-transactional binary transfers;
- one persistence API across a browser and a native iOS container.

> Continuum is an engineering thesis project and an actively developed system.
> It is intentionally honest about its consistency model and current production boundaries.

---

## Product

### What works today

| Area                  | Capability                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| **Libraries**         | Create focused collections, edit their metadata, add cover images, and delete them locally first |
| **Media**             | Import, store, browse, rate, and remove video, image, and PDF files                              |
| **Playback**          | Persist video position and resume from the last watched moment                                   |
| **Notes**             | Create, edit, and delete notes attached to an exact video timestamp                              |
| **Dashboard**         | Local statistics, recent notes, media mix, top-rated items, and last-watched video               |
| **Offline mode**      | Continue writing while the API is unavailable; pending work remains in a durable outbox          |
| **Multi-device sync** | Synchronize metadata, files, covers, notes, progress, and registered devices                     |
| **Platforms**         | Responsive web client plus a Capacitor-based iOS foundation                                      |

### Product tour

<table>
  <tr>
    <td width="50%" align="center">
      <img src="docs/screenshots/library.png" alt="Continuum library view" />
      <br />
      <sub><strong>Library workspace</strong> — covers, metadata, file types, sizes, and durations.</sub>
    </td>
    <td width="50%" align="center">
      <img src="docs/screenshots/media.png" alt="Continuum video and notes view" />
      <br />
      <sub><strong>Video workspace</strong> — playback, ratings, and timestamped notes.</sub>
    </td>
  </tr>
</table>

<details>
<summary><strong>See onboarding and device management</strong></summary>

<br />

<table>
  <tr>
    <td width="33%"><img src="docs/screenshots/register-user.png" alt="Account creation" /></td>
    <td width="33%"><img src="docs/screenshots/device-setup.png" alt="Device registration" /></td>
    <td width="33%"><img src="docs/screenshots/profile.png" alt="Device management" /></td>
  </tr>
  <tr>
    <td align="center"><sub>Account creation</sub></td>
    <td align="center"><sub>Device registration</sub></td>
    <td align="center"><sub>Active device management</sub></td>
  </tr>
</table>

</details>

---

## Engineering highlights

| Problem                                          | Continuum's approach                                                                                     |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| The UI should never wait for the network         | Every domain write commits to local SQLite first                                                         |
| Offline work must survive a restart              | A persistent outbox stores ordered operations until acknowledged                                         |
| A lost response can cause a duplicate request    | Every change has a UUID; the server journal makes replay idempotent                                      |
| Two devices can update the same stale version    | `change.version` is compared with the entity's `expected_version`                                        |
| Different fields need different merge semantics  | Entity-specific resolvers implement LWW, maximum-time, multi-value preservation, and deterministic forks |
| Two requests for one user can race               | The backend serializes synchronization with a per-user PostgreSQL row lock                               |
| A delete must reach devices that were offline    | Server-side tombstones preserve deletion history                                                         |
| Large files should not bloat the change protocol | Metadata uses JSON; binaries use a separate multipart channel                                            |
| Web and iOS need different storage engines       | Repositories hide IndexedDB-backed SQLite and native SQLite behind one interface                         |

---

## Architecture

Continuum separates an offline-capable client from a canonical synchronization server.
The server is not required to make a local change visible; it is responsible for
validation, ordering, conflict resolution, and redistribution.

[![Continuum synchronization architecture](docs/architecture/continuum-sync-overview.svg)](docs/architecture/continuum-sync-overview.svg)

<div align="center">
  <sub>Click the diagram for a full-resolution vector view.</sub>
</div>

### System boundaries

| Boundary               | Responsibility                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| **Product UI**         | Renders local state and initiates user actions                                               |
| **Domain services**    | Coordinate local repositories, file operations, and sync-event creation                      |
| **Local repositories** | Provide one persistence interface across web and iOS SQLite                                  |
| **Outbox worker**      | Preserve ordering, send batches, retry failures, and pull only after pending work is drained |
| **FastAPI boundary**   | Validate payloads, device activity, paths, and ownership                                     |
| **Conflict resolvers** | Apply entity- and field-specific merge semantics                                             |
| **PostgreSQL**         | Store canonical metadata, versions, tombstones, and processed change IDs                     |
| **File channel**       | Move immutable media and library covers independently from metadata                          |

### Client

The client is a statically exportable Next.js 16 application. On the web,
`jeep-sqlite` and SQL.js persist SQLite state through IndexedDB. Inside the iOS
container, the same repository layer uses native SQLite and Capacitor's filesystem.

```text
React UI
  └── domain service
      ├── local SQLite write
      ├── local file write
      └── versioned operation → outbox
```

### Server

FastAPI exposes account, device, synchronization, and file-transfer endpoints.
Async SQLAlchemy repositories enforce ownership-aware access. A synchronization
transaction selects a resolver for the incoming entity, updates canonical state,
records the processed change UUID, and advances the expected version.

For implementation-level views:

- [Client architecture](docs/architecture/continuum-architecture-client.svg)
- [Network boundary](docs/architecture/continuum-architecture-network.svg)
- [Server architecture](docs/architecture/continuum-architecture-server.svg)
- [Editable diagram sources](docs/architecture/README.md)

---

## Synchronization engine

### One complete cycle

1. The user action commits to local SQLite and, when applicable, local file storage.
2. `EntitySyncMapper` serializes the entity and creates a versioned operation.
3. The operation is appended to the durable local outbox.
4. The worker sends up to 20 changes in order to `POST /sync/initiate/{user_id}`.
5. The server locks the user's row, validates the device, and checks the change UUID.
6. A matching version takes the normal path; a mismatch invokes the entity resolver.
7. Canonical metadata, its new expected version, and the idempotency journal commit in one transaction.
8. Required binaries are uploaded separately after their metadata is accepted.
9. Only when the outbox is empty does the client pull and apply the canonical snapshot.
10. Missing files are downloaded; already present immutable files are skipped.

The order is deliberate. **Push-before-pull** prevents a full server snapshot from
overwriting local work that has not yet left the device.

### Delivery and idempotency

The client removes a batch only after metadata and required file uploads succeed.
If a response is lost, the same operation may be sent again. The server's
`sync_changes` journal recognizes its UUID and does not apply it twice.

This yields **at-least-once transport with idempotent application**.

Binary transfer is a separate failure domain. Uploads are streamed to a temporary
file and atomically moved into place, so a partial upload cannot corrupt the previous
valid file. A failed upload leaves the client operation queued for retry.

### Version semantics

Each synchronized entity stores `expected_version`.

- A create operation is sent with version `0`.
- After accepting it, the server advances the entity to `1`.
- Each queued local mutation advances the device's local expectation.
- A request matching the server expectation follows the normal update path.
- A mismatch is treated as concurrent or stale work and routed to conflict resolution.

### Conflict resolution by domain

One universal “last write wins” rule would silently destroy valid work. Continuum
chooses merge semantics based on the meaning of each field.

| Entity / field                                  | Strategy                 | Result                                                           |
| ----------------------------------------------- | ------------------------ | ---------------------------------------------------------------- |
| Device `name`                                   | LWW by `updated_at`      | The newer name wins                                              |
| Device `last_seen`                              | Maximum timestamp        | Activity never moves backward                                    |
| Library `name`, `icon_url`                      | LWW                      | The newer value wins                                             |
| Library `description`                           | Multi-value preservation | Distinct concurrent descriptions are kept in deterministic order |
| Media metadata                                  | LWW                      | The newer allowed payload wins                                   |
| Playback progress                               | Latest activity wins     | The record with later `last_watched` wins                        |
| Note `title`, `timestamp`                       | LWW                      | The newer value wins                                             |
| Note `content`                                  | Deterministic fork       | Both bodies survive as separate notes                            |
| Stale delete vs newer Library/Media/Note update | Preserve update          | The newer live entity survives                                   |

#### Why note conflicts become forks

Concurrent edits to a note body can both contain valuable information. The resolver
marks the existing note as conflicted and materializes the incoming body as a second
note. Its ID is generated with UUIDv5 from the entity ID and change ID, making conflict
materialization deterministic across retries.

### Consistency model

Continuum provides:

- immediate read-your-writes on the originating device;
- durable offline work while local storage remains intact;
- ordered batches per client;
- per-user serialization on the server;
- at-least-once retry with idempotent metadata application;
- eventual convergence after devices reconnect;
- explicit preservation of selected concurrent values.

Continuum does **not** claim:

- linearizable or globally strong consistency;
- instant visibility on offline devices;
- one transaction spanning PostgreSQL and binary file storage;
- incremental pull — the current implementation returns a full snapshot.

### Failure behavior

| Failure                        | Observable behavior                                                                |
| ------------------------------ | ---------------------------------------------------------------------------------- |
| API unavailable                | The local write succeeds and remains in the outbox                                 |
| Response lost after commit     | The operation is resent and ignored by UUID on replay                              |
| Metadata batch fails           | The PostgreSQL transaction rolls back; the local batch remains queued              |
| Binary upload fails            | Metadata may already exist; the batch remains queued and upload is retried         |
| Partial file upload            | The temporary file is removed; the previous destination remains intact             |
| Device removed remotely        | Sync returns `403`; the client drops local device registration and re-enters setup |
| Missing local file during PUSH | The change is retained and the cycle fails visibly in logs                         |

Sequence diagrams:

- [Add media and PUSH](docs/sequence/01-media-upload-push.svg)
- [Register a second device and PULL](docs/sequence/02-second-device-pull.svg)
- [Offline work and retry](docs/sequence/03-offline-and-retry.svg)

---

## Data model

[![Continuum data model](docs/architecture/continuum-data-model.svg)](docs/architecture/continuum-data-model.svg)

| Entity          | Purpose                                                 | Synchronization metadata                         |
| --------------- | ------------------------------------------------------- | ------------------------------------------------ |
| `User`          | Account and ownership root                              | Timestamps                                       |
| `Device`        | Registered client identity and activity                 | Version + tombstone                              |
| `Library`       | Named collection with description and cover             | Version + tombstone                              |
| `Media`         | File metadata, type, duration, rating, and storage path | Version + tombstone                              |
| `MediaProgress` | Position, last watched time, and last device            | Version; one row per medium                      |
| `Note`          | Title, body, and optional media timestamp               | Version + tombstone                              |
| `SyncChange`    | Processed-operation journal                             | Change UUID, entity, operation, version, payload |

The client has its own `sync_changes` table. That table is an outbox of unacknowledged
operations, not a replica of the server journal.

---

## Technology choices

| Layer             | Technology                                 | Why it is here                                           |
| ----------------- | ------------------------------------------ | -------------------------------------------------------- |
| Web client        | Next.js 16, React 19, TypeScript 5         | Component model, static export, and type-safe UI         |
| UI                | Tailwind CSS 4, Motion, Lucide             | Responsive design and interaction                        |
| Local data        | Capacitor SQLite, SQL.js, IndexedDB        | A SQLite-shaped API on web and native                    |
| Native shell      | Capacitor 8, Swift/iOS project             | Native filesystem and SQLite access                      |
| API               | FastAPI, Pydantic, Uvicorn                 | Async HTTP boundary and executable contracts             |
| Server data       | SQLAlchemy 2 async, Alembic, PostgreSQL 15 | Transactions, row locks, migrations, and canonical state |
| Security baseline | bcrypt                                     | Password hashing and verification                        |
| Tooling           | `uv`, npm, Docker Compose                  | Reproducible local setup                                 |

---

## API surface

Interactive OpenAPI documentation is available at `http://localhost:8000/docs` while
the backend is running.

| Method   | Route                             | Purpose                                 |
| -------- | --------------------------------- | --------------------------------------- |
| `GET`    | `/health`                         | API liveness                            |
| `GET`    | `/health/db`                      | Database connectivity                   |
| `POST`   | `/user/setup`                     | Create an account and hash its password |
| `POST`   | `/user/login`                     | Verify credentials                      |
| `GET`    | `/devices/{user_id}`              | List active devices                     |
| `DELETE` | `/devices/{user_id}/{device_id}`  | Soft-delete another device              |
| `POST`   | `/sync/initiate/{user_id}`        | Push an ordered change batch            |
| `GET`    | `/sync/state/{user_id}`           | Pull the canonical snapshot             |
| `POST`   | `/sync/icon/{user_id}`            | Upload a library cover                  |
| `POST`   | `/sync/media/file/`               | Upload media bytes                      |
| `GET`    | `/media_storage/{user_id}/{path}` | Download synchronized binary data       |

<details>
<summary><strong>Example synchronization change</strong></summary>

```json
[
  {
    "id": "47da2465-d1a6-4300-8fe0-05e0ea51887c",
    "deviceId": "3e2a57d6-4ff9-4aa8-bbb8-f0a8e4cd9713",
    "entityType": "library",
    "entityId": "b2793059-7537-474d-9f21-bf24f958528f",
    "operation": "create",
    "version": 0,
    "payload": {
      "name": "Films",
      "description": "Watch later",
      "icon_url": null,
      "created_at": "2026-10-09T10:00:00Z",
      "updated_at": "2026-10-09T10:00:00Z",
      "deleted_at": null
    }
  }
]
```

</details>

---

## Repository map

```text
Continuum/
├── apps/
│   ├── frontend/
│   │   ├── app/                  # Routes, contexts, and sync worker
│   │   ├── components/           # Responsive product UI
│   │   ├── lib/
│   │   │   ├── api/              # HTTP client
│   │   │   ├── db/               # Local repositories and domain services
│   │   │   ├── files/            # Cross-platform file persistence
│   │   │   └── sync/             # Outbox, PUSH/PULL, snapshot application
│   │   └── ios/                  # Capacitor-generated Xcode project
│   └── backend/
│       ├── app/
│       │   ├── api/              # FastAPI routes
│       │   ├── models/           # SQLAlchemy domain model
│       │   ├── repositories/     # Ownership-aware persistence
│       │   ├── schemas/          # Pydantic contracts
│       │   └── services/resolve/ # Per-entity conflict strategies
│       ├── alembic/              # Versioned PostgreSQL migrations
│       └── tests/                # API and resolver tests
├── docs/
│   ├── architecture/             # Graphviz/Mermaid sources and renders
│   ├── sequence/                 # Synchronization sequence diagrams
│   └── screenshots/              # Product walkthrough
└── docker-compose.yml
```

---

## Run locally

### Prerequisites

- Docker with Docker Compose
- Python 3.12+
- [`uv`](https://docs.astral.sh/uv/)
- Node.js 20+ with npm, or Bun

### 1. Start PostgreSQL

From the repository root:

```bash
docker compose up -d db
```

### 2. Start the API

```bash
cd apps/backend
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

The checked-in example contains the local defaults:

```dotenv
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/continuum
FRONTEND_URL=http://localhost:3000
MEDIA_STORAGE_DIR=./media_storage
```

Verify the process:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/health/db
```

### 3. Start the client

In a second terminal:

```bash
cd apps/frontend
npm install
printf 'NEXT_PUBLIC_API_URL=http://localhost:8000\n' > .env.local
npm run dev
```

Open <http://localhost:3000>, create an account, register the device, and create the
first library.

### Optional: run the iOS shell

On macOS with Xcode:

```bash
cd apps/frontend
npm run build
npx cap sync ios
npx cap open ios
```

For a physical device, build with an API address reachable from the phone instead of
`localhost`, and bind Uvicorn to `0.0.0.0`.

---

## Tests

[![Backend tests](https://img.shields.io/badge/backend_tests-20_passing-22c55e?style=for-the-badge&logo=pytest&logoColor=white)](apps/backend/tests)

From `apps/backend`:

```bash
PYTHONPATH=. uv run pytest -q
uv run ruff check .
uv run mypy app
```

The current backend suite covers:

- active-device authorization and self-removal protection;
- path traversal rejection and metadata-to-path validation;
- atomic file replacement after successful upload;
- cleanup and old-file preservation after interrupted upload;
- normal resolver paths for all synchronized entities;
- device LWW / maximum-time behavior;
- library multi-value preservation;
- latest-activity playback progress;
- deterministic note conflict forks.

Frontend commands:

```bash
npm run build
npm run lint
```

The frontend lint configuration still scans generated files under
`ios/App/App/public` and the source tree has existing lint debt. It is not yet a green
CI gate; generated artifacts should be excluded before enforcing it.

---

## Security model

The implementation already includes bcrypt password hashes, ownership-aware repository
queries, device validation, Pydantic contracts, parameterized queries, upload path
validation, and atomic file writes.

However, the current API does **not** issue an authenticated session or JWT. Several
routes accept `user_id` from the request, static media URLs are not authorization-gated,
and CORS is permissive.

> Do not expose the current backend directly to the public Internet or use it for
> sensitive production media.

A production security pass would require authenticated identity-derived ownership,
private or signed file delivery, restrictive CORS, HTTPS, upload limits, secret
management, rate limiting, and audit-safe observability.

---

## Current boundaries

This project optimizes for an inspectable synchronization model rather than pretending
to be a finished cloud service.

- PULL returns a full snapshot rather than changes after a cursor.
- Metadata and file storage do not share one distributed transaction.
- Tombstones and orphaned files do not yet have a garbage-collection policy.
- The dedicated audio path is incomplete.
- Android packaging is not included.
- Sync polling runs every 30 seconds instead of using a push channel.
- API error mapping is intentionally simple and needs production hardening.
- End-to-end multi-device and fault-injection coverage should be expanded.

These are explicit engineering boundaries, not hidden assumptions.

---

## Roadmap

- [x] Local-first SQLite persistence
- [x] Durable outbox synchronization
- [x] Idempotent server-side change journal
- [x] Optimistic entity versioning
- [x] Domain-specific conflict resolution
- [x] Cross-device media and cover transfer
- [x] Playback progress and timestamped notes
- [x] Responsive web client and iOS foundation
- [ ] Authenticated sessions and hardened authorization
- [ ] Cursor-based incremental PULL
- [ ] Multi-device integration and fault-injection test harness
- [ ] Tombstone and orphaned-file lifecycle management
- [ ] Production-ready audio experience
- [ ] Android packaging
- [ ] Object storage and deployment profile

---

## Design questions behind the project

Continuum was built around questions that are useful beyond this specific product:

- When should a local-first client trust its own state, and when should it accept a snapshot?
- How can at-least-once delivery behave like exactly-once application?
- Why should a note conflict preserve both values while a rating can use LWW?
- What does a delete mean when another device concurrently updates the same entity?
- Where should the consistency boundary sit between metadata and large binary objects?
- How can the same domain layer remain useful over browser-backed and native SQLite?

The implementation is intended to make those trade-offs visible in code rather than
hiding them behind a framework.

---

## License

Released under the [MIT License](LICENSE.md).

<div align="center">

Built by [Daniel Sterzel](https://github.com/danielsterzel) as an engineering thesis project.

</div>

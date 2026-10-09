# Continuum backend

FastAPI synchronization server backed by async SQLAlchemy and PostgreSQL.
See the [project README](../../README.md) for the architecture, consistency model,
conflict strategies, API surface, and complete local setup.

## Start the server

Requires Python 3.12+, `uv`, and PostgreSQL.

```bash
cp .env.example .env
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

- API: <http://localhost:8000>
- OpenAPI: <http://localhost:8000/docs>

## Configuration

```dotenv
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/continuum
FRONTEND_URL=http://localhost:3000
MEDIA_STORAGE_DIR=./media_storage
```

## Tests and quality

```bash
PYTHONPATH=. uv run pytest -q
uv run ruff check .
uv run ruff format .
uv run mypy app
```

## Migrations

```bash
uv run alembic current
uv run alembic upgrade head
uv run alembic revision --autogenerate -m "describe the change"
uv run alembic downgrade -1
```

## Module map

- `app/api` — account, device, sync, and file endpoints;
- `app/models` — PostgreSQL domain model;
- `app/schemas` — Pydantic contracts;
- `app/repositories` — ownership-aware persistence;
- `app/services/SyncService.py` — transaction and change routing;
- `app/services/resolve` — per-entity conflict policies;
- `alembic` — schema migrations;
- `tests` — API and resolver tests.

> The API does not yet issue authenticated sessions or JWTs. Do not expose it
> publicly without authentication and file-delivery authorization.

## Backend

### Requirements

- Python 3.12+
- uv

### Installation

```bash
cd apps/backend

uv venv --python 3.12
source .venv/bin/activate

uv sync
```

### Running

```bash
uv run uvicorn app.main:app --reload
```

The API will be available at:

```
http://localhost:8000
```

Swagger documentation:

```
http://localhost:8000/docs
```
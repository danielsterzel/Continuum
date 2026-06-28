.PHONY: install run lint format test migrate revision upgrade downgrade

install:
	uv sync

run:
	uv run uvicorn app.main:app --reload

lint:
	uv run ruff check .

format:
	uv run ruff format .

test:
	uv run pytest

revision:
	uv run alembic revision --autogenerate -m "$(m)"

upgrade:
	uv run alembic upgrade head

downgrade:
	uv run alembic downgrade -1
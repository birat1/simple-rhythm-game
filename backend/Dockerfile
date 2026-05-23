FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

RUN groupadd -r appuser && useradd -r -g appuser -d /app appuser

WORKDIR /app

ENV UV_NO_DEV=1

COPY pyproject.toml uv.lock /app/

RUN chown -R appuser:appuser /app

USER appuser

RUN uv sync --locked

COPY ./app /app/app
COPY ./uploaded_tracks /app/uploaded_tracks

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0", "--port", "8000"]
# 01 — Reproduce local environment

Status: ready-for-agent
Progress: blocked
Type: task
Phase: M0
Priority: P0
Blocked by: None
Owner: unassigned
Target: main

## Outcome
Run empty MySQL/RustFS compose, migrations/seed, API health and UI render; capture logs and versions.

## Acceptance criteria
- [ ] API responds /health; worker one coordinator; results and environment recorded.
- [ ] Existing Jellyfish behavior and ownership rules are preserved; no secrets or rights violations.
- [ ] Reviewer has linked commit SHA, exact verification output and any limitations below.

## Implementation approach
1. Read `AGENTS.md` and relevant source, tests, ADRs. Document unknowns before writing code.
2. Write a failing behavior/contract test for logic changes; implement the smallest vertical slice.
3. Run focused tests, impacted suites, style/type checks; review diff.
4. Commit on `main` with repository subject convention and record evidence in `## Comments`.

## Likely files / boundaries
- `deploy/compose/`
- `backend/app/dev.py`
- `front/package.json`

## Verification
- [ ] Focused test(s) and command recorded; for docs-only task use source/link/semantic review.
- [ ] Backend change: `cd backend && uv run pytest -q` (or scoped tests), `uv run pylint app`.
- [ ] Frontend change: `pnpm --dir front run typecheck`, `pnpm --dir front run build`.
- [ ] API contract change: OpenAPI client refreshed from current running backend.
- [ ] If remote paid provider: cost cap + test credential verified outside Git.

## Comments
- 2026-11-23 — Planned from FilmForge roadmap; **not started**. No test or build result claimed.
- 2026-11-23 — Baseline attempt (ChatGPT runner; **not a Jellyfish runtime result**).
  - GitHub `main` verified at `2a1b25cd958abc6ffc8ab892ea4f5e0f2ccb497d`; only `main` observed. Actions API: `workflow_runs=[]` for `main`; combined commit statuses empty. CI workflow files use `pull_request`/`merge_group`, not direct `push` to `main`; branch protection disabled.
  - `git clone --depth=1 --branch main https://github.com/roronoazoroshao369/filmforge-studio.git /mnt/data/filmforge-studio` => exit 128, `Could not resolve host: github.com`.
  - Runner tools: `git`, `uv`, Python and Node available; `docker`, `podman`, `pnpm` missing. `curl http://127.0.0.1:8000/health` => exit 7, HTTP 000 (no local API responding).
  - Source-only preflight: `docs/development/guides/local-development.md` requires Compose MySQL/RustFS/migrations/seed before API/worker; `deploy/compose/docker-compose.yml` defines `mysql`, `rustfs`, `backend-migrate`, `backend-seed-system-data`, `backend`, `task-worker`, `front`; `backend/app/main.py` defines `/health`; `backend/app/dev.py` defines `api`, `worker`, `status`. **Not executed**.
  - RED/GREEN: not applicable (no behavior change). `pytest`, Pylint, typecheck, build, migrations, API/worker/UI smoke: **NOT RUN** (no full checkout/runtime). No paid API calls, GPU rental, upload or credential use.
  - **Environment-only blocker:** run this ticket on a network-enabled runner with Docker Compose, Python/uv, Node/pnpm and a clean checkout. Do not infer a product failure or mark Done from these observations.
- 2026-11-23 — Continuation of Task 01: additional **runner diagnostics and source-only bootstrap review** (not a successful startup).
  - Local runner: Python `3.13.5`, Node `v22.16.0`; repo pins Python `3.12` (`backend/.python-version`) and Node `24` (`front/.node-version`). `uv python list --only-installed` lists only Python 3.13.5. Import check matching `backend/tests/preflight.py`: `pytest`, `pytest_asyncio`, `fastapi`, `uvicorn`, `sqlalchemy`, `httpx` import successfully; `aiosqlite` fails with `ModuleNotFoundError`. Local ephemeral `127.0.0.1` TCP bind succeeds; ffmpeg/ffprobe installed. `corepack pnpm --version` fails fetching npm registry. These are **runner** constraints, not repository test results.
  - Local `curl --connect-timeout 2 --max-time 3 http://127.0.0.1:8000/health` => exit `7`, HTTP `000` (no API process). `git ls-remote` => `Could not resolve host: github.com`. Docker/Podman and pnpm unavailable. No migrations, API process, Worker, UI or real integration launched.
  - Source check: `backend/app/main.py` `/health` returns a static `status: ok`; it does **not** verify DB, RustFS or Worker. `backend/tests/preflight.py` tests local Python imports and socket bind, **not** MySQL/S3. `backend/app/scripts/migrate_database.py` intentionally refuses a non-empty unmanaged DB; `seed_system_data.py` seeds through a database transaction. `deploy/compose/docker-compose.yml` defines ordered `mysql -> backend-migrate -> backend-seed-system-data` via health/completion dependencies. `rustfs/rustfs:latest` is unpinned (reproducibility risk, not confirmed failure).
  - Next real-run acceptance (network-enabled clean checkout): use repo-required Python 3.12, Node 24, uv and pnpm; separate **empty** MySQL/RustFS volumes; run documented Compose startup `up --build -d mysql rustfs backend-migrate backend-seed-system-data`; inspect `docker compose ps -a` and both jobs' exit/logs; launch exactly one host API and one Worker (`uv run python -m app.dev api|worker`); verify `/health` **and separately DB/S3 access**, `uv run python -m app.dev status`, and UI render. Record output/exit codes, no provider keys and no `down -v` against existing data. After this, resume task 02 tests and 03/04 audits.
  - Scope: **documentation/evidence only**; RED/GREEN N/A; no application tests or build run; Task 01 remains `blocked`. No paid API use, cloud GPU, or publication.

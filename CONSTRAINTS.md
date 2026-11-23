# FilmForge constraints (initial floor)

**Status:** planning baseline 2026-11-23; numeric targets not invented before M0 measurements.

## Always enforced

- Do not change tests/config to disguise a failure; no skipped/deleted tests without explicit issue and reviewer note.
- No new suppression comments (`# noqa`, `# type: ignore`, `@ts-ignore`, `eslint-disable`) except documented narrow exception.
- No secrets, private scripts, signed URLs, voice samples without rights, or paid provider keys in Git.
- No unimplemented happy-path stub or swallowed error reported as feature complete.
- Do not replace Jellyfish `TaskService` single-writer semantics without approved ADR/tests.
- Do not modify this document to make a broken build “green”; changes require explicit decision.

## Existing required checks (scope-aware)

- Backend logic: `cd backend && uv run pytest -q`, focused tests before full where appropriate.
- Backend code/Pylint: `cd backend && uv run pylint app`.
- Frontend code: `pnpm --dir front run typecheck` and `pnpm --dir front run build`.
- API contract: regenerate with `pnpm --dir front run openapi:update` against a running **current** backend; inspect changed client.
- Docs-only: validate links, source claims and task/dependency graph; do not claim application tests passed.

## Measured then ratcheted in M0–M2

Coverage %, worker throughput, lost/duplicate paid submissions, media integrity, cost per approved minute, continuity false negative rate, asset reuse rate. Do not invent thresholds before benchmark; block only previously measured regressions and clearly defined correctness/safety violations.

## Operational

- One coordinating worker for existing DB.
- No unintended automatic retries of expensive API requests.
- Respect provider quota/entitlements and explicit budget approval.
- Before production deploy: dependency scan, SBOM/NOTICE review, least-privilege credentials, backup/restore smoke.

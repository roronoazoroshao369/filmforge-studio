# M0-05 / FF-001 — Foundation decision packet (DRAFT, UNSIGNED)

Date: 2026-11-25 (Asia/Ho_Chi_Minh). Reviewed baseline: `d193bd2d14a138cd9f8a717f16b34ac82b20c4a8`.
**Decision status: NOT DECIDED. Owner signature absent.** This packet is not an accepted ADR, M0 GO, production approval or permission to start M1/G1. The final numbered ADR belongs in `docs/development/adr/` only after owner decision. [Ticket 05](../../../.scratch/filmforge-studio/issues/05-record-foundation-go-no-go-adr.md) remains ready-for-human / not-started.

## Decision and boundaries

Choose whether to retain Jellyfish for controlled local creator-first development, run a bounded Toonflow comparison spike, or extract a smaller domain kernel. Preserve original-IP personal channel strategy, single coordinating worker and TaskService authority. No paid provider, private IP, production data, automatic publication, code import, schema migration or creative approval in this decision packet.

## Evidence and limitations

| Evidence | Result and provenance |
| --- | --- |
| [M0-02](../../../.scratch/filmforge-studio/issues/02-establish-backend-and-frontend-test-baseline.md) | Historical post-fix full backend 1485 passed, 62 skipped, 1 warning, exit 0; source fixture commit e9da7a65917f692421389f3eeb8ad68379b90d6b. Pylint 10/10; frontend baseline passed. Not fresh S17 full suites; skipped are not passes. |
| [M0-03](../../../.scratch/filmforge-studio/issues/03-audit-task-lifecycle-and-media-integration.md), [M0-04](../../../.scratch/filmforge-studio/issues/04-map-upstream-film-domain-and-duplication-hazards.md) | Historical Task lifecycle / entity audit, 29 and 11 scoped tests respectively; M0-04 evidence commit a250f7dd43e6a4e3914e928e9ac0505578e3a6e3. Source/document discrepancy: legacy SceneVersionRecord/SceneTakeRecord/SceneDeliveryRecord are not mapped authorities. |
| [S01 / #41](../short-film-path-audit.md) | Historical 65 scoped tests, real synthetic H.264 640x360 25 fps 2 s, frame extraction and retired export 404; no product master proof. |
| S17 current baseline | 39 passed in 7.09s, exit 0, scoped TaskService/store/retired-route tests below; root 20/20, including three trigger contracts. Source read confirms immutable remote ID, immutable output ordinal/file mapping, restricted Take/Cut references and storage key. |
| S17 external gates | `gh run list --commit d193bd2d14a138cd9f8a717f16b34ac82b20c4a8` => []; repo Actions runs API total_count=0; enabled=true, allowed_actions=all, workflows active. No run ID or failure log; underlying trigger/credential/platform cause unproven. Public /demo, /demo-media/fixture.mp4, /demo-media/reference.png, protected /api/v1/studio/projects all HTTP 530 text/plain. Current 403 unverified. Neither is evidence of a broken application nor of a production-ready release. |

Current source anchors: [TaskService](../../../backend/app/services/task_service.py#L110-L134) rejects empty or changed remote ID; [add_output](../../../backend/app/services/task_service.py#L196-L214) rejects unavailable or changed output file; [DirectingRevision/Take/CutTakeReference](../../../backend/app/models/directing.py#L110-L179), [ActiveCut/CutFrame](../../../backend/app/models/directing.py#L253-L279), [FileItem](../../../backend/app/models/studio_prompts_files_timeline.py#L44-L72). ActiveCut is a pointer, not the immutable revision itself. Task completion does not imply editorial adoption. Do not duplicate these identities. [Architecture](../architecture.md) and [upstream provenance](../upstreams.md) are planning/evidence, not approval.

Fresh S17 verification from repository root (existing cached Python 3.12.16, uv 0.13.9, FFmpeg/ffprobe 8.1.3, no sync; isolated HOME/SQLite, no inherited credentials):

```sh
env -i HOME="$PWD/.git/filmforge-s01/test-home" \
 PATH="$PWD/.git/filmforge-s01/ffmpeg-n8.1-latest-linux64-gpl-8.1/bin:/usr/bin:/bin" \
 UV_CACHE_DIR="$PWD/.git/filmforge-s01/cache" \
 UV_PYTHON_INSTALL_DIR="$PWD/.git/filmforge-s01/python" \
 UV_PROJECT_ENVIRONMENT="$PWD/.git/filmforge-s01/venv" \
 DATABASE_URL="sqlite+aiosqlite:///$PWD/.git/filmforge-s01/test.sqlite" \
 AWS_EC2_METADATA_DISABLED=true PYTHONDONTWRITEBYTECODE=1 \
 .git/filmforge-s01/uv-x86_64-unknown-linux-gnu/uv run \
 --project "$PWD/backend" --locked --no-sync --directory "$PWD/backend" \
 pytest -q -ra tests/services/test_task_service.py tests/directing/test_store.py tests/directing/test_retired_routes.py
node --test scripts/*.test.mjs
```

Observed: 39 passed in 7.09s; root 20 passed, 0 failed, 0 skipped. No application source changed; no fresh full backend/frontend, new media artifact, or live provider test.

## Alternatives and trade-offs

| Option | Advantage | Cost / limitation | When to select |
| --- | --- | --- | --- |
| A — retain Jellyfish | Existing React/FastAPI workflow, tested ownership and local media helpers; shortest reuse path | Missing active master/export/audio/subtitle; inherited debt, partial locale, runtime CI and preview gaps | Owner accepts controlled local development only; validate smallest offline editorial slice before expanding |
| B — bounded Toonflow spike | Alternative UI / 3D previs may suit creator workflow | No comparable measured baseline in this repo; Vue/Bun integration and domain compatibility unproven; avoid code merge | A fails a reproducible critical workflow or owner prioritizes previs; compare same synthetic input, lineage, effort and QC |
| C — domain extraction | Smaller core if inherited UI/domain is an actual impediment | Most migration/ownership/regression risk; rebuild editor and operational features; no measured benefit | A and B fail bounded evidence; require explicit spec, migration plan, tests and owner decision |

**Engineering recommendation (not approval): A, conditional controlled-local GO.** B and C are not rejected as intrinsically inferior: no comparative benchmark exists. They are not justified now because tested existing authority and reuse are available, while migration cost and workflow benefit remain unmeasured. The proposal accepts inherited UI debt and missing product export; it makes no claim of comparative performance or economics.

## Owner decision criteria and reversal

Owner may choose A (controlled local only), B (bounded comparison, no integration), C (separate extraction proposal), or NO-GO/hold. A must not imply release, CI pass, provider rights, credentials, new cost, or public deployment. Owner records choice, rationale, accepted blockers, scope, date and signature in final ADR; no prefilled approval. M1 only after explicit M0 GO under roadmap; #55 separately requires decision before G1. No owner decision supplied in S17.

Before production/creative release independently prove actual CI, authorized preview identity/403, rights/consent/NOTICE and backup/restore, and a human-reviewed master. Re-evaluate A if a reproducible offline critical-path proof cannot preserve existing lineage, or if a bounded comparable spike demonstrates material benefit (measure effort, QC, and resource use; no invented thresholds). Review assumptions at first offline export evidence: immutable lineage feasible (unverified export), adaptation less costly than rewrite (unmeasured), operational gaps separable from foundation (unverified in public runtime).

Rollback for this docs-only packet: reviewed revert of its delivery commit; preserve unrelated changes. Future code-only rollback: reviewed revert after backup verification. Any migration, stored media or production data rollback requires separately approved tested backup/restore; no hard reset, volume deletion or blind rollback.

## Independent next technical slice (not implemented here)

[#42](../../../.scratch/filmforge-studio/issues/42-add-portrait-export-profile-with-safe-areas.md) depends on done #41 but is needs-triage; its premise of an existing export pipeline is false in the audited active path. Re-triage a bounded synthetic local picture-master/manifest proof if independent under tracker policy: existing confirmed revision and project-scoped media identity, 9:16 and 16:9 ffprobe dimensions/duration, explicit gaps and rejection of invalid ranges/foreign media; no product export claim from standalone fixture. [#46](../../../.scratch/filmforge-studio/issues/46-reuse-takes-and-cuts-for-editable-short-assembly.md) depends on 42/43/44 and remains needs-triage; do not close or silently remove dependencies. #43 depends on 40/41; #44 on 37/43. No status change in this packet.

Rights: retain Apache-2.0 foundation attribution; Toonflow MIT and other license facts are historical pinned snapshots, not a fresh legal review. No imported code or assets, no provider calls, no production media, no release. Actual deliverable is this decision packet and fresh verification only.

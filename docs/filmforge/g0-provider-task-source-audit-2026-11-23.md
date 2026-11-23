# G0 / Task 54 — audited provider and task contracts (2026-11-23)

> Source revision: `d1fad0cb6142bc98531224d823994f233ae096b0` on `main`.
> Scope: READ-ONLY architecture audit and offline fixture tests; not a deployed router, not authorization to submit provider requests.

## Confirmed source-of-truth matrix

| Boundary | Existing source | Actual behavior | Preserve / missing for G1 |
| --- | --- | --- | --- |
| Provider inventory | `backend/app/services/llm/provider_registry.py`, `provider_bootstrap.py` | `ProviderSpec` / `register_provider` and category-listing support; built-ins openai, volcengine, vidu, kling and **text-only** aliyun_bailian | Reuse this registry; registry categories are NOT model-level guarantees for reference frames, output types, free quota, geographic rights or cost |
| Configuration DB | `backend/app/models/llm.py` | `Provider` stores provider key, status, secrets, generic plus image/video URLs; `Model` stores provider ID, category, name, params; `ModelSettings` stores defaults | Do not add a duplicate provider table; future capability evidence must be versioned independently of editable model-name heuristics |
| Endpoint resolution | `backend/app/services/llm/provider_resolver.py` | `resolve_provider_config_from_provider` checks status and category, requires credentials; URL precedence image/video override > generic > built-in default | Preserve disabled-provider and key gate; G1 dry-run must not leak keys/base URLs as public raw config |
| Discovery | `backend/app/core/integrations/model_catalog.py` | OpenAI-compatible GET `/models` plus static Vidu/Kling catalog; `_infer_category` classifies category via *name substrings*, defaults to text | **Not authoritative capability proof**, especially video output, first/last frames, non-commercial/free or async polling |
| Media vendor dispatch | `backend/app/core/contracts/provider.py`, `backend/app/core/integrations/media_provider.py` | Media `ProviderKey` is Literal openai/volcengine/vidu/kling; `MediaProvider.submit/poll` uses specific native image/video adapters and request formats; submit never automatically retries | **Do not register arbitrary gateway as media ProviderKey** based on chat compatibility. A fifth text-only provider in registry does not imply fifth media adapter |
| Acceptance | `backend/app/services/generation/submission/submitter.py`, `backend/app/services/generation/task_snapshot.py` | `GenerationSubmitter` validates input, resolves effective supplier/model and writes via TaskService; media config is frozen in server-side `execution_config` for media acceptance; `TaskInput` protects referenced FileItem | Route must be selected **before external submit** and actual provider/model/gateway pinned to accepted task; avoid duplicating task lifecycle |
| Task state/worker | `backend/app/services/task_service.py`, `backend/app/task_worker.py`, `backend/app/models/task.py` | **TaskService is sole writer** of local queued/running/terminal state; one coordinating worker; remote ID recorded then polled from same config; no automatic create retry when ID ambiguous | Keep one-worker constraint. Remote accepted but response/DB commit lost is **unknown**, can orphan a paid job; do not blindly create again |
| Output/creative provenance | `backend/app/services/generation/media_execution.py`, `backend/app/services/directing/store.py`, `backend/app/models/directing.py` | Stable `generated/{task_id}/{ordinal}` object key; TaskOutput references FileItem; directing video creates unreviewed Take candidate; Cut choice/confirm separate | Do not let generation success imply editorial approval; keep FileUsage and versioned Cut |
| Text execution | `backend/app/task_worker.py` `_text` / `_frozen_text_model` | Ordinary text tasks read provider/model config at execution and check provider key; canvas check path reads frozen config; ChatOpenAI uses `max_retries=0` | Gateway pilot must establish explicit route pinning/idempotent retry policy **per text task**; do not claim ordinary text currently snapshots effective endpoint |
| Interface/export | `backend/app/schemas`, `front/src/services/generated`, `docs/development/architecture/task-execution.md` | Task query DTOs and generated frontend OpenAPI client are distinct from private snapshots; final edits/exports remain human-controlled | No raw credentials/signed URLs in route preview DTO. API changes require OpenAPI regeneration and frontend checks |

### Security and safety findings

1. Server-side `Provider.api_key` / `api_secret` and private media `execution_config` are sensitive. Existing docs confirm the frozen config contains credentials. Do not claim encrypted-at-rest storage or credential revocation behavior without a separate verified audit. Future gateway key references should avoid additional plaintext snapshots by default, without breaking existing media polling.
2. Provider class/key distinctions: `ProviderKey` only four **media** adapter keys, while runtime provider registry includes fifth **text-only** key `aliyun_bailian`. Do not widen media Literal solely to make a text proxy fit.
3. Generic model discovery infers coarse category from names; never use it to assert exact video durations/ratios, first/last frame, speech output, commercial eligibility, or license.
4. No proven exactly-once external side effect: worker `MediaProvider.submit` can succeed externally before `TaskService.record_submission` persists remote ID. TaskService restart deliberately fails running remote tasks lacking ID and does **not** resubmit. This protects against duplicate spend but cannot automatically recover an orphaned job.
5. Local media provider handlers own vendor-specific auth, payload and poll semantics. A gateway passing `/v1/chat/completions` or `/models` does not prove support for image/video creation; mixing endpoints could misroute private references or lose the remote ID.
6. The current design docs refer to proposed `SceneVersionRecord` / `SceneTakeRecord`; M0 Task 04 found no corresponding SQLAlchemy mapped table in currently running schema. G1 must not make these assumed objects dependencies.

### Verified existing regression suite

Run on 2026-11-23 in the **new owner-provided FilmForgeStudio MCP workspace** `/home/devops/vibe/filmforge-studio`, on clean `main` source SHA above:

```sh
cd backend
uv sync --group dev --frozen
uv run --frozen pytest -q \
  tests/services/test_media_provider.py \
  tests/services/test_task_worker.py \
  tests/services/test_task_service.py \
  tests/services/test_task_submission.py \
  tests/services/test_media_execution_config.py \
  tests/core/integrations/test_model_catalog.py --tb=short
# Result: 65 passed in 10.61s; exit 0
```

The same MCP runner initially referenced two guessed/nonexistent test paths and received "file or directory not found" (exit nonzero); the above exact checked paths were used for the successful run. It is false to claim a live external provider request, spend, a working gateway or a full-suite pass from these fixtures. M0 Task02 has full backend baseline evidence and the post-fix 3/3 focused recovery in its own tracker record.

## Extension policy for next tickets

- Ticket 55 evaluates gateway *candidate* including privacy/ToS and explicit sign-off. OmniRoute / OmniRouter are different projects; do not assume license or provider quotas from a name.
- Tickets 56–58 build *offline* typed capability/eligibility/free-first dry-run only after G0 gate; use TDD and zero network. Ticket 59 does not call an external text endpoint without owner-approved specific provider, region, data permissions and spend cap (including $0 if that is the owner's choice).
- G2 60–63 remains blocked until schemas and sticky async route semantics are proven; never auto-retry ambiguous paid submit.
- Avoid a second Task/Provider/Shot/Cut state authority. Preserve native direct adapters and a deterministic, inspectable fallback path.

**Review decision:** G0 source audit is accepted as a **code-and-fixture audit**, not a gateway acceptance or owner policy approval. No code change in Task 54.

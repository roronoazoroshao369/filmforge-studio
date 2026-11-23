# Upstreams / provenance / licensing

Verified reference snapshot 2026-11-23. **No external source code has been merged into FilmForge by this planning commit.** Links are sources for audit, not automatically approved dependencies.

| Source | Commit (snapshot) | License / role |
|---|---|---|
| [Jellyfish](https://github.com/Forget-C/Jellyfish) | `b1d8add653a97ebe89c2eb8cc7b712af800b8f3c` | Apache-2.0, foundation |
| [Toonflow](https://github.com/HBAI-Ltd/Toonflow-app) | `eecf51547af47eb504822186bd3f2dee369125ff` | MIT, UI / 3D previs reference |
| [PenShot](https://github.com/neopen/story-shot-agent) | `54fea30a2d8aea9f47f069545c97899077b5eb20` | MIT, SDK/REST shot breakdown |
| [Drama Skills](https://github.com/zenstory-ai/drama-skills) | `7fed9dfcd33c5a3134ff1b51709dd826488b5aab` | MIT, agent skills |
| [Shuohao Skills](https://github.com/eternityspring/shuohao-skills) | `8af10e0ea1a550e4575666884f4deef780bf38ff` | Apache-2.0, world/art story skills |
| [LumenX](https://github.com/alibaba/lumenx) | `f2a02e23171447c939e7d8e1386b24d17049bbf1` | MIT, model catalog/provider study |
| [Calliope](https://github.com/benjiyaya/Calliope) | `32bcd92f3826bd8c10219aebf4cebefbff116eaf` | MIT, ComfyUI bridge ideas |
| [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO) | `f101411e11968d3255488f4aaccf041d965a2148` | Apache-2.0, future editorial adapter |
| [OpenCue](https://github.com/AcademySoftwareFoundation/OpenCue) | `15a1a495318cb8bdf8ed8e3d0c8605ef09a99fdd` | Apache-2.0, future render farm |
| [OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD) | `80c23ad590e97c7786b6196db96192ce75e60f0d` | custom TOST license; treat separately |

**Other references only:** Blender GPL; ComfyUI GPL; NodeTool/OpenMontage/Nomi AGPL; Huobao Drama CC BY-NC-SA; waoowaoo Elastic License 2.0. Do not copy code from restricted-license projects without reviewing obligations. Third-party assets and weights can have different rights from project code.

## Before importing ANY code

1. Pin upstream SHA and a manifest with file-level origin, reason and compatibility.
2. Record `LICENSE`, `NOTICE`, copyrights, dependency and media/weight terms.
3. Prefer SDK/API integration over cross-language code merge.
4. Add golden fixtures, security tests and a maintainership owner.
5. Explicitly evaluate updating from upstream; do not snapshot entire repo for one adapter.
6. For commercial release, obtain appropriate legal review, rights and consent.

## Repo history

`filmforge-studio` began as a fork of Jellyfish. Keep attribution and original license. The earlier branch `codex/0718` is reachable from main, with no unique commits to merge (compare verified 2026-11-23); see [main-only](main-only-workflow.md).

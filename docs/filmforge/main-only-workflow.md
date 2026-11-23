> **Creator-first scheduling:** C0 tickets 36–40 and M0 01–05 are active concurrently; C1 41–47 and C2 48–53 come before deferred film tasks 06–35. Numeric ticket order does not override priority. Publication and budget approvals require owner action; no SaaS/client work.

# Main-only workflow and branch cleanup

**Owner requirement:** maintain only `main`. We honor the intent for a single long-lived branch, but only commit tested/reviewed changes.

## State verified 2026-11-23

- Default branch: `main` @ `b1d8add653a97ebe89c2eb8cc7b712af800b8f3c` before FilmForge docs.
- Extra branch: `codex/0718` @ `508f2c7ecea61b544623393a498d9c7f255e0697`.
- `compare main...codex/0718` = 0 commits ahead, 1669 behind. **No unique work requiring merge**; deleting that branch cannot discard unique commits in it, but first re-check remote state immediately before deletion.
- No PR present.

## Working on main safely

1. `git switch main && git pull --ff-only origin main`
2. Pick the next **active, triaged, unblocked** ticket in `.scratch/filmforge-studio/issues/`; set `Progress: in-progress` (preserve triage `Status`) and add a Comments entry with scope.
3. Make a small, vertical testable change, preferably ≤5 source files. TDD for behavior changes.
4. Run focused tests, lint, typecheck and build as appropriate. Record exact command and exit code.
5. Review `git diff` against task spec/CONSTRAINTS and ensure no secrets.
6. `git commit -m "[feat] ... "`; push `git push origin main`.
7. Record commit SHA, result and evidence in task Comments. Progress `done` only with evidence.
8. Keep a last-known-good signed tag or backup ref before risky database work; never force-push shared main. Use `git revert` with compliant subject on failure.

**Warning:** direct commits to main cannot benefit from branch-based PR gate. Compensate with local pre-push tests, GitHub Actions, peer/agent review, fast revert, and backups. If you later enable protected main requiring PRs, a strict no-other-branch rule is incompatible; reconsider the policy instead of bypassing protection.

## Deleting obsolete branch

The connected GitHub tool available to this workflow does **not** expose deleting a remote Git ref. After verifying `codex/0718` is still ancestor of main, owner can execute:

~~~bash
git fetch origin --prune
git merge-base --is-ancestor origin/codex/0718 origin/main   && git push origin --delete codex/0718
git branch -r
~~~

Or use GitHub → repository → **Branches** → find `codex/0718` → delete. Never delete before confirming ancestry; don't force-delete a branch that has become ahead. No dummy merge PR is necessary.

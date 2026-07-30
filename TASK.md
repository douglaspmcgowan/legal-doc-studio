# Task

## Goal

Keep the completed Recital legal-document studio maintainable while preserving its unresolved repository and branding follow-ups.

## Active

<!-- No active harness work remains after the verified onboarding commit. -->

## Queue

- [ ] T4 — Make `build-refs.mjs` generate the same `refs-data.js` bytes on Windows | evidence: running the generator in a clean Windows worktree leaves `refs-data.js` unchanged when source memos are unchanged | owner: reference projection | provenance: 2026-07-30 onboarding discovery; current generator rewrites embedded LF as CRLF

## Blocked

- [!] T2 — Add this repository to the external repository map | blocked: the legacy task record says the map authority was on an unavailable `G:` drive; confirm the current authority before editing it | owner: external repository map | provenance: archived `CURRENT-TASK.md` at base `8a00cc9`

## Needs decision

- [?] D1 — Decide whether the public demo should receive a custom brand domain | evidence: Douglas selects a domain or explicitly keeps the existing project domain | owner: external DNS and hosting configuration | provenance: archived `CURRENT-TASK.md` at base `8a00cc9`

## Completed

- [x] T1 — Onboard the repository to the portable harness v3 contract | evidence: canonical and installed project verifiers pass; all four tracked JavaScript entry/data/generator files pass `node --check`; cached diff check passes; redacted Gitleaks history and worktree scans find no leaks | owner: harness-scoped files | provenance: 2026-07-30 onboarding request
- [x] T0 — Build and verify the Recital interactive legal-document studio and design-simplicity pass | evidence: the archived legacy task records the static SPA, browser verification, and design review; `README.md` and `DESIGN-REVIEW.md` remain the durable project evidence | provenance: base `8a00cc9`

## Verification

- Next: for future changes, run the commands in `AGENTS.md`, the canonical project verifier, the installed project-state verifier, `git diff --check`, and both redacted Gitleaks scans.

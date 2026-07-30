# Project map

## Core documents

| File | Owns |
|---|---|
| `AGENTS.md` | Portable project behavior |
| `CLAUDE.md` | Claude import |
| `.cursor/rules/00-project-contract.mdc` | Cursor project pointer |
| `TASK.md` | Active goal, queue, blockers, completed evidence, next verifier |
| `STATUS.md` | Durable capability state |
| `LOG.md` | Append-only completed work |
| `BACKBURNER.md` | Parked work |
| `MAP.md` | This architecture and navigation map |
| `DESIGN.md` | Universal and project interface rules |
| `PRODUCT.md` | Optional product intent |
| `MEMORY.md` | Lean durable-reference index |
| `skills-manifest.json` | Canonical skill bindings |
| `data-manifest.yaml` | External-data authorities, adapters, and restore rules |
| `secret-manifest.json` | Value-free secret inventory and trust boundaries |

## Architecture

| Component | Purpose | Entry point | Owner |
|---|---|---|---|
| Static application shell | Host the three-pane legal-document studio | `index.html` | Application structure |
| Interaction engine | Render sections, propagate fields, map citations, and manage modes | `app.js` | Client behavior |
| Document model | Own sections, fields, citations, and derivations | `data.js` | Legal-document content model |
| Reference pipeline | Convert authored Markdown memos into browser-readable data | `reference/*.md`, `build-refs.mjs`, `refs-data.js` | Authored references and generated projection |
| Design system | Own Sellit Cobalt chrome, document styling, responsive behavior, and print CSS | `styles.css`, `DESIGN-REVIEW.md` | Presentation |
| Portable harness | Own agent rules, task state, manifests, and verification metadata | `AGENTS.md`, `.agents/`, `TASK.md` | Harness-scoped project state |

## Important paths

| Path | Purpose | Generated | Committed |
|---|---|---|---|
| `index.html` | Static application entry point | no | yes |
| `app.js` | Client-side render and interaction engine | no | yes |
| `data.js` | Demo document and citation model | no | yes |
| `reference/` | Authored research memos | no | yes |
| `refs-data.js` | Embedded memo projection | yes | yes |
| `.agents/` | Vendored portable skills, feedback log, pathways, and provenance | yes | yes |

## Data flow

Committed document data and reference memos load entirely in the browser. `build-refs.mjs` reads committed Markdown and rewrites the committed browser projection. User-entered field and edit state is stored by the browser as documented in `README.md`; no external project-data adapter is declared.

## Integrations

| System | Direction | Credential name | Failure behavior |
|---|---|---|---|
| Browser local storage | in/out | none | Local edits or field state are unavailable if browser storage is cleared or blocked. |
| Static hosting | out | deployment-platform authentication | Deployment changes stop without explicit authorization; local verification remains available. |

## Ownership and concurrency

Use one writable worktree per task. Local static serving uses port 8911. Browser storage and hosted deployment are mutable resources; onboarding must not access production or deploy.

## Update rule

Update this file when a component boundary, data flow, owner, integration, core document, or important path changes.

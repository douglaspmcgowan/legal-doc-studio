# CURRENT-TASK: Legal Doc Studio ("Recital")

## 🔵 ACTIVE (Jun 16 overnight — autonomous build via /goal)

**Goal:** Interactive legal-document viewer/editor as a DEMO for Anna Maxwell (AMAX Elite Seals / legal-solutions-website customer). View the Motion to Dismiss draft, edit it, fill highlighted placeholder fields via a form (text/dropdown/date) that propagates live throughout the document, browse embedded reference research docs, and see citation→section→derivation mappings (click a section → highlight its supporting authorities + reference excerpts + a derivation note). Professional minimal aesthetic, brand-cohesive with Anna's site (Sellit Cobalt). No AI-isms. Tested. Deployed to Vercel via GitHub.

**Decisions locked:**

- Static SPA (no build step) — index.html + styles.css + app.js + data.js + reference/\*.md. Most reliable for autonomous build + Vercel static deploy.
- Brand: Sellit Cobalt (cobalt #3F69FF / cobalt-deep #2E49A8, ink #0A263A/#143248, cream #FBF6EB, mint #B5FFA9 sparingly), Inter Tight. Product-UI register (not marketing).
- Source content: the Motion to Dismiss + 4 research files already drafted in `OneDrive\Documents\General Claude\motion-to-dismiss\`.
- Repo: douglaspmcgowan/legal-doc-studio. Vercel static. gh+vercel authed as douglaspmcgowan.

**Plan / steps:**

1. [ ] data.js — structured doc (sections w/ {{FIELD}} + [[cite:id]] markers), FIELDS, CITATIONS, REFERENCES (4 md), per-section derivation notes
2. [ ] index.html — 3-pane shell (fill-in form + document + context panel), toolbar (modes, progress, export)
3. [ ] styles.css — Sellit Cobalt tokens, product register, full interaction states, reduced-motion
4. [ ] app.js — render engine ({{field}}→highlighted input, [[cite]]→chip), live field propagation, click-section→highlight authorities, citation map, edit mode, export/print
5. [ ] Local test: python http.server + Playwright (desktop+mobile), 0 console errors, field propagation + mapping verified, AI-isms self-check
6. [ ] Git → GitHub (douglaspmcgowan/legal-doc-studio) → Vercel deploy → verify live URL 200
7. [ ] Update repo-map; final report

**Next command:** build data.js
**Artifacts dir:** `C:\Users\dougl\projects\legal-doc-studio\`

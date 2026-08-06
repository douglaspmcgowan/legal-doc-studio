# CURRENT-TASK: Legal Doc Studio ("Recital")

## ✅ DONE (Jun 16 overnight) — interactive legal-document studio, deployed

**Goal (met):** Interactive viewer/editor for the Motion to Dismiss (E.D. Pa., FRCP 12(b)(6), SOL grounds) as a demo for Anna Maxwell / legal-solutions-website. Fillable highlighted fields with live propagation, embedded research memos, citation→section→derivation mapping, edit mode, court-clean print. Brand-cohesive (Sellit Cobalt), no AI-isms, tested, deployed.

**Live:** https://legal-doc-studio.vercel.app (200, PUBLIC — clean project domain)
**Repo:** https://github.com/douglaspmcgowan/legal-doc-studio (master) — connected to Vercel for auto-deploy on push.
**Vercel:** team scope `douglas-mcgowans-projects`, static (no build). NOTE: hashed `*-douglas-mcgowans-projects.vercel.app` deployment URLs return 401 (team SSO Standard Protection); the clean `legal-doc-studio.vercel.app` domain is exempt and public — **share that one.**

**Built (static SPA, no build step):** `index.html` · `styles.css` (Sellit Cobalt, product register, print CSS) · `app.js` (render engine, live field propagation, citation map, edit mode, markdown reference reader) · `data.js` (document sections w/ {{field}}+[[cite]] markers, 18 fields, 21 authorities, per-section derivations) · `refs-data.js` (4 research memos embedded, regen via `node build-refs.mjs`) · `reference/*.md`.

**Verified in-browser (local, identical commit):** 0 console errors · 30 sections, 63 field tokens, 28 cite chips, 18 fields · live propagation (sample data → 18/18, 0 blanks, caption+conclusion+signature all update) · computed SOL math (incident+2yr → deadline; days-late; recomputes on date change) · section→authorities+derivation mapping · citation locate (flash + scroll + tab switch) · reference reader (markdown w/ tables/lists, no raw markers) · fill/read/edit modes · combobox district field · 3-pane desktop (320/760/360) + mobile collapse. Brand: Inter Tight UI + serif document, no mono in chrome, amber fill tokens, cobalt(case)/green(statute) cites. Production verified via curl: HTML + all assets 200.
**Screenshot tool:** timed out ×3 (known headless-capture quirk this env) → verified via DOM eval/inspect/snapshot instead.

## ✅ DONE (Jun 16 — design-simplicity pass + review)

**Goal (met):** Researched UI-simplicity principles (memory-first + web cross-check), applied a calmer/cleaner pass, re-tested, redeployed, wrote `DESIGN-REVIEW.md`.
**Principles applied:** grayscale-first/color-last · hierarchy via weight+space · progressive disclosure · generous whitespace.
**Changes (commit 91d4551):** citations now quiet slate footnote-refs at rest (cobalt/green reveal on hover+locate) · filled field values seamless in prose · empty blanks softened from solid amber blocks → light amber underline (weight 500) · selected paragraph lights its own citations · 3-layer soft document shadow · calmer filled form inputs · more card breathing room.
**Verified:** 0 console errors; counts intact (30/63/28); propagation + citation/section mapping + locate-flash + reference reader + all modes still work; empty-field contrast 5.9:1 (AA). Live CSS confirmed deployed (~15s after push) at https://legal-doc-studio.vercel.app. Screenshot tool timed out (known quirk) → verified via computed-style inspection.
**Note:** the "flash transparent" reads during testing were a transition-timing artifact (read at t=0 of 140ms transition), not a bug — confirmed cobalt+white with transition disabled.
**Kept deliberately:** fill-in highlight as a feature (refined, not removed); serif document; two functional citation colors.

**Follow-ups (minor, non-blocking):**

- [ ] Update repo-map.md with the new repo — BLOCKED: G:\ drive offline this session. Do when G: remounts.
- [ ] Optional: attach a custom domain (e.g. under amaxeliteseals) if Doug wants the demo on-brand-domain.
- [ ] Optional: more demo documents (the data model + reference pipeline already support adding others).

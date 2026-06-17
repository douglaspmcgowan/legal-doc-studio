/* Recital — Legal Document Studio — application engine */
(() => {
  "use strict";

  const FIELDS = window.STUDIO_FIELDS;
  const CITES = window.STUDIO_CITATIONS;
  const DOC = window.STUDIO_DOC;
  const REF_META = window.STUDIO_REF_META;
  const REFS = window.STUDIO_REFS || {};

  const fieldById = Object.fromEntries(FIELDS.map((f) => [f.id, f]));
  const citeById = Object.fromEntries(CITES.map((c) => [c.id, c]));
  const refMetaById = Object.fromEntries(REF_META.map((r) => [r.id, r]));

  // reverse maps: which sections use a citation / a source
  const citeUses = {};
  const srcUses = {};
  for (const s of DOC) {
    (s.citations || []).forEach((c) =>
      (citeUses[c] = citeUses[c] || []).push(s.id),
    );
    (s.references || []).forEach((r) =>
      (srcUses[r] = srcUses[r] || []).push(s.id),
    );
  }

  const STORE_KEY = "recital.v1";
  const state = {
    values: Object.fromEntries(FIELDS.map((f) => [f.id, f.value || ""])),
    edits: {},
    mode: "fill",
    tab: "context",
    selected: null,
    sourceFilter: null,
  };

  /* ----------------------------------------------------------- persistence */
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
      if (saved.values) Object.assign(state.values, saved.values);
      if (saved.edits) state.edits = saved.edits;
    } catch (e) {
      /* ignore */
    }
  }
  let saveT;
  function save() {
    clearTimeout(saveT);
    saveT = setTimeout(() => {
      try {
        localStorage.setItem(
          STORE_KEY,
          JSON.stringify({ values: state.values, edits: state.edits }),
        );
      } catch (e) {}
    }, 250);
  }

  /* ------------------------------------------------------------- utilities */
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (s) =>
    String(s).replace(
      /[&<>]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
    );
  const escAttr = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  function parseISO(v) {
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    const [y, m, d] = v.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return isNaN(dt) ? null : dt;
  }
  function fmtDate(v) {
    const dt = parseISO(v);
    return dt
      ? `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`
      : "";
  }
  function addYears(v, n) {
    const dt = parseISO(v);
    if (!dt) return null;
    const r = new Date(dt);
    r.setFullYear(r.getFullYear() + n);
    return r;
  }
  function diffDays(aISO, bDate) {
    const a = parseISO(aISO);
    if (!a || !bDate) return null;
    return Math.round((a - bDate) / 86400000);
  }

  function computeField(id) {
    if (id === "SOL_DEADLINE") {
      const d = addYears(state.values.INCIDENT_DATE, 2);
      if (!d) return "";
      return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    if (id === "DAYS_LATE") {
      const deadline = addYears(state.values.INCIDENT_DATE, 2);
      const days = diffDays(state.values.FILING_DATE, deadline);
      if (days == null) return "";
      if (days <= 0) return "within the limitations period";
      return `${days} day${days === 1 ? "" : "s"}`;
    }
    return "";
  }

  function shortLabel(f) {
    return f.label
      .replace(/\s*\(.*?\)\s*/g, "")
      .replace(/\s*—.*$/, "")
      .trim();
  }

  function tokenView(f) {
    if (f.type === "computed") {
      const v = computeField(f.id);
      return { cls: "tok--computed", text: v || "—" };
    }
    const v = state.values[f.id];
    if (!v) return { cls: "tok--empty", text: shortLabel(f) };
    const text = f.type === "date" ? fmtDate(v) : v;
    return { cls: "tok--filled", text: text || shortLabel(f) };
  }

  /* --------------------------------------------------------- marker render */
  function fieldTokenHTML(id) {
    const f = fieldById[id];
    if (!f) return esc("{{" + id + "}}");
    const v = tokenView(f);
    return `<span class="tok ${v.cls}" data-field="${id}" role="button" tabindex="0" title="${escAttr(f.label)}">${esc(v.text)}</span>`;
  }
  function citeChipHTML(id) {
    const c = citeById[id];
    if (!c) return esc("[[" + id + "]]");
    const stat = c.kind !== "case" ? " cite--stat" : "";
    return `<span class="cite${stat}" data-cite="${id}" role="button" tabindex="0" title="${escAttr(c.full)}">${esc(c.short)}</span>`;
  }
  function renderMarkers(text) {
    let out = "",
      last = 0,
      m;
    const re = /\{\{(\w+)\}\}|\[\[(\w+)\]\]/g;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index));
      out += m[1] ? fieldTokenHTML(m[1]) : citeChipHTML(m[2]);
      last = re.lastIndex;
    }
    out += esc(text.slice(last));
    return out;
  }

  /* ------------------------------------------------------------ build doc */
  const isMappable = (s) =>
    !!(
      s.derivation ||
      (s.citations && s.citations.length) ||
      (s.references && s.references.length)
    );

  function sectionInnerHTML(s) {
    switch (s.kind) {
      case "court":
        return `<div class="s-court">${renderMarkers(s.html)}</div>`;
      case "parties": {
        const p = s.html.split("|");
        const [plaintiff, plLbl, v, defendant, defLbl, caseNo, judge] = p;
        return `<div class="caption">
          <div class="caption__l">
            <div>${renderMarkers(plaintiff)},</div>
            <div style="padding-left:28px">${esc(plLbl)}</div>
            <div>${esc(v)}</div>
            <div>${renderMarkers(defendant)},</div>
            <div style="padding-left:28px">${esc(defLbl)}</div>
          </div>
          <div class="caption__v">)<br>)<br>)<br>)<br>)</div>
          <div class="caption__r">
            <div class="row">Civil Action No. ${renderMarkers(caseNo)}</div>
            <div class="row">${renderMarkers(judge)}</div>
          </div>
        </div>`;
      }
      case "title":
        return `<div class="s-title">${renderMarkers(s.html)}</div>`;
      case "h1":
        return `<div class="s-h1">${renderMarkers(s.html)}</div>`;
      case "h2":
        return `<div class="s-h2">${renderMarkers(s.html)}</div>`;
      case "h3":
        return `<div class="s-h3">${renderMarkers(s.html)}</div>`;
      case "body":
        return `<p class="s-body">${renderMarkers(s.html)}</p>`;
      case "signature": {
        const lines = s.html
          .split("|")
          .map((l) => `<span class="line">${renderMarkers(l)}</span>`);
        lines.splice(1, 0, '<span class="gap"></span>');
        return `<div class="s-sig">${lines.join("")}</div>`;
      }
      case "certificate": {
        const parts = s.html.split("|");
        const head = parts.shift();
        const body = parts
          .map((l) => `<span class="line">${renderMarkers(l)}</span>`)
          .join('<span class="gap"></span>');
        return `<div class="s-cert"><div class="s-cert__h">${esc(head)}</div>${body}</div>`;
      }
      default:
        return renderMarkers(s.html);
    }
  }

  function buildPaper() {
    const paper = $("#paper");
    let html = "";
    let part = null;
    for (const s of DOC) {
      if (s.part && s.part !== part) {
        part = s.part;
        if (part === "Memorandum")
          html += `<div class="part-rule">Memorandum of Law</div>`;
      }
      const editable =
        state.mode === "edit" &&
        ["body", "h1", "h2", "h3", "title"].includes(s.kind);
      const cls = ["s", isMappable(s) ? "s--mappable" : ""]
        .filter(Boolean)
        .join(" ");
      const inner =
        state.edits[s.id] != null && s.kind === "body"
          ? `<p class="s-body" ${editable ? 'contenteditable="true"' : ""}>${state.edits[s.id]}</p>`
          : sectionInnerHTML(s);
      // make the right element contenteditable when in edit mode
      let block = inner;
      if (editable)
        block = inner.replace(
          /^<(p|div) class="(s-body|s-h1|s-h2|s-h3|s-title)"/,
          '<$1 class="$2" contenteditable="true"',
        );
      html += `<section class="${cls}" data-sec="${s.id}">${block}</section>`;
    }
    paper.innerHTML = html;
    wireDoc();
    updateTokens();
    applySelection();
  }

  /* --------------------------------------------------- in-place token sync */
  function updateTokens() {
    $$("#paper .tok").forEach((el) => {
      const f = fieldById[el.dataset.field];
      if (!f) return;
      const v = tokenView(f);
      el.className = `tok ${v.cls}`;
      el.textContent = v.text;
    });
    updateProgress();
    save();
  }

  function updateProgress() {
    const fillable = FIELDS.filter((f) => f.type !== "computed");
    const done = fillable.filter((f) => state.values[f.id]).length;
    const pct = fillable.length
      ? Math.round((done / fillable.length) * 100)
      : 0;
    $("#progFill").style.width = pct + "%";
    $("#progTxt").textContent = `${done} / ${fillable.length} fields`;
    // form dots
    $$("#form .field").forEach((el) => {
      const id = el.dataset.field;
      if (fieldById[id] && fieldById[id].type !== "computed") {
        el.classList.toggle("field--done", !!state.values[id]);
      }
    });
    // refresh computed inputs in the form
    FIELDS.filter((f) => f.type === "computed").forEach((f) => {
      const inp = $(`#form input[data-cfield="${f.id}"]`);
      if (inp) inp.value = computeField(f.id) || "—";
    });
  }

  /* ------------------------------------------------------------ build form */
  function buildForm() {
    const form = $("#form");
    const groups = [];
    for (const f of FIELDS) {
      let g = groups.find((x) => x.name === f.group);
      if (!g) groups.push((g = { name: f.group, items: [] }));
      g.items.push(f);
    }
    form.innerHTML = groups
      .map((g) => {
        const fillable = g.items.filter((f) => f.type !== "computed");
        const done = fillable.filter((f) => state.values[f.id]).length;
        const counter = fillable.length
          ? `<span class="count">${done}/${fillable.length}</span>`
          : "";
        return `<div class="fgroup">
        <div class="fgroup__h">${esc(g.name)} ${counter}</div>
        <div class="fields">${g.items.map(fieldHTML).join("")}</div>
      </div>`;
      })
      .join("");
    wireForm();
    updateProgress();
  }

  function fieldHTML(f) {
    const val =
      f.type === "computed"
        ? computeField(f.id) || "—"
        : state.values[f.id] || "";
    const done =
      f.type !== "computed" && state.values[f.id] ? " field--done" : "";
    let control;
    if (f.type === "computed") {
      control = `<input data-cfield="${f.id}" value="${escAttr(val)}" readonly tabindex="-1" aria-readonly="true">`;
    } else if (f.type === "select") {
      const listId = `dl-${f.id}`;
      const opts = f.options
        .map((o) => `<option value="${escAttr(o)}"></option>`)
        .join("");
      control = `<input list="${listId}" data-field="${f.id}" value="${escAttr(val)}" placeholder="Type or choose…" autocomplete="off">
        <datalist id="${listId}">${opts}</datalist>`;
    } else {
      const type = f.type === "date" ? "date" : "text";
      control = `<input type="${type}" data-field="${f.id}" value="${escAttr(val)}" placeholder="${escAttr(f.placeholder || "")}" autocomplete="off">`;
    }
    const cls = (f.type === "computed" ? " field--computed" : "") + done;
    return `<div class="field${cls}" data-field="${f.id}">
      <label for="in-${f.id}">${f.type !== "computed" ? '<span class="field__dot"></span>' : ""}${esc(f.label)}</label>
      ${control.replace("<input", `<input id="in-${f.id}"`)}
      ${f.hint ? `<div class="field__hint">${esc(f.hint)}</div>` : ""}
    </div>`;
  }

  function wireForm() {
    $$("#form input[data-field]").forEach((inp) => {
      const id = inp.dataset.field;
      inp.addEventListener("input", () => {
        state.values[id] = inp.value;
        updateTokens();
        // computed dependents update automatically via updateTokens
      });
      inp.addEventListener("focus", () => flashTokens(id));
    });
  }

  /* ------------------------------------------------------- doc interactions */
  function wireDoc() {
    // section selection
    $$("#paper .s--mappable").forEach((sec) => {
      sec.addEventListener("click", (e) => {
        if (e.target.closest(".tok") || e.target.closest(".cite")) return;
        if (state.mode === "edit") return;
        selectSection(sec.dataset.sec);
      });
    });
    // tokens -> focus matching field
    $$("#paper .tok").forEach((el) => {
      const act = (e) => {
        e.stopPropagation();
        focusField(el.dataset.field);
      };
      el.addEventListener("click", act);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          act(e);
        }
      });
    });
    // citations -> locate
    $$("#paper .cite").forEach((el) => {
      const act = (e) => {
        e.stopPropagation();
        locateCitation(el.dataset.cite, true);
      };
      el.addEventListener("click", act);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          act(e);
        }
      });
    });
    // edit-mode capture
    if (state.mode === "edit") {
      $$('#paper [contenteditable="true"]').forEach((el) => {
        const sec = el.closest(".s").dataset.sec;
        el.addEventListener("input", () => {
          if (el.classList.contains("s-body")) {
            state.edits[sec] = el.innerHTML;
            save();
          }
        });
      });
    }
  }

  function focusField(id) {
    state.mode === "read" && setMode("fill");
    const field = $(`#form .field[data-field="${id}"]`);
    const inp = $(`#form input[data-field="${id}"]`);
    if (field) {
      field.scrollIntoView({ block: "center", behavior: "smooth" });
      field.classList.add("is-flash");
      setTimeout(() => field.classList.remove("is-flash"), 900);
    }
    if (inp) inp.focus({ preventScroll: true });
    flashTokens(id);
  }

  function flashTokens(id) {
    $$(`#paper .tok[data-field="${id}"]`).forEach((t) => {
      t.classList.remove("is-flash");
      void t.offsetWidth;
      t.classList.add("is-flash");
      setTimeout(() => t.classList.remove("is-flash"), 900);
    });
  }

  /* ---------------------------------------------------------- section map */
  function selectSection(id) {
    state.selected = id;
    state.sourceFilter = null;
    applySelection();
    setTab("context");
    const sec = $(`#paper .s[data-sec="${id}"]`);
    if (sec) sec.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function applySelection() {
    $$("#paper .s").forEach((sec) => {
      sec.classList.toggle("s--active", sec.dataset.sec === state.selected);
      sec.classList.remove("s--dimmed", "s--srchit");
    });
    if (state.sourceFilter) {
      const using = new Set(srcUses[state.sourceFilter] || []);
      $$("#paper .s--mappable").forEach((sec) => {
        if (using.has(sec.dataset.sec)) sec.classList.add("s--srchit");
        else sec.classList.add("s--dimmed");
      });
    }
  }

  /* ----------------------------------------------------------- context tab */
  function renderContext() {
    const body = $("#ctxBody");
    if (!state.selected) {
      body.innerHTML = `<div class="ctx-empty">
        <h4>Trace any part of the document</h4>
        <p>Click a <strong>paragraph or heading</strong> to see the authorities behind it, the research it draws on, and a note on how it was derived.</p>
        <ul>
          <li>Click a <strong>blue citation</strong> to highlight every place it appears.</li>
          <li>Open the <strong>Authorities</strong> tab for the full table of cases and statutes.</li>
          <li>Open <strong>Sources</strong> to read the underlying research memos.</li>
        </ul>
        <p>Fill the highlighted blanks on the left — each value flows through the whole document at once.</p>
      </div>`;
      return;
    }
    const s = DOC.find((x) => x.id === state.selected);
    let html = "";
    if (s.derivation) {
      html += `<p class="ctx-sec-label">Why this section exists</p>
        <div class="derivation"><span class="q">¶</span> ${esc(s.derivation)}</div>`;
    }
    if (s.citations && s.citations.length) {
      html +=
        `<p class="ctx-sec-label">Supporting authorities</p>` +
        s.citations.map((c) => authCard(citeById[c])).join("");
    }
    if (s.references && s.references.length) {
      html +=
        `<p class="ctx-sec-label">Drawn from</p>` +
        s.references.map((r) => srcCard(refMetaById[r])).join("");
    }
    if (
      !s.derivation &&
      !(s.citations || []).length &&
      !(s.references || []).length
    ) {
      html = `<div class="ctx-empty">This is a structural heading. Select a paragraph to see its authorities.</div>`;
    }
    body.innerHTML = html;
    wireCtxCards();
  }

  function badgeClass(weight) {
    if (/binding/i.test(weight)) return "badge--binding";
    if (/controlling/i.test(weight)) return "badge--controlling";
    return "badge--persuasive";
  }
  function authCard(c) {
    if (!c) return "";
    const uses = (citeUses[c.id] || []).length;
    return `<div class="auth" data-auth="${c.id}">
      <div class="auth__top">
        <span class="auth__short">${esc(c.short)}</span>
        <span class="auth__badge ${badgeClass(c.weight)}">${esc(c.weight)}</span>
      </div>
      <div class="auth__full">${esc(c.full)}</div>
      <div class="auth__auth">${esc(c.authority)}</div>
      <div class="auth__prop">${esc(c.proposition)}</div>
      <div class="auth__links">
        <button data-locate="${c.id}">Locate in document${uses > 1 ? ` (${uses})` : ""}</button>
        ${c.source ? `<button data-readsrc="${c.source}">Source memo</button>` : ""}
        ${c.url ? `<a href="${escAttr(c.url)}" target="_blank" rel="noopener">Full text ↗</a>` : ""}
      </div>
    </div>`;
  }
  function srcCard(r) {
    if (!r) return "";
    const uses = (srcUses[r.id] || []).length;
    return `<div class="src" data-src="${r.id}">
      <div class="src__t">${docIcon()} ${esc(r.title)}</div>
      <div class="src__b">${esc(r.blurb)}</div>
      <div class="src__open">Read full document → <span class="auth__uses" style="margin-left:6px">used by ${uses} section${uses === 1 ? "" : "s"}</span></div>
    </div>`;
  }
  const docIcon = () =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>`;

  function wireCtxCards() {
    $$("#ctxBody [data-locate]").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        locateCitation(b.dataset.locate, true);
      }),
    );
    $$("#ctxBody [data-readsrc]").forEach((b) =>
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        openRef(b.dataset.readsrc);
      }),
    );
    $$("#ctxBody .auth").forEach((el) =>
      el.addEventListener("click", () => locateCitation(el.dataset.auth, true)),
    );
    $$("#ctxBody .src").forEach((el) =>
      el.addEventListener("click", () => openRef(el.dataset.src)),
    );
  }

  /* -------------------------------------------------------- authorities tab */
  function renderAuthorities(flashId) {
    const body = $("#ctxBody");
    const order = ["case", "statute", "rule"];
    const sorted = [...CITES].sort(
      (a, b) => order.indexOf(a.kind) - order.indexOf(b.kind),
    );
    body.innerHTML =
      `<div class="filterbar">${CITES.length} authorities · cases, statutes &amp; rules</div>` +
      sorted.map((c) => authCard(c)).join("");
    wireCtxCards();
    if (flashId) {
      const card = $(`#ctxBody .auth[data-auth="${flashId}"]`);
      if (card) {
        card.classList.add("is-flash");
        card.scrollIntoView({ block: "center", behavior: "smooth" });
        setTimeout(() => card.classList.remove("is-flash"), 1400);
      }
    }
  }

  /* ------------------------------------------------------------ sources tab */
  function renderSources() {
    const body = $("#ctxBody");
    const filt = state.sourceFilter
      ? `<div class="filterbar">Highlighting sections that use <strong>${esc(refMetaById[state.sourceFilter].title)}</strong> · <span class="clear" data-clearsrc>clear</span></div>`
      : `<div class="filterbar">Four research memos underpin this motion.</div>`;
    body.innerHTML = filt + REF_META.map((r) => srcCard(r)).join("");
    $$("#ctxBody .src").forEach((el) => {
      el.addEventListener("click", (e) => {
        if (e.detail === 2) return;
        // single click highlights; the explicit link reads
        toggleSourceFilter(el.dataset.src);
      });
      $(".src__open", el).addEventListener("click", (e) => {
        e.stopPropagation();
        openRef(el.dataset.src);
      });
    });
    const clr = $("#ctxBody [data-clearsrc]");
    if (clr)
      clr.addEventListener("click", () => {
        state.sourceFilter = null;
        applySelection();
        renderSources();
      });
  }

  function toggleSourceFilter(id) {
    state.sourceFilter = state.sourceFilter === id ? null : id;
    state.selected = null;
    applySelection();
    renderSources();
    if (state.sourceFilter) {
      const first = (srcUses[id] || [])[0];
      const sec = first && $(`#paper .s[data-sec="${first}"]`);
      if (sec) sec.scrollIntoView({ block: "center", behavior: "smooth" });
      toast(
        `${srcUses[id] ? srcUses[id].length : 0} sections draw on “${refMetaById[id].title}”`,
      );
    }
  }

  /* --------------------------------------------------------------- locate */
  function locateCitation(id, scroll) {
    setTab("authorities", id);
    const hits = $$(`#paper .cite[data-cite="${id}"]`);
    hits.forEach((h) => {
      h.classList.remove("is-flash");
      void h.offsetWidth;
      h.classList.add("is-flash");
      setTimeout(() => h.classList.remove("is-flash"), 1600);
    });
    if (scroll && hits[0])
      hits[0].scrollIntoView({ block: "center", behavior: "smooth" });
    if (hits.length)
      toast(
        `“${citeById[id].short}” appears in ${hits.length} place${hits.length === 1 ? "" : "s"}`,
      );
  }

  /* ------------------------------------------------------------- tabs/mode */
  function setTab(tab, flashId) {
    state.tab = tab;
    $$(".ctx__tab").forEach((t) =>
      t.setAttribute("aria-selected", String(t.dataset.tab === tab)),
    );
    if (tab === "context") renderContext();
    else if (tab === "authorities") renderAuthorities(flashId);
    else renderSources();
  }

  function setMode(mode) {
    state.mode = mode;
    $$(".segmented button").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.mode === mode)),
    );
    document.body.classList.toggle("editing", mode === "edit");
    $(".rail").style.display = mode === "read" ? "none" : "";
    // rebuild doc to toggle contenteditable
    buildPaper();
    if (mode === "edit")
      toast(
        "Edit mode — click any paragraph to revise the text. Blanks stay linked.",
      );
  }

  /* ----------------------------------------------------------- ref drawer */
  function openRef(id) {
    const meta = refMetaById[id];
    const md = REFS[id];
    $("#drawerTitle").textContent = meta ? meta.title : "Reference";
    $("#drawerBody").innerHTML = md
      ? renderMarkdown(md)
      : "<p>Reference text unavailable.</p>";
    $("#drawer").classList.add("open");
    $("#scrim").classList.add("open");
    $("#drawerBody").parentElement.scrollTop = 0;
    $("#drawerClose").focus();
  }
  function closeRef() {
    $("#drawer").classList.remove("open");
    $("#scrim").classList.remove("open");
  }

  /* --------------------------------------------------- markdown (compact) */
  function mdInline(s) {
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    );
    s = s.replace(/(^|[^*])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
    return s;
  }
  function renderMarkdown(md) {
    const lines = md.replace(/\r/g, "").split("\n");
    let html = "",
      i = 0;
    const splitRow = (l) =>
      l
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((c) => c.trim());
    while (i < lines.length) {
      let l = lines[i];
      if (/^\s*$/.test(l)) {
        i++;
        continue;
      }
      if (/^---+$/.test(l.trim())) {
        html += "<hr>";
        i++;
        continue;
      }
      let h = l.match(/^(#{1,4})\s+(.*)$/);
      if (h) {
        const n = h[1].length;
        html += `<h${n}>${mdInline(h[2])}</h${n}>`;
        i++;
        continue;
      }
      if (/^>\s?/.test(l)) {
        let buf = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          buf.push(lines[i].replace(/^>\s?/, ""));
          i++;
        }
        html += `<blockquote>${mdInline(buf.join(" "))}</blockquote>`;
        continue;
      }
      // table
      if (
        /^\|.*\|/.test(l) &&
        i + 1 < lines.length &&
        /^\|[\s:|-]+\|/.test(lines[i + 1])
      ) {
        const head = splitRow(lines[i]);
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|.*\|/.test(lines[i])) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        html += `<table><thead><tr>${head.map((c) => `<th>${mdInline(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${mdInline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
        continue;
      }
      // lists
      if (/^\s*[-*]\s+/.test(l)) {
        let buf = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          buf.push(lines[i].replace(/^\s*[-*]\s+/, ""));
          i++;
        }
        html += `<ul>${buf.map((x) => `<li>${mdInline(x)}</li>`).join("")}</ul>`;
        continue;
      }
      if (/^\s*\d+\.\s+/.test(l)) {
        let buf = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          buf.push(lines[i].replace(/^\s*\d+\.\s+/, ""));
          i++;
        }
        html += `<ol>${buf.map((x) => `<li>${mdInline(x)}</li>`).join("")}</ol>`;
        continue;
      }
      // paragraph (gather until blank)
      let buf = [l];
      i++;
      while (
        i < lines.length &&
        !/^\s*$/.test(lines[i]) &&
        !/^(#{1,4}\s|>|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i]) &&
        !/^---+$/.test(lines[i].trim())
      ) {
        buf.push(lines[i]);
        i++;
      }
      html += `<p>${mdInline(buf.join(" "))}</p>`;
    }
    return html;
  }

  /* --------------------------------------------------------------- toast */
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ------------------------------------------------------------ top actions */
  const SAMPLE = {
    PLAINTIFF_NAME: "Anna Reyes",
    DEFENDANT_NAME: "Douglas Hartman",
    CASE_NUMBER: "2:26-cv-02184",
    DISTRICT: "Eastern District of Pennsylvania",
    JUDGE_NAME: "Hon. Maria Santos",
    STORE_NAME: "Greenline Market",
    STORE_ADDRESS: "1200 Market Street, Philadelphia, PA 19107",
    INCIDENT_DATE: "2024-04-01",
    COMPL_INCIDENT_PARA: "8",
    COMPL_NEG_PARA: "12–18",
    FILING_DATE: "2026-06-15",
    SIGN_DATE: "2026-06-22",
    ATTORNEY_NAME: "Jordan Lee, Esq.",
    FIRM_NAME: "Lee & Associates, LLC",
    FIRM_ADDRESS: "1500 Walnut Street, Suite 900, Philadelphia, PA 19102",
    ATTORNEY_PHONE: "(215) 555-0100",
    ATTORNEY_EMAIL: "jlee@leeassociates.com",
    BAR_NO: "312045",
  };
  function applyValues(map) {
    FIELDS.forEach((f) => {
      if (f.type !== "computed") state.values[f.id] = map[f.id] || "";
    });
    state.edits = {};
    buildForm();
    buildPaper();
    save();
  }

  /* ---------------------------------------------------------------- wire */
  function init() {
    load();
    buildForm();
    buildPaper();
    setTab("context");

    $$(".segmented button").forEach((b) =>
      b.addEventListener("click", () => setMode(b.dataset.mode)),
    );
    $$(".ctx__tab").forEach((b) =>
      b.addEventListener("click", () => setTab(b.dataset.tab)),
    );
    $("#btnPrint").addEventListener("click", () => window.print());
    $("#btnSample").addEventListener("click", () => {
      applyValues(SAMPLE);
      toast("Sample matter loaded");
    });
    $("#btnClear").addEventListener("click", () => {
      applyValues({});
      toast("Cleared — fill the highlighted blanks");
    });
    $("#drawerClose").addEventListener("click", closeRef);
    $("#scrim").addEventListener("click", closeRef);
    $("#stage").addEventListener("click", (e) => {
      if (e.target.id === "stage" || e.target.id === "paper") {
        state.selected = null;
        applySelection();
        if (state.tab === "context") renderContext();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeRef();
    });

    window.__recital = { state, setTab, selectSection, locateCitation }; // test hook
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();

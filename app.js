/* Recital — Legal Document Studio — application engine */
(() => {
  "use strict";

  /**
   * The document model is declared once in types/studio.d.ts, on `Window`.
   * These aliases give the same shapes a local name so the annotations below
   * read as prose rather than as indexed lookups.
   *
   * @typedef {Window["STUDIO_FIELDS"][number]} Field
   * @typedef {Window["STUDIO_CITATIONS"][number]} Cite
   * @typedef {Window["STUDIO_REF_META"][number]} RefMeta
   * @typedef {Window["STUDIO_DOC"][number]} Section
   */

  const FIELDS = window.STUDIO_FIELDS;
  const CITES = window.STUDIO_CITATIONS;
  const DOC = window.STUDIO_DOC;
  const REF_META = window.STUDIO_REF_META;
  const REFS = window.STUDIO_REFS || {};

  /** @type {Record<string, Field>} */
  const fieldById = Object.fromEntries(FIELDS.map((f) => [f.id, f]));
  /** @type {Record<string, Cite>} */
  const citeById = Object.fromEntries(CITES.map((c) => [c.id, c]));
  /** @type {Record<string, RefMeta>} */
  const refMetaById = Object.fromEntries(REF_META.map((r) => [r.id, r]));

  // reverse maps: which sections use a citation / a source
  /** @type {Record<string, string[]>} */
  const citeUses = {};
  /** @type {Record<string, string[]>} */
  const srcUses = {};
  for (const s of DOC) {
    (s.citations || []).forEach((c) =>
      (citeUses[c] = citeUses[c] || []).push(s.id),
    );
    (s.references || []).forEach((r) =>
      (srcUses[r] = srcUses[r] || []).push(s.id),
    );
  }

  /**
   * Paragraph numbers (1..N in document order) of every section that cites an
   * authority, whether through its `citations` list or an inline [[marker]].
   * The table of authorities prints these beside each entry.
   *
   * @param {string} id
   * @returns {number[]}
   */
  function paragraphsCiting(id) {
    const marker = `[[${id}]]`;
    /** @type {number[]} */
    const out = [];
    DOC.forEach((s, i) => {
      if ((s.citations || []).includes(id) || s.html.includes(marker))
        out.push(i + 1);
    });
    return out;
  }

  const STORE_KEY = "recital.v1";
  /**
   * @type {{
   *   values: Record<string, string>,
   *   edits: Record<string, string>,
   *   mode: "fill" | "edit" | "read",
   *   tab: "context" | "authorities" | "sources",
   *   selected: string | null,
   *   sourceFilter: string | null,
   * }}
   */
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
  /** @type {ReturnType<typeof setTimeout> | undefined} */
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
  /**
   * Every selector these two are called with names an element index.html ships,
   * so the return is deliberately loose rather than null-checked at sixty call
   * sites. Keep it that way: a selector that can miss gets its own guard.
   *
   * @type {(sel: string, el?: ParentNode) => any}
   */
  const $ = (sel, el = document) => el.querySelector(sel);
  /** @type {(sel: string, el?: ParentNode) => any[]} */
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  /** @type {(s: unknown) => string} */
  const esc = (s) =>
    String(s).replace(
      /[&<>]/g,
      (c) =>
        /** @type {Record<string, string>} */ ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
        })[c],
    );
  /** @type {(s: unknown) => string} */
  const escAttr = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) =>
        /** @type {Record<string, string>} */ ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
        })[c],
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
  /** @param {string | null | undefined} v @returns {Date | null} */
  function parseISO(v) {
    if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
    const [y, m, d] = v.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return isNaN(dt.getTime()) ? null : dt;
  }
  /** @param {string | null | undefined} v */
  function fmtDate(v) {
    const dt = parseISO(v);
    return dt
      ? `${MONTHS[dt.getMonth()]} ${dt.getDate()}, ${dt.getFullYear()}`
      : "";
  }
  /** @param {string | null | undefined} v @param {number} n */
  function addYears(v, n) {
    const dt = parseISO(v);
    if (!dt) return null;
    const r = new Date(dt);
    r.setFullYear(r.getFullYear() + n);
    return r;
  }
  /** @param {string | null | undefined} aISO @param {Date | null} bDate */
  function diffDays(aISO, bDate) {
    const a = parseISO(aISO);
    if (!a || !bDate) return null;
    return Math.round((a.getTime() - bDate.getTime()) / 86400000);
  }

  /** @param {string} id */
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

  /** @param {Field} f */
  function shortLabel(f) {
    return f.label
      .replace(/\s*\(.*?\)\s*/g, "")
      .replace(/\s*—.*$/, "")
      .trim();
  }

  /** @param {Field} f */
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
  /** @param {string} id */
  function fieldTokenHTML(id) {
    const f = fieldById[id];
    if (!f) return esc("{{" + id + "}}");
    const v = tokenView(f);
    return `<span class="tok ${v.cls}" data-field="${id}" role="button" tabindex="0" title="${escAttr(f.label)}">${esc(v.text)}</span>`;
  }
  /** @param {string} id */
  function citeChipHTML(id) {
    const c = citeById[id];
    if (!c) return esc("[[" + id + "]]");
    const stat = c.kind !== "case" ? " cite--stat" : "";
    const kind = c.kind === "statute" ? "Statute: " : c.kind === "rule" ? "Rule: " : "";
    return `<span class="cite${stat}" data-cite="${id}" role="button" tabindex="0" title="${escAttr(kind + c.full)}">${esc(c.short)}</span>`;
  }
  /** @param {string} text */
  function renderMarkers(text) {
    let out = "",
      last = 0,
      /** @type {RegExpExecArray | null} */ m;
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
  /** @type {(s: Section) => boolean} */
  const isMappable = (s) =>
    !!(
      s.derivation ||
      (s.citations && s.citations.length) ||
      (s.references && s.references.length)
    );

  /** @param {Section} s */
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
            <div class="caption__ind">${esc(plLbl)}</div>
            <div>${esc(v)}</div>
            <div>${renderMarkers(defendant)},</div>
            <div class="caption__ind">${esc(defLbl)}</div>
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
    let n = 0;
    for (const s of DOC) {
      n += 1;
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
      html += `<section class="${cls}" data-sec="${s.id}"><span class="pnum" data-pn="${n}">${n}</span>${block}</section>`;
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
    $("#progFill").style.transform = `scaleX(${pct / 100})`;
    $("#progress").setAttribute("aria-valuenow", String(pct));
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
    /** @type {{ name: string, items: Field[] }[]} */
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

  /** @param {Field} f */
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
      const opts = (f.options || [])
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
      <label for="in-${f.id}"><span class="field__name">${esc(f.label)}</span> ${f.type !== "computed" ? '<span class="field__blank">blank</span>' : ""}</label>
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
      sec.setAttribute("tabindex", "0");
      sec.addEventListener("click", (/** @type {MouseEvent} */ e) => {
        const t = /** @type {Element} */ (e.target);
        if (t.closest(".tok") || t.closest(".cite")) return;
        if (state.mode === "edit") return;
        selectSection(sec.dataset.sec);
      });
      sec.addEventListener("keydown", (/** @type {KeyboardEvent} */ e) => {
        if (e.target !== sec) return;
        if (state.mode === "edit") return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectSection(sec.dataset.sec);
        }
      });
    });
    // tokens -> focus matching field
    $$("#paper .tok").forEach((el) => {
      /** @param {Event} e */
      const act = (e) => {
        e.stopPropagation();
        focusField(el.dataset.field);
      };
      el.addEventListener("click", act);
      el.addEventListener("keydown", (/** @type {KeyboardEvent} */ e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          act(e);
        }
      });
    });
    // citations -> locate
    $$("#paper .cite").forEach((el) => {
      /** @param {Event} e */
      const act = (e) => {
        e.stopPropagation();
        locateCitation(el.dataset.cite, true);
      };
      el.addEventListener("click", act);
      el.addEventListener("keydown", (/** @type {KeyboardEvent} */ e) => {
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

  /** @param {string} id */
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

  /** @param {string} id */
  function flashTokens(id) {
    $$(`#paper .tok[data-field="${id}"]`).forEach((t) => {
      t.classList.remove("is-flash");
      void t.offsetWidth;
      t.classList.add("is-flash");
      setTimeout(() => t.classList.remove("is-flash"), 900);
    });
  }

  /* ---------------------------------------------------------- section map */
  /** @param {string} id */
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
          <li>Click an <strong>oxblood citation</strong> to highlight every place it appears.</li>
          <li>Open <strong>Authorities</strong> for the table of authorities and the paragraphs that cite each one.</li>
          <li>Open <strong>Sources</strong> to read the underlying research memos.</li>
        </ul>
        <p>Fill the highlighted blanks on the left. Each value flows through the whole document at once.</p>
      </div>`;
      return;
    }
    // state.selected is only ever set from a data-sec attribute this run wrote,
    // so the section is present; the cast records that rather than adding a
    // branch no input can reach.
    const s = /** @type {Section} */ (DOC.find((x) => x.id === state.selected));
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

  /** @param {string} weight */
  function badgeClass(weight) {
    if (/binding/i.test(weight)) return "badge--binding";
    if (/controlling/i.test(weight)) return "badge--controlling";
    return "badge--persuasive";
  }
  /** @param {Cite | undefined} c */
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
  /** @param {RefMeta | undefined} r */
  function srcCard(r) {
    if (!r) return "";
    const uses = (srcUses[r.id] || []).length;
    return `<div class="src" data-src="${r.id}">
      <div class="src__t">${docIcon()} ${esc(r.title)}</div>
      <div class="src__b">${esc(r.blurb)}</div>
      <button class="src__open" type="button">Read full document → <span class="auth__uses">used by ${uses} section${uses === 1 ? "" : "s"}</span></button>
    </div>`;
  }
  const docIcon = () =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2"/><path d="M9 9l1 0"/><path d="M9 13l6 0"/><path d="M9 17l6 0"/></svg>`;

  function wireCtxCards() {
    $$("#ctxBody [data-locate]").forEach((b) =>
      b.addEventListener("click", (/** @type {Event} */ e) => {
        e.stopPropagation();
        locateCitation(b.dataset.locate, true);
      }),
    );
    $$("#ctxBody [data-readsrc]").forEach((b) =>
      b.addEventListener("click", (/** @type {Event} */ e) => {
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

  /* ------------------------------------------------- loading / empty / error */
  /** @param {"context" | "authorities" | "sources" | "drawer"} kind */
  function skeletonHTML(kind) {
    const bar = (/** @type {string} */ w) =>
      `<span class="skel__bar skel__bar--${w}"></span>`;
    let inner = "";
    if (kind === "authorities") {
      const row = `<div class="skel__row">${bar("name")}${bar("lead")}${bar("num")}</div>`;
      inner = `${bar("head")}${row.repeat(4)}${bar("head")}${row.repeat(2)}`;
    } else if (kind === "sources") {
      const row = `<div class="skel__row skel__row--src">${bar("title")}${bar("btn")}</div>${bar("meta")}`;
      inner = row.repeat(4);
    } else if (kind === "drawer") {
      inner = `${bar("head")}${bar("line")}${bar("line")}${bar("short")}${bar("line")}${bar("line")}${bar("short")}`;
    } else {
      inner = `${bar("meta")}${bar("block")}${bar("meta")}${bar("block")}`;
    }
    return `<div class="skel" role="status"><span class="sr-only">Loading</span>${inner}</div>`;
  }

  /**
   * @param {string} title @param {string} text
   * @param {string} [action] button markup, already escaped
   */
  function emptyHTML(title, text, action) {
    return `<div class="state state--empty"><h4>${esc(title)}</h4><p>${esc(text)}</p>${action || ""}</div>`;
  }
  /** @param {string} title @param {string} text @param {string} [action] */
  function errorHTML(title, text, action) {
    return `<div class="state state--error" role="alert"><h4>${esc(title)}</h4><p>${esc(text)}</p>${action || ""}</div>`;
  }
  const toContextBtn = `<button class="btn btn--tonal" type="button" data-goto="context">Back to Context</button>`;
  function wireGoto() {
    $$("#ctxBody [data-goto]").forEach((b) =>
      b.addEventListener("click", () => setTab(b.dataset.goto)),
    );
  }

  /** Show the final-shape skeleton in the right-hand panel. @param {"context" | "authorities" | "sources"} tab */
  function setLoading(tab) {
    const body = $("#ctxBody");
    body.setAttribute("aria-busy", "true");
    body.innerHTML = skeletonHTML(tab);
  }

  /** @type {(el: Element) => void} */
  const unbusy = (el) => el.removeAttribute("aria-busy");

  /* -------------------------------------------------------- authorities tab */
  function clearTrace() {
    $$(".is-tracing").forEach((el) => el.classList.remove("is-tracing"));
  }
  /** Mark a table-of-authorities row and the margin numbers it cites. @param {Element} row @param {string} id @param {boolean} on */
  function trace(row, id, on) {
    row.classList.toggle("is-tracing", on);
    paragraphsCiting(id).forEach((n) => {
      const pn = $(`#paper .pnum[data-pn="${n}"]`);
      if (pn) pn.classList.toggle("is-tracing", on);
    });
  }

  const TOA_GROUPS = /** @type {const} */ ([
    ["case", "Cases"],
    ["statute", "Statutes"],
    ["rule", "Rules"],
  ]);

  /** @param {Cite} c @param {boolean} open */
  function toaRowHTML(c, open) {
    const pages = paragraphsCiting(c.id);
    const uses = (citeUses[c.id] || []).length;
    const detail = open
      ? `<div class="toa__detail">
          <span class="auth__badge ${badgeClass(c.weight)}">${esc(c.weight)}</span>
          <div class="auth__full">${esc(c.full)}</div>
          <div class="auth__prop">${esc(c.proposition)}</div>
          <div class="auth__links">
            <button data-locate="${c.id}">Locate in document${uses > 1 ? ` (${uses})` : ""}</button>
            ${c.source ? `<button data-readsrc="${c.source}">Source memo</button>` : ""}
            ${c.url ? `<a href="${escAttr(c.url)}" target="_blank" rel="noopener">Full text ↗</a>` : ""}
          </div>
        </div>`
      : "";
    return `<li class="toa__row${open ? " is-open" : ""}" data-auth="${c.id}">
      <button class="toa__main" type="button" data-toa="${c.id}"${open ? ' aria-current="true"' : ""}>
        <span class="toa__name toa__name--${c.kind}">${esc(c.short)}</span>
        <span class="toa__leader" aria-hidden="true"></span>
        <span class="toa__pages">${pages.length ? esc(pages.join(", ")) : "not cited"}</span>
      </button>${detail}
    </li>`;
  }

  /** @param {string} [flashId] */
  function renderAuthorities(flashId) {
    const body = $("#ctxBody");
    if (!CITES.length) {
      body.innerHTML = emptyHTML(
        "No authorities cited yet",
        "Cases, statutes and rules appear here, with the paragraphs that cite them, once the document cites one.",
        toContextBtn,
      );
      wireGoto();
      return;
    }
    const groups = TOA_GROUPS.map(([kind, label]) => {
      const items = CITES.filter((c) => c.kind === kind);
      return items.length
        ? `<h3 class="toa__group">${label}</h3><ul class="toa__list">${items.map((c) => toaRowHTML(c, c.id === flashId)).join("")}</ul>`
        : "";
    }).join("");
    body.innerHTML = `<p class="toa__lede">${CITES.length} authorities, with the paragraph numbers that cite each.</p>${groups}`;
    wireCtxCards();
    $$("#ctxBody .toa__row").forEach((row) => {
      const id = row.dataset.auth;
      const on = () => trace(row, id, true);
      const off = () => trace(row, id, false);
      row.addEventListener("mouseenter", on);
      row.addEventListener("mouseleave", off);
      row.addEventListener("focusin", on);
      row.addEventListener("focusout", off);
    });
    $$("#ctxBody .toa__main").forEach((b) =>
      b.addEventListener("click", () => {
        locateCitation(b.dataset.toa, true);
        closeRailDrawer(true); // narrow screens: reveal the cited paragraph
      }),
    );
    if (flashId) {
      const row = $(`#ctxBody .toa__row[data-auth="${flashId}"]`);
      if (row) {
        row.classList.add("is-flash");
        row.scrollIntoView({ block: "center", behavior: "smooth" });
        setTimeout(() => row.classList.remove("is-flash"), 1400);
      }
    }
  }

  /* ------------------------------------------------------------ sources tab */
  /** @param {RefMeta} r */
  function sourceRowHTML(r) {
    const uses = (srcUses[r.id] || []).length;
    const active = state.sourceFilter === r.id;
    return `<li class="srow${active ? " is-active" : ""}" data-src="${r.id}">
      <button class="srow__main" type="button" aria-pressed="${active}">
        <span class="srow__title">${docIcon()} ${esc(r.title)}</span>
        <span class="srow__kind">Research memo, used by ${uses} section${uses === 1 ? "" : "s"}</span>
        <span class="srow__blurb">${esc(r.blurb)}</span>
      </button>
      <button class="btn btn--text srow__open" type="button" aria-label="Open ${escAttr(r.title)}">Open</button>
    </li>`;
  }

  function renderSources() {
    const body = $("#ctxBody");
    if (!REF_META.length) {
      body.innerHTML = emptyHTML(
        "No sources attached yet",
        "Research memos that support the motion are listed here once they are added.",
        toContextBtn,
      );
      wireGoto();
      return;
    }
    const filt = state.sourceFilter
      ? `<div class="filterbar">Highlighting sections that use <strong>${esc(refMetaById[state.sourceFilter].title)}</strong> <button class="btn btn--text" type="button" data-clearsrc>Clear</button></div>`
      : `<div class="filterbar">Four research memos underpin this motion.</div>`;
    body.innerHTML = `${filt}<ul class="srow__list">${REF_META.map(sourceRowHTML).join("")}</ul>`;
    $$("#ctxBody .srow").forEach((el) => {
      $(".srow__main", el).addEventListener("click", () =>
        toggleSourceFilter(el.dataset.src),
      );
      $(".srow__open", el).addEventListener("click", (/** @type {Event} */ e) => {
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

  /** @param {string} id */
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
  /** @param {string} id @param {boolean} [scroll] */
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
  /** @param {"context" | "authorities" | "sources"} tab @param {string} [flashId] */
  function setTab(tab, flashId) {
    state.tab = tab;
    $$(".ctx__tab").forEach((t) =>
      t.setAttribute("aria-selected", String(t.dataset.tab === tab)),
    );
    $("#ctxBody").setAttribute("aria-labelledby", `ctxTab-${tab}`);
    clearTrace();
    // The skeleton stands in the panel's final shape while the content is built;
    // the build runs in a microtask, so a caller never observes a half-built panel.
    setLoading(tab);
    queueMicrotask(() => {
      if (state.tab !== tab) return;
      const body = $("#ctxBody");
      try {
        if (tab === "context") renderContext();
        else if (tab === "authorities") renderAuthorities(flashId);
        else renderSources();
      } catch (err) {
        body.innerHTML = errorHTML(
          "This panel could not be built",
          "Something went wrong while building it. Choose the tab again to retry.",
        );
      }
      unbusy(body);
    });
  }

  /** @param {"fill" | "edit" | "read"} mode */
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
  /** Latest open request, so a slow render never overwrites a newer one. */
  let refToken = 0;
  /** @param {string} id */
  function openRef(id) {
    const meta = refMetaById[id];
    const body = $("#drawerBody");
    const token = ++refToken;
    $("#drawerTitle").textContent = meta ? meta.title : "Reference";
    body.innerHTML = skeletonHTML("drawer");
    body.setAttribute("aria-busy", "true");
    $("#drawer").classList.add("open");
    $("#scrim").classList.add("open");
    body.parentElement.scrollTop = 0;
    $("#drawerClose").focus();
    setTimeout(() => {
      if (token !== refToken) return;
      const md = REFS[id];
      if (md) {
        body.innerHTML = renderMarkdown(md);
      } else {
        body.innerHTML = errorHTML(
          "Reference not found",
          "This reference could not be opened. Close and choose it again from Sources.",
          `<button class="btn btn--text" type="button" data-closeref>Close</button>`,
        );
        $("[data-closeref]", body).addEventListener("click", closeRef);
      }
      unbusy(body);
    }, 0);
  }
  function closeRef() {
    $("#drawer").classList.remove("open");
    $("#scrim").classList.remove("open");
  }
  function refIsOpen() {
    return $("#drawer").classList.contains("open");
  }

  /* ------------------------------------------- form and context drawers */
  /** Below 1080px the form rail and context rail are drawers. */
  const narrow = window.matchMedia("(max-width: 1080px)");
  /** @type {"rail" | "ctx" | null} */
  let openRail = null;
  /** @type {HTMLElement | null} */
  let railOpener = null;
  const RAILS = /** @type {const} */ ([
    ["rail", "#rail", "#btnFields", "show-rail-mobile"],
    ["ctx", "#ctx", "#btnAuthorities", "show-ctx-mobile"],
  ]);
  /** Reflect openRail in classes, aria and inert; the one place that decides. */
  function syncRails() {
    RAILS.forEach(([name, sel, btn, cls]) => {
      const el = $(sel);
      const open = narrow.matches && openRail === name;
      const hidden = narrow.matches && !open;
      document.body.classList.toggle(cls, open);
      $(btn).setAttribute("aria-expanded", String(open));
      el.toggleAttribute("inert", hidden);
      if (hidden) el.setAttribute("aria-hidden", "true");
      else el.removeAttribute("aria-hidden");
      if (open) {
        el.setAttribute("role", "dialog");
        el.setAttribute("aria-modal", "true");
      } else {
        el.removeAttribute("role");
        el.removeAttribute("aria-modal");
      }
    });
    $("#railScrim").classList.toggle("open", narrow.matches && !!openRail);
  }
  /** @param {"rail" | "ctx"} name @param {HTMLElement} opener */
  function openRailDrawer(name, opener) {
    if (!narrow.matches) return;
    openRail = name;
    railOpener = opener;
    syncRails();
    const el = $(name === "rail" ? "#rail" : "#ctx");
    const first = $("[data-close-drawer]", el);
    if (first) first.focus();
  }
  /** @param {boolean} [restoreFocus] */
  function closeRailDrawer(restoreFocus) {
    if (!openRail) return;
    const opener = railOpener;
    openRail = null;
    railOpener = null;
    syncRails();
    if (restoreFocus && opener) opener.focus();
  }
  /** Keep Tab inside the open drawer. @param {KeyboardEvent} e */
  function trapRailFocus(e) {
    if (e.key !== "Tab" || !openRail || !narrow.matches) return;
    const el = $(openRail === "rail" ? "#rail" : "#ctx");
    const items = /** @type {HTMLElement[]} */ ([
      ...el.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      ),
    ]).filter((n) => n.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  /* --------------------------------------------------- markdown (compact) */
  /** @param {string} s */
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
  /** @param {string} md */
  function renderMarkdown(md) {
    const lines = md.replace(/\r/g, "").split("\n");
    let html = "",
      i = 0;
    /** @type {(l: string) => string[]} */
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
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let toastT;
  /** @param {string} msg */
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
  /** @param {Record<string, string>} map */
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
    $("#btnFields").addEventListener("click", (/** @type {Event} */ e) =>
      openRailDrawer("rail", /** @type {HTMLElement} */ (e.currentTarget)),
    );
    $("#btnAuthorities").addEventListener("click", (/** @type {Event} */ e) => {
      setTab("authorities");
      openRailDrawer("ctx", /** @type {HTMLElement} */ (e.currentTarget));
    });
    $$("[data-close-drawer]").forEach((b) =>
      b.addEventListener("click", () => closeRailDrawer(true)),
    );
    $("#railScrim").addEventListener("click", () => closeRailDrawer(true));
    narrow.addEventListener("change", () => {
      openRail = null;
      railOpener = null;
      syncRails();
    });
    syncRails();
    $("#stage").addEventListener("click", (/** @type {Event} */ e) => {
      const t = /** @type {Element} */ (e.target);
      if (t.id === "stage" || t.id === "paper") {
        state.selected = null;
        applySelection();
        if (state.tab === "context") renderContext();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        if (refIsOpen()) closeRef();
        else closeRailDrawer(true);
      }
      trapRailFocus(e);
    });

    window.__recital = {
      state,
      setTab,
      selectSection,
      locateCitation,
      paragraphsCiting,
      openRef,
      setLoading,
    }; // test hook
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();

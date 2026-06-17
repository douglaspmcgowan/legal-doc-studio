/* Recital — Legal Document Studio
 * Data model for the demo document: a Motion to Dismiss (E.D. Pa., FRCP 12(b)(6),
 * statute-of-limitations grounds). Marker syntax inside section html:
 *   {{FIELD_ID}}   -> fillable / computed field token
 *   [[CITE_ID]]    -> inline citation chip
 */

/* ------------------------------------------------------------------ FIELDS */
window.STUDIO_FIELDS = [
  // Parties
  {
    id: "PLAINTIFF_NAME",
    group: "Parties",
    label: "Plaintiff (full name)",
    type: "text",
    value: "",
    placeholder: "e.g. Anna Reyes",
    hint: "Appears in the caption, every argument heading, and the conclusion.",
  },
  {
    id: "DEFENDANT_NAME",
    group: "Parties",
    label: "Defendant (full name)",
    type: "text",
    value: "",
    placeholder: "e.g. Douglas Hartman",
    hint: "The moving party — your client.",
  },

  // Case
  {
    id: "CASE_NUMBER",
    group: "Case",
    label: "Civil action number",
    type: "text",
    value: "",
    placeholder: "e.g. 2:26-cv-02184",
    hint: "Assigned by the Clerk on filing.",
  },
  {
    id: "DISTRICT",
    group: "Case",
    label: "District court",
    type: "select",
    value: "Eastern District of Pennsylvania",
    options: [
      "Eastern District of Pennsylvania",
      "Middle District of Pennsylvania",
      "Western District of Pennsylvania",
    ],
    hint: "E.D. Pa. covers Philadelphia and the surrounding counties.",
  },
  {
    id: "JUDGE_NAME",
    group: "Case",
    label: "Assigned judge",
    type: "text",
    value: "",
    placeholder: "e.g. Hon. Maria Santos",
    hint: "Check the assigned judge’s standing orders before filing.",
  },

  // Incident
  {
    id: "STORE_NAME",
    group: "Incident facts",
    label: "Premises (store name)",
    type: "text",
    value: "",
    placeholder: "e.g. Greenline Market",
    hint: "Where the alleged slip-and-fall occurred.",
  },
  {
    id: "STORE_ADDRESS",
    group: "Incident facts",
    label: "Premises address",
    type: "text",
    value: "",
    placeholder: "e.g. 1200 Market St., Philadelphia, PA",
    hint: "",
  },
  {
    id: "INCIDENT_DATE",
    group: "Incident facts",
    label: "Date of incident",
    type: "date",
    value: "2024-04-01",
    hint: "The accrual date. Drives the limitations math below.",
  },
  {
    id: "COMPL_INCIDENT_PARA",
    group: "Incident facts",
    label: "Complaint ¶ — incident",
    type: "text",
    value: "",
    placeholder: "e.g. 8",
    hint: "Paragraph of the Complaint that alleges the date and fall.",
  },
  {
    id: "COMPL_NEG_PARA",
    group: "Incident facts",
    label: "Complaint ¶¶ — negligence",
    type: "text",
    value: "",
    placeholder: "e.g. 12–18",
    hint: "Paragraphs alleging negligence and damages.",
  },

  // Filing
  {
    id: "FILING_DATE",
    group: "Filing",
    label: "Date complaint was filed",
    type: "date",
    value: "2026-06-15",
    hint: "From the docket. Drives the “days late” calculation.",
  },
  {
    id: "SIGN_DATE",
    group: "Filing",
    label: "Date of this motion",
    type: "date",
    value: "",
    hint: "The date you sign and file the motion.",
  },

  // Counsel
  {
    id: "ATTORNEY_NAME",
    group: "Counsel",
    label: "Attorney name",
    type: "text",
    value: "",
    placeholder: "e.g. Jordan Lee, Esq.",
    hint: "",
  },
  {
    id: "FIRM_NAME",
    group: "Counsel",
    label: "Firm name",
    type: "text",
    value: "",
    placeholder: "e.g. Lee & Associates, LLC",
    hint: "",
  },
  {
    id: "FIRM_ADDRESS",
    group: "Counsel",
    label: "Firm address",
    type: "text",
    value: "",
    placeholder: "Street, City, PA ZIP",
    hint: "",
  },
  {
    id: "ATTORNEY_PHONE",
    group: "Counsel",
    label: "Phone",
    type: "text",
    value: "",
    placeholder: "(215) 555-0100",
    hint: "",
  },
  {
    id: "ATTORNEY_EMAIL",
    group: "Counsel",
    label: "Email",
    type: "text",
    value: "",
    placeholder: "name@firm.com",
    hint: "",
  },
  {
    id: "BAR_NO",
    group: "Counsel",
    label: "PA Bar No.",
    type: "text",
    value: "",
    placeholder: "e.g. 312045",
    hint: "",
  },

  // Computed (read-only, recalculated live)
  {
    id: "SOL_DEADLINE",
    group: "Computed",
    label: "Limitations deadline",
    type: "computed",
    value: "",
    hint: "Incident date + 2 years (42 Pa.C.S. § 5524).",
    derivedFrom: ["INCIDENT_DATE"],
  },
  {
    id: "DAYS_LATE",
    group: "Computed",
    label: "Days filed late",
    type: "computed",
    value: "",
    hint: "Filing date minus the limitations deadline.",
    derivedFrom: ["INCIDENT_DATE", "FILING_DATE"],
  },
];

/* --------------------------------------------------------------- CITATIONS */
window.STUDIO_CITATIONS = [
  {
    id: "twombly",
    kind: "case",
    short: "Bell Atl. Corp. v. Twombly",
    full: "Bell Atl. Corp. v. Twombly, 550 U.S. 544, 570 (2007)",
    authority: "U.S. Supreme Court",
    weight: "Binding",
    proposition:
      "A complaint must contain enough facts to state a claim to relief that is plausible on its face; labels, conclusions, and a formulaic recitation of the elements are not enough.",
    source: "frcp-12b6-standards",
    url: "https://supreme.justia.com/cases/federal/us/550/544/",
  },
  {
    id: "iqbal",
    kind: "case",
    short: "Ashcroft v. Iqbal",
    full: "Ashcroft v. Iqbal, 556 U.S. 662, 678 (2009)",
    authority: "U.S. Supreme Court",
    weight: "Binding",
    proposition:
      "Facial plausibility exists when the pleaded facts let the court draw a reasonable inference of liability; conclusory allegations are stripped before the plausibility assessment.",
    source: "frcp-12b6-standards",
    url: "https://supreme.justia.com/cases/federal/us/556/662/",
  },
  {
    id: "phillips",
    kind: "case",
    short: "Phillips v. County of Allegheny",
    full: "Phillips v. Cty. of Allegheny, 515 F.3d 224, 231 (3d Cir. 2008)",
    authority: "Third Circuit",
    weight: "Binding",
    proposition:
      "On a 12(b)(6) motion the court accepts all well-pleaded factual allegations as true and draws all reasonable inferences in the plaintiff’s favor.",
    source: "frcp-12b6-standards",
    url: "https://law.justia.com/cases/federal/appellate-courts/F3/515/224/",
  },
  {
    id: "robinson",
    kind: "case",
    short: "Robinson v. Johnson",
    full: "Robinson v. Johnson, 313 F.3d 128, 135 (3d Cir. 2002)",
    authority: "Third Circuit",
    weight: "Binding",
    proposition:
      "A statute-of-limitations defense may be raised on a 12(b)(6) motion where the time bar is apparent on the face of the complaint.",
    source: "frcp-12b6-standards",
    url: "https://law.justia.com/cases/federal/appellate-courts/F3/313/128/533212/",
  },
  {
    id: "wisniewski",
    kind: "case",
    short: "Wisniewski v. Fisher",
    full: "Wisniewski v. Fisher, 857 F.3d 152, 157 (3d Cir. 2017)",
    authority: "Third Circuit",
    weight: "Binding",
    proposition:
      "Reaffirms that dismissal on limitations grounds is proper when the defense is apparent from the complaint’s own allegations.",
    source: "examples-and-templates",
    url: "https://law.justia.com/cases/federal/appellate-courts/ca3/16-1062/16-1062-2017-05-16.html",
  },
  {
    id: "rycoline",
    kind: "case",
    short: "Rycoline Products v. C & W Unlimited",
    full: "Rycoline Prods., Inc. v. C & W Unlimited, 109 F.3d 883, 886 (3d Cir. 1997)",
    authority: "Third Circuit",
    weight: "Binding",
    proposition:
      "An affirmative defense may support a 12(b)(6) dismissal only when the pleaded facts conclusively establish the defense without reference to matters outside the complaint.",
    source: "frcp-12b6-standards",
    url: "https://law.justia.com/cases/federal/appellate-courts/F3/109/883/",
  },
  {
    id: "fine",
    kind: "case",
    short: "Fine v. Checcio",
    full: "Fine v. Checcio, 870 A.2d 850, 857–59 (Pa. 2005)",
    authority: "Pennsylvania Supreme Court",
    weight: "Controlling (state law)",
    proposition:
      "A cause of action accrues when the plaintiff could first maintain the action; the discovery rule tolls accrual only while the plaintiff is reasonably unaware of the injury and its cause.",
    source: "pa-statutes-of-limitations",
    url: "https://caselaw.findlaw.com/court/pa-supreme-court/1418276.html",
  },
  {
    id: "dalrymple",
    kind: "case",
    short: "Dalrymple v. Brown",
    full: "Dalrymple v. Brown, 701 A.2d 164, 167 (Pa. 1997)",
    authority: "Pennsylvania Supreme Court",
    weight: "Controlling (state law)",
    proposition:
      "The discovery rule is employed only for worthy cases and cannot be applied so loosely as to nullify the purpose of the statute of limitations.",
    source: "examples-and-templates",
    url: "https://law.justia.com/cases/pennsylvania/supreme-court/1997/549-pa-217-1.html",
  },
  {
    id: "gleason",
    kind: "case",
    short: "Gleason v. Borough of Moosic",
    full: "Gleason v. Borough of Moosic, 15 A.3d 479 (Pa. 2008)",
    authority: "Pennsylvania Supreme Court",
    weight: "Controlling (state law)",
    proposition:
      "Whether a plaintiff exercised reasonable diligence under the discovery rule is ordinarily a jury question absent undisputed facts.",
    source: "pa-statutes-of-limitations",
    url: "https://www.courtlistener.com/opinion/2552454/gleason-v-borough-of-moosic/",
  },
  {
    id: "montanya",
    kind: "case",
    short: "Montanya v. McGonegal",
    full: "Montanya v. McGonegal, 757 A.2d 947, 950 (Pa. Super. Ct. 2000)",
    authority: "Pennsylvania Superior Court",
    weight: "Persuasive (state law)",
    proposition:
      "Fraudulent concealment requires an affirmative independent act of concealment; mere silence does not toll the limitations period.",
    source: "pa-statutes-of-limitations",
    url: "https://law.justia.com/cases/pennsylvania/superior-court/2000/a30043-00.html",
  },
  {
    id: "cunningham",
    kind: "case",
    short: "Cunningham v. M&T Bank Corp.",
    full: "Cunningham v. M&T Bank Corp., 814 F.3d 156 (3d Cir. 2016)",
    authority: "Third Circuit",
    weight: "Binding",
    proposition:
      "A plaintiff must plausibly allege facts supporting equitable tolling; bare assertions of tolling do not satisfy the Twombly/Iqbal standard.",
    source: "frcp-12b6-standards",
    url: "https://law.justia.com/cases/federal/appellate-courts/ca3/15-1412/15-1412-2016-02-19.html",
  },
  {
    id: "foman",
    kind: "case",
    short: "Foman v. Davis",
    full: "Foman v. Davis, 371 U.S. 178, 182 (1962)",
    authority: "U.S. Supreme Court",
    weight: "Binding",
    proposition:
      "Leave to amend may be denied where amendment would be futile.",
    source: "frcp-12b6-standards",
    url: "https://supreme.justia.com/cases/federal/us/371/178/",
  },
  {
    id: "burlington",
    kind: "case",
    short: "In re Burlington Coat Factory",
    full: "In re Burlington Coat Factory Sec. Litig., 114 F.3d 1410, 1426 (3d Cir. 1997)",
    authority: "Third Circuit",
    weight: "Binding",
    proposition:
      "On a 12(b)(6) motion the court may not consider matters extraneous to the pleadings.",
    source: "frcp-12b6-standards",
    url: "https://law.justia.com/cases/federal/appellate-courts/F3/114/1410/",
  },
  {
    id: "pocono",
    kind: "case",
    short: "Pocono Int’l Raceway v. Pocono Produce",
    full: "Pocono Int’l Raceway, Inc. v. Pocono Produce, Inc., 468 A.2d 468, 471 (Pa. 1983)",
    authority: "Pennsylvania Supreme Court",
    weight: "Controlling (state law)",
    proposition:
      "For a discrete traumatic injury, the cause of action accrues on the date of the injury.",
    source: "pa-statutes-of-limitations",
    url: "https://law.justia.com/cases/pennsylvania/supreme-court/1983/503-pa-80-0.html",
  },
  {
    id: "erie",
    kind: "case",
    short: "Erie R.R. v. Tompkins",
    full: "Erie R.R. Co. v. Tompkins, 304 U.S. 64 (1938)",
    authority: "U.S. Supreme Court",
    weight: "Binding",
    proposition:
      "A federal court sitting in diversity applies state substantive law.",
    source: "pa-statutes-of-limitations",
    url: "https://supreme.justia.com/cases/federal/us/304/64/",
  },
  {
    id: "guaranty",
    kind: "case",
    short: "Guaranty Trust Co. v. York",
    full: "Guaranty Trust Co. v. York, 326 U.S. 99, 110 (1945)",
    authority: "U.S. Supreme Court",
    weight: "Binding",
    proposition:
      "State statutes of limitations are substantive and apply in federal diversity actions.",
    source: "pa-statutes-of-limitations",
    url: "https://supreme.justia.com/cases/federal/us/326/99/",
  },
  {
    id: "pierce",
    kind: "case",
    short: "Pierce v. Montgomery Cty. Opportunity Bd.",
    full: "Pierce v. Montgomery Cty. Opportunity Bd., Inc., 884 F. Supp. 965 (E.D. Pa. 1995)",
    authority: "E.D. Pa.",
    weight: "Persuasive",
    proposition:
      "Example of an E.D. Pa. dismissal where the limitations bar was apparent on the face of the pleadings.",
    source: "examples-and-templates",
    url: "https://law.justia.com/cases/federal/district-courts/FSupp/884/965/1388735/",
  },

  // Statutes & rules
  {
    id: "sec5524",
    kind: "statute",
    short: "42 Pa.C.S. § 5524",
    full: "42 Pa. Cons. Stat. § 5524 (two-year limitation)",
    authority: "Pennsylvania statute",
    weight: "Controlling (state law)",
    proposition:
      "Actions for personal injury must be commenced within two years of accrual.",
    source: "pa-statutes-of-limitations",
    url: "https://www.legis.state.pa.us/cfdocs/legis/LI/consCheck.cfm?txtType=HTM&ttl=42&div=0&chpt=55",
  },
  {
    id: "rule12",
    kind: "rule",
    short: "Fed. R. Civ. P. 12(b)(6)",
    full: "Fed. R. Civ. P. 12(b)(6)",
    authority: "Federal rule",
    weight: "Binding",
    proposition:
      "Authorizes dismissal of a complaint that fails to state a claim upon which relief can be granted.",
    source: "frcp-12b6-standards",
    url: "https://www.law.cornell.edu/rules/frcp/rule_12",
  },
  {
    id: "rule15",
    kind: "rule",
    short: "Fed. R. Civ. P. 15(c)",
    full: "Fed. R. Civ. P. 15(c) (relation back)",
    authority: "Federal rule",
    weight: "Binding",
    proposition:
      "Governs when an amended pleading relates back to the date of the original pleading; it does not revive a claim already time-barred when first filed.",
    source: "frcp-12b6-standards",
    url: "https://www.law.cornell.edu/rules/frcp/rule_15",
  },
];

/* ----------------------------------------------------------- REFERENCE META */
window.STUDIO_REF_META = [
  {
    id: "pa-statutes-of-limitations",
    title: "PA Statutes of Limitations",
    blurb:
      "The two-year period, accrual, the discovery rule, and tolling doctrines under Pennsylvania law.",
  },
  {
    id: "frcp-12b6-standards",
    title: "FRCP 12(b)(6) Standards",
    blurb:
      "Twombly/Iqbal pleading, when a limitations defense is proper at the pleading stage, and dismissal with prejudice.",
  },
  {
    id: "linguistic-patterns",
    title: "Legal Drafting Conventions",
    blurb:
      "Structure, headings, E.D. Pa. formatting, and the precise phrasing of a limitations argument.",
  },
  {
    id: "examples-and-templates",
    title: "Examples & Argument Templates",
    blurb:
      "Granted-dismissal precedent and the step-by-step template for a limitations argument.",
  },
];

/* ---------------------------------------------------------------- DOCUMENT */
/* kind: court | parties | title | body | h1 | h2 | h3 | signature | certificate
 * Markers: {{FIELD_ID}} and [[CITE_ID]]. citations[] drives the section->authority map.
 * derivation: where this section comes from (shown in the context panel). */
window.STUDIO_DOC = [
  {
    id: "m-court",
    kind: "court",
    part: "Motion",
    html: `IN THE UNITED STATES DISTRICT COURT\nFOR THE {{DISTRICT}}`,
    citations: [],
    references: [],
    derivation:
      "Caption block required by the local rules. The district is a field so the same template serves all three Pennsylvania federal districts.",
  },

  {
    id: "m-parties",
    kind: "parties",
    part: "Motion",
    html: `{{PLAINTIFF_NAME}}|Plaintiff,|v.|{{DEFENDANT_NAME}}|Defendant.|{{CASE_NUMBER}}|{{JUDGE_NAME}}`,
    citations: [],
    references: [],
    derivation:
      "Party caption. The names entered here propagate to every heading and to the conclusion, so the caption and the argument can never drift out of sync.",
  },

  {
    id: "m-title",
    kind: "title",
    part: "Motion",
    html: `DEFENDANT’S MOTION TO DISMISS PLAINTIFF’S COMPLAINT PURSUANT TO FEDERAL RULE OF CIVIL PROCEDURE 12(b)(6)`,
    citations: ["rule12"],
    references: ["linguistic-patterns"],
    derivation:
      "Title names the procedural vehicle. Rule 12(b)(6) is the mechanism for dismissing a complaint that is time-barred on its face.",
  },

  {
    id: "m-body",
    kind: "body",
    part: "Motion",
    html: `Defendant {{DEFENDANT_NAME}}, by and through undersigned counsel, respectfully moves this Court, pursuant to [[rule12]], to dismiss Plaintiff {{PLAINTIFF_NAME}}’s Complaint in its entirety, with prejudice. Plaintiff brings a negligence action arising from an alleged slip-and-fall on a wet floor at {{STORE_NAME}} on {{INCIDENT_DATE}}. Pennsylvania imposes a two-year statute of limitations on personal-injury claims. [[sec5524]]. Plaintiff did not file this action until {{FILING_DATE}} — more than two years after the alleged incident and {{DAYS_LATE}} after the limitations period expired on {{SOL_DEADLINE}}. Plaintiff’s claims are time-barred on the face of the Complaint, and no recognized tolling doctrine can save them. In support of this Motion, Defendant submits the accompanying Memorandum of Law.`,
    citations: ["rule12", "sec5524"],
    references: ["examples-and-templates", "pa-statutes-of-limitations"],
    derivation:
      "The motion proper: a short, self-contained statement of the relief and the single ground. The limitations math (incident date → deadline → days late) is computed live from the fields so the numbers are always internally consistent.",
  },

  {
    id: "m-sig",
    kind: "signature",
    part: "Motion",
    html: `Respectfully submitted,|{{ATTORNEY_NAME}}|{{FIRM_NAME}}|{{FIRM_ADDRESS}}|{{ATTORNEY_PHONE}} · {{ATTORNEY_EMAIL}}|Pennsylvania Bar No. {{BAR_NO}}|Attorney for Defendant {{DEFENDANT_NAME}}|Dated: {{SIGN_DATE}}`,
    citations: [],
    references: ["linguistic-patterns"],
    derivation:
      "Signature block. The defendant name matches the caption automatically.",
  },

  // ---- Memorandum ----
  {
    id: "mem-title",
    kind: "title",
    part: "Memorandum",
    html: `MEMORANDUM OF LAW IN SUPPORT OF DEFENDANT’S MOTION TO DISMISS`,
    citations: [],
    references: ["linguistic-patterns"],
    derivation:
      "The supporting brief. E.D. Pa. expects a memorandum of law accompanying any substantive motion (Local Civ. R. 7.1), capped at 25 pages.",
  },

  {
    id: "mem-prelim-h",
    kind: "h1",
    part: "Memorandum",
    html: `PRELIMINARY STATEMENT`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-prelim",
    kind: "body",
    part: "Memorandum",
    html: `This is a personal-injury action that Plaintiff waited too long to file. The Complaint alleges that on {{INCIDENT_DATE}}, Plaintiff {{PLAINTIFF_NAME}} slipped and fell on a wet floor at {{STORE_NAME}} in {{STORE_ADDRESS}} and sustained injuries she attributes to Defendant’s negligence. Pennsylvania law requires that personal-injury claims be commenced within two years of the date the cause of action accrues. [[sec5524]]. Plaintiff’s claims accrued on {{INCIDENT_DATE}} — the date of the alleged fall — when she sustained the injuries alleged and knew their cause. The limitations period therefore expired on {{SOL_DEADLINE}}. Plaintiff filed this action on {{FILING_DATE}}, {{DAYS_LATE}} after the limitations period closed. Because the time bar is apparent on the face of the Complaint, and because no amendment could render these claims timely, the Court should dismiss the Complaint with prejudice.`,
    citations: ["sec5524"],
    references: ["linguistic-patterns", "examples-and-templates"],
    derivation:
      "Opens by framing the dispositive point in plain terms, then states the rule, the accrual date, the deadline, and the overrun. Follows the drafting-conventions guidance that a preliminary statement should state the ground without string-citing.",
  },

  {
    id: "mem-facts-h",
    kind: "h1",
    part: "Memorandum",
    html: `FACTUAL BACKGROUND`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-facts",
    kind: "body",
    part: "Memorandum",
    html: `The following facts are drawn from the Complaint and are accepted as true solely for purposes of this Motion. On or about {{INCIDENT_DATE}}, Plaintiff {{PLAINTIFF_NAME}} was a customer at {{STORE_NAME}}, located at {{STORE_ADDRESS}}. (Compl. ¶ {{COMPL_INCIDENT_PARA}}.) Plaintiff alleges that she slipped and fell on a wet floor and sustained injuries as a result. (Compl. ¶¶ {{COMPL_NEG_PARA}}.) Plaintiff commenced this action by filing the Complaint on {{FILING_DATE}}.`,
    citations: [],
    references: ["examples-and-templates"],
    derivation:
      "A limitations motion lives or dies on the complaint’s own dates. This section pins the accrual date and the filing date to specific paragraphs so the bar is established from the pleading itself, never from outside evidence.",
  },

  {
    id: "mem-std-h",
    kind: "h1",
    part: "Memorandum",
    html: `LEGAL STANDARD`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-std-1",
    kind: "body",
    part: "Memorandum",
    html: `Federal Rule of Civil Procedure 12(b)(6) requires dismissal of a complaint that fails to state a claim upon which relief can be granted. [[rule12]]. To survive a motion to dismiss, a complaint must contain sufficient factual matter, accepted as true, to state a claim to relief that is plausible on its face. [[iqbal]] (quoting [[twombly]]). The Court accepts all well-pleaded factual allegations as true and draws all reasonable inferences in the plaintiff’s favor. [[phillips]].`,
    citations: ["rule12", "iqbal", "twombly", "phillips"],
    references: ["frcp-12b6-standards"],
    derivation:
      "The plausibility standard. Stated even-handedly — conceding the deferential standard of review strengthens the motion, because the argument is that the claim fails even when every allegation is taken as true.",
  },
  {
    id: "mem-std-2",
    kind: "body",
    part: "Memorandum",
    html: `An affirmative defense such as the statute of limitations may be raised in a Rule 12(b)(6) motion where the defense is apparent on the face of the complaint. [[robinson]]; [[wisniewski]]. When the complaint’s own allegations establish that the limitations period has expired, dismissal is warranted without resort to extrinsic evidence. [[rycoline]]; [[burlington]].`,
    citations: ["robinson", "wisniewski", "rycoline", "burlington"],
    references: ["frcp-12b6-standards"],
    derivation:
      "Bridges from the general standard to the limitations-specific rule. Robinson is the load-bearing authority: it is what permits a limitations defense to be decided at the pleading stage at all.",
  },

  {
    id: "mem-arg-h",
    kind: "h1",
    part: "Memorandum",
    html: `ARGUMENT`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-arg-i",
    kind: "h2",
    part: "Memorandum",
    html: `I. PLAINTIFF’S CLAIMS ARE BARRED BY PENNSYLVANIA’S TWO-YEAR STATUTE OF LIMITATIONS`,
    citations: ["sec5524"],
    references: ["linguistic-patterns"],
    derivation:
      "The single argument. A limitations motion should make one clean point, not bury it among weaker grounds.",
  },

  {
    id: "mem-arg-a-h",
    kind: "h3",
    part: "Memorandum",
    html: `A. Pennsylvania’s Two-Year Limitations Period Governs Plaintiff’s Negligence Claims`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-arg-a",
    kind: "body",
    part: "Memorandum",
    html: `Federal courts sitting in diversity apply state substantive law, including state statutes of limitations. [[guaranty]]; [[erie]]. Pennsylvania requires that an action to recover damages for personal injury be commenced within two years. [[sec5524]]. That two-year period governs negligence claims for personal injury, including slip-and-fall premises-liability actions. There is no dispute that Pennsylvania’s two-year period applies here.`,
    citations: ["guaranty", "erie", "sec5524"],
    references: ["pa-statutes-of-limitations"],
    derivation:
      "Establishes which limitations period applies and why Pennsylvania law controls in a federal diversity case. The Erie/Guaranty Trust pairing forecloses any argument that a federal limitations period applies.",
  },

  {
    id: "mem-arg-b-h",
    kind: "h3",
    part: "Memorandum",
    html: `B. Plaintiff’s Claims Accrued on the Date of the Alleged Incident`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-arg-b",
    kind: "body",
    part: "Memorandum",
    html: `Under Pennsylvania law, a cause of action accrues when the plaintiff could first maintain the action to a successful conclusion — generally, the date the plaintiff suffers a cognizable injury. [[fine]]. For a personal-injury claim arising from a discrete, traumatic event, accrual occurs on the date of the injury. [[pocono]]. Here, the Complaint alleges that Plaintiff sustained injuries when she slipped and fell on a wet floor at {{STORE_NAME}} on {{INCIDENT_DATE}}. (Compl. ¶ {{COMPL_INCIDENT_PARA}}.) The alleged injury was immediate and traumatic, and Plaintiff was aware of both her injury and its cause at the moment it occurred. Plaintiff’s negligence claims therefore accrued on {{INCIDENT_DATE}}.`,
    citations: ["fine", "pocono"],
    references: ["pa-statutes-of-limitations"],
    derivation:
      "Fixes the accrual date. A fall is a discrete traumatic event, so Pocono places accrual on the date of injury and the discovery rule (addressed below) has nothing to toll.",
  },

  {
    id: "mem-arg-c-h",
    kind: "h3",
    part: "Memorandum",
    html: `C. Plaintiff Filed This Action After the Limitations Period Expired`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-arg-c",
    kind: "body",
    part: "Memorandum",
    html: `Plaintiff was required to file this action within two years of {{INCIDENT_DATE}} — that is, no later than {{SOL_DEADLINE}}. [[sec5524]]. Plaintiff did not file the Complaint until {{FILING_DATE}}, {{DAYS_LATE}} after the limitations period expired. The time bar is established entirely from the face of the Complaint and the docket: the Complaint alleges {{INCIDENT_DATE}} as the date of the incident, and the docket reflects a filing date of {{FILING_DATE}}. The arithmetic is not in dispute — Plaintiff’s claims were extinguished on {{SOL_DEADLINE}}, and this action was not commenced until well after that deadline.`,
    citations: ["sec5524"],
    references: ["examples-and-templates"],
    derivation:
      "The decisive paragraph: it does the arithmetic on the record. Every date here is a live field, so the deadline and the days-late figure recompute the instant the incident or filing date changes.",
  },

  {
    id: "mem-arg-d-h",
    kind: "h3",
    part: "Memorandum",
    html: `D. No Tolling Doctrine Rescues Plaintiff’s Time-Barred Claims`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-arg-d1",
    kind: "body",
    part: "Memorandum",
    html: `Pennsylvania’s discovery rule tolls the limitations period only where the plaintiff is reasonably unaware of her injury or its cause. [[fine]]. The rule is employed only for worthy cases and cannot be applied so loosely as to nullify the purpose for which a statute of limitations exists. [[dalrymple]]. Whether a plaintiff acted with reasonable diligence can be a jury question, but only when the complaint leaves the issue genuinely open. [[gleason]]. Here, it does not. A slip-and-fall on a wet floor is a discrete, immediately observable event; the Complaint alleges no latent or undiscoverable injury, and its own allegations confirm that Plaintiff knew she had fallen, knew the condition that caused the fall, and knew the harm she suffered on {{INCIDENT_DATE}}. (Compl. ¶¶ {{COMPL_NEG_PARA}}.) The discovery rule affords Plaintiff no refuge.`,
    citations: ["fine", "dalrymple", "gleason"],
    references: ["pa-statutes-of-limitations", "examples-and-templates"],
    derivation:
      "Preempts the discovery-rule argument before Plaintiff can raise it in opposition. The move is to concede the rule, then show the complaint’s own facts establish immediate knowledge — which takes the issue away from the jury.",
  },
  {
    id: "mem-arg-d2",
    kind: "body",
    part: "Memorandum",
    html: `Nor has Plaintiff alleged any basis for equitable tolling. Fraudulent concealment requires an affirmative independent act of concealment that diverts the plaintiff from inquiry; mere silence is not enough. [[montanya]]. The Complaint alleges no such act. And a plaintiff opposing dismissal on limitations grounds must plausibly allege facts supporting tolling — bare assertions do not satisfy the pleading standard. [[cunningham]] (citing [[twombly]] and [[iqbal]]). Plaintiff has pleaded no facts that would toll the two-year period for a single day.`,
    citations: ["montanya", "cunningham", "twombly", "iqbal"],
    references: ["pa-statutes-of-limitations", "frcp-12b6-standards"],
    derivation:
      "Closes the remaining tolling exits. Ties the Pennsylvania fraudulent-concealment standard to the federal plausibility standard, so an unpleaded tolling theory cannot defeat the motion.",
  },

  {
    id: "mem-arg-e-h",
    kind: "h3",
    part: "Memorandum",
    html: `E. Dismissal Should Be With Prejudice Because Amendment Would Be Futile`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-arg-e",
    kind: "body",
    part: "Memorandum",
    html: `Where a complaint is time-barred on its face and no amendment could cure the defect, dismissal with prejudice is appropriate. [[foman]]. The passage of time is not a pleading deficiency that can be corrected by re-pleading, and an amendment cannot relate back to revive a claim that was already untimely when first filed. [[rule15]]. The incident occurred on {{INCIDENT_DATE}}, the limitations period expired on {{SOL_DEADLINE}}, and the Complaint was filed on {{FILING_DATE}}. No amendment can change those dates or make this action timely. Dismissal should therefore be with prejudice.`,
    citations: ["foman", "rule15"],
    references: ["frcp-12b6-standards"],
    derivation:
      "Asks for dismissal with prejudice rather than leave to amend. Because the defect is the calendar, not the wording, amendment is futile — the Foman standard for denying leave.",
  },

  {
    id: "mem-concl-h",
    kind: "h1",
    part: "Memorandum",
    html: `CONCLUSION`,
    citations: [],
    references: [],
    derivation: "",
  },
  {
    id: "mem-concl",
    kind: "body",
    part: "Memorandum",
    html: `For the foregoing reasons, Defendant {{DEFENDANT_NAME}} respectfully requests that this Court dismiss Plaintiff {{PLAINTIFF_NAME}}’s Complaint in its entirety, with prejudice, pursuant to [[rule12]]. Plaintiff’s negligence claims are time-barred under Pennsylvania’s two-year statute of limitations, [[sec5524]]; the time bar is apparent on the face of the Complaint; no tolling doctrine applies; and no amendment could render this action timely.`,
    citations: ["rule12", "sec5524"],
    references: ["linguistic-patterns"],
    derivation:
      "Restates the relief and the four-part throughline (time-barred → apparent on the face → no tolling → amendment futile) in a single sentence, matching the conclusion pattern in the drafting-conventions reference.",
  },

  {
    id: "mem-sig",
    kind: "signature",
    part: "Memorandum",
    html: `Respectfully submitted,|{{ATTORNEY_NAME}}|{{FIRM_NAME}}|{{FIRM_ADDRESS}}|{{ATTORNEY_PHONE}} · {{ATTORNEY_EMAIL}}|Pennsylvania Bar No. {{BAR_NO}}|Attorney for Defendant {{DEFENDANT_NAME}}|Dated: {{SIGN_DATE}}`,
    citations: [],
    references: [],
    derivation: "",
  },

  {
    id: "mem-cert",
    kind: "certificate",
    part: "Memorandum",
    html: `CERTIFICATE OF SERVICE|I hereby certify that on {{SIGN_DATE}}, a true and correct copy of the foregoing Motion to Dismiss and Memorandum of Law was served upon all counsel of record via the Court’s Electronic Case Filing (ECF) system.|{{ATTORNEY_NAME}}`,
    citations: [],
    references: ["linguistic-patterns"],
    derivation:
      "Certificate of service. Required by the local rules; the date matches the motion date field.",
  },
];

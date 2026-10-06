import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function ready(page: Page) {
  await page.goto("/index.html", { waitUntil: "load" });
  await page.waitForSelector("#paper .s", { state: "attached" });
  await page.waitForSelector(".field input", { state: "attached" });
  await expect(page.locator("#ctxBody")).not.toBeEmpty();
}

const oxblood = (page: Page) =>
  page.evaluate(() => {
    const probe = document.createElement("i");
    probe.style.color = "var(--oxblood)";
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });

test("button tiers: Print is filled oxblood, Use sample data is tonal, Clear is underlined text", async ({
  page,
}) => {
  await ready(page);
  const ox = await oxblood(page);
  const read = (sel: string) =>
    page.locator(sel).evaluate((n) => {
      const cs = getComputedStyle(n);
      return { bg: cs.backgroundColor, deco: cs.textDecorationLine };
    });
  expect((await read("#btnPrint")).bg).toBe(ox);
  const tonal = await read("#btnSample");
  expect(tonal.bg).not.toBe(ox);
  expect(tonal.bg).not.toBe("rgba(0, 0, 0, 0)");
  const clear = await read("#btnClear");
  expect(clear.bg).toBe("rgba(0, 0, 0, 0)");
  expect(clear.deco).toContain("underline");
});

test("pressing a button scales it to 0.98, and no button or input has a box border", async ({
  page,
}) => {
  await ready(page);
  const box = await page.locator("#btnPrint").boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(200);
  const t = await page
    .locator("#btnPrint")
    .evaluate((n) => getComputedStyle(n).transform);
  await page.mouse.up();
  expect(t).toMatch(/^matrix\(0\.98,/);

  const outlined = await page.evaluate(() =>
    [...document.querySelectorAll(".btn, input")]
      .filter((e) => {
        const cs = getComputedStyle(e);
        return ["Top", "Right", "Bottom", "Left"].every(
          (side) =>
            parseFloat(
              cs.getPropertyValue(`border-${side.toLowerCase()}-width`),
            ) > 0 &&
            cs.getPropertyValue(`border-${side.toLowerCase()}-style`) !==
              "none",
        );
      })
      .map((e) => `${e.tagName}.${e.className}`),
  );
  expect(outlined).toEqual([]);
});

test("the selected mode segment sits on paper with a 2px ink underline", async ({
  page,
}) => {
  await ready(page);
  const sel = await page
    .locator('.segmented button[aria-pressed="true"]')
    .evaluate((n) => {
      const cs = getComputedStyle(n);
      return { shadow: cs.boxShadow, border: cs.borderLeftWidth };
    });
  expect(sel.border).toBe("0px");
  expect(sel.shadow).toMatch(/inset/);
  expect(sel.shadow).toMatch(/0px -2px 0px 0px/);
});

test("a blank field says 'blank' and a filled field does not", async ({
  page,
}) => {
  await ready(page);
  const blank = page.locator(
    '.field[data-field="PLAINTIFF_NAME"] .field__blank',
  );
  await expect(blank).toBeVisible();
  await expect(blank).toHaveText("blank");
  await page.fill("#in-PLAINTIFF_NAME", "Anna Reyes");
  await expect(blank).toBeHidden();
  const ink = await page
    .locator('.field[data-field="CASE_NUMBER"] .field__blank')
    .evaluate((n) => getComputedStyle(n).color);
  const status = await page.evaluate(() => {
    const probe = document.createElement("i");
    probe.style.color = "var(--status-blank)";
    document.body.append(probe);
    const c = getComputedStyle(probe).color;
    probe.remove();
    return c;
  });
  expect(ink).toBe(status);
});

test("a focused input thickens its rule to 2px oxblood without moving layout", async ({
  page,
}) => {
  await ready(page);
  const inp = page.locator("#in-CASE_NUMBER");
  const before = await inp.boundingBox();
  await inp.focus();
  await expect
    .poll(() => inp.evaluate((n) => getComputedStyle(n).boxShadow))
    .toMatch(/0px -2px 0px 0px/);
  const after = await inp.boundingBox();
  expect(after).toEqual(before);
});

test("every section carries a sequential paragraph number", async ({
  page,
}) => {
  await ready(page);
  const nums = await page.evaluate(() =>
    [...document.querySelectorAll("#paper .s")].map((s) => {
      const p = s.querySelector(".pnum");
      return p ? p.textContent : null;
    }),
  );
  expect(nums.length).toBeGreaterThan(10);
  expect(nums).toEqual(nums.map((_, i) => String(i + 1)));
  const style = await page
    .locator("#paper .pnum")
    .first()
    .evaluate((n) => getComputedStyle(n).fontVariantNumeric);
  expect(style).toContain("tabular-nums");
});

test("paragraphsCiting maps an authority to the paragraphs that cite it", async ({
  page,
}) => {
  await ready(page);
  const result = await page.evaluate(() => {
    const id = window.STUDIO_CITATIONS[0]!.id;
    const nums = window.__recital.paragraphsCiting(id);
    const dom = [...document.querySelectorAll("#paper .s")]
      .map((s, i) => (s.querySelector(`.cite[data-cite="${id}"]`) ? i + 1 : 0))
      .filter(Boolean);
    return { nums, dom };
  });
  expect(result.nums.length).toBeGreaterThan(0);
  for (const n of result.dom) expect(result.nums).toContain(n);
});

test("Authorities renders Cases, Statutes and Rules rows with a leader and paragraph numbers", async ({
  page,
}) => {
  await ready(page);
  await page.click('.ctx__tab[data-tab="authorities"]');
  const groups = await page.locator(".toa__group").allTextContents();
  expect(groups).toEqual(["Cases", "Statutes", "Rules"]);
  const rows = page.locator(".toa__row");
  const count = await rows.count();
  expect(count).toBe(
    await page.evaluate(() => window.STUDIO_CITATIONS.length),
  );
  let numbered = 0;
  for (let i = 0; i < count; i++) {
    const row = rows.nth(i);
    await expect(row.locator(".toa__leader")).toHaveCount(1);
    const pages = (await row.locator(".toa__pages").textContent()) || "";
    expect(pages).toMatch(/^(\d+(, \d+)*|not cited)$/);
    if (/\d/.test(pages)) numbered++;
  }
  expect(numbered).toBeGreaterThan(count / 2);
  const italic = await page
    .locator(".toa__name--case")
    .first()
    .evaluate((n) => getComputedStyle(n).fontStyle);
  expect(italic).toBe("italic");
  const origin = await page
    .locator(".toa__leader")
    .first()
    .evaluate((n) => getComputedStyle(n).transformOrigin);
  expect(origin.startsWith("0px")).toBe(true);
});

test("hovering an authorities row traces its paragraphs in the margin", async ({
  page,
}) => {
  await ready(page);
  await page.click('.ctx__tab[data-tab="authorities"]');
  const row = page.locator(".toa__row").first();
  await row.hover();
  await expect(row).toHaveClass(/is-tracing/);
  expect(await page.locator("#paper .pnum.is-tracing").count()).toBeGreaterThan(
    0,
  );
  await page.mouse.move(0, 0);
  await expect(page.locator("#paper .pnum.is-tracing")).toHaveCount(0);
});

test("clicking an authority row still locates its citations and opens its detail", async ({
  page,
}) => {
  await ready(page);
  await page.click('.ctx__tab[data-tab="authorities"]');
  await page.locator(".toa__main").first().click();
  await expect(page.locator(".toa__row.is-open .toa__detail")).toBeVisible();
  await expect(page.locator("#paper .cite.is-flash").first()).toBeVisible();
});

test("Sources rows show title, kind and an Open control, and Open reads the memo", async ({
  page,
}) => {
  await ready(page);
  await page.click('.ctx__tab[data-tab="sources"]');
  const rows = page.locator(".srow");
  expect(await rows.count()).toBe(4);
  await expect(rows.first().locator(".srow__kind")).toContainText(
    "Research memo",
  );
  await rows.first().locator(".srow__open").click();
  await expect(page.locator("#drawer")).toHaveClass(/open/);
  await expect(page.locator("#drawerBody h1, #drawerBody h2").first()).toBeVisible();
});

test("an unknown reference opens an error state with role=alert and a way out", async ({
  page,
}) => {
  await ready(page);
  await page.evaluate(() => window.__recital.openRef("no-such-memo"));
  const alert = page.locator("#drawerBody [role=alert]");
  await expect(alert).toContainText("This reference could not be opened");
  await expect(alert).toContainText("choose it again from Sources");
  await page.locator("[data-closeref]").click();
  await expect(page.locator("#drawer")).not.toHaveClass(/open/);
});

test("loading shows a skeleton in the panel's shape, then the content replaces it", async ({
  page,
}) => {
  await ready(page);
  await page.evaluate(() => window.__recital.setLoading("authorities"));
  await expect(page.locator("#ctxBody .skel")).toHaveCount(1);
  await expect(page.locator("#ctxBody")).toHaveAttribute("aria-busy", "true");
  await page.click('.ctx__tab[data-tab="authorities"]');
  await expect(page.locator("#ctxBody .skel")).toHaveCount(0);
  await expect(page.locator("#ctxBody")).not.toHaveAttribute("aria-busy", "true");
});

test("empty authorities and sources say what belongs there and offer a way back", async ({
  page,
}) => {
  await ready(page);
  await page.evaluate(() => {
    window.STUDIO_CITATIONS.splice(0);
    window.STUDIO_REF_META.splice(0);
  });
  await page.click('.ctx__tab[data-tab="authorities"]');
  await expect(page.locator("#ctxBody .state--empty")).toContainText(
    "No authorities cited yet",
  );
  await page.click('.ctx__tab[data-tab="sources"]');
  await expect(page.locator("#ctxBody .state--empty")).toContainText(
    "No sources attached yet",
  );
  await page.locator("[data-goto=context]").click();
  await expect(page.locator("#ctxBody .ctx-empty")).toContainText(
    "Trace any part of the document",
  );
});

test("help copy no longer says blue and uses no em-dash divider", async ({
  page,
}) => {
  await ready(page);
  const text = await page.locator("#ctxBody").innerText();
  expect(text).not.toMatch(/blue/i);
  expect(text).toMatch(/oxblood citation/);
  expect(text).not.toMatch(/ — /);
});

test("the toast is a square paper surface with ink text", async ({ page }) => {
  await ready(page);
  const t = await page.locator("#toast").evaluate((n) => {
    const cs = getComputedStyle(n);
    return { r: cs.borderTopLeftRadius, bg: cs.backgroundColor, c: cs.color };
  });
  expect(t.r).toBe("0px");
  const paper = await page.evaluate(() => getComputedStyle(document.querySelector(".paper")!).backgroundColor);
  expect(t.bg).toBe(paper);
});

test("citation chips are oxblood sans at the small size; statute chips take the statute ink", async ({
  page,
}) => {
  await ready(page);
  const ox = await oxblood(page);
  const chip = await page
    .locator("#paper .cite:not(.cite--stat)")
    .first()
    .evaluate((n) => ({
      color: getComputedStyle(n).color,
      font: getComputedStyle(n).fontFamily,
    }));
  expect(chip.color).toBe(ox);
  expect(chip.font).toContain("Public Sans");
  const stat = page.locator("#paper .cite--stat").first();
  expect(await stat.getAttribute("title")).toMatch(/^(Statute|Rule): /);
  const statColor = await stat.evaluate((n) => getComputedStyle(n).color);
  expect(statColor).not.toBe(ox);
});

test("blank tokens carry a dotted underline and filled tokens a solid hairline", async ({
  page,
}) => {
  await ready(page);
  const blank = await page
    .locator("#paper .tok--empty")
    .first()
    .evaluate((n) => getComputedStyle(n).textDecorationStyle);
  expect(blank).toBe("dotted");
  await page.click("#btnSample");
  const filled = await page
    .locator("#paper .tok--filled")
    .first()
    .evaluate((n) => ({
      s: getComputedStyle(n).textDecorationStyle,
      bg: getComputedStyle(n).backgroundColor,
    }));
  expect(filled.s).toBe("solid");
  expect(filled.bg).toBe("rgba(0, 0, 0, 0)");
});

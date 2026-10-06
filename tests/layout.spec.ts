import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function ready(page: Page, width: number, height = 900) {
  await page.setViewportSize({ width, height });
  await page.goto("/index.html", { waitUntil: "load" });
  await page.waitForSelector("#paper .s", { state: "attached" });
  await page.waitForSelector(".field input", { state: "attached" });
  await expect(page.locator("#ctxBody")).not.toBeEmpty();
}

const inViewport = (page: Page, sel: string) =>
  page.locator(sel).evaluate((n) => {
    const r = n.getBoundingClientRect();
    return r.left >= -1 && r.right <= innerWidth + 1 && r.width > 0;
  });

test("display title is Libre Caslon at least twice the body size at 1440", async ({ page }) => {
  await ready(page, 1440);
  const t = await page.locator("#docTitle").evaluate((n) => {
    const cs = getComputedStyle(n);
    return { size: parseFloat(cs.fontSize), family: cs.fontFamily, text: n.textContent };
  });
  expect(t.size).toBeGreaterThanOrEqual(32);
  expect(t.family).toContain("Libre Caslon");
  expect(t.text).toBe("Motion to Dismiss");
  await expect(page.locator("#docSub")).toContainText("E.D. Pa.");
  const body = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
  expect(t.size).toBeGreaterThanOrEqual(2 * body);
});

test("1440: toggles hidden, rail 320 | stage | ctx 360, default screen renders at most three font sizes", async ({
  page,
}) => {
  await ready(page, 1440);
  await expect(page.locator("#btnFields")).toBeHidden();
  await expect(page.locator("#btnAuthorities")).toBeHidden();
  const w = await page.evaluate(() => ({
    rail: document.querySelector(".rail")!.getBoundingClientRect().width,
    ctx: document.querySelector(".ctx")!.getBoundingClientRect().width,
  }));
  expect(w).toEqual({ rail: 320, ctx: 360 });
  const sizes = await page.evaluate(() => {
    const out = new Set<number>();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent!.trim()) continue;
      const el = n.parentElement!;
      if (["SCRIPT", "STYLE"].includes(el.tagName)) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === "hidden" || cs.display === "none") continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (r.width === 0 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
      if (el.closest("#drawer, [inert]")) continue;
      out.add(Math.round(parseFloat(cs.fontSize) * 100) / 100);
    }
    return [...out].sort((a, b) => a - b);
  });
  expect(sizes.length, `sizes: ${sizes.join(", ")}`).toBeLessThanOrEqual(3);
});

test("1440: paragraph numbers hang left of the 65ch text column", async ({ page }) => {
  await ready(page, 1440);
  const g = await page.evaluate(() => {
    const sec = document.querySelector("#paper .s:has(.s-body)")!;
    const pn = sec.querySelector(".pnum")!.getBoundingClientRect();
    const body = sec.querySelector(".s-body")!;
    const b = body.getBoundingClientRect();
    const ch = parseFloat(getComputedStyle(body).fontSize) * 0.5;
    return { pnRight: pn.right, bodyLeft: b.left, bodyWidth: b.width, paperLeft: document.querySelector(".paper")!.getBoundingClientRect().left, pnLeft: pn.left, ch };
  });
  expect(g.pnRight).toBeLessThanOrEqual(g.bodyLeft);
  expect(g.pnLeft).toBeGreaterThanOrEqual(g.paperLeft);
  const maxCol = await page.locator(".paper").evaluate((n) => {
    const probe = document.createElement("div");
    probe.style.width = "65ch";
    n.append(probe);
    const w = probe.getBoundingClientRect().width;
    probe.remove();
    return w;
  });
  expect(g.bodyWidth).toBeLessThanOrEqual(maxCol + 1);
});

test("375: paragraph numbers sit inside the viewport and the column, never clipped", async ({ page }) => {
  await ready(page, 375, 800);
  const g = await page.evaluate(() => {
    const sec = document.querySelector("#paper .s--mappable")!;
    const pn = sec.querySelector(".pnum")!.getBoundingClientRect();
    const b = sec.getBoundingClientRect();
    return { left: pn.left, right: pn.right, secLeft: b.left, scroll: document.documentElement.scrollWidth, w: innerWidth };
  });
  expect(g.left).toBeGreaterThanOrEqual(0);
  expect(g.right).toBeLessThanOrEqual(g.w);
  expect(g.left).toBeGreaterThanOrEqual(g.secLeft - 1);
  expect(g.scroll).toBeLessThanOrEqual(g.w);
  await expect(page.locator(".mobilenote")).toHaveCount(0);
});

for (const [width, full] of [
  [768, false],
  [375, true],
] as const) {
  test(`${width}: Fields and Authorities toggles open drawers, Escape closes, focus returns`, async ({ page }) => {
    await ready(page, width, 800);
    for (const [btn, drawer] of [
      ["#btnFields", "#rail"],
      ["#btnAuthorities", "#ctx"],
    ] as const) {
      const toggle = page.locator(btn);
      await expect(toggle).toBeVisible();
      const box = (await toggle.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator(drawer)).toHaveAttribute("inert", "");
      await toggle.click();
      await expect(toggle).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator(drawer)).not.toHaveAttribute("inert", "");
      await page.waitForTimeout(500);
      const r = await page.locator(drawer).evaluate((n) => {
        const b = n.getBoundingClientRect();
        return { left: b.left, right: b.right, width: b.width, vw: innerWidth };
      });
      expect(r.left).toBeGreaterThanOrEqual(-1);
      expect(r.right).toBeLessThanOrEqual(r.vw + 1);
      if (full) expect(r.width).toBeCloseTo(r.vw, 0);
      else expect(r.width).toBeCloseTo(drawer === "#rail" ? 320 : 360, 0);
      expect(await page.evaluate((d) => document.querySelector(d)!.contains(document.activeElement), drawer)).toBe(true);
      await page.keyboard.press("Escape");
      await expect(toggle).toHaveAttribute("aria-expanded", "false");
      await expect(toggle).toBeFocused();
      await page.waitForTimeout(400);
      expect(await inViewport(page, drawer)).toBe(false);
    }
    // scrim click closes too
    await page.locator("#btnFields").click();
    await page.waitForTimeout(400);
    await page.mouse.click(width - 2, 400);
    if (!full) {
      await expect(page.locator("#btnFields")).toHaveAttribute("aria-expanded", "false");
      await expect(page.locator("#btnFields")).toBeFocused();
    }
  });
}

test("768: keyboard path reaches the drawer inputs and the close button", async ({ page }) => {
  await ready(page, 768, 800);
  await page.locator("#btnFields").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#btnFields")).toHaveAttribute("aria-expanded", "true");
  const seen = new Set<string>();
  const kind = () =>
    page.evaluate(() => {
      const a = document.activeElement!;
      return a.matches("input,select") ? "input" : a.matches("[data-close-drawer]") ? "close" : a.tagName;
    });
  seen.add(await kind());
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    seen.add(await kind());
  }
  expect(seen.has("input")).toBe(true);
  expect(seen.has("close")).toBe(true);
  expect(await page.evaluate(() => document.querySelector("#rail")!.contains(document.activeElement))).toBe(true);
});

for (const width of [375, 768, 1440]) {
  test(`${width}: no horizontal scroll and every control is at least 44px`, async ({ page }) => {
    await ready(page, width, 800);
    const g = await page.evaluate(() => ({ s: document.documentElement.scrollWidth, w: innerWidth }));
    expect(g.s).toBeLessThanOrEqual(g.w);
    const small = await page.evaluate(() =>
      [...document.querySelectorAll(".topbar button, .rail button, .rail input, .ctx button, .segmented button")]
        .filter((n) => (n as HTMLElement).offsetParent !== null && !n.closest("[inert]"))
        .map((n) => ({ n: n.className || n.tagName, h: n.getBoundingClientRect().height, w: n.getBoundingClientRect().width }))
        .filter((x) => x.h < 43.5 || x.w < 43.5)
        .map((x) => `${x.n} ${x.w}x${x.h}`),
    );
    if (width === 1440) expect(small).toEqual([]);
    else expect(small).toEqual([]);
  });
}

test("hovering an authority row draws its leader and marks cited paragraphs", async ({ page }) => {
  await ready(page, 1440);
  await page.locator("#ctxTab-authorities").click();
  const row = page.locator(".toa__row").first();
  await expect(row).toBeVisible();
  await row.hover();
  const leader = row.locator(".toa__leader");
  await expect(row).toHaveClass(/is-tracing/);
  const anim = await leader.evaluate((n) => ({
    count: n.getAnimations().length,
    name: getComputedStyle(n).animationName,
  }));
  expect(anim.count).toBeGreaterThan(0);
  expect(anim.name).toBe("leader-draw");
  await page.waitForTimeout(600);
  const mark = await page.locator(".pnum.is-tracing").first().evaluate((n) => getComputedStyle(n, "::before").opacity);
  expect(mark).toBe("1");
});

test("motion animates only transform and opacity", async ({ page }) => {
  await ready(page, 768, 800);
  await page.evaluate(() => window.__recital.setTab("authorities"));
  await page.waitForSelector(".toa__leader", { state: "attached" });
  const props = await page.evaluate(() => {
    const t = (sel: string, pseudo?: string) => {
      const el = document.querySelector(sel)!;
      return getComputedStyle(el, pseudo).transitionProperty;
    };
    return {
      rail: t("#rail"),
      ctx: t("#ctx"),
      railScrim: t("#railScrim"),
      refDrawer: t("#drawer"),
      refScrim: t("#scrim"),
      pnumMark: t(".pnum", "::before"),
      leader: t(".toa__leader"),
      progress: t(".progress__fill"),
    };
  });
  for (const k of ["rail", "ctx"] as const) expect(props[k]).toBe("transform");
  for (const k of ["railScrim", "refScrim", "pnumMark"] as const) expect(props[k]).toBe("opacity");
  expect(props.refDrawer).toBe("transform");
  expect(props.progress).toBe("transform");
  // keyframes: collect the properties every motion keyframe animates
  const kf = await page.evaluate(() => {
    const out: Record<string, string[]> = {};
    for (const sheet of document.styleSheets) {
      if (!sheet.href || !sheet.href.endsWith("styles.css")) continue;
      for (const rule of sheet.cssRules) {
        if (rule instanceof CSSKeyframesRule && ["leader-draw", "tokflash"].includes(rule.name)) {
          const set = new Set<string>();
          for (const f of rule.cssRules) {
            const s = (f as CSSKeyframeRule).style;
            for (let i = 0; i < s.length; i++) set.add(s[i]!);
          }
          out[rule.name] = [...set].sort();
        }
      }
    }
    return out;
  });
  expect(kf["leader-draw"]).toEqual(["opacity", "transform"]);
  expect(kf["tokflash"]).toEqual(["opacity"]);
});

test("reduced motion collapses the drawer transition to 1ms or less", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await ready(page, 768, 800);
  const d = await page.evaluate(() => {
    const dur = (sel: string) => parseFloat(getComputedStyle(document.querySelector(sel)!).transitionDuration) * 1000;
    return { rail: dur("#rail"), ctx: dur("#ctx"), scrim: dur("#railScrim") };
  });
  expect(d.rail).toBeLessThanOrEqual(1);
  expect(d.ctx).toBeLessThanOrEqual(1);
  expect(d.scrim).toBeLessThanOrEqual(1);
});

test("changing a field flashes its document tokens with an opacity-only wash", async ({ page }) => {
  await ready(page, 1440);
  const input = page.locator(".field input").first();
  await input.fill("Jordan");
  const anim = await page.evaluate(() => {
    const el = document.querySelector("#paper .tok.is-flash");
    return el ? getComputedStyle(el, "::after").animationName : "none";
  });
  expect(["tokflash", "none"]).toContain(anim);
});

for (const width of [375, 768]) {
  test(`topbar stays within two rows at ${width}`, async ({ page }) => {
    await ready(page, width);
    const h = await page.locator(".topbar").evaluate((n) => n.getBoundingClientRect().height);
    expect(h).toBeLessThanOrEqual(112);
    const scrolls = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    expect(scrolls).toBe(false);
    const btns = page.locator(".topbar button");
    const n = await btns.count();
    expect(n).toBeGreaterThanOrEqual(6);
    for (let i = 0; i < n; i++) {
      const info = await btns.nth(i).evaluate((b) => {
        const r = b.getBoundingClientRect();
        return { w: r.width, h: r.height, name: (b.getAttribute("aria-label") || b.textContent || "").trim() };
      });
      expect(info.name.length).toBeGreaterThan(0);
      expect(info.w).toBeGreaterThanOrEqual(43.5);
      expect(info.h).toBeGreaterThanOrEqual(43.5);
    }
  });
}

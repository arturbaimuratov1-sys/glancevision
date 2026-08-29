import { test, expect, type Page } from "@playwright/test";

/**
 * Glance Vision One — video-scrub hero suite (post-AR-removal).
 *
 * 1. <video> loads cleanly with no fatal pageerror / unhandled rejection.
 * 2. Scrolling with the mouse wheel scrubs the video forward, and up-scroll
 *    rewinds it (currentTime advances / decreases).
 * 3. Glassmorphism: the hero HUD would have been here — now assert the page
 *    has no horizontal overflow at any stage.
 * 4. Specs / nav links still work end-to-end.
 * 5. The AR interface is fully removed.
 */

type CapturedError = { kind: "console" | "pageerror" | "unhandled"; text: string };

test.describe("Glance Vision One video-scrub landing", () => {
  let page: Page;
  const errors: CapturedError[] = [];

  test.beforeEach(async ({ page: p }) => {
    page = p;
    page.on("pageerror", (e) => errors.push({ kind: "pageerror", text: String(e) }));
    page.on("console", (m) => {
      if (m.type() === "error")
        errors.push({ kind: "console", text: m.text().slice(0, 200) });
    });
    await p.addInitScript(() => {
      window.addEventListener("unhandledrejection", (e) => {
        const w = window as unknown as { __rejections?: string[] };
        w.__rejections ??= [];
        w.__rejections.push(String(e.reason).slice(0, 200));
      });
    });
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("video loads, scrubs forward + rewinds, no overflow, nav works", async () => {
    const video = page.getByTestId("scrub-video");
    await expect(video).toBeVisible();

    // Video loaded & spec-compliant.
    const meta = await video.evaluate((v: HTMLVideoElement) => ({
      ready: v.readyState,
      duration: v.duration,
      allowed: !v.controls && v.muted && v.playsInline,
    }));
    expect(meta.ready).toBeGreaterThanOrEqual(2);
    expect(meta.duration).toBeGreaterThan(1);
    expect(meta.allowed).toBe(true);

    // Forward scrub with the mouse wheel.
    const t0 = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    await wheel(page, 900, 2, 1500);
    const t1 = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(t1).toBeGreaterThan(t0 + 0.5);

    // Deeper into the lens: video keeps advancing (or clamps at end).
    await scrollStoryFraction(page, 0.9);
    const t2 = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(t2).toBeGreaterThanOrEqual(t1 - 0.01);

    // Rewind by scrolling back up.
    await scrollStoryFraction(page, 0.2);
    const t3 = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
    expect(t3).toBeLessThan(t2 - 0.2);

    await assertNoHorizontalOverflow(page);

    // Specs + nav still reachable.
    await page.getByTestId("specs").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await expect(page.getByTestId("specs")).toBeVisible();
    await expect(page.getByTestId("preorder")).toBeVisible();
    await assertNoHorizontalOverflow(page);

    await page.getByRole("link", { name: "Specs" }).first().click();
    await page.waitForTimeout(800);
    const specsTop = await page.evaluate(() => {
      const el = document.getElementById("specs");
      return el ? el.getBoundingClientRect().top : 9999;
    });
    expect(Math.abs(specsTop)).toBeLessThan(200);

    // AR interface fully removed.
    await expect(page.locator('[data-testid="ar-hud"]')).toHaveCount(0);

    // Fatal-crash gate.
    const unhandled = await page.evaluate(
      () => (window as unknown as { __rejections?: string[] }).__rejections ?? []
    );
    unhandled.forEach((t) => errors.push({ kind: "unhandled", text: t }));
    const crashes = errors.filter(
      (e) => e.kind === "pageerror" || e.kind === "unhandled"
    );
    expect(
      crashes,
      `Fatal crash detected:\n${crashes.map((c) => `  [${c.kind}] ${c.text}`).join("\n")}`
    ).toEqual([]);
  });
});

/** Scroll the page with repeated mouse-wheel deltas (like a real user). */
async function wheel(page: Page, yDelta: number, steps: number, settleMs: number) {
  await page.mouse.move(720, 450);
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, yDelta);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(settleMs);
}

/** Deterministically scroll the story section to a fraction of its own range. */
async function scrollStoryFraction(page: Page, fraction: number) {
  await page.evaluate(async (f) => {
    const sec = document.querySelector("#overview") as HTMLElement | null;
    if (!sec) return;
    const top = sec.getBoundingClientRect().top + window.scrollY;
    const scrollable = sec.offsetHeight - window.innerHeight;
    const target = top + scrollable * f;
    const start = window.scrollY;
    const dist = target - start;
    const dur = 1200;
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const ease = (t: number) =>
        t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        window.scrollTo(0, start + dist * ease(t));
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });
  }, fraction);
  await page.waitForTimeout(1400);
}

/** Assert the document does not overflow horizontally (layout broken). */
async function assertNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth
  );
  expect(overflow).toBeLessThan(4);
}

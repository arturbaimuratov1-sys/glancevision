import { test, expect, type Page } from "@playwright/test";

/**
 * Regression suite for the video-scrubbing + Glassmorphism refactor.
 *
 * Checks, per the brief:
 *  1. <video> exists, has z-index < 0 (bottom-most layer) and is visible.
 *  2. "Look classic" opacity goes to 0 after scrolling down (mouse.wheel).
 *  3. The AR interface is gone — "Golden Gate" / reticle text no longer exists.
 *  4. In the "Design Language" section there is NO <canvas>.
 */

test.describe("Video-scrub + glass fixes", () => {
  let page: Page;

  test.beforeEach(async ({ page: p }) => {
    page = p;
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("1. video exists, bottom layer, visible", async () => {
    const video = page.getByTestId("scrub-video");
    await expect(video).toBeVisible();

    const meta = await video.evaluate((v: HTMLVideoElement) => {
      const cs = getComputedStyle(v);
      return {
        zIndex: Number(cs.zIndex),
        position: cs.position,
        objectFit: cs.objectFit,
        muted: v.muted,
        playsInline: v.playsInline,
        preload: v.preload,
        ready: v.readyState,
      };
    });
    // z-index must be negative (bottom-most), fixed, object-cover, muted/inline.
    expect(meta.zIndex).toBeLessThan(0);
    expect(meta.position).toBe("fixed");
    expect(meta.objectFit).toBe("cover");
    expect(meta.muted).toBe(true);
    expect(meta.playsInline).toBe(true);
    expect(meta.preload).toBe("auto");
    expect(meta.ready).toBeGreaterThanOrEqual(2);
  });

  test("2. 'Look classic' fades to 0 on scroll", async () => {
    const heading = page.getByRole("heading", { name: /Look classic/ });
    await expect(heading).toBeVisible();

    // The hero copy container carries the scroll-driven opacity.
    const heroCopy = page.getByTestId("hero-copy");
    const before = await heroCopy.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(before).toBeGreaterThan(0.5);

    // Scroll down so the story progress passes the fade-out threshold.
    await page.mouse.move(720, 450);
    for (let i = 0; i < 6; i++) {
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(1400);

    const after = await heroCopy.evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(after).toBeLessThan(0.1);
  });

  test("3. AR interface removed from DOM", async () => {
    // The AR HUD / reticle / assistant objects must be gone entirely.
    await expect(page.locator('[data-testid="ar-hud"]')).toHaveCount(0);
    await expect(page.getByText(/Golden Gate/i)).toHaveCount(0);
    await expect(page.getByText(/Face recognition on/i)).toHaveCount(0);
    await expect(page.getByText(/latency 12ms/i)).toHaveCount(0);
    await expect(page.getByText(/76 obj/i)).toHaveCount(0);
    // "4K HDR" no longer appears as an AR widget (the specs card says "4K HDR"
    // too — assert the widget-only helper at rest, i.e. no crosshair reticle).
    await expect(page.locator(".animate-spin-slow")).toHaveCount(0);
  });

  test("4. no <canvas> / Spline in Design section", async () => {
    const design = page.locator("#design");
    await design.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const canvases = await design.locator("canvas").count();
    expect(canvases).toBe(0);

    // Spline creates a <canvas>; also assert no spline runtime markers remain.
    const splineEls = await design.locator("[class*=spline], [id*=spline]").count();
    expect(splineEls).toBe(0);

    // The section still shows the titan colour palette (content preserved).
    await expect(design.getByText("Design Language")).toBeVisible();
    await expect(design.getByText("Titanium", { exact: true })).toBeVisible();
    await expect(design.getByText("Onyx", { exact: true })).toBeVisible();
  });

  test("5. specs cards are frosted glass and stagger-reveal on view", async () => {
    const specs = page.locator('[data-testid="specs"]');
    await specs.scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);

    // Bento grid present.
    const cards = specs.locator(".rounded-3xl");
    expect(await cards.count()).toBeGreaterThanOrEqual(4);

    // Every card is frosted glass: backdrop-blur + translucent bg + hairline.
    const cardStyle = await cards.first().evaluate((el) => {
      const cs = getComputedStyle(el) as CSSStyleDeclaration & {
        webkitBackdropFilter?: string;
      };
      return {
        blur: cs.backdropFilter || cs.webkitBackdropFilter || "",
        bg: cs.backgroundColor,
        border: cs.borderColor,
      };
    });
    expect(cardStyle.blur).toContain("blur");
    expect(cardStyle.border).not.toBe("rgba(0, 0, 0, 0)");

    // Staggered reveal: cards animate in (opacity 1 after inView).
    await page.waitForTimeout(900);
    const opacities = [];
    for (let i = 0; i < Math.min(await cards.count(), 4); i++) {
      opacities.push(
        await cards.nth(i).evaluate((el) => Number(getComputedStyle(el).opacity))
      );
    }
    expect(Math.min(...opacities)).toBeGreaterThan(0.8);
  });
});

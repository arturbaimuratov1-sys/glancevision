# Glance Vision One

> **Look classic. Think beyond.**

A premium, crash-proof landing page for **Glance Vision One** — smart glasses that look like a timeless frame but think like Apple Vision Pro: embedded AI, a spatial AR interface, and a smart camera.

Pure-black `apple-design` aesthetic: `#000` background, SF Pro Display typography with size-specific tracking, deep glassmorphism materials, and a cinematic **scroll-scrubbed video hero** driven by Framer Motion.

---

## ✨ Features

- **Apple-style video scrubbing** — `video.currentTime` is bound to scroll via a ref-driven `requestAnimationFrame` loop (zero React re-renders during scroll). Scrolling down plays the footage forward; scrolling up rewinds it. A soft `useSpring` (stiffness 50 / damping 20) turns mouse-wheel bursts into a continuous glide.
- **True frosted glass everywhere** — `bg-white/5` + `backdrop-blur` + `border-white/10` panels over the footage, so the video glows *through* the interface.
- **Glossy bento specs grid** — `GlareCard.tsx`: cursor-tracked radial glare + edge highlight (spring-smoothed), `backdrop-blur-3xl`, and a **staggered reveal** (0.1 s cascade on scroll into view).
- **Clean lens moment** — the camera dives into the lenses with no HUD clutter.
- **E2E regression suite** (Playwright) covering video init, scrubbing, glassmorphism classes, and crash-freedom.

## 🧱 Tech stack

| Layer        | Choice                                |
| ------------ | ------------------------------------- |
| Framework    | Next.js 16 (App Router) + React 19    |
| Styling      | Tailwind CSS v4 + DaisyUI 5           |
| Motion       | Framer Motion (`motion`)              |
| Icons        | Lucide                                |
| Testing      | Playwright                            |

## 🚀 Getting started

```bash
npm install
npm run dev        # → http://localhost:3000
```

| Command             | Purpose                             |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Dev server                          |
| `npm run build`     | Production build                    |
| `npm run start`     | Serve the production build          |
| `npm run lint`      | ESLint                              |
| `npm run typecheck` | `tsc --noEmit`                      |
| `npm run test`      | Playwright E2E (auto-starts dev)    |

## 🎬 The hero: cinematic video scrubbing

`/public/video/glance-vision.mp4` (~9.5 s H.264) is pinned to the bottom layer:

- `<video>` is `fixed inset-0 -z-10 object-cover`, muted, playsinline, no controls.
- `video.currentTime` follows the `scrollYProgress` of the 420vh story section via a `requestAnimationFrame` loop that seeks a **paused** video (browsers coalesce seeks per frame — zero-lag).
- Scrub mapping: frontal glasses → 3/4 turn → camera flies into the lenses.
- The hero headline fades out immediately on scroll (`opacity 1 → 0`).

## 🧊 Frosted glass (Glassmorphism)

Everything on top of the video is translucent glass: `bg-white/5` panels,
`backdrop-filter: blur(14–64px)`, `border-white/10` hairlines. The blur is
applied as inline style so it renders reliably in headless Chromium too
(Tailwind's `backdrop-blur-*` compiles into a `@supports` block that headless
SwiftShader ignores).

The specs cards (`GlareCard.tsx`) add a cursor-tracked sheen + edge glow for a
"light catching the glass" effect.

## 🗂 Sections

| Section | Description |
| ------- | ----------- |
| `#overview` | Video-scrubbed hero |
| `#experience` | The AR journey |
| `#specs` | Glossy bento grid + price + Pre-order |
| `#design` | Design language + titanium colorways |
| footer | Company / product links |

Nav links smooth-scroll to sections (`scroll-behavior: smooth` + `scroll-padding-top`) with an IntersectionObserver active-state highlight.

## 🧪 E2E tests

`e2e/landing.spec.ts` + `e2e/fixes.spec.ts` guard the core behavior:

- `<video>` loads, is the bottom layer (`z-index < 0`), muted/playsinline/cover.
- Wheel-scrolling **changes `video.currentTime`** forward and rewinds on up-scroll.
- Hero copy fades to `opacity 0` after scrolling.
- Specs cards carry `backdrop-filter: blur(...)` + hairline borders and stagger-reveal.
- No horizontal overflow; nav links scroll to real sections; zero `pageerror` / unhandled rejections.

```bash
npx playwright install chromium   # once
npm run test
```

## 📁 Project structure

```
src/
  app/           # layout, page, globals.css
  components/    # ScrollStory, GlareCard, ProductSpecs, Experience, Design, Navbar, Footer
  lib/config.ts  # brand, specs, video URL
e2e/             # Playwright specs
public/video/    # hero footage
```

## 📄 License

MIT — see [LICENSE](./LICENSE).

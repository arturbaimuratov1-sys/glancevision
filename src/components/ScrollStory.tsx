"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import { ArrowDown, Sparkles } from "lucide-react";
import { VIDEO_URL, PRODUCT } from "@/lib/config";

/**
 * Cinematic video-scrub hero (Apple-style).
 *
 * The glasses footage (glance-vision.mp4, ~9.5 s) is bound to scroll.
 * Architecture (robust, static-export friendly):
 *   - hero container     : h-[450vh]  (lots of scroll space for all frames)
 *   - sticky viewport    : sticky top-0 h-screen w-full overflow-hidden
 *   - <video>            : absolute inset-0 w-full h-full object-cover z-0
 *                         (a plain DOM element, driven via ref — no motion)
 *
 * video.currentTime is scrubbed from scrollYProgress wrapped in a spring.
 * The video stays paused; an rAF loop seeks it directly. All mutable state
 * lives in refs so there are zero re-renders during scroll, and duration is
 * read live from the element (NaN-safe) so the loop never breaks.
 */

// Safe duration: video.duration is NaN until metadata loads.
const SAFE_DURATION = 9.5;

export function ScrollStory() {
  const targetRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubTarget = useRef(0);
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"],
  });

  // Spring inertia smooths mouse-wheel bursts into a continuous glide.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Drive the video target from the smoothed scroll every frame (ref only).
  useMotionValueEvent(smooth, "change", (v) => {
    if (Number.isFinite(v)) scrubTarget.current = v;
  });

  // Hero copy + hint fade out as soon as the user starts scrolling.
  const heroFade = useTransform(smooth, [0, 0.28], [1, 0]);

  // Scrub loop: read the live target + duration each frame, seek directly.
  // No React state, no re-renders — pure DOM seek, which is NaN-safe.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let lastTarget = -1;

    const tick = () => {
      raf = requestAnimationFrame(tick);

      const duration =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : SAFE_DURATION;
      const target = Math.max(0, Math.min(duration - 0.01, scrubTarget.current));

      // Hystereis: skip a seek if we're already there to avoid churn.
      if (Math.abs(target - lastTarget) < 0.004) return;
      lastTarget = target;

      if (video.readyState >= 2) {
        try {
          video.currentTime = target;
        } catch {
          /* seek can throw while metadata loads — ignore, retry next frame */
        }
      }
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      try {
        video.pause();
      } catch {
        /* ignore */
      }
    };
  }, []);

  // On load, pause + park the video so scrubbing fully owns playback.
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0.001;
    } catch {
      /* ignore */
    }
    setVideoReady(true);
  }, []);

  // Robust readiness: the browser can finish decoding before React attaches
  // onCanPlay (a hydration race), so also poll until data is available.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    const check = () => {
      if (cancelled) return;
      if (video.readyState >= 2) {
        setVideoReady(true);
      } else {
        setTimeout(check, 120);
      }
    };
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="overview" ref={targetRef} className="relative h-[450vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Cinematic video — scrubbed by scroll. Plain element, ref-driven. */}
        <video
          ref={videoRef}
          data-testid="scrub-video"
          className="absolute inset-0 z-0 h-full w-full object-cover"
          src={VIDEO_URL}
          muted
          playsInline
          loop={false}
          preload="auto"
          disablePictureInPicture
          style={{ pointerEvents: "none", opacity: videoReady ? 1 : 0 }}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setVideoReady(true)}
        />

        {/* Loading veil while the video decodes — auto fades with the video */}
        {!videoReady && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/80">
            <motion.div
              className="h-9 w-9 rounded-full border-2 border-white/15 border-t-white/90"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div className="loader-track">
              <div className="loader-fill" />
            </div>
            <span className="text-xs font-medium text-foreground-2">
              Loading experience…
            </span>
          </div>
        )}

        {/* Ambient frosted-glass orbs (subtle, keeps footage visible) */}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          <FrostedBackdrop />
        </div>

        {/* Hero copy — dissolves immediately on scroll */}
        <motion.div
          data-testid="hero-copy"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center justify-start px-6 pt-[13vh] text-center"
          style={{ opacity: heroFade }}
        >
          <div className="glass-soft pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium uppercase tracking-[0.14em] text-foreground-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Introducing {PRODUCT.name}
          </div>
          <h1 className="mt-5 display-1 text-gradient drop-shadow-[0_2px_24px_rgba(0,0,0,0.9)]">
            Look classic.
            <br />
            Think beyond.
          </h1>
          <p className="mt-6 max-w-xl body-lg text-foreground-2 drop-shadow-[0_2px_16px_rgba(0,0,0,0.9)]">
            {PRODUCT.name} looks like a timeless frame — and thinks like Apple
            Vision Pro. Embedded AI, a spatial AR interface, and a 12 MP smart
            camera. All in 45 grams.
          </p>
          <div className="pointer-events-auto mt-8 flex items-center gap-3">
            <a href="#specs" data-testid="cta" className="btn-apple">
              Pre-order · {PRODUCT.price}
            </a>
            <a href="#experience" className="btn-ghost glass-soft">
              See the experience
            </a>
          </div>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-white/50"
          style={{ opacity: heroFade }}
        >
          <span className="text-[11px] tracking-[0.28em] uppercase">
            Scroll to try on
          </span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/** Subtle ambient orbs over the footage; keeps the video visible. */
function FrostedBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute left-[8%] top-[10%] h-[42vmin] w-[42vmin] rounded-full bg-sky-500/12 blur-[100px]" />
      <div className="absolute right-[4%] top-[24%] h-[36vmin] w-[36vmin] rounded-full bg-violet-600/10 blur-[90px]" />
      <div className="absolute bottom-[8%] left-[28%] h-[38vmin] w-[38vmin] rounded-full bg-indigo-500/8 blur-[110px]" />
    </div>
  );
}

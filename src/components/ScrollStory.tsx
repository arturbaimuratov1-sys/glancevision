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
 * The glasses footage (glance-vision.mp4, ~9.5 s) is bound to scroll. It sits
 * on the very bottom layer (`z-[-1]`, fixed) so the whole interface above it
 * is translucent glass and the footage shows through.
 *
 *   video 0.00–0.65  frontal glasses -> 3/4 turn
 *   video 0.65–1.00  camera flies into the lenses (clean screen, no HUD)
 *
 * scrollYProgress is wrapped in a useSpring so seeking currentTime is smooth
 * instead of bursting. The video stays paused; the rAF loop only seeks.
 */
export function ScrollStory() {
  const containerRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scrubTarget = useRef(0);
  const [videoDuration, setVideoDuration] = useState(9.5);
  const [videoReady, setVideoReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Soft spring inertia smooths mouse-wheel bursts into a continuous glide.
  const smooth = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 20,
    mass: 0.5,
    restDelta: 0.001,
  });

  // Drive the video from the smoothed scroll every frame.
  useMotionValueEvent(smooth, "change", (v) => {
    scrubTarget.current = v * videoDuration;
  });

  // Scrub loop: the video stays PAUSED; we only seek `currentTime` toward the
  // scroll target, reading the live spring value each frame. No React state,
  // no re-renders during scroll — just a direct DOM seek, which is what keeps
  // the scrub at zero lag.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let raf = 0;
    let lastApplied = -1;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const target = scrubTarget.current;
      const cur = video.currentTime;
      const diff = target - cur;
      if (Math.abs(diff) < 0.008) {
        lastApplied = -1;
        return;
      }
      // Seek directly (browsers coalesce seeks per frame) for buttery scrub.
      if (video.readyState >= 2) {
        const next = Math.max(0, Math.min(video.duration - 0.01, target));
        if (Math.abs(next - lastApplied) > 0.001) {
          try {
            video.currentTime = next;
            lastApplied = next;
          } catch {
            /* seek can throw while metadata loads — ignore, retry next frame */
          }
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
  }, [videoReady]);

  // Pause the video on load so scrubbing controls it entirely.
  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration || 9.5);
    video.pause();
    video.currentTime = 0.001;
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
        setVideoDuration(video.duration || 9.5);
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

  // Hero copy + hint fade out as soon as the user starts scrolling.
  const heroFade = useTransform(smooth, [0, 0.28], [1, 0]);

  return (
    <section id="overview" ref={containerRef} className="relative h-[420vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Fixed cinematic video — the bottom-most layer, scrubbed by scroll */}
        <motion.video
          ref={videoRef}
          data-testid="scrub-video"
          className="fixed inset-0 -z-10 h-full w-full object-cover"
          src={VIDEO_URL}
          muted
          playsInline
          loop={false}
          preload="auto"
          disablePictureInPicture
          style={{ pointerEvents: "none" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: videoReady ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          onLoadedMetadata={handleLoadedMetadata}
          onCanPlay={() => setVideoReady(true)}
        />

        {/* Loading veil while the video decodes — auto fades with the video */}
        {!videoReady && (
          <div className="pointer-events-none fixed inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
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
        <div className="pointer-events-none fixed inset-0">
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

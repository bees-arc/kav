'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring, type MotionValue } from 'framer-motion';
import Navbar from './Navbar';
import styles from './HeroSection.module.css';

interface VideoFrameCallbackMetadata {
  mediaTime: number;
  [key: string]: unknown;
}

type HTMLVideoElementWithCallback = HTMLVideoElement & {
  requestVideoFrameCallback: (
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void
  ) => number;
};

// ─── Capture config ──────────────────────────────────────
const TARGET_FPS    = 30;   // 30 fps for ultra-smooth frame scrubbing
const CAPTURE_SPEED = 2;    // play at 2× speed for high reliability capture
const CAPTURE_SCALE = 1.0;  // 100% crisp full native video resolution
const UNLOCK_AT     = 0.10; // enable rendering as soon as initial frames arrive
// ─────────────────────────────────────────────────────────

// Module-level cache so frames persist across renders and can be pre-captured
let cachedHeroFrames: (ImageBitmap | undefined)[] | null = null;
let preloadPromise: Promise<(ImageBitmap | undefined)[]> | null = null;

export function preloadHeroFrames(): Promise<(ImageBitmap | undefined)[]> {
  if (typeof window === 'undefined') return Promise.resolve([]);
  if (cachedHeroFrames && cachedHeroFrames.length > 0) return Promise.resolve(cachedHeroFrames);
  if (preloadPromise) return preloadPromise;

  preloadPromise = new Promise<(ImageBitmap | undefined)[]>((resolve) => {
    const video = document.createElement('video');
    video.src = '/hero.mp4';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.style.position = 'fixed';
    video.style.top = '0px';
    video.style.left = '0px';
    video.style.width = '16px';
    video.style.height = '16px';
    video.style.opacity = '0.01';
    video.style.pointerEvents = 'none';
    video.style.zIndex = '-999';
    document.body.appendChild(video);

    const cleanup = () => {
      try {
        video.pause();
        video.remove();
      } catch {}
    };

    video.addEventListener(
      'loadedmetadata',
      async () => {
        const duration = video.duration || 10.04;
        const totalFrames = Math.ceil(duration * TARGET_FPS);
        const frames: (ImageBitmap | undefined)[] = new Array(totalFrames);

        const oc = document.createElement('canvas');
        oc.width = Math.round(video.videoWidth * CAPTURE_SCALE) || 720;
        oc.height = Math.round(video.videoHeight * CAPTURE_SCALE) || 1280;
        const ctx = oc.getContext('2d', { alpha: false });
        if (!ctx) {
          cleanup();
          resolve([]);
          return;
        }

        const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

        if (hasRVFC) {
          video.playbackRate = CAPTURE_SPEED;
          try {
            await video.play();
          } catch {
            cleanup();
            resolve([]);
            return;
          }

          const onFrame = (_: DOMHighResTimeStamp, meta: { mediaTime: number }) => {
            const pct = meta.mediaTime / duration;
            const idx = Math.min(Math.round(pct * (totalFrames - 1)), totalFrames - 1);

            if (!frames[idx]) {
              ctx.drawImage(video, 0, 0, oc.width, oc.height);
              createImageBitmap(oc).then((bmp) => {
                frames[idx] = bmp;
                if (idx > 0 && !frames[idx - 1]) frames[idx - 1] = bmp;
              });
            }

            if (meta.mediaTime < duration - 0.05) {
              (video as HTMLVideoElementWithCallback).requestVideoFrameCallback(onFrame);
            } else {
              video.pause();
              setTimeout(() => {
                for (let i = 1; i < frames.length; i++) {
                  if (!frames[i] && frames[i - 1]) {
                    frames[i] = frames[i - 1];
                  }
                }
                cachedHeroFrames = frames;
                cleanup();
                resolve(frames);
              }, 200);
            }
          };

          (video as HTMLVideoElementWithCallback).requestVideoFrameCallback(onFrame);
        } else {
          cleanup();
          resolve([]);
        }
      },
      { once: true }
    );
  });

  return preloadPromise;
}

const HEARTS = [
  { id: 0,  e: '💗', l: '3%',  d: '0s',    dur: '7s',   s: '1.5rem' },
  { id: 1,  e: '💕', l: '9%',  d: '2.1s',  dur: '6s',   s: '1.1rem' },
  { id: 2,  e: '💖', l: '17%', d: '0.5s',  dur: '8.5s', s: '1.8rem' },
  { id: 3,  e: '❤️', l: '25%', d: '3.5s',  dur: '5.5s', s: '1.0rem' },
  { id: 4,  e: '💓', l: '33%', d: '1.2s',  dur: '7.5s', s: '1.3rem' },
  { id: 5,  e: '💝', l: '41%', d: '4.8s',  dur: '6.5s', s: '1.7rem' },
  { id: 6,  e: '🩷', l: '48%', d: '0.8s',  dur: '5.5s', s: '1.2rem' },
  { id: 7,  e: '💗', l: '55%', d: '2.8s',  dur: '9s',   s: '1.4rem' },
  { id: 8,  e: '💕', l: '63%', d: '1.6s',  dur: '6s',   s: '1.0rem' },
  { id: 9,  e: '💖', l: '71%', d: '3.2s',  dur: '7s',   s: '1.7rem' },
  { id: 10, e: '❤️', l: '79%', d: '0.3s',  dur: '5.5s', s: '1.2rem' },
  { id: 11, e: '💓', l: '86%', d: '4.1s',  dur: '6.5s', s: '1.5rem' },
  { id: 12, e: '💝', l: '92%', d: '1.9s',  dur: '8s',   s: '1.1rem' },
  { id: 13, e: '🩷', l: '97%', d: '3.7s',  dur: '7s',   s: '1.3rem' },
  { id: 14, e: '💗', l: '13%', d: '5.5s',  dur: '6s',   s: '0.9rem' },
  { id: 15, e: '💕', l: '58%', d: '6.2s',  dur: '7.5s', s: '1.6rem' },
  { id: 16, e: '💖', l: '74%', d: '2.5s',  dur: '5s',   s: '1.3rem' },
  { id: 17, e: '❤️', l: '37%', d: '7.1s',  dur: '8s',   s: '1.1rem' },
  { id: 18, e: '🩷', l: '50%', d: '5.0s',  dur: '6.5s', s: '1.4rem' },
  { id: 19, e: '💓', l: '20%', d: '8.3s',  dur: '7s',   s: '1.2rem' },
];

interface HeroSectionProps {
  onBackClick?: () => void;
}

export default function HeroSection({ onBackClick }: HeroSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const captureRef   = useRef<HTMLVideoElement>(null);
  // Sparse array — some slots undefined until captured
  const framesRef    = useRef<(ImageBitmap | undefined)[]>([]);
  const frameIdxRef  = useRef(0);
  const rafRef       = useRef<number>(0);
  const [phase, setPhase]       = useState<'loading' | 'ready'>('loading');
  const [progress, setProgress] = useState(0);
  // ── Scroll container progress
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });
  const smooth = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    mass: 0.12,
    restDelta: 0.0001,
  });

  // ── Frame capture
  const captureFrames = useCallback(async () => {
    // 1. Check if module-level cache already has complete frames
    if (cachedHeroFrames && cachedHeroFrames.length > 0) {
      framesRef.current = cachedHeroFrames;
      setPhase('ready');
      setProgress(100);
      return;
    }

    // 2. If background preloader is already capturing, wait for it
    if (preloadPromise) {
      const preloaded = await preloadPromise;
      if (preloaded && preloaded.length > 0) {
        framesRef.current = preloaded;
        setPhase('ready');
        setProgress(100);
        return;
      }
    }

    const video = captureRef.current;
    if (!video) return;

    // Wait for duration to be known
    await new Promise<void>((res) => {
      if (video.readyState >= 1) { res(); return; }
      video.addEventListener('loadedmetadata', () => res(), { once: true });
    });

    const duration    = video.duration || 10.04;
    const totalFrames = Math.ceil(duration * TARGET_FPS);
    const frames: (ImageBitmap | undefined)[] = new Array(totalFrames);
    let captured = 0;
    let unlocked = false;

    const oc  = document.createElement('canvas');
    oc.width  = Math.round(video.videoWidth  * CAPTURE_SCALE) || 720;
    oc.height = Math.round(video.videoHeight * CAPTURE_SCALE) || 1280;
    const ctx = oc.getContext('2d', { alpha: false })!;

    const tryUnlock = () => {
      setProgress(Math.round((captured / totalFrames) * 100));
      if (!unlocked && captured >= Math.max(2, totalFrames * UNLOCK_AT)) {
        unlocked = true;
        framesRef.current = frames;
        setPhase('ready');
      }
    };

    const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

    if (hasRVFC) {
      video.playbackRate = CAPTURE_SPEED;
      video.muted = true;
      try {
        await video.play();
      } catch (err) {
        console.warn('Autoplay prevented on video capture', err);
      }

      await new Promise<void>((done) => {
        const onFrame = (_: DOMHighResTimeStamp, meta: { mediaTime: number }) => {
          const pct = meta.mediaTime / duration;
          const idx = Math.min(Math.round(pct * (totalFrames - 1)), totalFrames - 1);

          if (!frames[idx]) {
            ctx.drawImage(video, 0, 0, oc.width, oc.height);
            createImageBitmap(oc).then((bmp) => {
              frames[idx] = bmp;
              captured++;
              if (idx > 0 && !frames[idx - 1]) frames[idx - 1] = bmp;
              tryUnlock();
            });
          }

          if (meta.mediaTime < duration - 0.05) {
            (video as HTMLVideoElementWithCallback).requestVideoFrameCallback(onFrame);
          } else {
            video.pause();
            setTimeout(() => {
              // Fill all remaining gaps so every index is valid
              for (let i = 1; i < frames.length; i++) {
                if (!frames[i] && frames[i - 1]) {
                  frames[i] = frames[i - 1];
                }
              }
              framesRef.current = frames;
              cachedHeroFrames = frames;
              setPhase('ready');
              setProgress(100);
              done();
            }, 200);
          }
        };

        (video as HTMLVideoElementWithCallback).requestVideoFrameCallback(onFrame);
      });

    } else {
      // Seek fallback
      const FFPS  = 15;
      const ftotal = Math.ceil(duration * FFPS);
      const fframes: (ImageBitmap | undefined)[] = new Array(ftotal);
      let fcap = 0, funlocked = false;

      for (let i = 0; i < ftotal; i++) {
        const t = (i / Math.max(ftotal - 1, 1)) * duration;
        await new Promise<void>((res) => {
          video.currentTime = t;
          video.addEventListener('seeked', () => res(), { once: true });
        });
        ctx.drawImage(video, 0, 0, oc.width, oc.height);
        fframes[i] = await createImageBitmap(oc);
        fcap++;
        setProgress(Math.round((fcap / ftotal) * 100));
        if (!funlocked && fcap >= ftotal * UNLOCK_AT) {
          funlocked = true;
          framesRef.current = fframes;
          setPhase('ready');
        }
      }
      framesRef.current = fframes;
      cachedHeroFrames = fframes;
      setPhase('ready');
      setProgress(100);
    }
  }, []);

  useEffect(() => { captureFrames(); }, [captureFrames]);

  // ── Canvas draw loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let lastIdx = -1;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      lastIdx = -1;
    };
    setSize();
    const obs = new ResizeObserver(setSize);
    obs.observe(canvas);

    const unsub = smooth.on('change', (p) => {
      const total = framesRef.current.length;
      if (total > 0) {
        const targetIdx = Math.min(Math.round(p * (total - 1)), total - 1);
        frameIdxRef.current = Math.max(0, targetIdx);
      }
    });

    const draw = () => {
      if (canvas.width === 0 || canvas.height === 0) {
        setSize();
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      const frames = framesRef.current;
      const total = frames.length;

      if (total > 0) {
        let idx = frameIdxRef.current;
        if (idx >= total) idx = total - 1;
        if (idx < 0) idx = 0;

        // Search nearest available frame if gap exists
        while (idx > 0 && !frames[idx]) {
          idx--;
        }

        const bmp = frames[idx] || frames[0];
        if (bmp && idx !== lastIdx) {
          const cw = canvas.width;
          const ch = canvas.height;
          const ir = bmp.width / bmp.height;
          const cr = cw / ch;
          let sw = cw, sh = ch, sx = 0, sy = 0;
          if (ir > cr) {
            sw = ch * ir;
            sx = -(sw - cw) / 2;
          } else {
            sh = cw / ir;
            sy = -(sh - ch) / 2;
          }
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(bmp, sx, sy, sw, sh);
          lastIdx = idx;
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => { unsub(); cancelAnimationFrame(rafRef.current); obs.disconnect(); };
  }, [smooth]);

  // ── Scroll transforms
  const hintOpacity  = useTransform(smooth, [0, 0.05], [1, 0]);
  const pinkOverlay  = useTransform(smooth, [0.68, 1],  [0, 0.55]);
  const barScaleX    = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={containerRef} className={styles.scrollContainer}>
      {/* Hidden video — capture source only, never shown */}
      <video
        ref={captureRef}
        src="/hero.mp4"
        muted
        playsInline
        preload="auto"
        className={styles.hiddenVideo}
      />

      <div className={styles.stickyFrame}>
        {/* Floating Back Button (top left) */}
        {onBackClick && (
          <button
            type="button"
            onClick={onBackClick}
            className={styles.backButton}
            aria-label="Go back to previous page"
          >
            <span className={styles.backArrow}>←</span>
            <span>Back</span>
          </button>
        )}

        {/* Floating Completing Heart Indicator (top right) */}
        <Navbar progress={smooth} />

        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Loading overlay — disappears as soon as frames ready */}
        {phase === 'loading' && (
          <div className={styles.captureOverlay}>
            <div className={styles.captureBox}>
              <div className={styles.captureBar}>
                <div className={styles.captureFill} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.captureLabel}>
                Preparing your surprise… {progress}%
              </p>
            </div>
          </div>
        )}

        <div className={styles.overlay} />
        <motion.div className={styles.celebOverlay} style={{ opacity: pinkOverlay }} />

        <div className={styles.heartsLayer} aria-hidden="true">
          {HEARTS.map((h) => (
            <span key={h.id} className={styles.heart}
              style={{ left: h.l, animationDelay: h.d, animationDuration: h.dur, fontSize: h.s }}>
              {h.e}
            </span>
          ))}
        </div>

        {/* "With love ❤️" badge moved to bottom with "Scroll down ↓" indicator */}
        <motion.div
          className={styles.bottomLoveContainer}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          style={{ opacity: hintOpacity }}
        >
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            With love ❤️
          </div>
          <div className={styles.scrollDownIndicator}>
            <span>Scroll down to celebrate</span>
            <motion.span
              className={styles.scrollDownArrow}
              animate={{ y: [0, 4, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              ↓
            </motion.span>
          </div>
        </motion.div>

        <motion.div className={styles.progressBar} style={{ scaleX: barScaleX }} />
      </div>

      {/* Tall scroll track for smooth user scrubbing */}
      <div className={styles.scrollTrack} />
    </div>
  );
}

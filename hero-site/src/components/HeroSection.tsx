'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './HeroSection.module.css';

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

// ── How many frames to capture (higher = smoother but more RAM)
// We capture frames by seeking a hidden video and snapshotting to ImageBitmap
// This runs once on load in the browser — no ffmpeg needed!
const TARGET_FPS = 24; // frames per second to capture

export default function HeroSection() {
  const containerRef   = useRef<HTMLDivElement>(null);
  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const captureRef     = useRef<HTMLVideoElement>(null); // hidden, used for capture
  const framesRef      = useRef<ImageBitmap[]>([]);
  const frameIdxRef    = useRef(0);
  const rafRef         = useRef<number>(0);
  const [phase, setPhase]     = useState<'capturing' | 'ready'>('capturing');
  const [progress, setProgress] = useState(0); // 0-100

  // ── Scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smooth = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 28,
    restDelta: 0.0001,
  });

  // ── Capture frames from video into ImageBitmap[]
  //    Runs once on mount. Seeks a hidden <video>, grabs each frame via createImageBitmap.
  const captureFrames = useCallback(async () => {
    const video = captureRef.current;
    if (!video) return;

    await new Promise<void>((res) => {
      if (video.readyState >= 2) { res(); return; }
      video.addEventListener('loadedmetadata', () => res(), { once: true });
    });

    const duration = video.duration;
    const totalFrames = Math.ceil(duration * TARGET_FPS);
    const captured: ImageBitmap[] = [];

    // Helper: seek + wait for seeked event
    const seekTo = (t: number) =>
      new Promise<void>((res) => {
        video.currentTime = t;
        video.addEventListener('seeked', () => res(), { once: true });
      });

    // Offscreen canvas for ImageBitmap capture
    const offscreen = document.createElement('canvas');
    offscreen.width  = video.videoWidth;
    offscreen.height = video.videoHeight;
    const ctx = offscreen.getContext('2d', { alpha: false })!;

    for (let i = 0; i < totalFrames; i++) {
      const t = (i / (totalFrames - 1)) * duration;
      await seekTo(t);
      ctx.drawImage(video, 0, 0);
      // createImageBitmap is GPU-accelerated and very fast to paint later
      const bmp = await createImageBitmap(offscreen);
      captured.push(bmp);
      if (i % 5 === 0 || i === totalFrames - 1) {
        setProgress(Math.round(((i + 1) / totalFrames) * 100));
      }
    }

    framesRef.current = captured;
    setPhase('ready');
  }, []);

  useEffect(() => {
    captureFrames();
  }, [captureFrames]);

  // ── Draw loop: paint ImageBitmap matching current scroll frame
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    setSize();
    const obs = new ResizeObserver(setSize);
    obs.observe(canvas);

    const unsub = scrollYProgress.on('change', (p) => {
      const total = framesRef.current.length;
      if (total > 0) {
        frameIdxRef.current = Math.min(Math.round(p * (total - 1)), total - 1);
      }
    });

    let lastIdx = -1;
    const draw = () => {
      const idx = frameIdxRef.current;
      const bmp = framesRef.current[idx];
      if (bmp && idx !== lastIdx) {
        const cw = canvas.offsetWidth;
        const ch = canvas.offsetHeight;
        // Cover-fit
        const ir = bmp.width / bmp.height;
        const cr = cw / ch;
        let sw = cw, sh = ch, sx = 0, sy = 0;
        if (ir > cr) { sw = ch * ir; sx = -(sw - cw) / 2; }
        else         { sh = cw / ir; sy = -(sh - ch) / 2; }
        ctx.drawImage(bmp, sx, sy, sw, sh);
        lastIdx = idx;
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      unsub();
      cancelAnimationFrame(rafRef.current);
      obs.disconnect();
    };
  }, [scrollYProgress]);

  // ── Transforms
  const introOpacity = useTransform(smooth, [0, 0.12], [1, 0]);
  const introY       = useTransform(smooth, [0, 0.12], ['0px', '-60px']);
  const hintOpacity  = useTransform(smooth, [0, 0.06], [1, 0]);
  const pinkOverlay  = useTransform(smooth, [0.70, 1],  [0, 0.55]);
  const bdOpacity    = useTransform(smooth, [0.80, 0.94], [0, 1]);
  const bdScale      = useTransform(smooth, [0.80, 0.97], [0.65, 1]);
  const bdY          = useTransform(smooth, [0.80, 0.94], ['70px', '0px']);
  const subOpacity   = useTransform(smooth, [0.88, 0.98], [0, 1]);
  const subY         = useTransform(smooth, [0.88, 0.98], ['30px', '0px']);
  const barScaleX    = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className={styles.scrollContainer}>
      {/* Hidden video used only for frame capture */}
      <video
        ref={captureRef}
        src="/hero.mp4"
        muted
        playsInline
        preload="auto"
        className={styles.hiddenVideo}
      />

      <div className={styles.stickyFrame}>
        {/* ── Canvas — displays captured ImageBitmaps ── */}
        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Capturing progress overlay */}
        {phase === 'capturing' && (
          <div className={styles.captureOverlay}>
            <div className={styles.captureBox}>
              <div className={styles.captureBar}>
                <div className={styles.captureFill} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.captureLabel}>
                {progress < 100 ? `Loading frames… ${progress}%` : 'Almost ready ✨'}
              </p>
            </div>
          </div>
        )}

        {/* Dark overlay */}
        <div className={styles.overlay} />
        <motion.div className={styles.celebOverlay} style={{ opacity: pinkOverlay }} />

        {/* ── Floating Hearts ── */}
        <div className={styles.heartsLayer} aria-hidden="true">
          {HEARTS.map((h) => (
            <span key={h.id} className={styles.heart}
              style={{ left: h.l, animationDelay: h.d, animationDuration: h.dur, fontSize: h.s }}>
              {h.e}
            </span>
          ))}
        </div>

        {/* ── Intro Content ── */}
        <motion.div className={styles.intro} style={{ opacity: introOpacity, y: introY }}>
          <motion.div className={styles.badge}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}>
            <span className={styles.badgeDot} />
            With love ❤️
          </motion.div>
          <motion.h2 className={styles.introTitle}
            initial={{ opacity: 0, y: 35 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            for my <br />
            <span className={styles.shimmer}>purest blue</span>
            <br />
            <span className={styles.roseText}>rose 🌹</span>
          </motion.h2>
        </motion.div>

        {/* ── Scroll hint ── */}
        <motion.div className={styles.scrollHint} style={{ opacity: hintOpacity }}>
          <div className={styles.scrollLine} />
          <span className={styles.scrollLabel}>scroll for you 💙</span>
        </motion.div>

        {/* ── Happy Birthday ── */}
        <motion.div className={styles.birthday} style={{ opacity: bdOpacity }}>
          <motion.h1 className={styles.birthdayTitle} style={{ scale: bdScale, y: bdY }}>
            Happy<br />Birthday!
          </motion.h1>
          <motion.div className={styles.birthdaySub} style={{ opacity: subOpacity, y: subY }}>
            <span className={styles.bdEmoji}>🎂</span>
            <p className={styles.bdMsg}>
              Wishing you a day full of joy,<br />love & beautiful moments
            </p>
            <span className={styles.bdEmoji}>🎈</span>
          </motion.div>
          <motion.div className={styles.sparkles} style={{ opacity: subOpacity }}>
            {['✨','⭐','💫','⭐','✨'].map((s, i) => (
              <span key={i} className={styles.sparkle} style={{ animationDelay: `${i * 0.18}s` }}>{s}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Progress bar ── */}
        <motion.div className={styles.progressBar} style={{ scaleX: barScaleX }} />
      </div>
    </section>
  );
}

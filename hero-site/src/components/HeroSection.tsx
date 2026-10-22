'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './HeroSection.module.css';

// ─── Capture config ──────────────────────────────────────
const TARGET_FPS    = 24;   // frames/sec to capture
const CAPTURE_SPEED = 4;    // play at 4× → 10 s video captured in ~2.5 s
const CAPTURE_SCALE = 0.5;  // half-res capture (imperceptible on bg, 4× faster)
const UNLOCK_AT     = 0.20; // enable scrolling once 20% frames ready (~0.5 s)
// ─────────────────────────────────────────────────────────

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

// ─── Individual word revealed smoothly with scroll progress ─────
function ScrollWord({
  text,
  type = 'plain',
  range,
  progress,
  emoji,
}: {
  text: string;
  type?: 'plain' | 'shimmer' | 'blue' | 'rose' | 'birthday';
  range: [number, number];
  progress: any;
  emoji?: string;
}) {
  const [start, end] = range;
  const opacity = useTransform(progress, [start, end], [0, 1]);
  const y       = useTransform(progress, [start, end], [20, 0]);
  const scale   = useTransform(progress, [start, end], [0.88, 1]);

  const typeClass =
    type === 'shimmer'
      ? styles.wordShimmer
      : type === 'blue'
      ? styles.wordBlue
      : type === 'rose'
      ? styles.wordRose
      : type === 'birthday'
      ? styles.wordBirthday
      : styles.wordPlain;

  return (
    <motion.span
      className={`${styles.scrollWord} ${typeClass}`}
      style={{ opacity, y, scale }}
    >
      {text}
      {emoji && <span className={styles.wordEmoji}>{emoji}</span>}
    </motion.span>
  );
}

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const captureRef   = useRef<HTMLVideoElement>(null);
  // Sparse array — some slots undefined until captured
  const framesRef    = useRef<(ImageBitmap | undefined)[]>([]);
  const frameIdxRef  = useRef(0);
  const rafRef       = useRef<number>(0);
  const [phase, setPhase]       = useState<'loading' | 'ready'>('loading');
  const [progress, setProgress] = useState(0);

  // ── Scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 100, damping: 28, restDelta: 0.0001 });

  // ── Frame capture
  const captureFrames = useCallback(async () => {
    const video = captureRef.current;
    if (!video) return;

    // Wait for duration to be known
    await new Promise<void>((res) => {
      if (video.readyState >= 1) { res(); return; }
      video.addEventListener('loadedmetadata', () => res(), { once: true });
    });

    const duration    = video.duration;
    const totalFrames = Math.ceil(duration * TARGET_FPS);
    const frames: (ImageBitmap | undefined)[] = new Array(totalFrames);
    let captured = 0;
    let unlocked = false;

    // Half-res offscreen canvas — way faster than full-res
    const oc  = document.createElement('canvas');
    oc.width  = Math.round(video.videoWidth  * CAPTURE_SCALE);
    oc.height = Math.round(video.videoHeight * CAPTURE_SCALE);
    const ctx = oc.getContext('2d', { alpha: false })!;

    const tryUnlock = () => {
      setProgress(Math.round((captured / totalFrames) * 100));
      if (!unlocked && captured >= totalFrames * UNLOCK_AT) {
        unlocked = true;
        framesRef.current = frames; // share sparse array — draw loop handles gaps
        setPhase('ready');
      }
    };

    const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

    if (hasRVFC) {
      // ── FAST PATH: play at 4× speed, capture via requestVideoFrameCallback
      // 10 s video → ~2.5 s capture. No seek overhead at all.
      video.playbackRate = CAPTURE_SPEED;
      video.play();

      await new Promise<void>((done) => {
        const onFrame = (_: DOMHighResTimeStamp, meta: { mediaTime: number }) => {
          const pct = meta.mediaTime / duration;
          const idx = Math.min(Math.round(pct * (totalFrames - 1)), totalFrames - 1);

          if (!frames[idx]) {
            ctx.drawImage(video, 0, 0, oc.width, oc.height);
            // Fire-and-forget — createImageBitmap is ~instant (GPU copy)
            createImageBitmap(oc).then((bmp) => {
              frames[idx] = bmp;
              captured++;
              tryUnlock();
            });
          }

          if (meta.mediaTime < duration - 0.05) {
            (video as any).requestVideoFrameCallback(onFrame);
          } else {
            video.pause();
            // Brief wait for any in-flight createImageBitmap promises
            setTimeout(() => {
              framesRef.current = frames;
              setPhase('ready');
              setProgress(100);
              done();
            }, 400);
          }
        };

        (video as any).requestVideoFrameCallback(onFrame);
      });

    } else {
      // ── FALLBACK: seek-based at 12 fps (older browsers)
      const FFPS  = 12;
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
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;       // skip until layout is ready
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      lastIdx = -1;                          // force redraw on resize
    };
    setSize();
    const obs = new ResizeObserver(setSize);
    obs.observe(canvas);

    const unsub = scrollYProgress.on('change', (p) => {
      const total = framesRef.current.length;
      if (total > 0) frameIdxRef.current = Math.min(Math.round(p * (total - 1)), total - 1);
    });

    const draw = () => {
      // If canvas not sized yet, retry next frame
      if (canvas.width === 0 || canvas.height === 0) { setSize(); rafRef.current = requestAnimationFrame(draw); return; }

      let idx = frameIdxRef.current;
      const frames = framesRef.current;

      // If slot not yet captured, search nearest available frame (backward, then forward)
      if (!frames[idx]) {
        for (let i = idx - 1; i >= 0; i--) {
          if (frames[i]) { idx = i; break; }
        }
        if (!frames[idx]) {
          for (let i = idx + 1; i < frames.length; i++) {
            if (frames[i]) { idx = i; break; }
          }
        }
      }

      const bmp = frames[idx];
      if (bmp && idx !== lastIdx) {
        // ── Use canvas.width/height (physical pixels) — matches the buffer exactly
        const cw = canvas.width;
        const ch = canvas.height;
        // Cover-fit: scale bmp to fill canvas, crop excess
        const ir = bmp.width / bmp.height;  // image ratio
        const cr = cw / ch;                 // canvas ratio
        let sw = cw, sh = ch, sx = 0, sy = 0;
        if (ir > cr) { sw = ch * ir; sx = -(sw - cw) / 2; }  // wider than canvas → crop sides
        else         { sh = cw / ir; sy = -(sh - ch) / 2; }  // taller than canvas → crop top/bottom
        ctx.drawImage(bmp, sx, sy, sw, sh);
        lastIdx = idx;
      }
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => { unsub(); cancelAnimationFrame(rafRef.current); obs.disconnect(); };
  }, [scrollYProgress]);

  // ── Scroll transforms
  const hintOpacity  = useTransform(smooth, [0, 0.05], [1, 0]);
  const pinkOverlay  = useTransform(smooth, [0.68, 1],  [0, 0.55]);
  const wishOpacity  = useTransform(smooth, [0.88, 0.98], [0, 1]);
  const wishY        = useTransform(smooth, [0.88, 0.98], ['20px', '0px']);
  const barScaleX    = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className={styles.scrollContainer}>
      {/* Hidden video — capture source only, never shown */}
      <video ref={captureRef} src="/hero.mp4" muted playsInline preload="auto"
        className={styles.hiddenVideo} />

      <div className={styles.stickyFrame}>
        <canvas ref={canvasRef} className={styles.canvas} />

        {/* Loading overlay — disappears as soon as 20% frames ready */}
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

        {/* Animated word-by-word message loaded with scroll */}
        <div className={styles.messageContainer}>
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <span className={styles.badgeDot} />
            With love ❤️
          </motion.div>

          <div className={styles.phraseRow}>
            <ScrollWord text="To" range={[0.03, 0.12]} progress={smooth} />
            <ScrollWord text="My" range={[0.09, 0.18]} progress={smooth} />
          </div>

          <div className={styles.phraseRow}>
            <ScrollWord text="Rarest" type="shimmer" range={[0.17, 0.29]} progress={smooth} />
            <ScrollWord text="and" range={[0.27, 0.37]} progress={smooth} />
            <ScrollWord text="Purest" type="shimmer" range={[0.36, 0.49]} progress={smooth} />
          </div>

          <div className={styles.phraseRow}>
            <ScrollWord text="Blue" type="blue" range={[0.48, 0.61]} progress={smooth} />
            <ScrollWord text="Rose," type="rose" range={[0.59, 0.73]} progress={smooth} emoji="🌹" />
          </div>

          <div className={styles.phraseRowBirthday}>
            <ScrollWord text="Happy" type="birthday" range={[0.72, 0.86]} progress={smooth} />
            <ScrollWord text="Birthday." type="birthday" range={[0.83, 0.96]} progress={smooth} emoji="🎂" />
          </div>

          {/* Celebratory wish and sparkles reveal at end */}
          <motion.div className={styles.finalWish} style={{ opacity: wishOpacity, y: wishY }}>
            <div className={styles.birthdaySub}>
              <p className={styles.bdMsg}>
                Wishing you a day full of joy,<br />love & beautiful moments
              </p>
              <span className={styles.bdEmoji}>🎈</span>
            </div>
            <div className={styles.sparkles}>
              {['✨', '⭐', '💫', '⭐', '✨'].map((s, i) => (
                <span key={i} className={styles.sparkle} style={{ animationDelay: `${i * 0.18}s` }}>
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div className={styles.scrollHint} style={{ opacity: hintOpacity }}>
          <div className={styles.scrollLine} />
          <span className={styles.scrollLabel}>scroll for you 💙</span>
        </motion.div>

        <motion.div className={styles.progressBar} style={{ scaleX: barScaleX }} />
      </div>
    </section>
  );
}

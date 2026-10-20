'use client';

import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import styles from './HeroSection.module.css';

// SSR-safe deterministic hearts
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

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef    = useRef<HTMLVideoElement>(null);

  // Scroll progress tracks the full tall section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Spring-smoothed for visual transforms
  const smooth = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 35,
    restDelta: 0.0001,
  });

  // ── Video scrubbing: raw scroll → video currentTime (no spring lag)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Make sure video is fully seekable
    video.preload = 'auto';

    const unsub = scrollYProgress.on('change', (p) => {
      if (video.readyState >= 2 && video.duration) {
        // clamp to avoid edge glitch on last frame
        video.currentTime = Math.min(p * video.duration, video.duration - 0.001);
      }
    });

    return unsub;
  }, [scrollYProgress]);

  // ── Intro content — visible at start, fades out quickly
  const introOpacity = useTransform(smooth, [0, 0.15], [1, 0]);
  const introY       = useTransform(smooth, [0, 0.15], ['0px', '-60px']);

  // ── Scroll hint fades very early
  const hintOpacity = useTransform(smooth, [0, 0.07], [1, 0]);

  // ── Celebratory pink overlay builds toward the end
  const pinkOverlay = useTransform(smooth, [0.65, 1], [0, 0.55]);

  // ── Happy Birthday reveal
  const bdOpacity = useTransform(smooth, [0.72, 0.90], [0, 1]);
  const bdScale   = useTransform(smooth, [0.72, 0.95], [0.65, 1]);
  const bdY       = useTransform(smooth, [0.72, 0.90], ['70px', '0px']);

  // ── Subtitle + emojis pop in slightly after title
  const subOpacity = useTransform(smooth, [0.85, 0.97], [0, 1]);
  const subY       = useTransform(smooth, [0.85, 0.97], ['30px', '0px']);

  // ── Progress bar
  const barScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className={styles.scrollContainer}>
      {/* ── Sticky viewport ── */}
      <div className={styles.stickyFrame}>

        {/* VIDEO — scrubbed frame by frame */}
        <video
          ref={videoRef}
          className={styles.video}
          src="/hero.mp4"
          muted
          playsInline
          preload="auto"
        />

        {/* Dark gradient overlay */}
        <div className={styles.overlay} />

        {/* Pink/purple glow that intensifies at the end */}
        <motion.div className={styles.celebOverlay} style={{ opacity: pinkOverlay }} />

        {/* ── Floating Hearts ── */}
        <div className={styles.heartsLayer} aria-hidden="true">
          {HEARTS.map((h) => (
            <span
              key={h.id}
              className={styles.heart}
              style={{
                left: h.l,
                animationDelay: h.d,
                animationDuration: h.dur,
                fontSize: h.s,
              }}
            >
              {h.e}
            </span>
          ))}
        </div>

        {/* ── Intro Content ── */}
        <motion.div
          className={styles.intro}
          style={{ opacity: introOpacity, y: introY }}
        >
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <span className={styles.badgeDot} />
            With love ❤️
          </motion.div>

          <motion.h2
            className={styles.introTitle}
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
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
          <motion.h1
            className={styles.birthdayTitle}
            style={{ scale: bdScale, y: bdY }}
          >
            Happy
            <br />
            Birthday!
          </motion.h1>

          <motion.div
            className={styles.birthdaySub}
            style={{ opacity: subOpacity, y: subY }}
          >
            <span className={styles.bdEmoji}>🎂</span>
            <p className={styles.bdMsg}>
              Wishing you a day full of joy,<br />love & beautiful moments
            </p>
            <span className={styles.bdEmoji}>🎈</span>
          </motion.div>

          {/* Sparkle row */}
          <motion.div className={styles.sparkles} style={{ opacity: subOpacity }}>
            {['✨','⭐','💫','⭐','✨'].map((s, i) => (
              <span key={i} className={styles.sparkle} style={{ animationDelay: `${i * 0.18}s` }}>{s}</span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Bottom progress bar ── */}
        <motion.div className={styles.progressBar} style={{ scaleX: barScaleX }} />
      </div>
    </section>
  );
}

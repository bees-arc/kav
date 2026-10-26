'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './FerrisWheelHero.module.css';

interface FerrisWheelHeroProps {
  onBackClick?: () => void;
  onNextClick?: () => void;
}

export default function FerrisWheelHero({
  onBackClick,
  onNextClick,
}: FerrisWheelHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <section className={styles.pageContainer} aria-label="Sky View Ferris Wheel Celebration">
      {/* ── Background Video ── */}
      <div className={styles.videoWrapper}>
        <video
          ref={videoRef}
          src="/Animate_image_with_matching_frames_1080p_20261026211056.mp4"
          autoPlay
          loop
          muted
          playsInline
          className={styles.videoElement}
        />
        {/* Soft Vignette Overlay for aesthetics & contrast */}
        <div className={styles.softOverlay} />
      </div>

      {/* ── Top Left Floating Back Button ── */}
      {onBackClick && (
        <motion.button
          type="button"
          className={styles.backBtn}
          onClick={onBackClick}
          aria-label="Go back to birthday wish letter"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          <svg
            className={styles.backArrowSvg}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Back</span>
        </motion.button>
      )}

      {/* ── Ethereal Top Heading ── */}
      <motion.div
        className={styles.headerArea}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className={styles.tagline}>A Sky Full of Memories 🎡</span>
        <h1 className={styles.mainTitle}>
          Higher Than The Clouds
        </h1>
        <p className={styles.subSubtitle}>
          With every turn, may your life soar to breathtaking new heights, Kaawya. 💙
        </p>
      </motion.div>

      {/* ── Bottom Floating Card / Action ── */}
      <motion.div
        className={styles.bottomArea}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.glassCard}>
          <p className={styles.quoteText}>
            &ldquo;The best views in life are the ones we cherish together.&rdquo; ✨
          </p>
          {onNextClick && (
            <button
              type="button"
              className={styles.exploreBtn}
              onClick={onNextClick}
              aria-label="Continue to celebration experience"
            >
              <span>Our Story & Celebration 💕</span>
              <span className={styles.btnArrow}>→</span>
            </button>
          )}
        </div>
      </motion.div>
    </section>
  );
}

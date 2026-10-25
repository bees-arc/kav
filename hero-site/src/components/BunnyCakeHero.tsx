'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './BunnyCakeHero.module.css';

interface BunnyCakeHeroProps {
  onScrollDown?: () => void;
  nextSectionId?: string;
}

export default function BunnyCakeHero({
  onScrollDown,
  nextSectionId = 'interactive-story',
}: BunnyCakeHeroProps) {
  const sparkles = useMemo(
    () => [
      { id: 1, top: '22%', left: '25%', size: 6, delay: '0s' },
      { id: 2, top: '35%', left: '72%', size: 8, delay: '1.5s' },
      { id: 3, top: '55%', left: '18%', size: 5, delay: '2.8s' },
      { id: 4, top: '68%', left: '82%', size: 7, delay: '0.7s' },
      { id: 5, top: '40%', left: '48%', size: 9, delay: '2.1s' },
      { id: 6, top: '80%', left: '35%', size: 6, delay: '3.4s' },
    ],
    []
  );

  const handleScrollClick = () => {
    if (onScrollDown) {
      onScrollDown();
      return;
    }
    const targetElement = document.getElementById(nextSectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.cakeContainer} aria-label="Kaawya's 23rd Birthday Cake">
      {/* ── Full Screen Background Image (Exact screen size 100vw, 100dvh) ── */}
      <Image
        src="/Dreamy Blue Bunny Birthday Cake.png"
        alt="Dreamy Blue Bunny Birthday Cake for Kaawya"
        fill
        priority
        sizes="100vw"
        className={styles.bgImage}
        quality={95}
      />

      {/* Atmospheric Overlays & Glows */}
      <div className={styles.overlayGradient} aria-hidden="true" />
      <div className={styles.candleGlow} aria-hidden="true" />

      {/* Floating Fairy Sparkles */}
      <div className={styles.sparklesContainer} aria-hidden="true">
        {sparkles.map((s) => (
          <span
            key={s.id}
            className={styles.fairySparkle}
            style={{
              top: s.top,
              left: s.left,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>

      {/* ── Top Header Information ── */}
      <motion.div
        className={styles.topArea}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.birthdayBadge}>
          <span className={styles.badgeDot} />
          <span>Kaawya&apos;s 23rd Celebration 🎂</span>
        </div>

        <h1 className={styles.cakeTitle}>
          Make a Wish, <br />
          <span className={styles.cakeGradientText}>Sweet Blue Rose</span>
        </h1>

        <p className={styles.cakeSubtitle}>
          &ldquo;May every candle light the way to your happiest dreams and purest joy.&rdquo; 💙✨
        </p>
      </motion.div>

      {/* ── Bottom Section with Pulsing Scroll Arrow ── */}
      <motion.div
        className={styles.bottomArea}
        onClick={handleScrollClick}
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
      >
        <span className={styles.scrollLabel}>
          Scroll to open your story 💌
        </span>
        <button
          type="button"
          className={styles.scrollArrowBtn}
          onClick={handleScrollClick}
          aria-label="Scroll down to open your story"
        >
          <div className={styles.arrowRingGlow} aria-hidden="true" />
          <svg
            className={styles.arrowSvg}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      </motion.div>
    </section>
  );
}

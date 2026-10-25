'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './SanctuaryHero.module.css';

interface SanctuaryHeroProps {
  onNextClick?: () => void;
  nextSectionId?: string;
}

export default function SanctuaryHero({
  onNextClick,
  nextSectionId = 'interactive-story',
}: SanctuaryHeroProps) {
  const sparkles = useMemo(
    () => [
      { id: 1, top: '15%', left: '20%', size: 6, delay: '0s' },
      { id: 2, top: '28%', left: '78%', size: 8, delay: '1.2s' },
      { id: 3, top: '45%', left: '12%', size: 5, delay: '2.4s' },
      { id: 4, top: '62%', left: '84%', size: 7, delay: '0.8s' },
      { id: 5, top: '78%', left: '26%', size: 6, delay: '1.8s' },
      { id: 6, top: '88%', left: '72%', size: 8, delay: '3.1s' },
    ],
    []
  );

  const handleArrowClick = () => {
    if (onNextClick) {
      onNextClick();
      return;
    }
    const targetElement = document.getElementById(nextSectionId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className={styles.heroContainer} aria-label="Kaawya's Birthday Greeting">
      {/* ── Background Watercolor Artwork ── */}
      <div className={styles.imageLayer}>
        <Image
          src="/Dreamy Underwater Reef Sanctuary.png"
          alt="Dreamy Underwater Reef Sanctuary"
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
          quality={95}
        />
      </div>

      {/* ── Soft Central Water Wash Overlay & Lighting ── */}
      <div className={styles.centerClearing} aria-hidden="true" />
      <div className={styles.bottomBlend} aria-hidden="true" />

      {/* ── Subtle Floating Sparkles ── */}
      <div className={styles.ambientSparkles} aria-hidden="true">
        {sparkles.map((s) => (
          <span
            key={s.id}
            className={styles.sparkle}
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

      {/* ── Centered Birthday Letter (Matches Image Layout Exactly) ── */}
      <motion.div
        className={styles.contentCard}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header Group */}
        <div className={styles.headerGroup}>
          <h1 className={styles.mainTitle}>Happy Birthday,</h1>
          <div className={styles.nameTitle}>
            <span>Kaawya</span>
            <span className={styles.heartGlyph}>♡</span>
          </div>

          {/* Delicate Seashell Ornament */}
          <div className={styles.ornamentDivider} aria-hidden="true">
            <span className={styles.ornamentLine} />
            <span className={styles.shellIcon}>🐚</span>
            <span className={styles.ornamentLine} />
          </div>

          <h2 className={styles.subTitle}>Before the Magic Begins…</h2>
        </div>

        {/* Letter Body Paragraphs */}
        <div className={styles.letterBody}>
          <p className={styles.paragraph}>
            Today isn&apos;t just another day…<br />
            It&apos;s the day the world was gifted someone<br />
            as beautiful and precious as you.
          </p>

          <p className={styles.paragraph}>
            There&apos;s something so special about your smile,<br />
            the kindness in your heart, and the way you give love<br />
            so effortlessly, without ever expecting anything in return.
          </p>

          <p className={styles.paragraph}>
            It&apos;s those little things you do without even realizing,<br />
            the gentleness of your soul, and the beautiful way you<br />
            simply exist that make you so incredibly precious.
          </p>

          <p className={styles.paragraph}>
            I wish you could see yourself through my eyes,<br />
            just for a moment… Maybe then you&apos;d understand<br />
            how truly special you are.
          </p>

          <p className={styles.paragraph}>
            This little space was made just for you, to remind you<br />
            that you deserve all the love, happiness, and beautiful<br />
            things this world has to offer.
          </p>

          <p className={styles.paragraph}>
            So keep smiling, keep dreaming, and never stop being<br />
            the beautiful soul you are.
          </p>

          <p className={styles.paragraph}>
            Because some kinds of beauty are too rare<br />
            to be captured in photographs or described in words…
          </p>

          {/* Calligraphic Quote */}
          <p className={styles.feltQuote}>They can only be felt.</p>

          <p className={styles.paragraph}>
            And you, Kaawya, are one of those<br />
            beautiful, once-in-a-lifetime kinds of magic. 💙
          </p>
        </div>

        {/* Delicate Heart Filigree */}
        <div className={styles.filigreeDivider} aria-hidden="true">
          <span className={styles.filigreeLine} />
          <span className={styles.filigreeHeart}>♡</span>
          <span className={styles.filigreeLine} />
        </div>

        {/* Action Pill Button */}
        <motion.button
          type="button"
          className={styles.actionPillBtn}
          onClick={handleArrowClick}
          aria-label="Click the arrow to begin your celebration"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className={styles.btnLabel}>
            Click the arrow to begin your celebration. 💙
          </span>
          <span className={styles.arrowCircle}>
            <svg
              className={styles.arrowSvg}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
}

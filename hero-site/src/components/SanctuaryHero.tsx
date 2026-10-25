'use client';

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
      {/* Full screen background artwork */}
      <Image
        src="/Dreamy Underwater Reef Sanctuary.webp"
        alt="Dreamy Underwater Reef Sanctuary"
        fill
        priority
        sizes="100vw"
        className={styles.bgImage}
        quality={95}
      />

      {/* Central lighting overlay */}
      <div className={styles.centerWashOverlay} aria-hidden="true" />

      {/* Centered Text Overlay */}
      <motion.div
        className={styles.textOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.headerGroup}>
          <h1 className={styles.mainTitle}>Happy Birthday,</h1>
          <div className={styles.nameTitle}>
            <span>Kaawya</span>
            <span className={styles.heartGlyph}>♡</span>
          </div>

          <div className={styles.shellDivider} aria-hidden="true">
            <span className={styles.shellLine} />
            <span className={styles.shellIcon}>🐚</span>
            <span className={styles.shellLine} />
          </div>

          <h2 className={styles.subTitle}>Before the Magic Begins…</h2>
        </div>

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

          <p className={styles.finalParagraph}>
            And you, Kaawya, are one of those<br />
            beautiful, once-in-a-lifetime kinds of magic. 💙
          </p>
        </div>

        <div className={styles.filigreeDivider} aria-hidden="true">
          <span className={styles.filigreeLine} />
          <span className={styles.filigreeHeart}>♡</span>
          <span className={styles.filigreeLine} />
        </div>

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

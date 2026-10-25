'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './BunnyCakeHero.module.css';

interface BunnyCakeHeroProps {
  onBackClick?: () => void;
  onNextClick?: () => void;
}

export default function BunnyCakeHero({
  onBackClick,
  onNextClick,
}: BunnyCakeHeroProps) {
  return (
    <section className={styles.cakeContainer} aria-label="Dreamy Blue Bunny Birthday Cake">
      {/* ── Full Screen Background Image (Exact screen size 100vw, 100dvh) ── */}
      <Image
        src="/Dreamy Blue Bunny Birthday Cake.png"
        alt="Dreamy Blue Bunny Birthday Cake"
        fill
        priority
        sizes="100vw"
        className={styles.bgImage}
        quality={95}
      />

      {/* Atmospheric center light wash */}
      <div className={styles.centerWashOverlay} aria-hidden="true" />

      {/* ── Back Button (Top Left) ── */}
      {onBackClick && (
        <motion.button
          type="button"
          className={styles.backBtn}
          onClick={onBackClick}
          aria-label="Go back to previous page"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
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

      {/* ── Top Typography Group (Exact match to image) ── */}
      <motion.div
        className={styles.topContentArea}
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Top Seashell Divider */}
        <div className={styles.shellDivider} aria-hidden="true">
          <span className={styles.shellLine} />
          <span className={styles.shellIcon}>🐚</span>
          <span className={styles.shellLine} />
        </div>

        {/* First Poem Paragraph */}
        <p className={styles.upperPoem}>
          Close your eyes<br />
          and think of something lovely
        </p>

        {/* Small Heart Divider */}
        <div className={styles.heartDivider} aria-hidden="true">
          <span className={styles.heartDividerLine} />
          <span className={styles.heartDividerIcon}>♡</span>
          <span className={styles.heartDividerLine} />
        </div>

        {/* Main "Make a Wish" Calligraphy */}
        <div className={styles.wishTitleWrap}>
          <h1 className={styles.wishTitle}>Make a Wish</h1>
          <span className={styles.titleHeartR} aria-hidden="true">♡</span>
        </div>

        {/* Lower Seashell Divider */}
        <div className={styles.shellDivider} aria-hidden="true">
          <span className={styles.shellLine} />
          <span className={styles.shellIcon}>🐚</span>
          <span className={styles.shellLine} />
        </div>

        {/* Second Instruction Paragraph */}
        <p className={styles.lowerInstruction}>
          Tap the button and watch<br />
          your candles light up the room
        </p>
      </motion.div>

      {/* ── Bottom Action Pill: "Make a Wish ♡ >" (Exact match to image) ── */}
      <motion.div
        className={styles.bottomArea}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, delay: 0.45, ease: 'easeOut' }}
      >
        <button
          type="button"
          className={styles.actionPillBtn}
          onClick={onNextClick}
          aria-label="Make a wish and light the candles"
        >
          <div className={styles.btnTextWrap}>
            <span className={styles.btnWishScript}>
              Make a Wish <span className={styles.btnScriptHeart}>♡</span>
            </span>
            <span className={styles.btnTinyHeartFlourish} aria-hidden="true">
              • ♡ •
            </span>
          </div>

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
        </button>
      </motion.div>
    </section>
  );
}

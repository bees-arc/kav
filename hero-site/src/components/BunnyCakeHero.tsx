'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import styles from './BunnyCakeHero.module.css';

interface BunnyCakeHeroProps {
  onBackClick?: () => void;
  onNextClick?: () => void;
}

export default function BunnyCakeHero({
  onBackClick,
  onNextClick,
}: BunnyCakeHeroProps) {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleMakeAWish = () => {
    if (candlesBlown) return;

    // Trigger candle blow-out animation
    setCandlesBlown(true);

    // Launch celebratory confetti burst
    confetti({
      particleCount: 55,
      spread: 75,
      origin: { y: 0.62 },
      colors: ['#38bdf8', '#818cf8', '#ffd700', '#f472b6', '#ffffff'],
    });

    // Reveal birthday letter after candles extinguish
    setTimeout(() => {
      setShowModal(true);
    }, 950);
  };

  return (
    <section className={styles.cakeContainer} aria-label="Dreamy Blue Bunny Birthday Cake">
      {/* ── Full Screen Stage: Centers aspect-ratio image and locks flame overlays ── */}
      <div className={styles.imageStage}>
        <div className={styles.imageInner}>
          <Image
            src="/Dreamy Blue Birthday Bunny Cake.webp"
            alt="Dreamy Blue Birthday Bunny Cake"
            fill
            priority
            sizes="100vw"
            className={`${styles.bgImage} ${candlesBlown ? styles.dimmedBg : ''}`}
            quality={95}
          />

          {/* ── Interactive Candle Flames locked to exact image coordinates ── */}
          <div className={styles.flameContainer} aria-hidden="true">
            {/* Left flame ("2") */}
            <div
              className={`${styles.candleFlameLeft} ${candlesBlown ? styles.flameBlowing : ''}`}
            />
            {/* Right flame ("3") */}
            <div
              className={`${styles.candleFlameRight} ${candlesBlown ? styles.flameBlowing : ''}`}
            />

            {/* Smoke Wisps when blown out */}
            {candlesBlown && (
              <>
                <div className={styles.smokeWispLeft} />
                <div className={styles.smokeWispRight} />
              </>
            )}
          </div>
        </div>
      </div>

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
          onClick={handleMakeAWish}
          aria-label="Make a wish and blow out the candles"
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

      {/* ── Candle Blow-Out Wish Modal ── */}
      <AnimatePresence>
        {showModal && (
          <div className={styles.modalBackdrop}>
            <motion.div
              className={styles.modalCard}
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 22, stiffness: 240 }}
            >
              <span className={styles.modalSparkleTop}>✨🎂✨</span>

              <h2 className={styles.modalTitle}>
                Happiest Birthday, Kavya!<span className={styles.modalHeartRed}>❤️</span>
              </h2>

              <div className={styles.modalBody}>
                <p className={styles.modalPara}>
                  As you blow out those candles, I hope every little wish you make finds its way to you...
                </p>

                <p className={styles.modalPara}>
                  And everything you hold close to your heart, every beautiful dream and every unspoken wish, slowly finds its way into reality. 💙
                </p>

                <p className={styles.modalPara}>
                  May this new chapter of your life bring you the kind of happiness that doesn&apos;t simply come and go, but stays with you, quietly and beautifully.
                </p>

                <p className={styles.modalPara}>
                  May your days be filled with moments that turn into unforgettable memories, dreams that blossom into reality, and countless little reasons to smile, even when there&apos;s no particular reason at all.
                </p>

                <p className={styles.modalPara}>
                  Because you deserve a life filled with beautiful surprises, gentle moments, and all the happiness your heart could ever wish for. ❤️
                </p>
              </div>

              <button
                type="button"
                className={styles.modalContinueBtn}
                onClick={onNextClick}
              >
                <span>Continue to Your Story 💕</span>
                <span>→</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

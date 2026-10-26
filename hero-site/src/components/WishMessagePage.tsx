'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import styles from './WishMessagePage.module.css';

interface WishMessagePageProps {
  onBackClick?: () => void;
  onNextClick?: () => void;
}

export default function WishMessagePage({
  onBackClick,
  onNextClick,
}: WishMessagePageProps) {
  return (
    <section className={styles.pageContainer} aria-label="Birthday Wish Letter for Kaawya">
      {/* ── Artwork Frame matching 675 x 1200 ratio ── */}
      <div className={styles.artworkFrame}>
        {/* Full Frame Ribbon Background Image: download (4).webp */}
        <Image
          src="/download (4).webp"
          alt="Coquette Blue Ribbon Background"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 550px"
          className={styles.ribbonBg}
          quality={95}
        />

        {/* Back Button */}
        {onBackClick && (
          <motion.button
            type="button"
            className={styles.backBtn}
            onClick={onBackClick}
            aria-label="Go back to cake page"
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

        {/* ── Direct Text Content (Matching Mockup Exactly, within one screen) ── */}
        <motion.div
          className={styles.textContent}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Titles Group */}
          <div className={styles.titleGroup}>
            <h1 className={styles.happiestText}>Happiest</h1>

            <div className={styles.birthdayScriptWrap}>
              <span className={styles.birthdayScript}>Birthday,</span>
              <span className={styles.birthdayHeart} aria-hidden="true">
                ♡
              </span>
            </div>

            <h2 className={styles.kaawyaText}>
              <span>Kaawya!</span>
              <span className={styles.kaawyaHeart}>♡</span>
            </h2>
          </div>

          {/* Delicate Blue Heart Divider */}
          <div className={styles.heartDivider} aria-hidden="true">
            <span className={styles.heartDividerLine} />
            <span className={styles.heartDividerIcon}>💙</span>
            <span className={styles.heartDividerLine} />
          </div>

          {/* Body Paragraphs */}
          <div className={styles.paragraphsBody}>
            <p className={styles.para}>
              As you blow out those candles, I hope every little wish<br />
              you make finds its way to you...
            </p>

            <p className={styles.para}>
              And everything you hold close to your heart,<br />
              every beautiful dream and every unspoken wish,<br />
              slowly finds its way into reality. 💙
            </p>

            <p className={styles.para}>
              May this new chapter of your life bring you the kind of<br />
              happiness that doesn&apos;t simply come and go, but stays<br />
              with you, quietly and beautifully.
            </p>

            <p className={styles.para}>
              May your days be filled with moments that turn into<br />
              unforgettable memories, dreams that blossom into reality,<br />
              and countless little reasons to smile, even when there&apos;s<br />
              no particular reason at all.
            </p>

            <p className={styles.para}>
              Because you deserve a life filled with beautiful surprises,<br />
              gentle moments, and all the happiness your heart<br />
              could ever wish for. ❤️
            </p>
          </div>

          {/* Bottom Delicate Blue Heart Divider */}
          <div className={styles.heartDivider} aria-hidden="true">
            <span className={styles.heartDividerLine} />
            <span className={styles.heartDividerIcon}>💙</span>
            <span className={styles.heartDividerLine} />
          </div>

          {/* Action Continue Button */}
          {onNextClick && (
            <div className={styles.actionBottom}>
              <button
                type="button"
                className={styles.continueBtn}
                onClick={onNextClick}
                aria-label="Continue to celebration story"
              >
                <span>Continue 💕</span>
                <span>→</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

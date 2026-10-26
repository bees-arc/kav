'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import styles from './Navbar.module.css';

interface NavbarProps {
  progress?: MotionValue<number>;
}

export default function Navbar({ progress }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { scrollY, scrollYProgress: defaultScrollYProgress } = useScroll();
  const effectiveProgress = progress || defaultScrollYProgress;

  useEffect(() => {
    if (progress) {
      const unsub = progress.on('change', (p: number) => {
        setScrolled(p > 0.04);
        setIsComplete(p >= 0.96);
      });
      return () => unsub();
    } else {
      const unsubY = scrollY.on('change', (v: number) => setScrolled(v > 60));
      const unsubProgress = defaultScrollYProgress.on('change', (p: number) => {
        setIsComplete(p >= 0.96);
      });
      return () => {
        unsubY();
        unsubProgress();
      };
    }
  }, [progress, scrollY, defaultScrollYProgress]);

  // Transform scroll progress (0 -> 1) into top clip percentage (100% -> 0%)
  const clipTop = useTransform(effectiveProgress, [0, 1], [100, 0]);
  const clipPath = useTransform(clipTop, (val) => `inset(${val}% 0% 0% 0%)`);

  // Heart glow intensifies as it fills up with red
  const heartGlow = useTransform(
    effectiveProgress,
    [0, 0.4, 0.8, 1],
    [
      'drop-shadow(0 0 0px rgba(255, 23, 68, 0))',
      'drop-shadow(0 0 4px rgba(255, 23, 68, 0.4))',
      'drop-shadow(0 0 8px rgba(255, 23, 68, 0.7))',
      'drop-shadow(0 0 14px rgba(255, 23, 68, 0.95)) drop-shadow(0 0 20px rgba(255, 107, 157, 0.7))',
    ]
  );

  return (
    <motion.nav
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
    >
      <span className={styles.logo}>🎂 Boo&apos;s 23</span>

      <div className={styles.rightSection}>
        <span className={styles.tagline}>Scroll to celebrate</span>

        <div
          className={`${styles.heartContainer} ${isComplete ? styles.heartBeating : ''}`}
          title="Scroll progress"
        >
          {/* Circular Progress Border Ring that completes with scroll */}
          <svg className={styles.heartRingSvg} viewBox="0 0 38 38">
            <defs>
              <linearGradient id="navRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff1744" />
                <stop offset="50%" stopColor="#ff5252" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>

            {/* Faint base circle track */}
            <circle
              cx="19"
              cy="19"
              r="17"
              fill="none"
              stroke="rgba(255, 107, 157, 0.2)"
              strokeWidth="1.8"
            />

            {/* Active animated stroke completing with scroll */}
            <motion.circle
              cx="19"
              cy="19"
              r="17"
              fill="none"
              stroke="url(#navRingGrad)"
              strokeWidth="2.4"
              strokeLinecap="round"
              style={{ pathLength: effectiveProgress }}
              transform="rotate(-90 19 19)"
            />
          </svg>

          <div className={styles.heartWrapper}>
            {/* Base Heart (Empty Outline & soft translucent backdrop) */}
            <svg
              className={styles.heartSvg}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="none"
                stroke="rgba(255, 200, 220, 0.45)"
                strokeWidth="1.2"
              />
            </svg>

            {/* Filled Red Heart that completes from bottom to top with scroll */}
            <motion.div
              className={styles.heartFillLayer}
              style={{ clipPath, filter: heartGlow }}
            >
              <svg
                className={styles.heartSvg}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="navHeartRedGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#c62828" />
                    <stop offset="50%" stopColor="#ff1744" />
                    <stop offset="100%" stopColor="#ff5252" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="url(#navHeartRedGrad)"
                  stroke="#ff1744"
                  strokeWidth="0.8"
                />
              </svg>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (v) => setScrolled(v > 60));
  }, [scrollY]);

  return (
    <motion.nav
      className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: 'easeOut' }}
    >
      <a href="/" className={styles.logo}>STUDIO</a>

      <div className={styles.links}>
        <a href="#work" className={styles.link}>Work</a>
        <a href="#about" className={styles.link}>About</a>
        <a href="#contact" className={styles.link}>Contact</a>
      </div>

      <a href="#contact" className={styles.cta}>
        Let&apos;s Talk
      </a>
    </motion.nav>
  );
}

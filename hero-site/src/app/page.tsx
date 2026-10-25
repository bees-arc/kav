'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SanctuaryHero from '@/components/SanctuaryHero';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  const [started, setStarted] = useState(false);

  // Prevent scrolling down while on the initial hero screen
  useEffect(() => {
    if (!started) {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [started]);

  return (
    <main style={{ position: 'relative', overflowX: 'hidden', minHeight: '100dvh' }}>
      <AnimatePresence mode="wait">
        {!started ? (
          <motion.div
            key="sanctuary-intro-page"
            initial={{ opacity: 1, x: 0 }}
            exit={{
              x: '100%',
              opacity: 0,
              transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
            }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              width: '100%',
              height: '100dvh',
              overflow: 'hidden',
            }}
          >
            <SanctuaryHero onNextClick={() => setStarted(true)} />
          </motion.div>
        ) : (
          <motion.div
            key="interactive-celebration-page"
            initial={{ opacity: 0, x: '-15%' }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <Navbar />
            <HeroSection />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

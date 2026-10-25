'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SanctuaryHero from '@/components/SanctuaryHero';
import BunnyCakeHero from '@/components/BunnyCakeHero';
import WishMessagePage from '@/components/WishMessagePage';
import HeroSection from '@/components/HeroSection';

type PageStep = 'sanctuary' | 'cake' | 'wish' | 'experience';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<PageStep>('sanctuary');
  const [direction, setDirection] = useState<1 | -1>(1);

  // Lock body scroll on the full-screen interactive pages
  useEffect(() => {
    if (currentStep !== 'experience') {
      document.body.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      window.scrollTo(0, 0);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [currentStep]);

  return (
    <main style={{ position: 'relative', overflowX: 'hidden', minHeight: '100dvh' }}>
      <AnimatePresence mode="wait" custom={direction}>
        {currentStep === 'sanctuary' && (
          <motion.div
            key="step-sanctuary"
            custom={direction}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              x: '100%',
              opacity: 0,
              transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              width: '100%',
              height: '100dvh',
              overflow: 'hidden',
            }}
          >
            <SanctuaryHero
              onNextClick={() => {
                setDirection(1);
                setCurrentStep('cake');
              }}
            />
          </motion.div>
        )}

        {currentStep === 'cake' && (
          <motion.div
            key="step-cake"
            custom={direction}
            initial={{ opacity: 0, scale: 0.95, y: direction === 1 ? '15%' : '-15%' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: direction === 1 ? '-25%' : '25%',
              transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.8 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              width: '100%',
              height: '100dvh',
              overflow: 'hidden',
            }}
          >
            <BunnyCakeHero
              onBackClick={() => {
                setDirection(-1);
                setCurrentStep('sanctuary');
              }}
              onNextClick={() => {
                setDirection(1);
                setCurrentStep('wish');
              }}
            />
          </motion.div>
        )}

        {currentStep === 'wish' && (
          <motion.div
            key="step-wish"
            custom={direction}
            initial={{ opacity: 0, y: direction === 1 ? '45%' : '-35%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{
              opacity: 0,
              y: direction === 1 ? '-40%' : '40%',
              transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 220, mass: 0.8 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              width: '100%',
              height: '100dvh',
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: '#ffffff',
            }}
          >
            <WishMessagePage
              onBackClick={() => {
                setDirection(-1);
                setCurrentStep('cake');
              }}
              onNextClick={() => {
                setDirection(1);
                setCurrentStep('experience');
              }}
            />
          </motion.div>
        )}

        {currentStep === 'experience' && (
          <motion.div
            key="step-experience"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <Navbar />
            <div id="original-hero">
              <HeroSection />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

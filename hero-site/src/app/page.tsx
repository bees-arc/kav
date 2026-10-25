'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import SanctuaryHero from '@/components/SanctuaryHero';
import BunnyCakeHero from '@/components/BunnyCakeHero';
import HeroSection from '@/components/HeroSection';

type PageStep = 'sanctuary' | 'cake' | 'experience';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<PageStep>('sanctuary');
  const [direction, setDirection] = useState<1 | -1>(1);

  // Lock body scroll on the first two static full-screen pages
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

  const goToCake = () => {
    setDirection(1);
    setCurrentStep('cake');
  };

  const goBackToSanctuary = () => {
    setDirection(-1);
    setCurrentStep('sanctuary');
  };

  const goToExperience = () => {
    setDirection(1);
    setCurrentStep('experience');
  };

  return (
    <main style={{ position: 'relative', overflowX: 'hidden', minHeight: '100dvh' }}>
      <AnimatePresence mode="wait" custom={direction}>
        {currentStep === 'sanctuary' && (
          <motion.div
            key="step-sanctuary"
            custom={direction}
            initial={{ opacity: 0, x: direction === 1 ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              x: direction === 1 ? '100%' : '-100%',
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
            <SanctuaryHero onNextClick={goToCake} />
          </motion.div>
        )}

        {currentStep === 'cake' && (
          <motion.div
            key="step-cake"
            custom={direction}
            initial={{ opacity: 0, x: direction === 1 ? -60 : 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{
              x: direction === 1 ? '100%' : '-100%',
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
            <BunnyCakeHero
              onBackClick={goBackToSanctuary}
              onNextClick={goToExperience}
            />
          </motion.div>
        )}

        {currentStep === 'experience' && (
          <motion.div
            key="step-experience"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
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

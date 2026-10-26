'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import styles from './FerrisWheelHero.module.css';

interface FerrisWheelHeroProps {
  onBackClick?: () => void;
  onNextClick?: () => void;
}

interface VideoFrameCallbackMetadata {
  mediaTime: number;
  [key: string]: unknown;
}

type HTMLVideoElementWithCallback = HTMLVideoElement & {
  requestVideoFrameCallback: (
    callback: (now: DOMHighResTimeStamp, metadata: VideoFrameCallbackMetadata) => void
  ) => number;
};

const TARGET_FPS = 30; // 30 fps for 2-second video = ~60 frames
const CAPTURE_SPEED = 2; // play at 2x speed for instant ~1s capture
const CAPTURE_SCALE = 1.0; // full native 1080p crispness

export default function FerrisWheelHero({
  onBackClick,
  onNextClick,
}: FerrisWheelHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const captureVideoRef = useRef<HTMLVideoElement>(null);

  const framesRef = useRef<(ImageBitmap | undefined)[]>([]);
  const frameIdxRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const autoNextTriggeredRef = useRef<boolean>(false);

  const [isReady, setIsReady] = useState(false);

  // ── Scroll progress tracking inside the container ──
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 320,
    damping: 42,
    mass: 0.4,
  });

  // Fade out scroll hint when user starts scrolling
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);
  const bottomActionOpacity = useTransform(scrollYProgress, [0.85, 0.98], [0, 1]);
  const bottomActionY = useTransform(scrollYProgress, [0.85, 0.98], ['20px', '0px']);

  // ── Video Frame Capture ──
  const captureFrames = useCallback(async () => {
    const video = captureVideoRef.current;
    if (!video) return;

    // Ensure metadata is loaded
    await new Promise<void>((resolve) => {
      if (video.readyState >= 1) {
        resolve();
        return;
      }
      video.addEventListener('loadedmetadata', () => resolve(), { once: true });
    });

    const duration = video.duration || 2.0;
    const totalFrames = Math.max(Math.ceil(duration * TARGET_FPS), 30);
    const frames: (ImageBitmap | undefined)[] = new Array(totalFrames);

    const offCanvas = document.createElement('canvas');
    offCanvas.width = Math.round((video.videoWidth || 1080) * CAPTURE_SCALE);
    offCanvas.height = Math.round((video.videoHeight || 1920) * CAPTURE_SCALE);
    const offCtx = offCanvas.getContext('2d', { alpha: false })!;

    const hasRVFC = 'requestVideoFrameCallback' in HTMLVideoElement.prototype;

    if (hasRVFC) {
      video.playbackRate = CAPTURE_SPEED;
      video.muted = true;
      try {
        await video.play();
      } catch {
        // Autoplay policy fallback
      }

      await new Promise<void>((done) => {
        const onFrame = (_: DOMHighResTimeStamp, meta: { mediaTime: number }) => {
          const pct = meta.mediaTime / duration;
          const idx = Math.min(Math.round(pct * (totalFrames - 1)), totalFrames - 1);

          if (!frames[idx]) {
            offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
            createImageBitmap(offCanvas).then((bmp) => {
              frames[idx] = bmp;
              if (!isReady && idx >= 2) {
                framesRef.current = frames;
                setIsReady(true);
              }
            });
          }

          if (meta.mediaTime < duration - 0.05) {
            (video as HTMLVideoElementWithCallback).requestVideoFrameCallback(onFrame);
          } else {
            video.pause();
            setTimeout(() => {
              framesRef.current = frames;
              setIsReady(true);
              done();
            }, 100);
          }
        };

        (video as HTMLVideoElementWithCallback).requestVideoFrameCallback(onFrame);
      });
    } else {
      // Fallback: seek-based capture
      for (let i = 0; i < totalFrames; i++) {
        const t = (i / Math.max(totalFrames - 1, 1)) * duration;
        await new Promise<void>((res) => {
          video.currentTime = t;
          video.addEventListener('seeked', () => res(), { once: true });
        });
        offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
        frames[i] = await createImageBitmap(offCanvas);
        if (i === 1) {
          framesRef.current = frames;
          setIsReady(true);
        }
      }
      framesRef.current = frames;
      setIsReady(true);
    }
  }, [isReady]);

  useEffect(() => {
    captureFrames();
  }, [captureFrames]);

  // ── Canvas Render Loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let lastIdx = -1;

    const setSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      lastIdx = -1; // force redraw
    };

    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(canvas);

    // Sync scroll progress to frame index
    const unsub = smoothProgress.on('change', (p) => {
      const total = framesRef.current.length;
      if (total > 0) {
        frameIdxRef.current = Math.min(Math.round(p * (total - 1)), total - 1);
      }

      // If user scrolled to the absolute bottom (>= 0.99), trigger next page
      if (p >= 0.99 && !autoNextTriggeredRef.current && onNextClick) {
        autoNextTriggeredRef.current = true;
        onNextClick();
      }
    });

    const draw = () => {
      if (canvas.width === 0 || canvas.height === 0) {
        setSize();
        rafRef.current = requestAnimationFrame(draw);
        return;
      }

      let idx = frameIdxRef.current;
      const frames = framesRef.current;

      if (!frames[idx]) {
        // Nearest available frame search
        for (let i = idx - 1; i >= 0; i--) {
          if (frames[i]) {
            idx = i;
            break;
          }
        }
        if (!frames[idx]) {
          for (let i = idx + 1; i < frames.length; i++) {
            if (frames[i]) {
              idx = i;
              break;
            }
          }
        }
      }

      const bmp = frames[idx];
      if (bmp && idx !== lastIdx) {
        const cw = canvas.width;
        const ch = canvas.height;
        const ir = bmp.width / bmp.height;
        const cr = cw / ch;

        let sw = cw,
          sh = ch,
          sx = 0,
          sy = 0;

        if (ir > cr) {
          sw = ch * ir;
          sx = -(sw - cw) / 2;
        } else {
          sh = cw / ir;
          sy = -(sh - ch) / 2;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bmp, sx, sy, sw, sh);
        lastIdx = idx;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      unsub();
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
    };
  }, [smoothProgress, onNextClick]);

  return (
    <div
      ref={containerRef}
      className={styles.scrollContainer}
      aria-label="Ferris Wheel Frame Scrub Experience"
    >
      {/* Hidden capture video */}
      <video
        ref={captureVideoRef}
        src="/Animate_image_with_matching_frames_1080p_20261026211056.mp4"
        muted
        playsInline
        preload="auto"
        className={styles.hiddenVideo}
      />

      {/* ── Sticky Viewport (100dvh) ── */}
      <div className={styles.stickyViewport}>
        {/* HTML5 Canvas rendering video frames on scroll */}
        <canvas ref={canvasRef} className={styles.canvasStage} />

        {/* Back Button (Top Left) */}
        {onBackClick && (
          <motion.button
            type="button"
            className={styles.backBtn}
            onClick={onBackClick}
            aria-label="Go back to wish message page"
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

        {/* Subtle Scroll Hint (Fades out when scrolled) */}
        <motion.div
          className={styles.scrollHint}
          style={{ opacity: scrollHintOpacity }}
        >
          <span className={styles.scrollIcon}>🎡</span>
          <span className={styles.scrollText}>Scroll to turn the wheel</span>
          <span className={styles.scrollArrow}>↓</span>
        </motion.div>

        {/* Action Button at Bottom (Revealed at the end of scroll) */}
        {onNextClick && (
          <motion.div
            className={styles.bottomAction}
            style={{ opacity: bottomActionOpacity, y: bottomActionY }}
          >
            <button
              type="button"
              className={styles.continueBtn}
              onClick={onNextClick}
              aria-label="Continue to celebration experience"
            >
              <span>Celebrate with Kaawya 💕</span>
              <span>→</span>
            </button>
          </motion.div>
        )}
      </div>

      {/* ── Scroll Track: 320vh to give natural, satisfying frame scrubbing ── */}
      <div className={styles.scrollTrack} />
    </div>
  );
}

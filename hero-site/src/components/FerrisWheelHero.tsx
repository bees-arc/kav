'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
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
const WHEEL_REVOLUTIONS = 4; // 4 graceful full rotations across the entire letter scroll

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

  const [isReady, setIsReady] = useState(false);

  // ── Scroll progress tracking inside the container ──
  const { scrollYProgress } = useScroll({
    container: containerRef,
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 38,
    mass: 0.35,
  });

  // ── Video Frame Capture ──
  const captureFrames = useCallback(async () => {
    const video = captureVideoRef.current;
    if (!video) return;

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
      lastIdx = -1;
    };

    setSize();
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(canvas);

    // Sync scroll progress through multiple seamless rotations
    const unsub = smoothProgress.on('change', (p) => {
      const total = framesRef.current.length;
      if (total > 0) {
        // Continuous looping scrub across the total letter scroll
        const virtualFrame = p * WHEEL_REVOLUTIONS * (total - 1);
        const loopIdx = Math.round(virtualFrame) % (total - 1);
        frameIdxRef.current = Math.min(Math.max(loopIdx, 0), total - 1);
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
  }, [smoothProgress]);

  return (
    <div
      ref={containerRef}
      className={styles.scrollContainer}
      aria-label="Ferris Wheel Letter Experience"
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

      {/* ── Fixed Canvas Background (Scrubbed with scroll) ── */}
      <div className={styles.canvasWrapper}>
        <canvas ref={canvasRef} className={styles.canvasStage} />
        {/* Soft atmospheric overlay */}
        <div className={styles.canvasOverlay} />
      </div>

      {/* ── Floating Back Button (Top Left) ── */}
      {onBackClick && (
        <motion.button
          type="button"
          className={styles.backBtn}
          onClick={onBackClick}
          aria-label="Go back to birthday wish letter"
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

      {/* ── Scrollable Letter Content Over the Wheel ── */}
      <div className={styles.letterWrapper}>
        <motion.article
          className={styles.letterCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Letter Header */}
          <header className={styles.letterHeader}>
            <span className={styles.headerTag}>For Kaawya 🕊️</span>
            <h1 className={styles.headerTitle}>My Beautiful Little Angel</h1>
            <div className={styles.heartDivider} aria-hidden="true">
              <span className={styles.dividerLine} />
              <span className={styles.dividerHeart}>💙</span>
              <span className={styles.dividerLine} />
            </div>
          </header>

          {/* Letter Body Paragraphs */}
          <div className={styles.letterBody}>
            <p>
              One of the very first things I noticed about you, when I was just
              beginning to know you, was the kindness you carried in your heart.
              The way you cared for others, the compassion you showed so
              naturally, and especially the love you had for animals.
            </p>

            <p>
              I still remember something I thought to myself back then...
              If this girl can give so much love to those who aren&apos;t even her own,
              I wonder how deeply she must love the people who truly belong in her heart.
            </p>

            <p>
              And the more I got to know you, the more I realized just how beautiful
              that heart really is. Someone who doesn&apos;t truly know you might
              misunderstand your kindness. They might think you&apos;re pretending,
              that you&apos;re simply too good to be real.
            </p>

            <p>
              But I know you. I&apos;ve seen the love behind your actions, the
              gentleness in your heart, and the way you care even when there&apos;s
              nothing for you to gain. And if there&apos;s one thing I know with all
              my heart, it&apos;s this...
            </p>

            <div className={styles.highlightQuote}>
              &ldquo;You&apos;re an angel who somehow found her way into this world.&rdquo;
            </div>

            <p>
              Not because you&apos;re perfect, but because there&apos;s something so
              incredibly rare about a soul that chooses kindness so naturally. And I
              hope you never lose that beautiful part of yourself.
            </p>

            <p>
              You might not even realize it, but there&apos;s something incredibly
              beautiful about the way you simply exist. Just as a sunflower turns
              toward the sunlight, my heart somehow always finds its way back to you.
            </p>

            <p>
              It&apos;s in your little smiles, your innocent expressions, the way your
              eyes light up when something makes you happy, and all those tiny things
              you do without even noticing. I&apos;ve fallen in love with so many little
              versions of you, and somehow, every day, I find another reason to love
              you even more.
            </p>

            <p>
              And there&apos;s something I&apos;ve always thought whenever I looked at
              you... This silly little girl of mine has such a beautiful heart. She&apos;s
              almost too good for this world. I just want to love her, protect her, and
              take care of her as gently as I possibly can.
            </p>

            <p>
              Not because you&apos;re too fragile to face the world, but because
              someone with a heart like yours deserves to feel just as loved and
              cared for as the people she gives her love to. I want you to bloom in
              every season of your life, to chase every little dream your heart holds,
              and to never feel that you have to become someone else to deserve love.
              Because to me, the person you already are is someone incredibly precious.
            </p>

            <p>
              Your beauty has never been just about your smile, your eyes, or the way
              you look. It&apos;s in the beautiful heart you carry. The love you give to
              animals, the kindness you show to people around you, and the way your
              heart cares even for the smallest, most innocent lives...
            </p>

            <p>
              It&apos;s the way you love without expecting anything in return, the way
              you find happiness in making others feel loved, and the gentleness you
              carry in everything you do. These are the little things that remind me
              how incredibly lucky I am to have someone like you in my life.
            </p>

            <div className={styles.sectionDivider} aria-hidden="true">
              <span>✦ ✦ ✦</span>
            </div>

            <p>
              And you know something? There were times when I was almost the complete
              opposite of you. The way I saw certain things, the way I understood
              people, and even the way I thought about giving kindness to others... We
              didn&apos;t always see the world in the same way.
            </p>

            <p>
              But being with you slowly taught me something beautiful. Love doesn&apos;t
              always mean being the same. Sometimes, it means becoming a better
              version of yourself because of the person beside you.
            </p>

            <p>
              I began to understand the happiness you found in giving kindness to
              others. Little by little, the things that made your heart happy started
              bringing happiness to mine, too. And without even realizing it, I started
              seeing the world a little differently. A little more gently. A little
              more lovingly. A little more like you.
            </p>

            <p>
              You never had to ask me to change. You simply loved the world in your own
              beautiful way, and somehow, that love began changing mine.
            </p>

            <p>
              Before you became such a beautiful part of my life, there were pieces of
              me that I hadn&apos;t quite figured out. Sometimes, I think of my life as
              an unfinished sculpture. It had its shape, its imperfections, its rough
              edges, and so many little spaces that still felt empty.
            </p>

            <p>
              And then you came along. Not to erase who I was, or to turn me into
              someone completely different. But somehow, with your love, your
              kindness, your laughter, and even your silly little ways, you began
              filling those empty spaces I hadn&apos;t even noticed before.
            </p>

            <p>
              Little by little, the unfinished sculpture started feeling more complete.
              And the most beautiful part? You didn&apos;t just help shape that
              sculpture. You gave it a soul.
            </p>

            <p>
              You brought warmth into places that had always felt cold. You brought
              tenderness into parts of me that had forgotten what gentleness felt like.
              And you brought a kind of love into my life that I never quite knew how
              to describe.
            </p>

            <p>
              Sometimes, I wonder if you even realize how much of a difference
              you&apos;ve made in my world. Because you didn&apos;t have to do anything
              extraordinary. You were simply yourself. And somehow, that was enough to
              make so many ordinary things feel beautiful.
            </p>

            <p>
              There are still so many chapters of life ahead of us, so many things to
              learn, so many memories to make, and so many versions of ourselves we
              haven&apos;t met yet. I don&apos;t know what every tomorrow will look like.
              But I do know that the love you&apos;ve brought into my life is something
              I will always be grateful for.
            </p>

            <p>
              And if I could tell you just one thing, it would be this... No matter
              what people who don&apos;t truly know you might say, no matter how
              misunderstood your kindness may sometimes be, please never let the world
              convince you that your beautiful heart is something you need to hide.
            </p>

            <p>
              Because I know the girl behind that smile. I know how deeply she feels,
              how genuinely she cares, and how much love she carries within her. And I
              will always see something beautiful in the parts of you that the world
              may never fully understand.
            </p>

            <p>
              To others, you may be just another girl in this world. But to me,
              you&apos;re the angel who brought a soul to my unfinished sculpture,
              warmth to my coldest places, and a little more love into everything I see.
            </p>

            <p className={styles.closingPara}>
              And my sweet, silly girl... If this world ever feels too heavy for a
              heart as gentle as yours, I hope you&apos;ll always find a little place of
              peace, warmth, and safety in my love. Because you deserve every bit of
              the tenderness you&apos;ve spent your life giving to others.
            </p>

            <p className={styles.finalAngelSign}>
              And if there&apos;s one thing I will never doubt, it&apos;s that you
              truly are my beautiful little angel. 💙
            </p>
          </div>

          {/* Letter Footer Heart Divider */}
          <div className={styles.heartDivider} aria-hidden="true">
            <span className={styles.dividerLine} />
            <span className={styles.dividerHeart}>💙</span>
            <span className={styles.dividerLine} />
          </div>

          {/* Explicit Continue Button at the very end of the letter */}
          {onNextClick && (
            <div className={styles.actionArea}>
              <button
                type="button"
                className={styles.celebrateBtn}
                onClick={onNextClick}
                aria-label="Proceed to the grand celebration"
              >
                <span>Celebrate with Kaawya 💕</span>
                <span className={styles.btnArrow}>→</span>
              </button>
            </div>
          )}
        </motion.article>
      </div>
    </div>
  );
}

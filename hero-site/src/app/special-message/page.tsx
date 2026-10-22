'use client';

import { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import styles from './special-message.module.css';

// ─── Levenshtein Distance for fuzzy matching ─────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

// ─── Question 1: Mustang / Ford Mustang ──────────────────────
function isMustangAnswer(ans: string): boolean {
  const clean = ans.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!clean || clean.length < 3) return false;
  if (clean.includes('mustang') || clean.includes('ford')) return true;

  const typoVariants = [
    'mustng', 'mustag', 'mustan', 'mastang', 'mostang', 'muston', 'mustong',
    'fordmustang', 'musstang', 'mustangg', 'mustange', 'mustaang', 'mustanh',
    'mustanggt', 'fordmustng', 'mastng', 'mostng'
  ];
  if (typoVariants.some((v) => clean.includes(v))) return true;

  // Split words if multiple
  const words = ans.toLowerCase().trim().split(/\s+/);
  for (const w of words) {
    const cw = w.replace(/[^a-z0-9]/g, '');
    if (cw.length >= 4 && levenshtein(cw, 'mustang') <= 2) return true;
  }

  return levenshtein(clean, 'mustang') <= 2;
}

// ─── Question 2: Purple ─────────────────────────────────────
function isPurpleAnswer(ans: string): boolean {
  const clean = ans.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!clean || clean.length < 2) return false;

  const purpleVariants = [
    'purple', 'purpel', 'purpal', 'purpl', 'purpole', 'perple', 'purlpe',
    'dam', 'dampata', 'dampaata', 'violet', 'darkpurple', 'lightpurple'
  ];
  if (purpleVariants.some((v) => clean.includes(v))) return true;

  const words = ans.toLowerCase().trim().split(/\s+/);
  for (const w of words) {
    const cw = w.replace(/[^a-z0-9]/g, '');
    if (cw.length >= 3 && levenshtein(cw, 'purple') <= 2) return true;
  }

  return levenshtein(clean, 'purple') <= 2;
}

// ─── Question 3: Kaawya / Me / Myself ────────────────────────
function isKaawyaAnswer(ans: string): boolean {
  const clean = ans.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
  if (!clean) return false;

  const kaawyaVariants = [
    'kaawya', 'kavya', 'kav', 'kaavya', 'kawya', 'kawi', 'kaawi',
    'kawa', 'kaawa', 'kavy', 'kaawy', 'kaavyah', 'kavyha', 'kavii',
    'kavyaa', 'kawyaa'
  ];
  if (kaawyaVariants.some((v) => clean.includes(v))) return true;

  const selfVariants = [
    'me', 'mama', 'mam', 'man', 'myself', 'iam', 'eyagekella', 'eyagewife',
    'oyagekaawya', 'oyaagekaawya', 'kavyaawitharai'
  ];
  if (selfVariants.some((v) => clean === v || clean.includes(v))) return true;

  const words = ans.toLowerCase().trim().split(/\s+/);
  for (const w of words) {
    const cw = w.replace(/[^a-z0-9]/g, '');
    if (cw.length >= 3 && (levenshtein(cw, 'kaawya') <= 2 || levenshtein(cw, 'kavya') <= 2)) {
      return true;
    }
  }

  return levenshtein(clean, 'kaawya') <= 2 || levenshtein(clean, 'kavya') <= 2;
}

export default function SpecialMessagePage() {
  const [ans1, setAns1] = useState('');
  const [ans2, setAns2] = useState('');
  const [ans3, setAns3] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showEmotionalModal, setShowEmotionalModal] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Real-time match indicators
  const q1Correct = isMustangAnswer(ans1);
  const q2Correct = isPurpleAnswer(ans2);
  const q3Correct = isKaawyaAnswer(ans3);

  // Play gentle web audio chime
  const playRomanticChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + idx * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.12 + 1.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 1.3);
      });
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ff6b9d', '#ffd700', '#c084fc', '#ffffff', '#ff2a85'],
    });
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff6b9d', '#c084fc'],
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffd700', '#ff2a85'],
      });
    }, 350);
  };

  // Form submission logic
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Mandatory check: all 3 fields must be filled
    if (!ans1.trim() || !ans2.trim() || !ans3.trim()) {
      setErrorMsg('Please answer all 3 questions, Kaawya! None can be left blank 🥰');
      return;
    }

    const isQ1Right = isMustangAnswer(ans1);
    const isQ2Right = isPurpleAnswer(ans2);
    const isQ3Right = isKaawyaAnswer(ans3);

    // If Q1 or Q2 is wrong -> Error! Do NOT show emotional message, do NOT unlock.
    if (!isQ1Right || !isQ2Right) {
      setErrorMsg(
        'Hmm... Answers do not seem right 🥺 Questions 1 & 2 must be correct to confirm you are Kaawya. Please try again 💕'
      );
      return;
    }

    // Both Q1 and Q2 are right!
    if (isQ3Right) {
      // All 3 correct!
      setUnlocked(true);
      triggerConfetti();
      playRomanticChime();
    } else {
      // Q1 & Q2 are right, but Q3 is WRONG!
      // Show emotional interstitial message as requested!
      setShowEmotionalModal(true);
    }
  };

  const handleProceedFromModal = () => {
    setShowEmotionalModal(false);
    setUnlocked(true);
    triggerConfetti();
    playRomanticChime();
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Background ambient lighting */}
      <div className={styles.glowBlob1} />
      <div className={styles.glowBlob2} />

      {/* Floating background hearts */}
      <div className={styles.bgHearts} aria-hidden="true">
        {[
          { left: '8%', delay: '0s', size: '1.2rem', char: '💖' },
          { left: '22%', delay: '3s', size: '1rem', char: '🌹' },
          { left: '42%', delay: '1s', size: '1.4rem', char: '✨' },
          { left: '60%', delay: '5s', size: '1.1rem', char: '💕' },
          { left: '78%', delay: '2s', size: '1.3rem', char: '💜' },
          { left: '90%', delay: '4s', size: '0.9rem', char: '🌸' },
        ].map((item, idx) => (
          <span
            key={idx}
            className={styles.floatingHeart}
            style={{
              left: item.left,
              animationDelay: item.delay,
              fontSize: item.size,
            }}
          >
            {item.char}
          </span>
        ))}
      </div>

      {/* Top Navigation */}
      <header className={styles.topNav}>
        <Link href="/" className={styles.backHomeBtn}>
          ← Back to Celebration 🎈
        </Link>
      </header>

      {/* ─── State A: Lock / Verification Screen ─── */}
      {!unlocked ? (
        <section className={styles.verifyCard}>
          <div className={styles.lockIconWrap}>
            <span className={styles.lockEmoji}>🔒</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <span className={styles.headerBadge}>Exclusive For Kaawya 🌹</span>
          </div>

          <h1 className={styles.title}>Confirm You Are Kaawya</h1>
          <p className={styles.subtitle}>
            This secret message is strictly for Kaawya! Please confirm it is really you by answering these 3 questions 🥰
          </p>

          {errorMsg && (
            <div className={styles.errorBanner} role="alert">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleVerify}>
            <div className={styles.questionsList}>
              {/* Question 1: Car */}
              <div className={styles.questionItem}>
                <div className={styles.questionLabelRow}>
                  <label htmlFor="q1Input" className={styles.questionText}>
                    1. Which dream car does Kaawya&apos;s boyfriend want to take her in? 🏎️
                  </label>
                </div>
                <div className={styles.inputRow}>
                  <input
                    id="q1Input"
                    type="text"
                    value={ans1}
                    onChange={(e) => setAns1(e.target.value)}
                    placeholder="Type your answer here..."
                    className={styles.inputField}
                    autoComplete="off"
                  />
                  {q1Correct && (
                    <div className={styles.tickStatus}>
                      <span className={styles.tickBadge}>✓ Correct 🏎️</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question 2: Buwwa color */}
              <div className={styles.questionItem}>
                <div className={styles.questionLabelRow}>
                  <label htmlFor="q2Input" className={styles.questionText}>
                    2. What color is the octopus plushie Kaawya gave her boyfriend? 🐙🧸
                  </label>
                </div>
                <div className={styles.inputRow}>
                  <input
                    id="q2Input"
                    type="text"
                    value={ans2}
                    onChange={(e) => setAns2(e.target.value)}
                    placeholder="Type your answer here..."
                    className={styles.inputField}
                    autoComplete="off"
                  />
                  {q2Correct && (
                    <div className={styles.tickStatus}>
                      <span className={styles.tickBadge}>✓ Correct 💜</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Question 3: Most wanted person */}
              <div className={styles.questionItem}>
                <div className={styles.questionLabelRow}>
                  <label htmlFor="q3Input" className={styles.questionText}>
                    3. Who does Kaawya&apos;s boyfriend need and love the most in this world? 🥺❤️
                  </label>
                </div>
                <div className={styles.inputRow}>
                  <input
                    id="q3Input"
                    type="text"
                    value={ans3}
                    onChange={(e) => setAns3(e.target.value)}
                    placeholder="Type your answer here..."
                    className={styles.inputField}
                    autoComplete="off"
                  />
                  {q3Correct && (
                    <div className={styles.tickStatus}>
                      <span className={styles.tickBadge}>✓ Correct ❤️</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitJellyBtn}>
              <span className={styles.btnGleam} />
              <span>Unlock Secret Message 💌</span>
            </button>
          </form>
        </section>
      ) : (
        /* ─── State B: Unlocked Special Secret Message ─── */
        <section className={styles.unlockedWrapper}>
          <div className={styles.celebrationBadge}>
            ✨ Unlocked Secret Message for Kaawya ✨
          </div>

          <article className={styles.loveLetterCard}>
            <div className={styles.waxSeal}>💌</div>

            <h1 className={styles.letterSalutation}>
              To My Rarest & Prettiest Blue Rose, Kaawya 🌹
            </h1>
            <p className={styles.letterDate}>A Special Birthday Message Just For You 🎂</p>

            <div className={styles.letterBody}>
              <p>
                <strong className={styles.letterRose}>Happy Birthday to my whole world! 🎂❤️</strong>
              </p>
              <p>
                You are truly the most precious gift life has ever blessed me with. In your sweet smile and gentle love, every single problem and worry in this world simply fades away.
              </p>
              <p>
                I still dream of taking you on an evening ride in our <span className={styles.letterHighlight}>Mustang</span>, holding your hand tight, windows down, singing along to our favorite songs into the night. That dream is going to become our beautiful reality very soon! 🏎️💨
              </p>
              <p>
                The <span className={styles.letterHighlight}>purple octopus</span> you gave me will forever be our sweet little guardian angel, reminding me every single second that your love is always right here with me 🐙💜.
              </p>
              <p>
                Always remember, Kaawya... no matter how this world changes or what happens, the person who matters the most, and the one I cannot live without, is <strong className={styles.letterHighlight}>YOU and only you</strong>. Standing by your side and loving you every day is my greatest happiness.
              </p>
            </div>

            <div className={styles.letterSignoff}>
              <span className={styles.signoffText}>With infinite love, warmest hugs, and always yours,</span>
              <span className={styles.signature}>Your Boyfriend ❤️</span>
            </div>
          </article>

          {/* Interactive Memory Highlights */}
          <div className={styles.memoryGrid}>
            <div className={styles.memoryCard}>
              <span className={styles.memoryIcon}>🏎️</span>
              <h3 className={styles.memoryTitle}>The Mustang Dream</h3>
              <p className={styles.memoryDesc}>
                Open roads, sunset skies, and you sitting right beside me forever.
              </p>
            </div>

            <div className={styles.memoryCard}>
              <span className={styles.memoryIcon}>🐙</span>
              <h3 className={styles.memoryTitle}>The Purple Buwwa</h3>
              <p className={styles.memoryDesc}>
                The sweetest gift holding a thousand memories of your love.
              </p>
            </div>

            <div className={styles.memoryCard}>
              <span className={styles.memoryIcon}>🌹</span>
              <h3 className={styles.memoryTitle}>My Blue Rose</h3>
              <p className={styles.memoryDesc}>
                Unique, priceless, and the brightest glow in my entire universe.
              </p>
            </div>
          </div>

          {/* Love Coupon Box */}
          <div className={styles.couponBox}>
            <span className={styles.couponTag}>OFFICIAL BIRTHDAY PASS</span>
            <h2 className={styles.couponHeading}>Unlimited Hugs & Pampering Pass 🎟️</h2>
            <p className={styles.couponText}>
              This pass entitles Kaawya to infinite cuddles, her favorite snacks, zero arguments, and whatever she wishes for today and every day! 🥰
            </p>
          </div>

          {/* Action buttons */}
          <div className={styles.bottomActions}>
            <button type="button" onClick={playRomanticChime} className={styles.chimeBtn}>
              🎵 Play Birthday Chime
            </button>
            <button type="button" onClick={triggerConfetti} className={styles.chimeBtn}>
              🎉 More Confetti!
            </button>
            <Link href="/" className={styles.returnBtn}>
              🏠 Return to Birthday Site 🎈
            </Link>
          </div>
        </section>
      )}

      {/* ─── Emotional Interstitial Modal (Q1 & Q2 correct, Q3 wrong) ─── */}
      {showEmotionalModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} role="dialog" aria-modal="true">
            <div className={styles.modalIcon}>🥺💔</div>
            <h2 className={styles.modalTitle}>Wait a moment, Kaawya!</h2>

            <div className={styles.modalBody}>
              <p>
                <strong>I will let you in for now, KaV... 🥺❤️</strong>
              </p>
              <br />
              <p>
                Even so, you don&apos;t love your boyfriend enough! Because the person he needs the most, values the most, and cannot live without in this world is <span className={styles.modalHighlight}>YOU</span>. 💖
              </p>
            </div>

            <button
              type="button"
              onClick={handleProceedFromModal}
              className={styles.modalProceedBtn}
            >
              Okay... Read My Secret Message 💌🥺
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

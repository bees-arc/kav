'use client';

import { useEffect, useState } from 'react';
import styles from './CountdownPage.module.css';

// November 13 at 12:00 AM (midnight) Sri Lanka time (UTC+05:30)
export const UNLOCK_TIME = new Date('2026-11-13T00:00:00+05:30').getTime();

interface CountdownPageProps {
  onComplete: () => void;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export default function CountdownPage({ onComplete }: CountdownPageProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => {
      const diff = UNLOCK_TIME - Date.now();
      if (diff <= 0) {
        onComplete();
        return;
      }
      setRemaining(diff);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [onComplete]);

  const total = Math.max(0, Math.floor((remaining ?? 0) / 1000));
  const units = [
    { label: 'Days', value: Math.floor(total / 86400) },
    { label: 'Hours', value: Math.floor((total % 86400) / 3600) },
    { label: 'Minutes', value: Math.floor((total % 3600) / 60) },
    { label: 'Seconds', value: total % 60 },
  ];

  return (
    <section className={styles.page} aria-label="Countdown to the surprise">
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.heart} aria-hidden="true">💙</div>
        <h1 className={styles.title}>Something special is coming…</h1>
        <p className={styles.subtitle}>Opens on 13th November at midnight</p>

        <div className={styles.grid}>
          {units.map((u) => (
            <div key={u.label} className={styles.box}>
              <span className={styles.num}>
                {remaining === null ? '--' : pad(u.value)}
              </span>
              <span className={styles.label}>{u.label}</span>
            </div>
          ))}
        </div>

        <p className={styles.note}>Sri Lanka Time · 12:00 AM</p>
      </div>
    </section>
  );
}

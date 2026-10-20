import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import WorkSection from '@/components/WorkSection';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <Navbar />
      <HeroSection />
      <WorkSection />

      {/* About stub */}
      <section id="about" className={styles.about}>
        <p className={styles.aboutLabel}>About</p>
        <h2 className={styles.aboutTitle}>
          We&apos;re a small team <br />
          with a big vision.
        </h2>
        <p className={styles.aboutText}>
          Based worldwide, working with brands that refuse to be ordinary.
          Our process is collaborative, our craft is obsessive.
        </p>
      </section>
    </main>
  );
}

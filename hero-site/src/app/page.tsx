import Navbar from '@/components/Navbar';
import SanctuaryHero from '@/components/SanctuaryHero';
import HeroSection from '@/components/HeroSection';

export default function Home() {
  return (
    <main>
      <Navbar />
      <SanctuaryHero nextSectionId="interactive-story" />
      <div id="interactive-story">
        <HeroSection />
      </div>
    </main>
  );
}

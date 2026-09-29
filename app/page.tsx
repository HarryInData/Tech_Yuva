import Navbar from '@/components/Navbar';
import HeroSequence from '@/components/HeroSequence';
import Intro from '@/components/Intro';
import Pillars from '@/components/Pillars';
import CircularGallery from '@/components/CircularGallery';
import Events from '@/components/Events';
import Founder from '@/components/Founder';
import Pathway from '@/components/Pathway';
import Impact from '@/components/Impact';
import Cta from '@/components/Cta';
import Footer from '@/components/Footer';
import ScrollReveal from '@/components/ScrollReveal';

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSequence />
        <Intro />
        <Pillars />
        <CircularGallery />
        <Events />
        <Founder />
        <Pathway />
        <Impact />
        <Cta />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  );
}

'use client';

import { useEffect, useRef } from 'react';

const PILLARS_DATA = [
  {
    number: '01',
    title: 'Build',
    desc: 'Scalable APIs, full-stack architectures, production backends. No toy projects — real systems that handle real users.',
  },
  {
    number: '02',
    title: 'Learn',
    desc: 'Hands-on AI bootcamps, LLM embeddings, Web3 smart contracts, cloud deployment. Learning by shipping.',
  },
  {
    number: '03',
    title: 'Connect',
    desc: '500+ builders, corporate tech talks, open-source collaboration. A network of people who build, not just talk.',
  },
  {
    number: '04',
    title: 'Compete',
    desc: '36-hour hackathons, coding sprints, DropHack events. Solve unknown problems under real pressure.',
  },
  {
    number: '05',
    title: 'Innovate',
    desc: 'PitchCraft Accelerator — angel reviews, funding connections, mentorship, and cloud credits to launch your startup.',
  },
];

export default function Pillars() {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll<HTMLDivElement>('.pillar-card');

    const handleMouseMove = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLDivElement;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const card = e.currentTarget as HTMLDivElement;
      card.style.transform = '';
    };

    cards.forEach((card) => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      cards.forEach((card) => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <section className="pillars-section" id="pillars">
      <div className="container">
        <div className="section-header reveal-up">
          <span className="section-eyebrow">What We Do</span>
          <h2 className="section-heading">
            Five pillars.<br />
            One mission.
          </h2>
        </div>
        <div className="pillars-grid" ref={gridRef}>
          {PILLARS_DATA.map((pillar) => (
            <div className="pillar-card reveal-up" key={pillar.number}>
              <span className="pillar-number">{pillar.number}</span>
              <h3 className="pillar-title">{pillar.title}</h3>
              <p className="pillar-desc">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

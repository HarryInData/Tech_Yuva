'use client';

import { useEffect, useRef } from 'react';

const IMPACT_ITEMS = [
  { count: 500, label: 'Active Members' },
  { count: 20, label: 'Events Hosted' },
  { count: 80, label: 'Prototypes Built' },
  { count: 1000, label: 'Builders Impacted' },
];

function animateCounter(el: HTMLElement, target: number) {
  const duration = 2000;
  const start = performance.now();
  const suffix = el.textContent?.replace(/[\d,]/g, '') || '+';

  function step(now: number) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

export default function Impact() {
  const gridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll<HTMLDivElement>('.impact-card');
            cards.forEach((card, i) => {
              setTimeout(() => {
                const targetAttr = card.getAttribute('data-count');
                const target = targetAttr ? parseInt(targetAttr, 10) : 0;
                const numEl = card.querySelector<HTMLSpanElement>('.impact-num');
                if (numEl && target) {
                  animateCounter(numEl, target);
                }
              }, i * 150);
            });
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    counterObserver.observe(grid);

    return () => {
      counterObserver.disconnect();
    };
  }, []);

  return (
    <section className="impact-section" id="impact">
      <div className="container">
        <div className="impact-grid" ref={gridRef}>
          {IMPACT_ITEMS.map((item) => (
            <div className="impact-card reveal-up" data-count={item.count} key={item.label}>
              <span className="impact-num">{item.count}+</span>
              <span className="impact-label">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

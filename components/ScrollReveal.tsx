'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      document
        .querySelectorAll('.reveal-up, .reveal-text')
        .forEach((el) => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const parent = entry.target.parentElement;
            if (parent) {
              const siblings = Array.from(
                parent.querySelectorAll('.reveal-up, .reveal-text')
              );
              const idx = siblings.indexOf(entry.target as HTMLElement);
              (entry.target as HTMLElement).style.transitionDelay = `${idx * 0.08}s`;
            }
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -50px 0px',
        threshold: 0.1,
      }
    );

    document
      .querySelectorAll('.reveal-up, .reveal-text')
      .forEach((el) => observer.observe(el));

    // Global smooth scroll handler for all hash anchors
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href !== '#') {
        const el = document.querySelector(href) as HTMLElement | null;
        if (el) {
          e.preventDefault();
          window.scrollTo({
            top: el.offsetTop - 80,
            behavior: 'smooth',
          });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return null;
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { aboutContent } from '@/data/aboutContent';
import { JOIN_FORM_URL } from '@/config/joinForm';

function IconRocket() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconTerminal() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function IconCpu() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" />
      <line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" />
      <line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" />
      <line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" />
      <line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  );
}

function IconZap() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function IconTrending() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

export default function AboutMission() {
  const countRef = useRef<HTMLSpanElement | null>(null);
  const [hasAnimatedCount, setHasAnimatedCount] = useState(false);

  // Animated Count-Up on Scroll (Runs Once)
  useEffect(() => {
    const el = countRef.current;
    if (!el || hasAnimatedCount) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimatedCount) {
            setHasAnimatedCount(true);
            const target = aboutContent.impact.count; // 500
            const duration = 1800;
            const startTime = performance.now();

            const update = (now: number) => {
              const elapsed = now - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease-out expo
              const eased = 1 - Math.pow(1 - progress, 3);
              const currentVal = Math.floor(eased * target);

              if (el) {
                el.textContent = `${currentVal}${aboutContent.impact.suffix}`;
              }

              if (progress < 1) {
                requestAnimationFrame(update);
              } else if (el) {
                el.textContent = `${target}${aboutContent.impact.suffix}`;
              }
            };

            requestAnimationFrame(update);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [hasAnimatedCount]);

  const { intro, mission, quote, contrast, whatWeDo, howItWorks, impact, cta } = aboutContent;

  return (
    <section className="about-experience-section" id="intro" aria-label="About Tech Yuva and Our Mission">
      {/* Background Subtle Technical Grid */}
      <div className="about-grid-backdrop" aria-hidden="true"></div>

      <div className="container">
        {/* =====================================================
            BLOCK 1 — INTRO / HEADER
            ===================================================== */}
        <header className="about-block about-intro-block reveal-up">
          <div className="about-eyebrow-row">
            <span className="section-eyebrow">{intro.eyebrow}</span>
            <span className="about-header-badge">
              <span className="badge-pulse-dot" aria-hidden="true"></span>
              {intro.badge}
            </span>
          </div>

          <h2 className="about-heading-xl">
            Where Youth Meet to <span className="gradient-text-accent">Build Future Tech</span>
          </h2>

          <p className="about-subheading">
            {intro.subheadingPrefix}
          </p>

          <p className="about-body-lead">
            {intro.body}
          </p>
        </header>

        {/* =====================================================
            BLOCK 2 — OUR MISSION (Feature Statement & 3 Pillars)
            ===================================================== */}
        <div className="about-block about-mission-block reveal-up">
          <div className="about-mission-statement-card">
            <span className="section-eyebrow">{mission.label}</span>
            <blockquote className="mission-statement-quote">
              &ldquo;{mission.statement}&rdquo;
            </blockquote>
          </div>

          <div className="mission-pillars-grid">
            {mission.pillars.map((pillar) => (
              <div key={pillar.id} className="mission-pillar-card">
                <div className="pillar-icon-box">
                  {pillar.icon === 'rocket' && <IconRocket />}
                  {pillar.icon === 'shield' && <IconShield />}
                  {pillar.icon === 'users' && <IconUsers />}
                </div>
                <h3 className="mission-pillar-title">{pillar.title}</h3>
                <p className="mission-pillar-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================
            BLOCK 3 — THE PROBLEM WE SAW (Vision Quote)
            ===================================================== */}
        <div className="about-block about-quote-block reveal-up">
          <div className="vision-quote-card">
            <div className="quote-accent-mark" aria-hidden="true">&ldquo;</div>
            <span className="section-eyebrow">{quote.label}</span>
            <blockquote className="vision-quote-text">
              <p>
                {quote.quoteBody}{' '}
                <strong className="gradient-text-accent font-semibold">{quote.quoteHighlight}</strong>
              </p>
            </blockquote>
            <figcaption className="vision-quote-author">
              <div className="author-avatar-badge" aria-hidden="true">LS</div>
              <div className="author-meta">
                <span className="author-name">{quote.author}</span>
                <span className="author-role">{quote.role}</span>
              </div>
            </figcaption>
          </div>
        </div>

        {/* =====================================================
            BLOCK 4 — FROM TUTORIAL HELL TO PRODUCTION (Before / After)
            ===================================================== */}
        <div className="about-block about-contrast-block reveal-up">
          <div className="section-header text-center">
            <span className="section-eyebrow">Transformation</span>
            <h3 className="section-heading">From Tutorial Hell to Production</h3>
          </div>

          <div className="contrast-card-container">
            {/* LEFT — Tutorial Hell */}
            <div className="contrast-column contrast-before">
              <div className="contrast-badge before-badge">
                <span className="contrast-tag-dot"></span>
                {contrast.before.tag}
              </div>
              <ul className="contrast-list">
                {contrast.before.points.map((pt, idx) => (
                  <li key={idx} className="contrast-item before-item">
                    <span className="item-icon before-icon">&times;</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Glowing Connector Arrow */}
            <div className="contrast-connector" aria-hidden="true">
              <div className="connector-line"></div>
              <div className="connector-circle">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
              <div className="connector-line"></div>
            </div>

            {/* RIGHT — The Tech Yuva Way */}
            <div className="contrast-column contrast-after">
              <div className="contrast-badge after-badge">
                <span className="contrast-tag-dot active-dot"></span>
                {contrast.after.tag}
              </div>
              <ul className="contrast-list">
                {contrast.after.points.map((pt, idx) => (
                  <li key={idx} className="contrast-item after-item">
                    <span className="item-icon after-icon">&#10003;</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* =====================================================
            BLOCK 5 — WHAT WE DO (4 Cards, Hover Glow)
            ===================================================== */}
        <div className="about-block about-what-block reveal-up">
          <div className="section-header">
            <span className="section-eyebrow">{whatWeDo.label}</span>
            <h3 className="section-heading">{whatWeDo.heading}</h3>
          </div>

          <div className="what-we-do-grid">
            {whatWeDo.items.map((item) => (
              <div key={item.id} className="what-card">
                <div className="what-icon-wrapper">
                  {item.icon === 'terminal' && <IconTerminal />}
                  {item.icon === 'cpu' && <IconCpu />}
                  {item.icon === 'zap' && <IconZap />}
                  {item.icon === 'trending' && <IconTrending />}
                </div>
                <h4 className="what-card-title">{item.title}</h4>
                <p className="what-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================
            BLOCK 6 — HOW IT WORKS (Timeline)
            ===================================================== */}
        <div className="about-block about-timeline-block reveal-up">
          <div className="section-header">
            <span className="section-eyebrow">{howItWorks.label}</span>
            <h3 className="section-heading">{howItWorks.heading}</h3>
          </div>

          <div className="timeline-track">
            {howItWorks.steps.map((item) => (
              <div key={item.step} className="timeline-step-card">
                <div className="timeline-step-indicator">
                  <span className="step-num">{item.step}</span>
                  <div className="step-connector-dot"></div>
                </div>
                <div className="timeline-content">
                  <h4 className="timeline-step-title">{item.title}</h4>
                  <p className="timeline-step-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =====================================================
            BLOCK 7 — IMPACT STRIP
            ===================================================== */}
        <div className="about-block about-impact-block reveal-up">
          <div className="impact-strip-card">
            <div className="impact-counter-wrap">
              <span className="impact-counter-number" ref={countRef}>
                0+
              </span>
              <span className="impact-counter-label">{impact.label}</span>
            </div>
            <div className="impact-divider" aria-hidden="true"></div>
            <p className="impact-strip-sub">{impact.subtext}</p>
          </div>
        </div>

        {/* =====================================================
            BLOCK 8 — CLOSING CALL TO ACTION
            ===================================================== */}
        <div className="about-block about-cta-block reveal-up">
          <div className="about-closing-card">
            <h3 className="about-closing-heading">{cta.heading}</h3>
            <p className="about-closing-text">{cta.text}</p>
            <div className="about-closing-actions">
              <a
                href={JOIN_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-white btn-lg"
              >
                {cta.buttonLabel}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

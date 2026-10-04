'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { JOIN_FORM_URL } from '@/config/joinForm';

const FRAME_COUNT = 270;
const FRAME_DIR = '/assets/frames/';
const SCRUB_SPEED = 0.5;
const BATCH_SIZE = 12;

function getFramePath(index: number, ext = '.webp') {
  const num = String(index + 1).padStart(3, '0');
  return `${FRAME_DIR}${num}${ext}`;
}

export default function HeroSequence() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  const phase1Ref = useRef<HTMLDivElement | null>(null);
  const phase2Ref = useRef<HTMLDivElement | null>(null);
  const phase3Ref = useRef<HTMLDivElement | null>(null);
  const phase4Ref = useRef<HTMLDivElement | null>(null);
  const phase5Ref = useRef<HTMLDivElement | null>(null);

  const word1Ref = useRef<HTMLSpanElement | null>(null);
  const word2Ref = useRef<HTMLSpanElement | null>(null);
  const word3Ref = useRef<HTMLSpanElement | null>(null);

  const [loaderHidden, setLoaderHidden] = useState(false);
  const [loaderDisplayNone, setLoaderDisplayNone] = useState(false);

  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT).fill(null));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const heroContainer = containerRef.current;
    const phases = [
      phase1Ref.current,
      phase2Ref.current,
      phase3Ref.current,
      phase4Ref.current,
      phase5Ref.current,
    ];
    const words = [word1Ref.current, word2Ref.current, word3Ref.current];
    const images = imagesRef.current;

    let loadedCount = 0;
    let renderedFrame = -1;
    let rafId: number | null = null;
    let stInstance: ScrollTrigger | null = null;
    let isDestroyed = false;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resizeCanvas = () => {
      if (isDestroyed || !canvas || !ctx) return;
      try {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isMobile = w <= 768;
        const scale = isMobile ? 1.0 : dpr;

        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(scale, 0, 0, scale, 0, 0);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        const frameToDraw = renderedFrame >= 0 ? renderedFrame : 0;
        if (images[frameToDraw]) {
          renderFrame(frameToDraw);
        }
      } catch (err) {
        // Safe resize guard
      }
    };

    const renderFrame = (index: number) => {
      if (isDestroyed || !ctx || !images[index]) return;
      try {
        renderedFrame = index;
        const img = images[index]!;
        const cw = window.innerWidth;
        const ch = window.innerHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.clearRect(0, 0, cw, ch);

        const naturalW = img.naturalWidth || 1080;
        const naturalH = img.naturalHeight || 608;
        const imgRatio = naturalW / naturalH;
        const canvasRatio = cw / ch;

        let drawW: number;
        let drawH: number;
        let offsetX: number;
        let offsetY: number;

        if (canvasRatio > imgRatio) {
          drawW = cw;
          drawH = cw / imgRatio;
          offsetX = 0;
          offsetY = (ch - drawH) / 2;
        } else {
          drawH = ch;
          drawW = ch * imgRatio;
          offsetX = (cw - drawW) / 2;
          offsetY = 0;
        }

        ctx.drawImage(
          img,
          Math.round(offsetX),
          Math.round(offsetY),
          Math.round(drawW),
          Math.round(drawH)
        );
      } catch (err) {
        // Draw guard
      }
    };

    const updateLoaderProgress = () => {
      if (progressBarRef.current) {
        const pct = Math.min(Math.round((loadedCount / FRAME_COUNT) * 100), 100);
        progressBarRef.current.style.width = pct + '%';
      }
    };

    const loadImage = (index: number): Promise<HTMLImageElement | null> => {
      return new Promise((resolve) => {
        if (images[index]) {
          resolve(images[index]);
          return;
        }

        const img = new Image();
        img.onload = () => {
          if (isDestroyed) return resolve(null);
          images[index] = img;
          loadedCount++;
          updateLoaderProgress();
          resolve(img);
        };
        img.onerror = () => {
          // Automatic PNG fallback if WebP fails
          const fallbackImg = new Image();
          fallbackImg.onload = () => {
            if (isDestroyed) return resolve(null);
            images[index] = fallbackImg;
            loadedCount++;
            updateLoaderProgress();
            resolve(fallbackImg);
          };
          fallbackImg.onerror = () => {
            if (isDestroyed) return resolve(null);
            loadedCount++;
            updateLoaderProgress();
            resolve(null);
          };
          fallbackImg.src = getFramePath(index, '.png');
        };
        img.src = getFramePath(index, '.webp');
      });
    };

    const hideLoader = () => {
      setLoaderHidden(true);
      setTimeout(() => {
        if (!isDestroyed) setLoaderDisplayNone(true);
      }, 500);
    };

    const showPhase = (phaseIndex: number) => {
      if (isDestroyed) return;
      phases.forEach((el, i) => {
        if (!el) return;
        if (i === phaseIndex) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      });
    };

    const animateWords = (progress: number) => {
      const localProg = (progress - 0.6) / 0.2;
      words.forEach((el, i) => {
        if (!el) return;
        const wordStart = i * 0.25;
        const wordProg = Math.max(0, Math.min((localProg - wordStart) / 0.35, 1));
        const eased = 1 - (1 - wordProg) * (1 - wordProg);
        el.style.opacity = String(eased);
        el.style.transform = `translateY(${30 * (1 - eased)}px)`;
      });
    };

    const updateTextPhases = (progress: number) => {
      if (progress < 0.2) {
        showPhase(0);
      } else if (progress < 0.4) {
        showPhase(1);
      } else if (progress < 0.6) {
        showPhase(2);
      } else if (progress < 0.8) {
        showPhase(3);
        animateWords(progress);
      } else {
        showPhase(4);
      }
    };

    const initScrollAnimation = () => {
      if (!canvas || !ctx || !heroContainer) return;
      gsap.registerPlugin(ScrollTrigger);

      const frameObj = { frame: 0 };

      const tween = gsap.to(frameObj, {
        frame: FRAME_COUNT - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: heroContainer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SPEED,
          onUpdate: (self) => {
            if (isDestroyed) return;
            const progress = self.progress;
            const frameIndex = Math.round(progress * (FRAME_COUNT - 1));
            const clampedIndex = Math.max(0, Math.min(frameIndex, FRAME_COUNT - 1));

            // Select nearest loaded frame to prevent any blank stuttering
            let drawIdx = clampedIndex;
            if (!images[drawIdx]) {
              for (let k = drawIdx; k >= 0; k--) {
                if (images[k]) {
                  drawIdx = k;
                  break;
                }
              }
            }

            if (drawIdx !== renderedFrame && images[drawIdx]) {
              if (rafId) cancelAnimationFrame(rafId);
              rafId = requestAnimationFrame(() => renderFrame(drawIdx));
            }

            updateTextPhases(progress);
          },
        },
      });

      stInstance = tween.scrollTrigger ?? null;
      ScrollTrigger.refresh();
    };

    const startSequence = async () => {
      // 1. Immediately preload the first frame for instant LCP
      await loadImage(0);
      if (isDestroyed) return;

      resizeCanvas();
      if (images[0]) renderFrame(0);
      hideLoader();
      showPhase(0);

      // 2. Initialize scroll scrubbing
      initScrollAnimation();

      // 3. Preload a small initial burst (frames 1–15) for immediate smooth start
      const firstBatch: Promise<HTMLImageElement | null>[] = [];
      for (let i = 1; i < Math.min(16, FRAME_COUNT); i++) {
        firstBatch.push(loadImage(i));
      }
      await Promise.all(firstBatch);
      if (isDestroyed) return;

      // 4. Stream the remaining frames in non-blocking batches in the background
      const loadRemaining = async () => {
        for (let i = 16; i < FRAME_COUNT; i += BATCH_SIZE) {
          if (isDestroyed) break;
          const batch: Promise<HTMLImageElement | null>[] = [];
          for (let j = i; j < Math.min(i + BATCH_SIZE, FRAME_COUNT); j++) {
            batch.push(loadImage(j));
          }
          await Promise.all(batch);
          // Yield to main thread between batches to keep scrolling at 60fps
          await new Promise((r) => setTimeout(r, 20));
        }
      };

      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => {
          loadRemaining();
        });
      } else {
        setTimeout(loadRemaining, 50);
      }
    };

    if (prefersReducedMotion) {
      loadImage(0).then(() => {
        if (images[0]) {
          resizeCanvas();
          renderFrame(0);
        }
        hideLoader();
      });
      showPhase(0);
      if (heroContainer) heroContainer.style.height = '100vh';
    } else {
      startSequence();
    }

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizeCanvas();
        if (stInstance) ScrollTrigger.refresh();
      }, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDestroyed = true;
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (stInstance) stInstance.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === heroContainer) st.kill();
      });
    };
  }, []);

  return (
    <section className="hero-sequence" id="hero">
      {/* Loading State */}
      <div
        className={`hero-loader ${loaderHidden ? 'hidden' : ''}`}
        id="heroLoader"
        ref={loaderRef}
        style={loaderDisplayNone ? { display: 'none' } : undefined}
      >
        <div className="loader-content">
          <span className="loader-brand">
            <span className="brand-tech">TECH</span> <span className="brand-yuva">YUVA</span>
          </span>
          <div className="loader-bar">
            <div className="loader-progress" id="loaderProgress" ref={progressBarRef}></div>
          </div>
          <span className="loader-text">Loading experience...</span>
        </div>
      </div>

      {/* Hero Canvas Container: 400vh scroll container, sticky canvas pinned inside */}
      <div className="hero-scroll-container" id="heroScrollContainer" ref={containerRef}>
        <div className="hero-sticky">
          {/* Canvas */}
          <canvas id="heroCanvas" ref={canvasRef}></canvas>

          {/* Subtle technical grid overlay */}
          <div className="hero-grid-pattern"></div>

          {/* Subtle vignette overlay */}
          <div className="hero-vignette"></div>

          {/* Left readability gradient */}
          <div className="hero-text-gradient"></div>

          {/* Text Overlay — 5 phases synced to user scroll */}
          <div className="hero-overlay">
            {/* Phase 1: 0–20% — Brand identity & Hero hook */}
            <div className="hero-phase phase-1 active" id="heroPhase1" ref={phase1Ref}>
              <div className="hero-badge-pill">
                <span className="pulse-dot dot-active"></span>
                <span>Join 500+ active members building future tech</span>
              </div>
              <img src="/assets/logo.jpg" alt="Tech Yuva" className="phase-logo" />
              <h1 className="phase-heading-xl">
                <span className="brand-tech">TECH</span> <span className="brand-yuva">YUVA</span>
              </h1>
              <p className="phase-tagline">Where Youth Meet to Build Future Tech</p>
              <div className="hero-cta-row">
                <a
                  href={JOIN_FORM_URL}
                  data-join-form="true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-white"
                >
                  Join Community
                </a>
                <a href="#intro" className="btn btn-ghost">
                  Explore Tech Yuva
                </a>
              </div>
            </div>

            {/* Phase 2: 20–40% — Primary statement */}
            <div className="hero-phase phase-2" id="heroPhase2" ref={phase2Ref}>
              <p className="phase-statement">
                Building future tech<br />
                with ambitious youth.
              </p>
            </div>

            {/* Phase 3: 40–60% — Minimal / VR dominant */}
            <div className="hero-phase phase-3" id="heroPhase3" ref={phase3Ref}>
              <p className="phase-whisper">Enter the future.</p>
            </div>

            {/* Phase 4: 60–80% — BUILD. CONNECT. INNOVATE. */}
            <div className="hero-phase phase-4" id="heroPhase4" ref={phase4Ref}>
              <div className="phase-words">
                <span className="phase-word" id="word1" ref={word1Ref}>BUILD.</span>
                <span className="phase-word" id="word2" ref={word2Ref}>CONNECT.</span>
                <span className="phase-word" id="word3" ref={word3Ref}>INNOVATE.</span>
              </div>
            </div>

            {/* Phase 5: 80–100% — Final CTA */}
            <div className="hero-phase phase-5" id="heroPhase5" ref={phase5Ref}>
              <p className="phase-final-heading">
                Where Young Minds<br />
                Build What&apos;s Next.
              </p>
              <p className="phase-subtext">
                Join 500+ builders shipping production systems, AI pipelines &amp; real startups.
              </p>
              <div className="hero-cta-row">
                <a
                  href={JOIN_FORM_URL}
                  data-join-form="true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-white"
                >
                  Join Community
                </a>
                <a href="#hackathon" className="btn btn-ghost">
                  Explore Events
                </a>
              </div>
            </div>
          </div>

          {/* Scroll Down Indicator */}
          <a href="#intro" className="hero-scroll-indicator" aria-label="Scroll to explore">
            <span>Scroll</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
          </a>
        </div>
      </div>

      {/* Bottom transition gradient */}
      <div className="hero-transition"></div>
    </section>
  );
}

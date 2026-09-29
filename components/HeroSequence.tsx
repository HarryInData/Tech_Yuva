'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const FRAME_COUNT = 270;
const FRAME_DIR = '/assets/frames/';
const FRAME_EXT = '.png';
const SCRUB_SPEED = 0.7;
const BATCH_SIZE = 10;

function getFramePath(index: number) {
  const num = String(index + 1).padStart(3, '0');
  return `${FRAME_DIR}${num}${FRAME_EXT}`;
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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

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

    const images: (HTMLImageElement | null)[] = new Array(FRAME_COUNT).fill(null);
    let loadedCount = 0;
    let currentFrame = -1;
    let isReady = false;
    let rafId: number | null = null;
    let stInstance: ScrollTrigger | null = null;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resizeCanvas = () => {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w <= 768;
      const scale = isMobile ? Math.min(dpr, 1.5) : dpr;

      canvas.width = w * scale;
      canvas.height = h * scale;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(scale, 0, 0, scale, 0, 0);

      if (currentFrame >= 0 && images[currentFrame]) {
        renderFrame(currentFrame);
      }
    };

    const renderFrame = (index: number) => {
      if (!ctx || !images[index]) return;
      if (index === currentFrame && isReady) return;

      currentFrame = index;
      const img = images[index]!;
      const cw = window.innerWidth;
      const ch = window.innerHeight;

      ctx.clearRect(0, 0, cw, ch);

      const imgRatio = img.naturalWidth / img.naturalHeight;
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

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    };

    const updateLoaderProgress = () => {
      if (progressBarRef.current) {
        const pct = Math.min((loadedCount / FRAME_COUNT) * 100, 100);
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
          images[index] = img;
          loadedCount++;
          updateLoaderProgress();
          resolve(img);
        };
        img.onerror = () => {
          loadedCount++;
          updateLoaderProgress();
          resolve(null);
        };
        img.src = getFramePath(index);
      });
    };

    const hideLoader = () => {
      setLoaderHidden(true);
      setTimeout(() => {
        setLoaderDisplayNone(true);
      }, 700);
    };

    const showPhase = (phaseIndex: number) => {
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

      const frameAnimation = { frame: 0 };

      const tween = gsap.to(frameAnimation, {
        frame: FRAME_COUNT - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: heroContainer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SCRUB_SPEED,
          onUpdate: (self) => {
            const progress = self.progress;
            const frameIndex = Math.round(progress * (FRAME_COUNT - 1));
            const clampedIndex = Math.max(0, Math.min(frameIndex, FRAME_COUNT - 1));

            let targetFrame = clampedIndex;
            if (!images[targetFrame]) {
              for (let k = targetFrame; k >= 0; k--) {
                if (images[k]) {
                  targetFrame = k;
                  break;
                }
              }
            }

            if (targetFrame !== currentFrame) {
              if (rafId) cancelAnimationFrame(rafId);
              rafId = requestAnimationFrame(() => renderFrame(targetFrame));
            }

            updateTextPhases(progress);
          },
        },
      });

      stInstance = tween.scrollTrigger ?? null;
    };

    const loadFrames = async () => {
      await loadImage(0);
      if (images[0]) {
        resizeCanvas();
        renderFrame(0);
        hideLoader();
        isReady = true;
      }

      for (let i = 1; i < FRAME_COUNT; i += BATCH_SIZE) {
        const batch: Promise<HTMLImageElement | null>[] = [];
        for (let j = i; j < Math.min(i + BATCH_SIZE, FRAME_COUNT); j++) {
          batch.push(loadImage(j));
        }
        await Promise.all(batch);
      }
    };

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    };

    window.addEventListener('resize', handleResize);

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
      loadFrames();
      initScrollAnimation();
      showPhase(0);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      if (rafId) cancelAnimationFrame(rafId);
      if (stInstance) stInstance.kill();
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

      {/* Scroll Container: 450vh tall, canvas sticks inside */}
      <div className="hero-scroll-container" id="heroScrollContainer" ref={containerRef}>
        <div className="hero-sticky">
          {/* Canvas */}
          <canvas id="heroCanvas" ref={canvasRef}></canvas>

          {/* Subtle vignette overlay */}
          <div className="hero-vignette"></div>

          {/* Left readability gradient */}
          <div className="hero-text-gradient"></div>

          {/* Text Overlay — 5 phases synced to scroll */}
          <div className="hero-overlay">
            {/* Phase 1: 0–20% — Brand identity */}
            <div className="hero-phase phase-1" id="heroPhase1" ref={phase1Ref}>
              <img src="/assets/logo.jpg" alt="Tech Yuva" className="phase-logo" />
              <h1 className="phase-heading-xl">
                <span className="brand-tech">TECH</span> <span className="brand-yuva">YUVA</span>
              </h1>
              <p className="phase-tagline">Where Youth Meet to Build Future Tech</p>
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
              <div className="phase-cta-group">
                <a href="#join" className="btn btn-white">Explore Tech Yuva</a>
                <a href="#hackathon" className="btn btn-ghost">Explore Events</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom transition gradient */}
      <div className="hero-transition"></div>
    </section>
  );
}

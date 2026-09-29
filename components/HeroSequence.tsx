'use client';

import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 270;
const FRAME_DIR = '/assets/frames/';
const BATCH_SIZE = 15;
const FPS = 25; // 25 frames per second
const FRAME_INTERVAL = 1000 / FPS; // 40ms per frame

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

  // References for continuous auto-play loop (prevents re-renders from breaking loop)
  const isPlayingRef = useRef(true);
  const currentFrameRef = useRef(0);
  const isHoldingRef = useRef(false);
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
    let lastTick = performance.now();
    let holdTimeout: NodeJS.Timeout | null = null;
    let isDestroyed = false;

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

        const cur = currentFrameRef.current;
        if (cur >= 0 && images[cur]) {
          renderFrame(cur);
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

        ctx.drawImage(img, Math.round(offsetX), Math.round(offsetY), Math.round(drawW), Math.round(drawH));
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
      }, 600);
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

    // Auto-Play animation loop
    const autoPlayLoop = (now: number) => {
      if (isDestroyed) return;

      if (isPlayingRef.current && !isHoldingRef.current) {
        const delta = now - lastTick;
        if (delta >= FRAME_INTERVAL) {
          const framesToAdvance = Math.max(1, Math.floor(delta / FRAME_INTERVAL));
          lastTick = now - (delta % FRAME_INTERVAL);

          let nextFrame = currentFrameRef.current + framesToAdvance;

          if (nextFrame >= FRAME_COUNT - 1) {
            // Reached final CTA phase
            nextFrame = FRAME_COUNT - 1;
            currentFrameRef.current = nextFrame;
            renderFrame(nextFrame);
            updateTextPhases(1);

            // Hold on CTA phase for 3.5 seconds so user can read/click, then loop back
            isHoldingRef.current = true;
            holdTimeout = setTimeout(() => {
              if (isDestroyed) return;
              currentFrameRef.current = 0;
              isHoldingRef.current = false;
              lastTick = performance.now();
              renderFrame(0);
              updateTextPhases(0);
            }, 3500);
          } else {
            currentFrameRef.current = nextFrame;

            // Pick nearest loaded frame if current hasn't finished loading
            let drawIdx = nextFrame;
            if (!images[drawIdx]) {
              for (let k = drawIdx; k >= 0; k--) {
                if (images[k]) {
                  drawIdx = k;
                  break;
                }
              }
            }
            if (drawIdx !== renderedFrame && images[drawIdx]) {
              renderFrame(drawIdx);
            }

            const progress = nextFrame / (FRAME_COUNT - 1);
            updateTextPhases(progress);
          }
        }
      }

      rafId = requestAnimationFrame(autoPlayLoop);
    };

    // Start loading frames and launch auto-play immediately
    const startSequence = async () => {
      // Preload first 20 frames for instant smooth playback
      const initialLoads: Promise<HTMLImageElement | null>[] = [];
      for (let i = 0; i < 20; i++) {
        initialLoads.push(loadImage(i));
      }
      await Promise.all(initialLoads);

      if (isDestroyed) return;
      resizeCanvas();
      if (images[0]) renderFrame(0);
      hideLoader();
      showPhase(0);

      // Start auto-play loop immediately
      lastTick = performance.now();
      rafId = requestAnimationFrame(autoPlayLoop);

      // Stream the remaining frames in the background
      for (let i = 20; i < FRAME_COUNT; i += BATCH_SIZE) {
        if (isDestroyed) break;
        const batch: Promise<HTMLImageElement | null>[] = [];
        for (let j = i; j < Math.min(i + BATCH_SIZE, FRAME_COUNT); j++) {
          batch.push(loadImage(j));
        }
        await Promise.all(batch);
      }
    };

    startSequence();

    // Pause when hero is out of view to save GPU/battery
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          isPlayingRef.current = false;
        } else {
          isPlayingRef.current = true;
          lastTick = performance.now();
        }
      },
      { threshold: 0.1 }
    );

    if (heroContainer) {
      observer.observe(heroContainer);
    }

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isDestroyed = true;
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      if (holdTimeout) clearTimeout(holdTimeout);
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, []); // Run ONCE on mount

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

      {/* Hero Canvas Container: full-screen cinematic experience with automatic animation */}
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

          {/* Text Overlay — 5 phases synced to automatic playback */}
          <div className="hero-overlay">
            {/* Phase 1: Brand identity */}
            <div className="hero-phase phase-1 active" id="heroPhase1" ref={phase1Ref}>
              <img src="/assets/logo.jpg" alt="Tech Yuva" className="phase-logo" />
              <h1 className="phase-heading-xl">
                <span className="brand-tech">TECH</span> <span className="brand-yuva">YUVA</span>
              </h1>
              <p className="phase-tagline">Where Youth Meet to Build Future Tech</p>
            </div>

            {/* Phase 2: Primary statement */}
            <div className="hero-phase phase-2" id="heroPhase2" ref={phase2Ref}>
              <p className="phase-statement">
                Building future tech<br />
                with ambitious youth.
              </p>
            </div>

            {/* Phase 3: Minimal / VR dominant */}
            <div className="hero-phase phase-3" id="heroPhase3" ref={phase3Ref}>
              <p className="phase-whisper">Enter the future.</p>
            </div>

            {/* Phase 4: BUILD. CONNECT. INNOVATE. */}
            <div className="hero-phase phase-4" id="heroPhase4" ref={phase4Ref}>
              <div className="phase-words">
                <span className="phase-word" id="word1" ref={word1Ref}>BUILD.</span>
                <span className="phase-word" id="word2" ref={word2Ref}>CONNECT.</span>
                <span className="phase-word" id="word3" ref={word3Ref}>INNOVATE.</span>
              </div>
            </div>

            {/* Phase 5: Final CTA */}
            <div className="hero-phase phase-5" id="heroPhase5" ref={phase5Ref}>
              <p className="phase-final-heading">
                Where Young Minds<br />
                Build What&apos;s Next.
              </p>
              <div className="phase-cta-group">
                <button type="button" className="btn btn-white" data-join-form="true">Join Community</button>
                <a href="#hackathon" className="btn btn-ghost">Explore Events</a>
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

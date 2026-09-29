/* ============================================
   TECH YUVA — Scroll-Driven Cinematic Experience
   Canvas frame sequence + GSAP ScrollTrigger
   ============================================ */

(function () {
    'use strict';

    // === Configuration ===
    const FRAME_COUNT = 270;
    const FRAME_DIR = 'assets/frames/';
    const FRAME_EXT = '.png';
    const SCRUB_SPEED = 0.7;
    const BATCH_SIZE = 10;

    // Detect reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // === DOM References ===
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const heroContainer = document.getElementById('heroScrollContainer');
    const loader = document.getElementById('heroLoader');
    const loaderProgress = document.getElementById('loaderProgress');

    // Phase elements
    const phases = [
        document.getElementById('heroPhase1'),
        document.getElementById('heroPhase2'),
        document.getElementById('heroPhase3'),
        document.getElementById('heroPhase4'),
        document.getElementById('heroPhase5')
    ];
    const words = [
        document.getElementById('word1'),
        document.getElementById('word2'),
        document.getElementById('word3')
    ];

    // === State ===
    const images = new Array(FRAME_COUNT);
    let loadedCount = 0;
    let currentFrame = -1;
    let isReady = false;
    let rafId = null;

    // === Utility: Frame filename ===
    function getFramePath(index) {
        // Frames are named 001.png through 270.png
        const num = String(index + 1).padStart(3, '0');
        return FRAME_DIR + num + FRAME_EXT;
    }

    // === Canvas Sizing ===
    function resizeCanvas() {
        if (!canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for memory
        const w = window.innerWidth;
        const h = window.innerHeight;

        // Reduce resolution on mobile
        const isMobile = w <= 768;
        const scale = isMobile ? Math.min(dpr, 1.5) : dpr;

        canvas.width = w * scale;
        canvas.height = h * scale;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(scale, 0, 0, scale, 0, 0);

        // Redraw current frame after resize
        if (currentFrame >= 0 && images[currentFrame]) {
            renderFrame(currentFrame);
        }
    }

    // === Canvas Rendering — Object-fit cover ===
    function renderFrame(index) {
        if (!ctx || !images[index]) return;
        if (index === currentFrame && isReady) return; // Skip redundant draws

        currentFrame = index;
        const img = images[index];
        const cw = window.innerWidth;
        const ch = window.innerHeight;

        ctx.clearRect(0, 0, cw, ch);

        // Calculate cover dimensions
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const canvasRatio = cw / ch;

        let drawW, drawH, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
            // Canvas is wider — fit to width
            drawW = cw;
            drawH = cw / imgRatio;
            offsetX = 0;
            offsetY = (ch - drawH) / 2;
        } else {
            // Canvas is taller — fit to height
            drawH = ch;
            drawW = ch * imgRatio;
            offsetX = (cw - drawW) / 2;
            offsetY = 0;
        }

        ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    }

    // === Frame Loading ===
    function loadImage(index) {
        return new Promise((resolve) => {
            if (images[index]) {
                resolve(images[index]);
                return;
            }

            const img = new Image();
            img.onload = function () {
                images[index] = img;
                loadedCount++;
                updateLoaderProgress();
                resolve(img);
            };
            img.onerror = function () {
                // On error, skip — keep previous valid frame
                loadedCount++;
                updateLoaderProgress();
                resolve(null);
            };
            img.src = getFramePath(index);
        });
    }

    function updateLoaderProgress() {
        if (loaderProgress) {
            const pct = Math.min((loadedCount / FRAME_COUNT) * 100, 100);
            loaderProgress.style.width = pct + '%';
        }
    }

    async function loadFrames() {
        // Step 1: Load first frame immediately and show it
        await loadImage(0);
        if (images[0]) {
            resizeCanvas();
            renderFrame(0);
            hideLoader();
            isReady = true;
        }

        // Step 2: Load remaining frames in batches
        for (let i = 1; i < FRAME_COUNT; i += BATCH_SIZE) {
            const batch = [];
            for (let j = i; j < Math.min(i + BATCH_SIZE, FRAME_COUNT); j++) {
                batch.push(loadImage(j));
            }
            await Promise.all(batch);
        }
    }

    function hideLoader() {
        if (loader) {
            loader.classList.add('hidden');
            // Remove from DOM after animation
            setTimeout(() => {
                if (loader.parentNode) loader.style.display = 'none';
            }, 700);
        }
    }

    // === Phase Control ===
    function showPhase(phaseIndex) {
        phases.forEach((el, i) => {
            if (!el) return;
            if (i === phaseIndex) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    // === GSAP ScrollTrigger Setup ===
    function initScrollAnimation() {
        if (!canvas || !ctx || !heroContainer) return;

        gsap.registerPlugin(ScrollTrigger);

        // Main frame scrubbing
        const frameAnimation = { frame: 0 };

        gsap.to(frameAnimation, {
            frame: FRAME_COUNT - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
                trigger: heroContainer,
                start: 'top top',
                end: 'bottom bottom',
                scrub: SCRUB_SPEED,
                onUpdate: function (self) {
                    const progress = self.progress;
                    const frameIndex = Math.round(progress * (FRAME_COUNT - 1));
                    const clampedIndex = Math.max(0, Math.min(frameIndex, FRAME_COUNT - 1));

                    // Find nearest loaded frame
                    let targetFrame = clampedIndex;
                    if (!images[targetFrame]) {
                        // Search backward for nearest loaded frame
                        for (let k = targetFrame; k >= 0; k--) {
                            if (images[k]) { targetFrame = k; break; }
                        }
                    }

                    // Render via rAF to avoid excessive redraws
                    if (targetFrame !== currentFrame) {
                        if (rafId) cancelAnimationFrame(rafId);
                        rafId = requestAnimationFrame(() => renderFrame(targetFrame));
                    }

                    // Update text phases based on progress
                    updateTextPhases(progress);
                }
            }
        });
    }

    function updateTextPhases(progress) {
        if (progress < 0.20) {
            showPhase(0);
        } else if (progress < 0.40) {
            showPhase(1);
        } else if (progress < 0.60) {
            showPhase(2);
        } else if (progress < 0.80) {
            showPhase(3);
            // Animate words stagger
            animateWords(progress);
        } else {
            showPhase(4);
        }
    }

    function animateWords(progress) {
        // Map 0.60–0.80 to 0–1 for word stagger
        const localProg = (progress - 0.60) / 0.20;
        words.forEach((el, i) => {
            if (!el) return;
            const wordStart = i * 0.25;
            const wordProg = Math.max(0, Math.min((localProg - wordStart) / 0.35, 1));
            // Ease out quad
            const eased = 1 - (1 - wordProg) * (1 - wordProg);
            el.style.opacity = eased;
            el.style.transform = 'translateY(' + (30 * (1 - eased)) + 'px)';
        });
    }

    // === Reduced Motion Fallback ===
    function initReducedMotion() {
        // Load a single poster frame and display statically
        loadImage(0).then(() => {
            if (images[0]) {
                resizeCanvas();
                renderFrame(0);
            }
            hideLoader();
        });

        // Show phase 1 (brand identity) permanently
        showPhase(0);

        // Make hero container just 100vh
        if (heroContainer) heroContainer.style.height = '100vh';
    }

    // === Navigation ===
    function initNavigation() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.getElementById('navLinks');
        const navItems = navLinks ? navLinks.querySelectorAll('a') : [];
        const sections = document.querySelectorAll('section[id]');

        // Scroll effect & Active link highlight
        function onScroll() {
            if (navbar) {
                navbar.classList.toggle('scrolled', window.scrollY > 80);
            }

            const scrollPos = window.scrollY + 180;
            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');
                if (scrollPos >= top && scrollPos < top + height) {
                    navItems.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        }

        window.addEventListener('scroll', onScroll, { passive: true });

        // Mobile toggle
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('open');
                document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
            });
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    navLinks.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });
        }

        // Smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    window.scrollTo({
                        top: target.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // === Scroll Reveal ===
    function initScrollReveal() {
        if (prefersReducedMotion) {
            // Make everything visible immediately
            document.querySelectorAll('.reveal-up,.reveal-text').forEach(el => el.classList.add('visible'));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add stagger delay based on sibling index
                    const parent = entry.target.parentElement;
                    if (parent) {
                        const siblings = Array.from(parent.querySelectorAll('.reveal-up,.reveal-text'));
                        const idx = siblings.indexOf(entry.target);
                        entry.target.style.transitionDelay = (idx * 0.08) + 's';
                    }
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.reveal-up,.reveal-text').forEach(el => observer.observe(el));
    }

    // === Counter Animation ===
    function initCounters() {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const cards = entry.target.querySelectorAll('.impact-card');
                    cards.forEach((card, i) => {
                        setTimeout(() => {
                            const target = parseInt(card.getAttribute('data-count'));
                            const numEl = card.querySelector('.impact-num');
                            if (numEl && target) {
                                animateCounter(numEl, target);
                            }
                        }, i * 150);
                    });
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        const grid = document.querySelector('.impact-grid');
        if (grid) counterObserver.observe(grid);
    }

    function animateCounter(el, target) {
        const duration = 2000;
        const start = performance.now();
        const suffix = el.textContent.replace(/[\d,]/g, '');

        function step(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    // === Pillar Card Tilt ===
    function initCardTilt() {
        if (prefersReducedMotion) return;

        document.querySelectorAll('.pillar-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                card.style.transform = `perspective(600px) rotateX(${y * -6}deg) rotateY(${x * 6}deg)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    // === Stacking Cards Scroll Animation ===
    function initStackingCards() {
        if (prefersReducedMotion || !window.gsap || !window.ScrollTrigger) return;

        const cards = gsap.utils.toArray('.stack-card');
        if (!cards.length) return;

        cards.forEach((card, index) => {
            if (index === cards.length - 1) return; // Last card stays full size

            const nextCard = cards[index + 1];

            gsap.to(card, {
                scale: 0.93,
                filter: 'brightness(0.6)',
                ease: 'none',
                scrollTrigger: {
                    trigger: nextCard,
                    start: 'top 80%',
                    end: 'top 120px',
                    scrub: true,
                }
            });
        });
    }

    // === Initialize Everything ===
    function init() {
        initNavigation();
        initScrollReveal();
        initCounters();
        initCardTilt();
        initStackingCards();

        if (prefersReducedMotion) {
            initReducedMotion();
        } else {
            // Start frame loading
            loadFrames().then(() => {
                // All frames loaded — animation fully operational
            });

            // Start GSAP animation (works progressively as frames load)
            initScrollAnimation();

            // Show phase 1 initially
            showPhase(0);
        }

        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeCanvas, 150);
        });
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9222;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 1;
    this.callbacks = new Map();
    this.events = [];
    this.consoleErrors = [];

    this.ready = new Promise((resolve) => {
      this.ws.onopen = resolve;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method === 'Runtime.consoleAPICalled') {
        if (msg.params.type === 'error') {
          this.consoleErrors.push(msg.params.args.map((a) => a.value || a.description).join(' '));
        }
      } else if (msg.method === 'Runtime.exceptionThrown') {
        this.consoleErrors.push(msg.params.exceptionDetails.text);
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  close() {
    this.ws.close();
  }
}

async function run() {
  console.log('--- STARTING ROBOT SCROLL ANIMATION QA VERIFICATION ---');

  // 1. Spawn headless chrome
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--disable-gpu=false',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--window-size=1440,900',
  ]);

  let cdp = null;

  try {
    // Wait for chrome to open debug port
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await delay(500);
      try {
        targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    if (!targets || targets.length === 0) {
      throw new Error('Could not connect to Headless Chrome remote debugging port.');
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
    await cdp.ready;

    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');

    console.log('1. Navigating to http://localhost:8080 ...');
    await cdp.send('Page.navigate', { url: 'http://localhost:8080' });
    await delay(3000); // Allow initial scripts and first frame to load

    const viewports = [
      { width: 1440, height: 900, name: 'Desktop (1440px)' },
      { width: 1920, height: 1080, name: 'Large Desktop (1920px)' },
      { width: 768, height: 1024, name: 'Tablet (768px)' },
      { width: 375, height: 812, name: 'Mobile (375px)' },
    ];

    for (const vp of viewports) {
      console.log(`\n======================================================`);
      console.log(`TESTING VIEWPORT: ${vp.name} [${vp.width}x${vp.height}]`);
      console.log(`======================================================`);

      // Set viewport metrics
      await cdp.send('Emulation.setDeviceMetricsOverride', {
        width: vp.width,
        height: vp.height,
        deviceScaleFactor: vp.width <= 768 ? 1 : 1.5,
        mobile: vp.width <= 768,
      });

      // Scroll to top instantly and wait for any smooth scrolls to stop
      await cdp.eval('window.scrollTo({ top: 0, left: 0, behavior: "instant" })');
      await delay(800);

      // Check Phase 1 elements
      const initialHeroCheck = await cdp.eval(`(() => {
        const canvas = document.getElementById('heroCanvas');
        const container = document.getElementById('heroScrollContainer');
        const phase1 = document.getElementById('heroPhase1');
        const ctaBtn = phase1?.querySelector('.hero-cta-row a[data-join-form="true"], .btn-white');
        const badge = phase1?.querySelector('.hero-badge-pill');
        const heading = phase1?.querySelector('.phase-heading-xl');
        const tagline = phase1?.querySelector('.phase-tagline');

        const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;
        const canvasRect = canvas ? canvas.getBoundingClientRect() : null;
        const containerHeight = container ? container.offsetHeight : 0;

        return {
          hasCanvas: !!canvas,
          canvasWidth: canvas ? canvas.width : 0,
          canvasHeight: canvas ? canvas.height : 0,
          containerHeight,
          phase1Active: phase1 ? phase1.classList.contains('active') : false,
          headingText: heading ? heading.innerText.trim() : '',
          taglineText: tagline ? tagline.innerText.trim() : '',
          badgeText: badge ? badge.innerText.trim() : '',
          ctaVisible: !!ctaBtn && ctaRect && ctaRect.width > 0 && ctaRect.height > 0,
          ctaClickable: ctaBtn ? window.getComputedStyle(ctaBtn).pointerEvents : '',
        };
      })()`);

      console.log('Initial State Check:');
      console.log(`  - Canvas Rendered: ${initialHeroCheck.hasCanvas} (${initialHeroCheck.canvasWidth}x${initialHeroCheck.canvasHeight})`);
      console.log(`  - Container Height: ${initialHeroCheck.containerHeight}px`);
      console.log(`  - Phase 1 Active: ${initialHeroCheck.phase1Active}`);
      console.log(`  - Heading: "${initialHeroCheck.headingText}"`);
      console.log(`  - Tagline: "${initialHeroCheck.taglineText}"`);
      console.log(`  - 500+ Badge: "${initialHeroCheck.badgeText}"`);
      console.log(`  - Join Community Button Visible: ${initialHeroCheck.ctaVisible} (pointer-events: ${initialHeroCheck.ctaClickable})`);

      if (!initialHeroCheck.hasCanvas || !initialHeroCheck.phase1Active) {
        throw new Error(`Initial hero check failed for ${vp.name}`);
      }

      // Test Slow Scroll Downwards
      console.log('\nTesting Slow Scroll Downwards (Step-by-Step):');
      const maxScroll = initialHeroCheck.containerHeight - vp.height;
      const steps = [
        Math.round(maxScroll * 0.25),
        Math.round(maxScroll * 0.50),
        Math.round(maxScroll * 0.75),
        Math.round(maxScroll * 1.00),
      ];

      for (let i = 0; i < steps.length; i++) {
        const targetY = steps[i];
        await cdp.eval(`window.scrollTo({ top: ${targetY}, behavior: 'smooth' })`);
        await delay(500);

        const state = await cdp.eval(`(() => {
          const container = document.getElementById('heroScrollContainer');
          const phases = [
            document.getElementById('heroPhase1'),
            document.getElementById('heroPhase2'),
            document.getElementById('heroPhase3'),
            document.getElementById('heroPhase4'),
            document.getElementById('heroPhase5'),
          ];
          const activeIndex = phases.findIndex(p => p && p.classList.contains('active'));
          return {
            scrollY: window.scrollY,
            activePhase: activeIndex + 1,
            phase5Heading: document.querySelector('#heroPhase5 .phase-final-heading')?.innerText?.trim(),
            phase5Subtext: document.querySelector('#heroPhase5 .phase-subtext')?.innerText?.trim(),
          };
        })()`);

        console.log(`  - Scrolled to Y=${targetY}px -> Current window.scrollY=${state.scrollY}, Active Phase=${state.activePhase}`);
      }

      // Test Fast Scroll Downwards
      console.log('\nTesting Fast Scroll to bottom of hero:');
      await cdp.eval(`window.scrollTo(0, ${maxScroll})`);
      await delay(300);
      const bottomState = await cdp.eval(`(() => {
        const phase5 = document.getElementById('heroPhase5');
        const ctaBtn = phase5?.querySelector('.hero-cta-row a[data-join-form="true"], .btn-white');
        const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;
        return {
          scrollY: window.scrollY,
          phase5Active: phase5 ? phase5.classList.contains('active') : false,
          ctaClickable: ctaBtn ? window.getComputedStyle(ctaBtn).pointerEvents : '',
          ctaRect,
        };
      })()`);
      console.log(`  - Reached Bottom Y=${maxScroll}: Phase 5 Active=${bottomState.phase5Active}, CTA Clickable=${bottomState.ctaClickable}`);

      // Test Scrolling Past Hero into Next Section (#intro)
      console.log('\nTesting Scrolling Past Hero into #intro:');
      await cdp.eval(`window.scrollTo({ top: ${maxScroll + 400}, behavior: 'smooth' })`);
      await delay(600);
      const nextSectionState = await cdp.eval(`(() => {
        const intro = document.getElementById('intro');
        const rect = intro ? intro.getBoundingClientRect() : null;
        return {
          introTop: rect ? rect.top : null,
          scrollY: window.scrollY,
          isIntroVisible: rect ? (rect.top >= -100 && rect.top <= window.innerHeight) : false,
        };
      })()`);
      console.log(`  - Scrolled past hero to Y=${nextSectionState.scrollY}px -> #intro top=${nextSectionState.introTop}px, Visible=${nextSectionState.isIntroVisible}`);

      // Test Reversible Scroll Upwards (Fast & Slow)
      console.log('\nTesting Reverse Scroll Upwards:');
      // Scroll to 50%
      await cdp.eval(`window.scrollTo(0, ${Math.round(maxScroll * 0.5)})`);
      await delay(400);
      const midReverse = await cdp.eval(`(() => {
        const phases = [1,2,3,4,5].map(n => document.getElementById('heroPhase' + n)?.classList.contains('active'));
        return {
          scrollY: window.scrollY,
          activePhase: phases.indexOf(true) + 1,
        };
      })()`);
      console.log(`  - Reversed back to 50% (Y=${Math.round(maxScroll * 0.5)}px): Active Phase=${midReverse.activePhase}`);

      // Scroll all the way back to top (0px)
      await cdp.eval(`window.scrollTo({ top: 0, behavior: 'smooth' })`);
      await delay(600);
      const topReverse = await cdp.eval(`(() => {
        const phase1 = document.getElementById('heroPhase1');
        return {
          scrollY: window.scrollY,
          phase1Active: phase1 ? phase1.classList.contains('active') : false,
        };
      })()`);
      console.log(`  - Reversed back to 0px: Phase 1 Active=${topReverse.phase1Active}, window.scrollY=${topReverse.scrollY}`);

      // Test Anchor navigation from hero
      console.log('\nTesting Anchor Click (#intro):');
      await cdp.eval(`(() => {
        const scrollLink = document.querySelector('.hero-scroll-indicator');
        if (scrollLink) scrollLink.click();
      })()`);
      await delay(800);
      const anchorResult = await cdp.eval(`(() => ({
        scrollY: window.scrollY,
        introTop: document.getElementById('intro')?.getBoundingClientRect().top
      }))()`);
      console.log(`  - Anchor clicked -> scrolled to Y=${anchorResult.scrollY}px (#intro top: ${anchorResult.introTop}px)`);
    }

    // Check for console errors
    console.log(`\n======================================================`);
    console.log(`CONSOLE ERROR AUDIT:`);
    console.log(`Total Errors Logged: ${cdp.consoleErrors.length}`);
    if (cdp.consoleErrors.length > 0) {
      console.log('Errors:', cdp.consoleErrors);
    } else {
      console.log('PASS: Zero console errors or unhandled exceptions detected!');
    }
    console.log(`======================================================`);

    console.log('\n--- QA VERIFICATION SUCCESSFULLY COMPLETED! ---');
  } catch (err) {
    console.error('QA Test Error:', err);
    process.exitCode = 1;
  } finally {
    if (cdp) cdp.close();
    chrome.kill();
  }
}

run();

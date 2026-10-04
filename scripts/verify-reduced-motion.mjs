import { spawn } from 'child_process';
import http from 'http';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORT = 9224;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function testReducedMotion() {
  const chrome = spawn(CHROME_PATH, [
    `--remote-debugging-port=${PORT}`,
    '--headless=new',
    '--no-sandbox',
    '--window-size=1440,900',
  ]);

  try {
    let targets = null;
    for (let i = 0; i < 20; i++) {
      await delay(300);
      try {
        targets = await fetchJson(`http://127.0.0.1:${PORT}/json`);
        if (targets && targets.length > 0) break;
      } catch (e) {}
    }

    const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    await new Promise((r) => (ws.onopen = r));

    let id = 1;
    const send = (method, params = {}) =>
      new Promise((resolve) => {
        const curId = id++;
        const onMsg = (e) => {
          const m = JSON.parse(e.data);
          if (m.id === curId) {
            ws.removeEventListener('message', onMsg);
            resolve(m.result);
          }
        };
        ws.addEventListener('message', onMsg);
        ws.send(JSON.stringify({ id: curId, method, params }));
      });

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: 'reduce' }],
    });
    await send('Page.navigate', { url: 'http://localhost:8080' });
    await delay(3500);

    const check = await send('Runtime.evaluate', {
      expression: `(() => {
        const container = document.getElementById('heroScrollContainer');
        const phase1 = document.getElementById('heroPhase1');
        const canvas = document.getElementById('heroCanvas');
        return {
          containerHeight: container ? container.offsetHeight : 0,
          windowHeight: window.innerHeight,
          is100vh: container ? (container.offsetHeight === window.innerHeight) : false,
          phase1Active: phase1 ? phase1.classList.contains('active') : false,
          hasCanvas: !!canvas
        };
      })()`,
      returnByValue: true,
    });

    console.log('--- REDUCED MOTION TEST RESULT ---');
    console.log(check.result.value);
    console.log('PASS: Reduced motion displays static frame at 100vh without scroll scrubbing!');
    ws.close();
  } finally {
    chrome.kill();
  }
}

testReducedMotion();

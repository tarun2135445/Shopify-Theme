import {chromium} from 'playwright-core';
import {fileURLToPath} from 'url';
import path from 'path';
import fs from 'fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const htmlUrl = 'file://' + path.join(here, 'smoke.html');
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const browser = await chromium.launch({
  executablePath: EXEC,
  args: [
    '--no-sandbox',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
  ],
});
const page = await browser.newPage({viewport: {width: 1100, height: 640}, reducedMotion: 'no-preference'});

const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

await page.goto(htmlUrl, {waitUntil: 'load'});
await page.bringToFront();
await page.waitForTimeout(800);

const env = await page.evaluate(
  () =>
    new Promise((res) => {
      let n = 0;
      const s = performance.now();
      function tick() {
        n++;
        if (performance.now() - s > 500) res({rafTicks: n, vis: document.visibilityState});
        else requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    })
);
console.log('ENV', JSON.stringify(env));
const beforeClick = await page.evaluate(() => document.querySelector('oni-motion')?.innerHTML || '');
await page.mouse.click(500, 280);
await page.waitForTimeout(900);
const afterClick = await page.evaluate(() => document.querySelector('oni-motion')?.innerHTML || '');
console.log('GESTURE_STARTED_IT', beforeClick !== afterClick);
await page.waitForTimeout(400);

const snap = () =>
  page.evaluate(() => {
    const el = document.querySelector('oni-motion');
    const node = el && el.querySelector('[style*="translate"]');
    return {
      mounted: el?.getAttribute('data-mounted'),
      childCount: el ? el.childElementCount : -1,
      innerHTMLLen: el ? el.innerHTML.length : -1,
      sampleTransform: node ? node.getAttribute('style')?.slice(0, 120) : null,
      html: el ? el.innerHTML : '',
    };
  });

const a = await snap();
await page.waitForTimeout(1200);
const b = await snap();
const domChanged = a.html !== b.html;
const diag = {
  mounted: a.mounted,
  childCount: a.childCount,
  innerHTMLLen: a.innerHTMLLen,
  domChanged,
  transformA: a.sampleTransform,
  transformB: b.sampleTransform,
};

const shot1 = path.join('/tmp', 'oni-motion-1.png');
const shot2 = path.join('/tmp', 'oni-motion-2.png');
await page.locator('.stage').screenshot({path: shot1});
await page.waitForTimeout(1200);
await page.locator('.stage').screenshot({path: shot2});

const b1 = fs.readFileSync(shot1);
const b2 = fs.readFileSync(shot2);
const moved = !b1.equals(b2);

console.log('DIAG', JSON.stringify(diag));
console.log('FRAME1_BYTES', b1.length, 'FRAME2_BYTES', b2.length, 'MOVED', moved);
console.log('ERRORS', errors.length ? JSON.stringify(errors) : 'none');

await browser.close();

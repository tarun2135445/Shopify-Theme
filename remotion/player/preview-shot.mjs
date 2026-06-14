import {chromium} from 'playwright-core';
import {fileURLToPath} from 'url';
import path from 'path';
const here = path.dirname(fileURLToPath(import.meta.url));
const url = 'file://' + path.join(here, 'preview.html');
const EXEC = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const b = await chromium.launch({executablePath: EXEC, args: ['--no-sandbox']});
const p = await b.newPage({viewport: {width: 1280, height: 720}, deviceScaleFactor: 2, reducedMotion: 'no-preference'});
await p.goto(url, {waitUntil: 'load'});
await p.waitForTimeout(2500); // let petals/haze/kanji reach an interesting moment
await p.locator('.hero').screenshot({path: '/tmp/oni-hero-preview.png'});
console.log('saved');
await b.close();

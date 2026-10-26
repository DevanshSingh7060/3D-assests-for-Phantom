const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const brain = '/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707';

async function capture() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 390, height: 844 }
  ];

  const sectionIds = [
    'home',
    'moments',
    'reality-diff',
    'memory',
    'phantom',
    'reality-diff-compare',
    'memory-receipt-section',
    'trust',
    'final-cta'
  ];

  for (const vp of viewports) {
    const dir = path.join(brain, `sections_${vp.name}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 1500));

    for (const id of sectionIds) {
      const el = await page.$(`#${id}`);
      if (el) {
        const outPath = path.join(dir, `${id}.png`);
        await el.screenshot({ path: outPath });
        console.log(`Saved ${vp.name} / ${id}`);
      }
    }
    await page.close();
  }

  await browser.close();
  console.log('All section screenshots captured successfully!');
}

capture().catch(console.error);

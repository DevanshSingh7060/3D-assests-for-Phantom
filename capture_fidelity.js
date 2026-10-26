const puppeteer = require('puppeteer-core');
const path = require('path');

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

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
    
    // Wait for spline / 3d / fonts to settle
    await new Promise(r => setTimeout(r, 2000));
    
    // Full page screenshot
    const fullPath = path.join(brain, `fidelity_${vp.name}_full.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    console.log(`Saved full page ${vp.name}: ${fullPath}`);

    // Section bounding boxes
    const sections = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('header, section, footer'));
      return els.map(el => {
        const r = el.getBoundingClientRect();
        return {
          id: el.id || el.className,
          tag: el.tagName,
          top: r.top + window.scrollY,
          left: r.left,
          width: r.width,
          height: r.height
        };
      });
    });
    console.log(`Sections for ${vp.name}:`, JSON.stringify(sections, null, 2));

    await page.close();
  }

  await browser.close();
  console.log('Fidelity captures complete!');
}

capture().catch(console.error);

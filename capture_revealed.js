const puppeteer = require('puppeteer-core');
const path = require('path');
const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const brain = '/Users/devanshsingh/.gemini/antigravity-ide/brain/8404bdc8-4523-40df-b065-77aecc86f707';

async function run() {
  const browser = await puppeteer.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle0' });
  
  await page.evaluate(() => {
    document.querySelectorAll('.receipt-reveal-item, .trust-reveal-item, .cta-reveal-item').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.visibility = 'visible';
    });
  });
  await new Promise(r => setTimeout(r, 600));
  
  const trustEl = await page.$('#trust');
  if (trustEl) await trustEl.screenshot({ path: path.join(brain, 'sections_desktop/trust_revealed.png') });
  
  const receiptEl = await page.$('#memory-receipt-section');
  if (receiptEl) await receiptEl.screenshot({ path: path.join(brain, 'sections_desktop/receipt_revealed.png') });

  const ctaEl = await page.$('#final-cta');
  if (ctaEl) await ctaEl.screenshot({ path: path.join(brain, 'sections_desktop/final_cta_revealed.png') });

  await browser.close();
  console.log('Revealed screenshots saved!');
}
run();

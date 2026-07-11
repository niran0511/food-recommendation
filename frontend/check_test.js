const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching headless browser...");
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER CONSOLE] [${msg.type()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log('[BROWSER FATAL ERROR]', err.stack || err.toString());
  });

  console.log("Navigating to http://localhost:3000/nutritionist...");
  try {
    await page.goto('http://localhost:3000/nutritionist', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    console.log("Page loaded. Waiting 3 seconds to capture async errors...");
    await new Promise(r => setTimeout(r, 3000));
  } catch (e) {
    console.error("Navigation failed:", e.message);
  }
  
  await browser.close();
  console.log("Done.");
  process.exit(0);
})();

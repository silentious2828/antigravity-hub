const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:20128/login', { waitUntil: 'networkidle' });
  const inputs = await page.$$eval('input', els => els.map(el => ({
    type: el.getAttribute('type'),
    name: el.getAttribute('name'),
    placeholder: el.getAttribute('placeholder'),
    id: el.getAttribute('id')
  })));
  console.log('Input elements:', inputs);
  await browser.close();
})();

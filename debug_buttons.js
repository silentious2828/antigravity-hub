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
  const buttons = await page.$$eval('button', els => els.map(el => ({
    innerText: el.innerText,
    className: el.className,
    id: el.getAttribute('id'),
    type: el.getAttribute('type')
  })));
  console.log('Input elements:', inputs);
  console.log('Button elements:', buttons);
  await browser.close();
})();

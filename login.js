const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto('http://localhost:20128/login', { waitUntil: 'networkidle' });
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: 'attached' });
  await passwordInput.fill('CHANGEME');
  const continueButton = page.locator('button:has-text("Continue")');
  await continueButton.waitFor({ state: 'attached' });
  await continueButton.click();
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  console.log('Login submitted');
  await browser.close();
})();

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  // Step 1: Go to login page
  await page.goto('http://localhost:20128/login', { waitUntil: 'networkidle' });
  // Fill password
  const passwordInput = page.locator('input[type="password"]');
  await passwordInput.waitFor({ state: 'attached' });
  await passwordInput.fill('CHANGEME');
  // Click Continue button
  const continueButton = page.locator('button:has-text("Continue")');
  await continueButton.waitFor({ state: 'attached' });
  await continueButton.click();
  // Wait for navigation after login
  await page.waitForNavigation({ waitUntil: 'networkidle' });
  console.log('After login, current URL:', page.url());
  // Step 2: Navigate to dashboard (main page)
  await page.goto('http://localhost:20128/dashboard', { waitUntil: 'domcontentloaded' });
  console.log('Navigated to dashboard');
  // Wait for page to load resources
  await page.waitForLoadState('networkidle');
  // Take a screenshot to verify
  await page.screenshot({ path: 'dashboard.png' });
  console.log('Dashboard screenshot saved as dashboard.png');
  // Check for a title element
  const title = page.locator('h1');
  await title.waitFor({ state: 'attached' });
  const titleText = await title.textContent();
  console.log('Dashboard title:', titleText);
  await browser.close();
})();

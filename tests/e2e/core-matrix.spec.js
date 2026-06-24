const { test, expect } = require('@playwright/test');

// Keep the suite independent of the heavy third-party Flutter widget iframe:
// stub it with an empty document so loads stay fast and deterministic.
test.beforeEach(async ({ page }) => {
  await page.route(/bible-quotes-widget\.pages\.dev/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>widget stub</title>' })
  );
});

const criticalPages = ['/', '/en', '/privacy', '/privacy-en', '/success.html'];

for (const pagePath of criticalPages) {
  test(`loads without runtime breakage: ${pagePath}`, async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
}

test('landing pages do not create horizontal overflow', async ({ page }) => {
  for (const pagePath of ['/', '/en']) {
    await page.goto(pagePath, { waitUntil: 'networkidle' });

    const hasOverflow = await page.evaluate(() => {
      const doc = document.documentElement;
      return doc.scrollWidth > doc.clientWidth + 1;
    });

    expect(hasOverflow).toBeFalsy();
  }
});

test('lightbox opens and closes cleanly', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const openBtn = page.locator('#openLightbox');
  const lightbox = page.locator('#lightbox');
  const closeBtn = page.locator('.close-lightbox');

  await openBtn.click();
  await expect(lightbox).toBeVisible();

  await closeBtn.click();
  await expect(lightbox).toBeHidden();
});

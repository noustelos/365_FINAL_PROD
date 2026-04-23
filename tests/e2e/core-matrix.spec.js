const { test, expect } = require('@playwright/test');

const criticalPages = ['/', '/en.html', '/privacy.html', '/privacy-en.html', '/success.html'];

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
  for (const pagePath of ['/', '/en.html']) {
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

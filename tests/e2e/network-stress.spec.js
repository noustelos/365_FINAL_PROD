const { test, expect } = require('@playwright/test');

test('translation timeout does not freeze page on slow network', async ({ page }) => {
  await page.route('**/translations/el.json', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 7000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}'
    });
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#header-date')).not.toContainText('...');
  await expect(page.locator('main')).toBeVisible();
});

test('malformed translation payload fails gracefully', async ({ page }) => {
  await page.route('**/translations/en.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{"broken-json":'
    });
  });

  await page.goto('/en.html', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('#header-date')).not.toContainText('...');
  await expect(page.locator('main')).toBeVisible();
});

test('slow form endpoint still shows immediate submit guard', async ({ page }) => {
  await page.route('**/success.html', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 2500));
    await route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<!doctype html><html><body>ok</body></html>'
    });
  });

  await page.goto('/en.html', { waitUntil: 'domcontentloaded' });

  const email = page.locator('#subscribe-email-en, #subscribe-email').first();
  const submit = page.locator('form.subscribe-form button[type="submit"]');

  await expect(email).toBeVisible();
  await email.fill('qa@example.com');

  const submitState = await page.evaluate(() => {
    const button = document.querySelector('form.subscribe-form button[type="submit"]');
    if (!button) return { disabled: false, busy: null };

    button.click();
    return {
      disabled: button.disabled,
      busy: button.getAttribute('aria-busy')
    };
  });

  expect(submitState.disabled).toBe(true);
  expect(submitState.busy).toBe('true');

  await page.waitForURL('**/success.html');
  await expect(page.locator('body')).toContainText('ok');
});

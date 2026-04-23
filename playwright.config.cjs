const { defineConfig, devices } = require('@playwright/test');
const os = require('os');

const isUnsupportedMacWebkit = process.platform === 'darwin' && os.release().startsWith('21.');
const projects = [
  {
    name: 'chromium-desktop',
    use: { ...devices['Desktop Chrome'] }
  },
  {
    name: 'firefox-desktop',
    use: { ...devices['Desktop Firefox'] }
  },
  {
    name: 'iphone-13',
    use: {
      ...devices['iPhone 13'],
      browserName: 'chromium'
    }
  },
  {
    name: 'pixel-5',
    use: { ...devices['Pixel 5'] }
  }
];

if (!isUnsupportedMacWebkit) {
  projects.splice(2, 0, {
    name: 'webkit-desktop',
    use: { ...devices['Desktop Safari'] }
  });
}

module.exports = defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: 0,
  timeout: 30000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'npx serve -s . -l 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: true,
    timeout: 120000
  },
  projects
});

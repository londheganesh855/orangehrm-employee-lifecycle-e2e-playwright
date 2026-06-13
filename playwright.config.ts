import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';


/**
 * Load environment variables
 */
if (!process.env.CI) {
  dotenv.config({
    path: path.resolve(__dirname, '.env.playwright')
  });
}

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,

  forbidOnly: !!process.env.CI,

  retries: process.env.CI ? 2 : 0,

  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],

  use: {
    baseURL: process.env.BASE_URL,

    trace: 'retain-on-failure',
    video: 'on',
    screenshot: 'only-on-failure',
    headless: true,
    viewport: null,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  // More setup steps per test now (persistent nav, day-select's extra
  // options, effort chips) push some flows close to the 30s default under
  // parallel worker contention — 45s gives real headroom, not just slack.
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --port 5180 --strictPort',
    url: 'http://localhost:5180',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } },
    },
  ],
})

import { defineConfig, devices } from "@playwright/test";

// Separate ports so the tests can run next to a local dev setup
const API_PORT = 9100;
const APP_PORT = 3100;
const testDatabase = process.env.PG_TEST_DATABASE || "poscon_test";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.js",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // The API checks the database as soon as it starts, so build the test database first
      command: "npm run db:reset:test && npm start",
      cwd: "../server",
      url: `http://localhost:${API_PORT}/data`,
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: String(API_PORT),
        PG_DATABASE: testDatabase,
        CLIENT_ORIGIN: `http://localhost:${APP_PORT}`,
        SESSION_SECRET: process.env.SESSION_SECRET || "e2e-secret",
        AUTH_RATE_LIMIT: "10000",
        CONTACT_RATE_LIMIT: "10000",
      },
    },
    {
      command: "npm start",
      cwd: "../postocom",
      url: `http://localhost:${APP_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        PORT: String(APP_PORT),
        BROWSER: "none",
        REACT_APP_API_URL: `http://localhost:${API_PORT}`,
      },
    },
  ],
});

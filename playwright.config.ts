import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 4173);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.(ts|js)/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "off",
    locale: "es-ES",
    viewport: { width: 412, height: 915 },
    isMobile: true,
    hasTouch: true,
    serviceWorkers: "block",
    userAgent:
      "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  },
  webServer: {
    command: process.env.E2E_NO_BUILD
      ? `npx vite preview --host 127.0.0.1 --port ${PORT}`
      : `npm run build && npx vite preview --host 127.0.0.1 --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      ...process.env,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ?? "https://placeholder.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY:
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "placeholder-publishable-key",
      VITE_SUPABASE_PROJECT_ID: process.env.VITE_SUPABASE_PROJECT_ID ?? "placeholder",
    },
  },
});

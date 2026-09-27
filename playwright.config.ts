import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT || 8912);

export default defineConfig({
  testDir: "tests",
  // Serial on purpose. The dev server is python's http.server and the suite
  // loads axe into every page, so six parallel workers starve each other on a
  // busy machine: measured 2026-09-27, `fullyParallel` with the default worker
  // count failed six of nine tests on `waitForSelector` timeouts while the same
  // nine passed in 41s at `--workers=1`. Nine tests do not need the parallelism,
  // and a suite that only goes green on an idle box is not a gate.
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    viewport: { width: 1440, height: 900 },
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `python -m http.server ${PORT} --bind 127.0.0.1`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !process.env.CI,
    stdout: "ignore",
  },
});

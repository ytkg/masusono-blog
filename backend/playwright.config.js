const { defineConfig, devices } = require("@playwright/test")

const baseURL = process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3100"
const disableWebServer = process.env.PLAYWRIGHT_DISABLE_WEBSERVER === "1"
const webServer = [
  {
    command: "./bin/e2e-vite-server",
    url: process.env.PLAYWRIGHT_VITE_URL || "http://localhost:3036/vite/@vite/client",
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
  {
    command: "PORT=3100 ./bin/e2e-rails-server",
    url: process.env.PLAYWRIGHT_RAILS_URL || "http://127.0.0.1:3100/up",
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
]

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  workers: 1,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: disableWebServer ? undefined : webServer,
})

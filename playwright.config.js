import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./test/visual",
  testMatch: "*.visual.js",
  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.VISUAL_BASE_URL || "http://localhost:3000",
    browserName: "chromium",
    colorScheme: "light",
    deviceScaleFactor: 1,
    locale: "ja-JP",
    reducedMotion: "reduce",
    timezoneId: "Asia/Tokyo",
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.001,
    },
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
})

/// <reference types="vitest/config" />

import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"
import react from "@vitejs/plugin-react"
import { fileURLToPath } from "node:url"

function formatBuildVersion(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  )

  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}`
}

const buildVersion = formatBuildVersion(new Date())
const frontendRoot = fileURLToPath(new URL("./app/frontend", import.meta.url))

export default defineConfig(async ({ command }) => {
  const { default: inertia } = await import("@inertiajs/vite")
  return {
    define: {
      "import.meta.env.VITE_BUILD_VERSION": JSON.stringify(buildVersion),
    },
    plugins: [RubyPlugin(), react(), inertia({ ssr: { entry: "ssr/ssr.jsx", host: "127.0.0.1" } })],
    server: { allowedHosts: ["vite"] },
    ssr: {
      noExternal: command === "build" ? true : [],
    },
    resolve: {
      alias: {
        "@": frontendRoot,
      },
    },
    build: {
      chunkSizeWarningLimit: 600,
    },
    test: {
      // Keep jsdom workers bounded when Docker shares resources with Rails and Playwright.
      maxWorkers: process.env.CI ? 4 : 2,
      environment: "jsdom",
      setupFiles: ["./test/setup.js"],
      include: ["**/*.{test,spec}.{js,jsx}"],
    },
  } as never
})

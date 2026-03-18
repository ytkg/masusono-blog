/// <reference types="vitest/config" />

import { defineConfig } from "vite"
import RubyPlugin from "vite-plugin-ruby"
import react from "@vitejs/plugin-react"

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

  const values = Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]))

  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}`
}

const buildVersion = formatBuildVersion(new Date())

export default defineConfig({
  define: {
    "import.meta.env.VITE_BUILD_VERSION": JSON.stringify(buildVersion),
  },
  plugins: [RubyPlugin(), react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.js"],
    include: ["**/*.{test,spec}.{js,jsx}"],
  },
} as never)

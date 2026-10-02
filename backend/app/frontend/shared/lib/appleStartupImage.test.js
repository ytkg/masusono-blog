import { afterEach, expect, it, vi } from "vitest"
import { installAppleStartupImage } from "./appleStartupImage"

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.head.innerHTML = ""
})

function setup(userAgent = "iPhone") {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue(userAgent)
  document.head.innerHTML = `
    <link rel="apple-touch-startup-image" media="old-phone" href="/old.png">
    <link rel="apple-touch-startup-image" media="new-phone" href="/new.png">
    <link rel="apple-touch-icon" href="/icon.png">
  `
  vi.stubGlobal(
    "matchMedia",
    vi.fn((media) => ({ matches: media === "new-phone" })),
  )
  // Capture listeners so each test can exercise them without leaking callbacks.
  return vi.spyOn(window, "addEventListener").mockImplementation(() => {})
}

it("replaces old-device declarations with the matching image without media", () => {
  setup()
  installAppleStartupImage()
  const images = document.querySelectorAll('link[rel="apple-touch-startup-image"]')
  expect(images).toHaveLength(1)
  expect(new URL(images[0].href).pathname).toBe("/new.png")
  expect(images[0].hasAttribute("media")).toBe(false)
  expect(document.querySelector('link[rel="apple-touch-icon"]')).not.toBeNull()
})

it("preserves static declarations on other platforms", () => {
  setup("Android")
  installAppleStartupImage()
  expect(document.querySelectorAll('link[rel="apple-touch-startup-image"]')).toHaveLength(2)
})

it("preserves static declarations when no image matches", () => {
  setup()
  window.matchMedia.mockReturnValue({ matches: false })
  installAppleStartupImage()
  expect(document.querySelectorAll('link[rel="apple-touch-startup-image"]')).toHaveLength(2)
})

it("reselects after a screen change and avoids replacing an unchanged image", () => {
  const listeners = setup()
  installAppleStartupImage()
  const update = listeners.mock.calls.find(([name]) => name === "resize")[1]
  const first = document.querySelector('link[rel="apple-touch-startup-image"]')
  update()
  expect(document.querySelector('link[rel="apple-touch-startup-image"]')).toBe(first)
  window.matchMedia.mockImplementation((media) => ({ matches: media === "old-phone" }))
  update()
  expect(document.querySelector('link[rel="apple-touch-startup-image"]').href).toContain("/old.png")
})

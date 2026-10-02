// Experimental: ask iOS to reconsider the startup image after a device migration.
// This runs after launch and can only affect subsequent launches.
export function installAppleStartupImage() {
  const isAppleMobile =
    /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  if (!isAppleMobile && navigator.standalone !== true) return

  const images = Array.from(document.querySelectorAll('link[rel="apple-touch-startup-image"]'))
  if (!images.length) return

  let currentHref
  function update() {
    const selected = images.find((image) => image.media && window.matchMedia(image.media).matches)
    if (!selected || selected.href === currentHref) return

    const replacement = document.createElement("link")
    replacement.rel = "apple-touch-startup-image"
    replacement.href = selected.href
    // Omit media so the only declared image is the one matching this device now.
    document.querySelectorAll('link[rel="apple-touch-startup-image"]').forEach((image) => image.remove())
    document.head.appendChild(replacement)
    currentHref = selected.href
  }

  update()
  window.addEventListener("resize", update)
  window.addEventListener("pageshow", update)
}

// Aborting releases callbacks and finishes loading tasks; it does not evict the browser cache.
export function loadImage(src, { signal } = {}) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      resolve(null)
      return
    }

    const image = new Image()
    let settled = false
    function finish(value, error) {
      if (settled) return
      settled = true
      image.onload = null
      image.onerror = null
      signal?.removeEventListener("abort", abort)
      if (error) reject(error)
      else resolve(value)
    }
    function abort() {
      finish(null)
    }
    image.onload = () => finish(image)
    image.onerror = () => finish(null, new Error("画像を読み込めませんでした"))
    signal?.addEventListener("abort", abort, { once: true })
    image.src = src
  })
}

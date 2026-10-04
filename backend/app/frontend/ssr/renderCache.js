import { Buffer } from "node:buffer"
import { createHash } from "node:crypto"

// Cache only identical Inertia payloads, including props, URL and asset version.
// The byte limit bounds memory even when a page contains a large article feed.
export function createCachedRenderer(
  render,
  { maxBytes = 8 * 1024 * 1024, maxEntries = 32, ttlMs = 5 * 60 * 1000, now = Date.now } = {},
) {
  const entries = new Map()
  const pending = new Map()
  let bytes = 0

  function remove(key) {
    bytes -= entries.get(key).bytes
    entries.delete(key)
  }

  return async (page) => {
    const key = createHash("sha256").update(JSON.stringify(page)).digest("hex")
    const cached = entries.get(key)
    if (cached && now() - cached.createdAt < ttlMs) {
      entries.delete(key)
      entries.set(key, cached)
      return cached.result
    }
    if (cached) remove(key)
    if (pending.has(key)) return pending.get(key)

    const request = (async () => {
      const result = await render(page)
      if (!result) return result
      const size = Buffer.byteLength(JSON.stringify(result))
      if (size > maxBytes || maxEntries < 1) return result
      if (entries.has(key)) remove(key)
      while (entries.size >= maxEntries || bytes + size > maxBytes) remove(entries.keys().next().value)
      entries.set(key, { result, bytes: size, createdAt: now() })
      bytes += size
      return result
    })()

    // Limit bookkeeping for simultaneous misses as well as completed results.
    if (pending.size < maxEntries) pending.set(key, request)
    try {
      return await request
    } finally {
      if (pending.get(key) === request) pending.delete(key)
    }
  }
}

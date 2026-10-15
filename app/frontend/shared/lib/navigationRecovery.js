import { createNavigationFailureReporter, localUrl } from "./navigationFailureReporter"

let failure = null
const listeners = new Set()

export const subscribeNavigationFailure = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
export const getNavigationFailure = () => failure

export function dismissNavigationFailure() {
  failure = null
  listeners.forEach((listener) => listener())
}

function showFailure(url, kind, requestId) {
  failure = { url, kind, requestId }
  listeners.forEach((listener) => listener())
}

// Inertia 3's HTTP exception event contains the response but not the visit.
// Only foreground visits process non-Inertia responses; prefetches emit prefetched.
export function installNavigationRecovery(router) {
  let foreground = null
  const visits = new Map()
  const { report, dispose } = createNavigationFailureReporter()

  const removeListeners = [
    router.on("before", ({ detail: { visit } }) => {
      const url = localUrl(visit.url)
      if (!url) return
      const entry = { ...visit, url: url.href, startedAt: performance.now() }
      if (!visit.prefetch && !visit.async) {
        entry.prefetchInFlight = [...visits.values()].some((pending) => pending.prefetch && pending.url === url.href)
        foreground = entry
        dismissNavigationFailure()
      }
    }),
    router.on("start", ({ detail: { visit } }) => {
      const url = localUrl(visit.url)
      if (url) {
        const startedAt = foreground?.id === visit.id ? foreground.startedAt : performance.now()
        visits.set(visit.id, { ...visit, url: url.href, startedAt })
      }
    }),
    router.on("finish", ({ detail: { visit } }) => {
      visits.delete(visit.id)
      if (foreground?.id === visit.id) foreground = null
    }),
    router.on("navigate", () => {
      if (foreground) visits.delete(foreground.id)
      foreground = null
      dismissNavigationFailure()
    }),
    router.on("prefetched", ({ detail: { response, visit } }) => {
      // A 409 location response is a normal version refresh, including an empty body.
      if (response.status === 409 && response.headers["x-inertia-location"]) return
      if (!response.headers["x-inertia"] || response.status >= 500)
        report({ ...visits.get(visit.id), ...visit, prefetch: true }, "http_exception", response)
    }),
    router.on("httpException", (event) => {
      const { response } = event.detail
      if (response.headers["x-inertia"]) return
      event.preventDefault()
      report(foreground, "http_exception", response)
      showFailure(
        localUrl(foreground?.url)?.href || window.location.href,
        "http_exception",
        response.headers["x-request-id"],
      )
    }),
    router.on("networkError", (event) => {
      const { error } = event.detail
      if (error.code === "ERR_CANCELLED" || error.name === "AbortError") return
      const url = localUrl(error.url)
      const prefetch = [...visits.values()].find((entry) => entry.prefetch && entry.url === url?.href)
      const visit =
        foreground && (!error.url || url?.href === foreground.url)
          ? foreground
          : [...visits.values()].find((entry) => entry.url === url?.href)
      report(visit, "network_error")
      // Let Inertia clean up failed background prefetches via onPrefetchError.
      if (visit?.prefetch || (error.url && url?.href !== foreground?.url)) return
      if (!prefetch) event.preventDefault()
      showFailure(url?.href || foreground?.url || window.location.href, "network_error")
    }),
  ]

  return () => {
    removeListeners.forEach((remove) => remove())
    dispose()
    visits.clear()
    foreground = null
  }
}

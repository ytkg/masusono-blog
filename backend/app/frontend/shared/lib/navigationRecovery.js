const REPORT_URL = "/api/app/navigation_failures"
const MAX_REPORTS = 10
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

function localUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value, window.location.href)
    return url.origin === window.location.origin ? url : null
  } catch {
    return null
  }
}

// Inertia 3's HTTP exception event contains the response but not the visit.
// Only foreground visits process non-Inertia responses; prefetches emit prefetched.
export function installNavigationRecovery(router) {
  let foreground = null
  let reportCount = 0
  const visits = new Map()
  const pendingReports = []

  async function sendReport(payload) {
    try {
      const response = await fetch(REPORT_URL, {
        method: "POST",
        credentials: "omit",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ failure: payload }),
      })
      if (!response.ok) return
    } catch {
      if (pendingReports.length < MAX_REPORTS) pendingReports.push(payload)
    }
  }

  function report(visit, kind, response) {
    if (reportCount >= MAX_REPORTS) return
    const url = localUrl(visit?.url || window.location.href)
    if (!url) return
    reportCount += 1
    const payload = {
      kind,
      path: url.pathname,
      source_path: window.location.pathname,
      status: response?.status ?? null,
      response_request_id: response?.headers?.["x-request-id"] ?? null,
      content_type: response?.headers?.["content-type"]?.split(";", 1)[0] ?? null,
      prefetch: Boolean(visit?.prefetch),
      prefetch_in_flight: Boolean(visit?.prefetchInFlight),
      elapsed_ms: Math.round(performance.now()),
      online: navigator.onLine,
      service_worker: Boolean(navigator.serviceWorker?.controller),
    }
    if (navigator.onLine) void sendReport(payload)
    else pendingReports.push(payload)
  }

  function flushReports() {
    pendingReports.splice(0).forEach((payload) => void sendReport(payload))
  }
  window.addEventListener("online", flushReports)

  const removeListeners = [
    router.on("before", ({ detail: { visit } }) => {
      const url = localUrl(visit.url)
      if (!url) return
      const entry = { ...visit, url: url.href }
      if (!visit.prefetch && !visit.async) {
        entry.prefetchInFlight = [...visits.values()].some((pending) => pending.prefetch && pending.url === url.href)
        foreground = entry
        dismissNavigationFailure()
      }
    }),
    router.on("start", ({ detail: { visit } }) => {
      const url = localUrl(visit.url)
      if (url) visits.set(visit.id, { ...visit, url: url.href })
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
        report({ ...visit, prefetch: true }, "http_exception", response)
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
    window.removeEventListener("online", flushReports)
  }
}

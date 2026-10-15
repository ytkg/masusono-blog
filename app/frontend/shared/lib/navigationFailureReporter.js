const REPORT_URL = "/api/app/navigation_failures"
const MAX_REPORTS = 10

export function localUrl(value) {
  if (!value) return null
  try {
    const url = new URL(value, window.location.href)
    return url.origin === window.location.origin ? url : null
  } catch {
    return null
  }
}

export function createNavigationFailureReporter() {
  let reportCount = 0
  let disposed = false
  const pendingReports = []

  async function sendReport(payload) {
    if (disposed) return
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
      if (!disposed && pendingReports.length < MAX_REPORTS) pendingReports.push(payload)
    }
  }

  function report(visit, kind, response) {
    if (disposed || reportCount >= MAX_REPORTS) return
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
      ...(Number.isFinite(visit?.startedAt)
        ? { elapsed_ms: Math.max(0, Math.round(performance.now() - visit.startedAt)) }
        : {}),
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

  return {
    report,
    dispose() {
      disposed = true
      pendingReports.length = 0
      window.removeEventListener("online", flushReports)
    },
  }
}

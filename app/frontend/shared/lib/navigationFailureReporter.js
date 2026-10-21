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

export function createNavigationFailureReporter({ maxReports = MAX_REPORTS } = {}) {
  let reportCount = 0
  let disposed = false
  const pendingReports = []

  async function sendReport(entry) {
    const { payload, onDelivered } = entry
    if (disposed) return
    try {
      await fetch(REPORT_URL, {
        method: "POST",
        credentials: "omit",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ failure: payload }),
      })
      // HTTP errors are terminal too; retry only transport failures.
      onDelivered?.()
    } catch {
      if (!disposed && pendingReports.length < MAX_REPORTS) pendingReports.push(entry)
    }
  }

  function report(visit, kind, response) {
    if (disposed || reportCount >= maxReports) return
    const url = localUrl(visit?.url || window.location.href)
    if (!url) return
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
    reportPayload(payload)
  }

  function reportPayload(payload, onDelivered) {
    if (disposed || reportCount >= maxReports) return
    reportCount += 1
    const entry = { payload, onDelivered }
    if (navigator.onLine) void sendReport(entry)
    else pendingReports.push(entry)
  }

  function flushReports() {
    pendingReports.splice(0).forEach((entry) => void sendReport(entry))
  }
  window.addEventListener("online", flushReports)

  return {
    report,
    reportPayload,
    dispose() {
      disposed = true
      pendingReports.length = 0
      window.removeEventListener("online", flushReports)
    },
  }
}

import { createNavigationFailureReporter, localUrl } from "./navigationFailureReporter"

const STORAGE_KEY = "footer-navigation-diagnostic-v1"
const STALL_MS = 5000
const SLOW_MS = 3000
const MAX_AGE_MS = 86400000
const TIMINGS = [
  "tap_ms",
  "request_ms",
  "response_ms",
  "data_ready_ms",
  "module_start_ms",
  "module_end_ms",
  "commit_ms",
  "frame_ms",
]
const STAGES = ["tap", "request", "response", "data_ready", "module_start", "module_end", "commit", "frame"]
const KINDS = ["navigation_stalled", "navigation_slow", "navigation_interrupted", "module_load_error"]
const CONTROLLER_STATES = ["none", "installing", "installed", "activating", "activated", "redundant"]
let diagnostics = null

function publicPath(value) {
  const url = localUrl(value)
  return url &&
    url.pathname.length <= 512 &&
    /^\/(?:|about|others|search|authors(?:\/[a-zA-Z0-9_-]+)?|numbers|articles\/[a-zA-Z0-9_-]+|blog(?:\/[a-zA-Z0-9_-]+)?)$/.test(
      url.pathname,
    )
    ? url.pathname
    : undefined
}

// Page resolution also runs in SSR, where diagnostics are deliberately absent.
export async function tracePageResolution(load) {
  const trace = diagnostics?.current()
  diagnostics?.mark(trace, "module_start")
  try {
    const page = await load()
    diagnostics?.mark(trace, "module_end")
    return page
  } catch (error) {
    diagnostics?.fail(trace)
    throw error
  }
}

export function recordNavigationCommit(url) {
  diagnostics?.commit(url)
}

export function installNavigationDiagnostics(router) {
  const standalone = navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches
  const { reportPayload, dispose } = createNavigationFailureReporter({ maxReports: 5 })
  let trace = null
  let timer, frame, nextFrame, lastResume
  let storage
  try {
    storage = standalone ? window.localStorage : window.sessionStorage
  } catch {
    // Private browsing and full storage must never prevent navigation.
  }

  function readStored() {
    try {
      const raw = storage?.getItem(STORAGE_KEY)
      if (raw && raw.length > 2048) {
        storage.removeItem(STORAGE_KEY)
        return null
      }
      return JSON.parse(raw || "null")
    } catch {
      return null
    }
  }
  function clearStored(id) {
    try {
      if (readStored()?.id === id) storage?.removeItem(STORAGE_KEY)
    } catch {
      // Storage may become unavailable after installation.
    }
  }
  function elapsed(entry) {
    return Math.min(
      MAX_AGE_MS,
      Math.max(
        0,
        Math.round(
          performance.now() -
            entry.started -
            entry.hiddenTime -
            (entry.hiddenAt === null ? 0 : performance.now() - entry.hiddenAt),
        ),
      ),
    )
  }
  function snapshot(entry, kind) {
    return {
      ...entry.payload,
      kind,
      elapsed_ms: elapsed(entry),
      online: navigator.onLine,
      visibility: document.visibilityState,
    }
  }
  function persist(entry, kind = "navigation_interrupted") {
    if (!entry.confirmed) return
    const saved = { id: entry.id, saved_at: entry.savedAt, payload: snapshot(entry, kind) }
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // Timing remains useful in memory when persistence is unavailable.
    }
    return saved
  }
  function report(entry, kind) {
    if (!entry.confirmed) return
    const saved = persist(entry, kind)
    reportPayload(saved.payload, () => clearStored(saved.id))
  }
  // Reconstruct only bounded, public fields; never send arbitrary persisted data.
  const previous = readStored()
  if (
    previous &&
    typeof previous.id === "string" &&
    previous.id.length <= 100 &&
    Number.isFinite(previous.saved_at) &&
    Date.now() - previous.saved_at >= 0 &&
    Date.now() - previous.saved_at < MAX_AGE_MS
  ) {
    const value = previous.payload || {}
    if (KINDS.includes(value.kind) && publicPath(value.path) && STAGES.includes(value.stage)) {
      const payload = {
        kind: value.kind,
        path: publicPath(value.path),
        source_path: publicPath(value.source_path),
        stage: value.stage,
        recovered: true,
      }
      for (const key of [...TIMINGS, "elapsed_ms", "since_resume_ms"]) {
        if (Number.isInteger(value[key]) && value[key] >= 0 && value[key] <= MAX_AGE_MS) payload[key] = value[key]
      }
      for (const key of ["standalone", "service_worker", "backgrounded", "online"]) {
        if (typeof value[key] === "boolean") payload[key] = value[key]
      }
      if (/^\d{12}$/.test(value.build_version)) payload.build_version = value.build_version
      if (["visible", "hidden"].includes(value.visibility)) payload.visibility = value.visibility
      if (CONTROLLER_STATES.includes(value.controller_state)) payload.controller_state = value.controller_state
      if (["cached", "in_flight", "network"].includes(value.data_source)) payload.data_source = value.data_source
      reportPayload(payload, () => clearStored(previous.id))
    } else clearStored(previous.id)
  } else if (previous) clearStored(previous.id)

  function stop() {
    clearTimeout(timer)
    cancelAnimationFrame(frame)
    cancelAnimationFrame(nextFrame)
    frame = undefined
    nextFrame = undefined
  }
  function abandon() {
    stop()
    if (trace) clearStored(trace.id)
    trace = null
  }
  function mark(entry, stage) {
    if (!entry?.confirmed || trace !== entry || entry.payload[`${stage}_ms`] !== undefined) return
    entry.payload[`${stage}_ms`] = elapsed(entry)
    // ResourceTiming callbacks can arrive after a later milestone.
    if (STAGES.indexOf(stage) > STAGES.indexOf(entry.payload.stage)) entry.payload.stage = stage
    persist(entry)
  }
  function armTimer() {
    clearTimeout(timer)
    if (!trace?.confirmed || trace.stalled || document.visibilityState !== "visible") return
    timer = setTimeout(
      () => {
        if (!trace) return
        trace.stalled = true
        report(trace, "navigation_stalled")
      },
      Math.max(0, STALL_MS - elapsed(trace)),
    )
  }
  function click(event) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return
    const link = event.target.closest?.('nav[aria-label="メインナビゲーション"] a[href]')
    const path = link && publicPath(link.href)
    if (!path || link.target === "_blank" || link.hasAttribute("download")) return
    abandon()
    trace = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      savedAt: Date.now(),
      started: performance.now(),
      hiddenTime: 0,
      hiddenAt: null,
      payload: {
        path,
        source_path: publicPath(window.location.href),
        stage: "tap",
        tap_ms: 0,
        standalone,
        build_version: import.meta.env.VITE_BUILD_VERSION,
        service_worker: Boolean(navigator.serviceWorker?.controller),
        controller_state: navigator.serviceWorker?.controller?.state || "none",
        backgrounded: false,
        ...(lastResume === undefined
          ? {}
          : { since_resume_ms: Math.min(MAX_AGE_MS, Math.round(performance.now() - lastResume)) }),
      },
    }
    // The click may still become a native navigation before React is hydrated.
    // Persist only once Inertia confirms this visit in its before event.
  }
  function visibility() {
    if (document.visibilityState === "hidden") {
      clearTimeout(timer)
      if (trace && trace.hiddenAt === null) {
        trace.hiddenAt = performance.now()
        trace.payload.backgrounded = true
        persist(trace)
      }
    } else {
      lastResume = performance.now()
      if (trace && trace.hiddenAt !== null) {
        trace.hiddenTime += performance.now() - trace.hiddenAt
        trace.hiddenAt = null
        persist(trace)
      }
      armTimer()
    }
  }
  function commit(url) {
    const entry = trace
    if (!entry || publicPath(url) !== entry.payload.path || entry.payload.data_ready_ms === undefined) return
    mark(entry, "commit")
    if (frame !== undefined) return
    frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        if (trace !== entry) return
        mark(entry, "frame")
        stop()
        if (elapsed(entry) >= SLOW_MS) report(entry, "navigation_slow")
        else clearStored(entry.id)
        trace = null
        frame = undefined
      })
    })
  }
  function fail(entry) {
    if (!entry?.confirmed || trace !== entry) return
    report(entry, "module_load_error")
    stop()
    trace = null
  }
  const api = { current: () => (trace?.payload.data_ready_ms === undefined ? null : trace), mark, commit, fail }
  diagnostics = api
  const remove = [
    router.on("before", ({ detail: { visit } }) => {
      if (!trace || visit.prefetch || visit.async) return
      if (publicPath(visit.url) !== trace.payload.path) return abandon()
      trace.confirmed = true
      trace.visitId = visit.id
      const cached = router.getCached(visit.url)
      trace.payload.data_source = cached ? "cached" : router.getPrefetching(visit.url) ? "in_flight" : "network"
      mark(trace, "request")
      if (cached) mark(trace, "response")
      armTimer()
    }),
    router.on("beforeUpdate", ({ detail: { page } }) => {
      if (trace && publicPath(page.url) === trace.payload.path) mark(trace, "data_ready")
    }),
    router.on("finish", ({ detail: { visit } }) => {
      if (trace?.visitId === visit.id && (visit.cancelled || visit.interrupted)) abandon()
    }),
    router.on("location", abandon),
  ]
  let resources
  if (window.PerformanceObserver) {
    try {
      resources = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            trace &&
            ["fetch", "xmlhttprequest"].includes(entry.initiatorType) &&
            entry.responseEnd >= trace.started &&
            publicPath(entry.name) === trace.payload.path
          )
            mark(trace, "response")
        }
      })
      resources.observe({ type: "resource" })
    } catch {
      // Older WebKit can still record Inertia's data_ready milestone.
    }
  }
  const pagehide = () => {
    if (trace) persist(trace)
  }
  const pageshow = (event) => {
    if (event.persisted) lastResume = performance.now()
    armTimer()
  }
  const preloadError = () => fail(trace)
  document.addEventListener("click", click, true)
  document.addEventListener("visibilitychange", visibility)
  window.addEventListener("pagehide", pagehide)
  window.addEventListener("pageshow", pageshow)
  window.addEventListener("popstate", abandon)
  window.addEventListener("vite:preloadError", preloadError)
  return () => {
    stop()
    resources?.disconnect()
    remove.forEach((off) => off())
    document.removeEventListener("click", click, true)
    document.removeEventListener("visibilitychange", visibility)
    window.removeEventListener("pagehide", pagehide)
    window.removeEventListener("pageshow", pageshow)
    window.removeEventListener("popstate", abandon)
    window.removeEventListener("vite:preloadError", preloadError)
    dispose()
    if (diagnostics === api) diagnostics = null
  }
}

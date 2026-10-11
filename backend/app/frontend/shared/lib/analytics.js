import { ensureUserIdCookie, getUserIdFromCookie } from "./userId"
import { fetchJson } from "./fetchJson"

let initialized = false
let configuredBrowserId = null
const pendingLocations = new Set()
let lastLocation = null
let referrer = null
let eligible = false
let approvedBrowserId = null
let revision = 0
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isPublicUrl(url) {
  return (
    url.origin === "https://masusono.com" &&
    /^\/(?:$|articles\/[^/]+$|authors(?:\/[^/]+)?$|blog$|about$|search$|numbers$)/.test(url.pathname)
  )
}

function setDisabled(url) {
  const id = document.querySelector('meta[name="ga4-measurement-id"]')?.content
  if (id) window[`ga-disable-${id}`] = !eligible || !isPublicUrl(url)
}

async function checkEligibility() {
  const currentRevision = revision
  eligible = false
  const url = new URL(window.location.href)
  setDisabled(url)
  const measurementId = document.querySelector('meta[name="ga4-measurement-id"]')?.content
  if (!isPublicUrl(url) || !/^G-[A-Z0-9]+$/.test(measurementId ?? "")) return null
  try {
    const browserId = ensureUserIdCookie()
    if (!uuidPattern.test(browserId ?? "")) return null
    const result = await fetchJson("/api/app/analytics.json")
    if (currentRevision !== revision || getUserIdFromCookie() !== browserId) return null
    eligible = result?.allowed === true
    approvedBrowserId = eligible ? browserId : null
    setDisabled(new URL(window.location.href))
    return eligible ? browserId : null
  } catch {
    return null
  }
}

// Disable engagement immediately, and recheck the private policy on every navigation.
export function installAnalyticsNavigation(router) {
  router.on("before", ({ detail: { visit } }) => {
    if (!visit.prefetch && !visit.async) {
      revision++
      eligible = false
      setDisabled(new URL(visit.url, window.location.href))
    }
  })
  router.on("finish", () => {
    void checkEligibility()
  })
  window.addEventListener("popstate", () => {
    revision++
    void checkEligibility()
  })
}

function publicLocation() {
  if (typeof window === "undefined" || window.location.origin !== "https://masusono.com") return null
  const url = new URL(window.location.href)
  setDisabled(url)
  if (!isPublicUrl(url)) return null
  url.hash = ""
  return url.href
}

async function send(event, parameters) {
  if (!publicLocation()) return
  const id = document.querySelector('meta[name="ga4-measurement-id"]')?.content
  if (!/^G-[A-Z0-9]+$/.test(id ?? "")) return
  const currentId = getUserIdFromCookie()
  const browserId =
    event !== "page_view" && eligible && currentId === approvedBrowserId ? currentId : await checkEligibility()
  if (!browserId || !publicLocation()) return
  if (event === "page_view" && parameters.page_location !== publicLocation()) return
  if (!initialized) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    window.gtag("js", new Date())
    window.gtag("config", id, {
      client_id: browserId,
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
    const script = document.createElement("script")
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)
    initialized = true
    configuredBrowserId = browserId
  }
  if (configuredBrowserId !== browserId) {
    window.gtag("config", id, { client_id: browserId, send_page_view: false })
    configuredBrowserId = browserId
  }
  window.gtag("event", event, { ...parameters, send_to: id })
  return true
}

// Called after React commits the page, including hydration and back/forward.
// URL deduplication also covers StrictMode, partial reloads and local UI updates.
export async function trackPageView(title) {
  const location = publicLocation()
  if (!location) {
    lastLocation = null
    return
  }
  if (location === lastLocation || pendingLocations.has(location)) return
  pendingLocations.add(location)
  if (
    await send("page_view", {
      page_location: location,
      page_title: title,
      page_referrer: referrer ?? document.referrer,
    })
  ) {
    lastLocation = location
    referrer = location
  }
  pendingLocations.delete(location)
}

export function trackRelatedArticleClick(sourceId, targetId, position) {
  return send("related_article_click", {
    source_article_id: sourceId,
    target_article_id: targetId,
    link_position: position,
    transport_type: "beacon",
  })
}

export function trackYearAgoArticleClick(sourceId, targetId, position) {
  return send("year_ago_article_click", {
    source_article_id: sourceId,
    target_article_id: targetId,
    link_position: position,
    transport_type: "beacon",
  })
}

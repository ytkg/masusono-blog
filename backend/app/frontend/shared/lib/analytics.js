let initialized = false
let lastLocation = null
let referrer = null

function isPublicUrl(url) {
  return (
    url.origin === "https://masusono.com" &&
    /^\/(?:$|articles\/[^/]+$|authors(?:\/[^/]+)?$|blog$|about$|search$|numbers$)/.test(url.pathname)
  )
}

function setDisabled(url) {
  const id = document.querySelector('meta[name="ga4-measurement-id"]')?.content
  if (id) window[`ga-disable-${id}`] = !isPublicUrl(url)
}

// Disable automatic engagement as well when entering the management-tools page.
export function installAnalyticsNavigation(router) {
  router.on("before", ({ detail: { visit } }) => {
    if (!visit.prefetch && !visit.async) setDisabled(new URL(visit.url, window.location.href))
  })
  router.on("finish", () => setDisabled(new URL(window.location.href)))
  window.addEventListener("popstate", () => setDisabled(new URL(window.location.href)))
}

function publicLocation() {
  if (typeof window === "undefined" || window.location.origin !== "https://masusono.com") return null
  const url = new URL(window.location.href)
  setDisabled(url)
  if (!isPublicUrl(url)) return null
  url.hash = ""
  return url.href
}

function send(event, parameters) {
  if (!publicLocation()) return
  const id = document.querySelector('meta[name="ga4-measurement-id"]')?.content
  if (!/^G-[A-Z0-9]+$/.test(id ?? "")) return
  if (!initialized) {
    window.dataLayer = window.dataLayer || []
    window.gtag = function () {
      window.dataLayer.push(arguments)
    }
    window.gtag("js", new Date())
    window.gtag("config", id, {
      send_page_view: false,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })
    const script = document.createElement("script")
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`
    document.head.appendChild(script)
    initialized = true
  }
  window.gtag("event", event, { ...parameters, send_to: id })
  return true
}

// Called after React commits the page, including hydration and back/forward.
// URL deduplication also covers StrictMode, partial reloads and local UI updates.
export function trackPageView(title) {
  const location = publicLocation()
  if (!location) {
    lastLocation = null
    return
  }
  if (location === lastLocation) return
  if (
    send("page_view", {
      page_location: location,
      page_title: title,
      page_referrer: referrer ?? document.referrer,
    })
  ) {
    lastLocation = location
    referrer = location
  }
}

export function trackRelatedArticleClick(sourceId, targetId, position) {
  send("related_article_click", {
    source_article_id: sourceId,
    target_article_id: targetId,
    link_position: position,
    transport_type: "beacon",
  })
}

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let analytics
let browser
const browserId = "11111111-1111-4111-8111-111111111111"
const events = () => browser.dataLayer?.map((args) => [...args]).filter(([command]) => command === "event") ?? []

beforeEach(async () => {
  vi.resetModules()
  document.cookie = `user_id=${browserId}; Path=/`
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ allowed: true }) }))
  browser = { location: new URL("https://masusono.com/articles/a?utm_source=sns&utm_medium=social") }
  vi.stubGlobal("window", browser)
  document.head.innerHTML = '<meta name="ga4-measurement-id" content="G-5930S30RWS">'
  analytics = await import("./analytics")
})
afterEach(async () => {
  document.cookie = "user_id=; Max-Age=0; Path=/"
  vi.unstubAllGlobals()
  document.head.innerHTML = ""
})

describe("analytics", () => {
  it("records initial display, navigation and back/forward with committed titles, without rerender duplicates", async () => {
    await analytics.trackPageView("A")
    await analytics.trackPageView("A")
    const first = browser.location.href
    browser.location = new URL("https://masusono.com/articles/b")
    await analytics.trackPageView("B")
    browser.location = new URL(first)
    await analytics.trackPageView("A")
    browser.location = new URL("https://masusono.com/articles/b")
    await analytics.trackPageView("B")
    expect(events().map(([, name, parameters]) => [name, parameters.page_title])).toEqual([
      ["page_view", "A"],
      ["page_view", "B"],
      ["page_view", "A"],
      ["page_view", "B"],
    ])
    expect(events()[0][2].page_location).toBe(first)
    expect(events()[1][2].page_referrer).toBe(first)
    expect(document.querySelectorAll('script[src*="googletagmanager"]')).toHaveLength(1)
    expect([...browser.dataLayer[1]]).toEqual([
      "config",
      "G-5930S30RWS",
      {
        client_id: browserId,
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      },
    ])
  })

  it.each([
    "http://localhost:3838/",
    "https://preview.run.app/",
    "https://masusono.com/others",
    "https://masusono.com/api/app/management/articles",
  ])("excludes %s", async (href) => {
    browser.location = new URL(href)
    await analytics.trackPageView("Excluded")
    await analytics.trackRelatedArticleClick("a", "b", 1)
    await analytics.trackYearAgoArticleClick("a", "b", 1)
    expect(events()).toEqual([])
    expect(document.querySelector("script")).toBeNull()
  })

  it.each(["", "invalid"])("does nothing with missing or invalid ID: %s", async (id) => {
    document.querySelector("meta").content = id
    await expect(analytics.trackPageView("A")).resolves.toBeUndefined()
    expect(events()).toEqual([])
  })

  it("records related link source, target and one-based position", async () => {
    await analytics.trackRelatedArticleClick("a", "b", 2)
    expect(events()).toEqual([
      [
        "event",
        "related_article_click",
        {
          source_article_id: "a",
          target_article_id: "b",
          link_position: 2,
          transport_type: "beacon",
          send_to: "G-5930S30RWS",
        },
      ],
    ])
  })

  it("records year ago clicks separately with source, target and position", async () => {
    await analytics.trackYearAgoArticleClick("a", "b", 4)
    expect(events()).toEqual([
      [
        "event",
        "year_ago_article_click",
        {
          source_article_id: "a",
          target_article_id: "b",
          link_position: 4,
          transport_type: "beacon",
          send_to: "G-5930S30RWS",
        },
      ],
    ])
  })

  it("does not record fragment-only changes", async () => {
    await analytics.trackPageView("A")
    browser.location.hash = "section"
    await analytics.trackPageView("A")
    expect(events()).toHaveLength(1)
  })
  it("checks exclusion before initializing and blocks both click events", async () => {
    fetch.mockResolvedValue({ ok: true, json: async () => ({ allowed: false }) })
    await analytics.trackPageView("Owner")
    await analytics.trackRelatedArticleClick("a", "b", 1)
    await analytics.trackYearAgoArticleClick("a", "b", 1)
    expect(browser.gtag).toBeUndefined()
    expect(document.querySelector("script")).toBeNull()
    expect(browser["ga-disable-G-5930S30RWS"]).toBe(true)
  })

  it("fails closed when the policy request fails without breaking browsing", async () => {
    fetch.mockRejectedValue(new Error("offline"))
    await expect(analytics.trackPageView("A")).resolves.toBeUndefined()
    expect(events()).toEqual([])
  })

  it("does not send an invalid identifier or call the profile API", async () => {
    document.cookie = "user_id=invalid; Path=/"
    await analytics.trackPageView("A")
    expect(fetch).not.toHaveBeenCalled()
    expect(events()).toEqual([])
  })

  it("disables engagement immediately on navigation and rechecks exclusion", async () => {
    const handlers = {}
    browser.addEventListener = vi.fn()
    analytics.installAnalyticsNavigation({
      on: (name, handler) => {
        handlers[name] = handler
      },
    })
    await analytics.trackPageView("A")
    fetch.mockResolvedValue({ ok: true, json: async () => ({ allowed: false }) })
    handlers.before({ detail: { visit: { url: "https://masusono.com/articles/b" } } })
    expect(browser["ga-disable-G-5930S30RWS"]).toBe(true)
    browser.location = new URL("https://masusono.com/articles/b")
    await analytics.trackPageView("B")
    expect(events()).toHaveLength(1)
  })

  it("deduplicates concurrent hydration calls", async () => {
    await Promise.all([analytics.trackPageView("A"), analytics.trackPageView("A")])
    expect(events()).toHaveLength(1)
  })
  it("keeps the UUID across navigation and uses a fresh UUID after Cookie deletion", async () => {
    await analytics.trackPageView("A")
    browser.location = new URL("https://masusono.com/articles/b")
    await analytics.trackPageView("B")
    expect(document.cookie).toContain(browserId)
    const freshId = "22222222-2222-4222-8222-222222222222"
    document.cookie = "user_id=; Max-Age=0; Path=/"
    vi.stubGlobal("crypto", { randomUUID: () => freshId })
    browser.location = new URL("https://masusono.com/articles/c")
    await analytics.trackPageView("C")
    const configs = browser.dataLayer.map((args) => [...args]).filter(([command]) => command === "config")
    expect(configs.map(([, , parameters]) => parameters.client_id)).toEqual([browserId, freshId])
    expect(fetch.mock.calls.every(([url]) => url === "/api/app/analytics.json")).toBe(true)
  })

  it("waits for the private policy before loading Google", async () => {
    let resolvePolicy
    fetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePolicy = resolve
      }),
    )
    const tracking = analytics.trackPageView("A")
    expect(browser.gtag).toBeUndefined()
    expect(browser["ga-disable-G-5930S30RWS"]).toBe(true)
    resolvePolicy({ ok: true, json: async () => ({ allowed: false }) })
    await tracking
    expect(browser.gtag).toBeUndefined()
  })

  it("does not let an old policy response reenable engagement during navigation", async () => {
    let resolvePolicy
    fetch.mockReturnValue(
      new Promise((resolve) => {
        resolvePolicy = resolve
      }),
    )
    const handlers = {}
    browser.addEventListener = vi.fn()
    analytics.installAnalyticsNavigation({
      on: (name, handler) => {
        handlers[name] = handler
      },
    })
    const tracking = analytics.trackPageView("A")
    handlers.before({ detail: { visit: { url: "https://masusono.com/articles/b" } } })
    resolvePolicy({ ok: true, json: async () => ({ allowed: true }) })
    await tracking
    expect(browser["ga-disable-G-5930S30RWS"]).toBe(true)
    expect(events()).toEqual([])
  })
})

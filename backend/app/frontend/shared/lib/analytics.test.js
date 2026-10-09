import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

let analytics
let browser
const events = () => browser.dataLayer?.map((args) => [...args]).filter(([command]) => command === "event") ?? []

beforeEach(async () => {
  vi.resetModules()
  browser = { location: new URL("https://masusono.com/articles/a?utm_source=sns&utm_medium=social") }
  vi.stubGlobal("window", browser)
  document.head.innerHTML = '<meta name="ga4-measurement-id" content="G-5930S30RWS">'
  analytics = await import("./analytics")
})
afterEach(() => {
  vi.unstubAllGlobals()
  document.head.innerHTML = ""
})

describe("analytics", () => {
  it("records initial display, navigation and back/forward with committed titles, without rerender duplicates", () => {
    analytics.trackPageView("A")
    analytics.trackPageView("A")
    const first = browser.location.href
    browser.location = new URL("https://masusono.com/articles/b")
    analytics.trackPageView("B")
    browser.location = new URL(first)
    analytics.trackPageView("A")
    browser.location = new URL("https://masusono.com/articles/b")
    analytics.trackPageView("B")
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
  ])("excludes %s", (href) => {
    browser.location = new URL(href)
    analytics.trackPageView("Excluded")
    analytics.trackRelatedArticleClick("a", "b", 1)
    analytics.trackYearAgoArticleClick("a", "b", 1)
    expect(events()).toEqual([])
    expect(document.querySelector("script")).toBeNull()
  })

  it.each(["", "invalid"])("does nothing with missing or invalid ID: %s", (id) => {
    document.querySelector("meta").content = id
    expect(() => analytics.trackPageView("A")).not.toThrow()
    expect(events()).toEqual([])
  })

  it("records related link source, target and one-based position", () => {
    analytics.trackRelatedArticleClick("a", "b", 2)
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

  it("records year ago clicks separately with source, target and position", () => {
    analytics.trackYearAgoArticleClick("a", "b", 4)
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

  it("does not record fragment-only changes", () => {
    analytics.trackPageView("A")
    browser.location.hash = "section"
    analytics.trackPageView("A")
    expect(events()).toHaveLength(1)
  })
})

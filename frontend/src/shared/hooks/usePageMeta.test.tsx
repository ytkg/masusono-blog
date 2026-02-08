import { render } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { usePageMeta } from "./usePageMeta"

function TestComponent(props: Parameters<typeof usePageMeta>[0]) {
  usePageMeta(props)
  return null
}

function getMetaByName(name: string) {
  return document.head.querySelector(`meta[name="${name}"]`)
}

function getMetaByProperty(property: string) {
  return document.head.querySelector(`meta[property="${property}"]`)
}

function removeAll(selector: string) {
  document.head.querySelectorAll(selector).forEach((element) => {
    element.remove()
  })
}

describe("usePageMeta", () => {
  afterEach(() => {
    document.title = ""
    removeAll('meta[name="description"]')
    removeAll('meta[property="og:title"]')
    removeAll('meta[property="og:description"]')
    removeAll('meta[name="twitter:title"]')
    removeAll('meta[name="twitter:description"]')
    removeAll('meta[property="og:url"]')
    removeAll('link[rel="canonical"]')
  })

  it("title/descriptionを反映し、再レンダー時に更新する", () => {
    const { rerender } = render(<TestComponent title="初期タイトル" description="初期説明" />)

    expect(document.title).toBe("初期タイトル | 増田とその他！")
    expect(getMetaByName("description")?.getAttribute("content")).toBe("初期説明")
    expect(getMetaByProperty("og:title")?.getAttribute("content")).toBe("初期タイトル | 増田とその他！")
    expect(getMetaByName("twitter:description")?.getAttribute("content")).toBe("初期説明")

    rerender(<TestComponent title="更新タイトル" description="更新説明" />)

    expect(document.title).toBe("更新タイトル | 増田とその他！")
    expect(getMetaByName("description")?.getAttribute("content")).toBe("更新説明")
    expect(getMetaByProperty("og:title")?.getAttribute("content")).toBe("更新タイトル | 増田とその他！")
    expect(getMetaByName("twitter:description")?.getAttribute("content")).toBe("更新説明")
  })

  it("canonicalPathを指定するとcanonicalとog:urlを更新する", () => {
    const { rerender } = render(<TestComponent title="Episode 1" canonicalPath="/podcast/001" />)
    const firstCanonical = new URL("/podcast/001", window.location.origin).toString()

    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(firstCanonical)
    expect(getMetaByProperty("og:url")?.getAttribute("content")).toBe(firstCanonical)

    rerender(<TestComponent title="Blog" canonicalPath="/blog" />)
    const secondCanonical = new URL("/blog", window.location.origin).toString()

    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(secondCanonical)
    expect(getMetaByProperty("og:url")?.getAttribute("content")).toBe(secondCanonical)
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1)
  })
})

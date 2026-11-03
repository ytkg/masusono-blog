import { render } from "@testing-library/react"
import { Children } from "react"
import { describe, expect, it, vi } from "vitest"
import SeoHead from "./SeoHead"

const { headMock } = vi.hoisted(() => ({
  headMock: vi.fn(() => null),
}))

vi.mock("@inertiajs/react", () => ({
  Head: headMock,
}))

describe("SeoHead", () => {
  it("title、description、canonical を組み立てる", () => {
    render(<SeoHead title="記事" description="説明です" canonicalPath="/blog/hello" />)
    const [{ children }] = headMock.mock.calls.at(-1)
    const nodes = Children.toArray(children)
    const title = nodes.find((node) => node.type === "title")
    const description = nodes.find((node) => node.props?.name === "description")
    const canonical = nodes.find((node) => node.props?.rel === "canonical")

    expect(title.props.children).toBe("記事 | 増田とその他！")
    expect(description.props.content).toBe("説明です")
    expect(canonical.props.href).toBe("https://masusono.com/blog/hello")
  })
  it("省略時はサイト名・既定説明・ホームURL・小さい共有カードを使う", () => {
    render(<SeoHead />)
    const nodes = Children.toArray(headMock.mock.calls.at(-1)[0].children)
    const content = (name) => nodes.find((node) => node.props?.name === name)?.props.content
    expect(nodes.find((node) => node.type === "title").props.children).toBe("増田とその他！")
    expect(content("description")).toContain("増田とその他！の公式サイト。")
    expect(nodes.find((node) => node.props?.rel === "canonical").props.href).toBe("https://masusono.com/")
    expect(content("twitter:card")).toBe("summary")
    expect(nodes.some((node) => node.props?.property === "og:image")).toBe(false)
  })

  it("相対パスの共有画像を絶対URLにして画像情報と代替テキストを出力する", () => {
    render(<SeoHead title="共有記事" canonicalPath="blog/shared" imagePath="images/shared.png" imageAlt="記事の画像" />)
    const nodes = Children.toArray(headMock.mock.calls.at(-1)[0].children)
    const meta = (key) => nodes.find((node) => node.props?.property === key || node.props?.name === key)?.props.content
    expect(meta("og:url")).toBe("https://masusono.com/blog/shared")
    expect(meta("og:image")).toBe("https://masusono.com/images/shared.png")
    expect(meta("og:image:secure_url")).toBe(meta("og:image"))
    expect(meta("twitter:image")).toBe(meta("og:image"))
    expect(meta("og:image:alt")).toBe("記事の画像")
    expect(meta("twitter:image:alt")).toBe("記事の画像")
    expect(meta("og:image:type")).toBe("image/png")
    expect(meta("og:image:width")).toBe("1200")
    expect(meta("og:image:height")).toBe("630")
    expect(meta("twitter:card")).toBe("summary_large_image")
  })
})

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
    const [{ children }] = headMock.mock.calls[0]
    const nodes = Children.toArray(children)
    const title = nodes.find((node) => node.type === "title")
    const description = nodes.find((node) => node.props?.name === "description")
    const canonical = nodes.find((node) => node.props?.rel === "canonical")

    expect(title.props.children).toBe("記事 | 増田とその他！")
    expect(description.props.content).toBe("説明です")
    expect(canonical.props.href).toBe("https://masusono.com/blog/hello")
  })
})

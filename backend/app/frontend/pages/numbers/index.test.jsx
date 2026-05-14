import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import NumbersIndex from "./index"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title, canonicalPath }) => <div>{`seo:${title}:${canonicalPath}`}</div>,
}))

describe("Numbers page", () => {
  it("数字でわかる増田とその他をページとして表示する", () => {
    render(<NumbersIndex metrics={{ blocks: [{ label: "記事数", value: 12 }] }} />)

    expect(screen.getByText("seo:数字でわかる、増田とその他！:/numbers")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "数字でわかる、増田とその他！" })).toBeInTheDocument()
    expect(screen.getByText("記事数")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
  })
})

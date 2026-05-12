import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Zukan from "./zukan"
import { zukanEntries } from "../features/apps/zukan/zukanData"

vi.mock("../shared/SeoHead", () => ({
  default: ({ title, canonicalPath }) => <div>{`seo:${title}:${canonicalPath}`}</div>,
}))

describe("Zukan page", () => {
  it("図鑑をページとして表示する", () => {
    render(<Zukan />)

    expect(screen.getByText("seo:増その図鑑:/zukan")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "増その図鑑" })).toBeInTheDocument()
    expect(screen.getByText("AI分析による人物像")).toBeInTheDocument()
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(zukanEntries.length)
  })
})

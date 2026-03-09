import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import About from "./about"

vi.mock("../shared/SeoHead", () => ({
  default: () => null,
}))

describe("About page", () => {
  it("紹介文と外部リンクを表示する", () => {
    render(<About />)

    expect(screen.getByRole("heading", { name: "「増田とその他！」について" })).toBeInTheDocument()
    expect(screen.getByText(/飲み仲間3人による/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "masusono.com" })).toHaveAttribute("href", "https://masusono.com")
    expect(screen.getByText("一言でいえば、「飲み仲間たちのゆるい日記」。")).toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import HomeHero from "./HomeHero"

vi.mock("./assets/aimi.png", () => ({
  default: "/mock-aimi.png",
}))

vi.mock("./masudaMessages", () => ({
  masudaMessages: ["やっほー。来てくれてありがとね", "せっかく来たなら、なんか読んでってよ〜"],
}))

describe("HomeHero", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("見出し、日付、説明を表示する", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.6)

    render(<HomeHero formattedNow="2026/03/09" />)

    expect(screen.getByRole("heading", { name: "ようこそ" })).toBeInTheDocument()
    expect(screen.getByText("2026/03/09")).toBeInTheDocument()
    expect(screen.getAllByRole("img", { name: "増田のアイコン" })).toHaveLength(1)
    expect(screen.getByRole("img", { name: "増田のアイコン" })).toHaveAttribute("src", "/mock-aimi.png")
    const description = screen.getByText(/ブログやポッドキャスト/)
    const message = screen.getByText("せっかく来たなら、なんか読んでってよ〜")
    expect(description).toBeInTheDocument()
    expect(message).toBeInTheDocument()
    expect(description.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

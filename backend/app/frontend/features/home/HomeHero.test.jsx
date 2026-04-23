import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import HomeHero from "./HomeHero"

vi.mock("./assets/aimi.webp", () => ({
  default: "/mock-aimi.png",
}))

vi.mock("./masudaMessages", () => ({
  masudaMessages: ["やっほー。来てくれてありがとね", "せっかく来たなら、なんか読んでってよ〜"],
}))

describe("HomeHero", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("説明と増田のメッセージを表示する", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.6)

    render(<HomeHero />)

    expect(screen.queryByRole("heading")).not.toBeInTheDocument()
    expect(screen.queryByText("ようこそ")).not.toBeInTheDocument()
    expect(screen.getAllByRole("img", { name: "増田のアイコン" })).toHaveLength(1)
    expect(screen.getByRole("img", { name: "増田のアイコン" })).toHaveAttribute("src", "/mock-aimi.png")
    const description = screen.getByText("ブログ").closest("p")
    const message = screen.getByText("せっかく来たなら、なんか読んでってよ〜")
    expect(description).toBeInTheDocument()
    expect(description).toHaveTextContent("ブログやポッドキャスト、ちょっとしたゲームまで。")
    expect(screen.getByText("最新のコンテンツをまとめてチェックできます。")).toBeInTheDocument()
    expect(message).toBeInTheDocument()
    expect(description.compareDocumentPosition(message) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})

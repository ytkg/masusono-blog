import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import HomeHero from "./HomeHero"

describe("HomeHero", () => {
  it("見出し、日付、説明を表示する", () => {
    render(<HomeHero formattedNow="2026/03/09" />)

    expect(screen.getByRole("heading", { name: "ようこそ" })).toBeInTheDocument()
    expect(screen.getByText("2026/03/09")).toBeInTheDocument()
    expect(screen.getByText(/ブログやポッドキャスト/)).toBeInTheDocument()
  })
})

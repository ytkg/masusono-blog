import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import BlogThreeSixtyFive from "./three_sixty_five"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title }) => <div>seo:{title}</div>,
}))

describe("BlogThreeSixtyFive page", () => {
  it("月ごとのアコーディオン見出しを描画し、開くと日付と記事タイトルを表示する", () => {
    render(
      <BlogThreeSixtyFive
        months={[
          {
            id: "01",
            title: "1月",
            filledDaysCount: 2,
            totalDaysCount: 31,
            days: [
              { id: "01-01", title: "1月1日", articles: [{ id: "a1", title: "記事1" }] },
              { id: "01-02", title: "1月2日", articles: [{ id: "a2", title: "記事2" }] },
            ],
          },
        ]}
      />,
    )

    expect(screen.getByText("seo:365日")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "365日" })).toBeInTheDocument()
    const januaryButton = screen.getByRole("button", { name: /1月.*2\/31日 \(6%\)/ })
    const article1 = screen.getByText("記事1")

    expect(januaryButton).toHaveAttribute("aria-expanded", "false")
    expect(article1).not.toBeVisible()

    fireEvent.click(januaryButton)

    expect(januaryButton).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("1月1日")).toBeInTheDocument()
    expect(screen.getByText("1月2日")).toBeInTheDocument()
    expect(article1).toBeVisible()
    expect(screen.getByText("記事2")).toBeInTheDocument()
  })

  it("記事がなくても月見出しは描画する", () => {
    render(
      <BlogThreeSixtyFive
        months={[
          { id: "01", title: "1月", filledDaysCount: 0, totalDaysCount: 31, days: [{ id: "01-01", title: "1月1日", articles: [] }] },
          { id: "02", title: "2月", filledDaysCount: 0, totalDaysCount: 28, days: [{ id: "02-01", title: "2月1日", articles: [] }] },
        ]}
      />,
    )

    expect(screen.getByRole("button", { name: /1月.*0\/31日 \(0%\)/ })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /2月.*0\/28日 \(0%\)/ })).toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import NumbersDistributionChart from "./NumbersDistributionChart"

const distribution = Array.from({ length: 11 }, (_, index) => ({
  minChars: index * 200,
  maxChars: index === 10 ? null : index * 200 + 199,
  articles: index === 10 ? 3 : 0,
}))

describe("NumbersDistributionChart", () => {
  it("0本を含む全区間と本数を読み上げ、スクロール領域をキーボードで利用できる", () => {
    render(<NumbersDistributionChart distribution={distribution} />)
    expect(screen.getByRole("region")).toHaveAttribute("tabindex", "0")
    for (const bucket of distribution) {
      const label =
        bucket.maxChars === null
          ? "2,000字以上"
          : `${bucket.minChars.toLocaleString("ja-JP")}〜${bucket.maxChars.toLocaleString("ja-JP")}字`
      expect(screen.getByRole("img", { name: `${label}：${bucket.articles}本` })).toBeInTheDocument()
    }
    expect(screen.getByText("3本")).toBeVisible()
  })

  it("対象0件を説明する", () => {
    render(<NumbersDistributionChart distribution={distribution.map((bucket) => ({ ...bucket, articles: 0 }))} />)
    expect(screen.getByText("記事がありません。全区間0本です。")).toBeVisible()
  })
})

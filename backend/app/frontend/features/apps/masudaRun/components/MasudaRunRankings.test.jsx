import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import MasudaRunRankings from "./MasudaRunRankings"

describe("MasudaRunRankings", () => {
  it("読み込み中と空状態を切り替える", () => {
    const { rerender } = render(<MasudaRunRankings rankings={[]} isLoading hasError={false} error={null} />)

    expect(screen.getByText("読み込み中...")).toBeInTheDocument()

    rerender(<MasudaRunRankings rankings={[]} isLoading={false} hasError={false} error={null} />)

    expect(screen.getByText("まだランキングがありません。")).toBeInTheDocument()
  })

  it("エラーとランキング表を描画する", () => {
    const rankings = Array.from({ length: 11 }, (_, index) => ({
      rank: index + 1,
      userId: `u${index + 1}`,
      name: `User ${index + 1}`,
      score: 1000 + index,
      rankedAt: `2026/03/${String(index + 1).padStart(2, "0")}`,
    }))

    const { rerender } = render(
      <MasudaRunRankings
        rankings={[]}
        isLoading={false}
        hasError
        error={{ code: "upstream_rate_limited", message: "Upstream service is temporarily rate limited." }}
      />,
    )
    expect(screen.getByText("ランキングへのアクセスが集中しています。少し待ってから再度お試しください。")).toBeInTheDocument()

    rerender(<MasudaRunRankings rankings={rankings} isLoading={false} hasError={false} error={null} />)

    expect(screen.getByRole("table", { name: "増田RUNランキング" })).toBeInTheDocument()
    expect(screen.getByText("1,000")).toBeInTheDocument()
    expect(screen.getByText("User 10")).toBeInTheDocument()
    expect(screen.queryByText("User 11")).not.toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import MasudaRunRankings from "./MasudaRunRankings"
import type { MasudaRunRanking } from "@/features/apps/masudaRun/model/ranking"

const buildRanking = (override: Partial<MasudaRunRanking> = {}): MasudaRunRanking => ({
  userId: "alice",
  score: 1234,
  rank: 1,
  rankedAt: "2026/02/01",
  ...override,
})

describe("MasudaRunRankings", () => {
  it("ロード中は読み込み中を表示する", () => {
    render(<MasudaRunRankings rankings={[]} isLoading hasError={false} />)

    expect(screen.getByText("読み込み中...")).toBeInTheDocument()
  })

  it("エラー時のメッセージを表示する", () => {
    render(<MasudaRunRankings rankings={[]} isLoading={false} hasError />)

    expect(screen.getByText("ランキングの取得に失敗しました。")).toBeInTheDocument()
  })

  it("空のときは案内メッセージを表示する", () => {
    render(<MasudaRunRankings rankings={[]} isLoading={false} hasError={false} />)

    expect(screen.getByText("まだランキングがありません。")).toBeInTheDocument()
  })

  it("ランキングの内容を表示する", () => {
    const rankings = [
      buildRanking({ rank: 1, userId: "alice", score: 3000, rankedAt: "2026/02/02" }),
      buildRanking({ rank: 2, userId: "bob", score: 2000, rankedAt: "2026/02/01" }),
    ]
    render(<MasudaRunRankings rankings={rankings} isLoading={false} hasError={false} />)

    expect(screen.getByText("順位")).toBeInTheDocument()
    expect(screen.getByText("ユーザー")).toBeInTheDocument()
    expect(screen.getByText("スコア")).toBeInTheDocument()
    expect(screen.getByText("日付")).toBeInTheDocument()
    expect(screen.getByText("alice")).toBeInTheDocument()
    expect(screen.getByText("bob")).toBeInTheDocument()
    expect(screen.getByText("3,000")).toBeInTheDocument()
    expect(screen.getByText("2,000")).toBeInTheDocument()
    expect(screen.getByText("2026/02/02")).toBeInTheDocument()
    expect(screen.getByText("2026/02/01")).toBeInTheDocument()
  })
})

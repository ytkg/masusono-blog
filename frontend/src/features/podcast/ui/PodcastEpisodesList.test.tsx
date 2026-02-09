import { screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import PodcastEpisodesList from "./PodcastEpisodesList"
import { usePodcasts } from "@/features/podcast/hooks/usePodcasts"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import { renderWithPodcastPlayerRouter } from "@/features/podcastPlayer/test/podcastPlayerTestUtils"
import { MINI_PLAYER_ARIA_LABELS } from "@/features/podcastPlayer/lib/miniPlayerA11y"

vi.mock("@/features/podcast/hooks/usePodcasts", () => ({
  usePodcasts: vi.fn(),
}))

const usePodcastsMock = usePodcasts as unknown as MockedFunction<typeof usePodcasts>

const createUsePodcastsResult = (overrides: Partial<ReturnType<typeof usePodcasts>> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  }) as ReturnType<typeof usePodcasts>

describe("PodcastEpisodesList", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  const renderList = () => renderWithPodcastPlayerRouter(<PodcastEpisodesList />)

  it("ロード中はスケルトンを表示する", () => {
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ isLoading: true }))

    const { container } = renderList()

    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0)
  })

  it("エラー時はメッセージを表示する", () => {
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ error: new Error("API error") }))

    renderList()

    expect(screen.getByText("エピソードの取得に失敗しました: API error")).toBeInTheDocument()
  })

  it("空配列のときは空状態メッセージを表示する", () => {
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ data: [] }))

    renderList()

    expect(screen.getByText("エピソードがありません。")).toBeInTheDocument()
  })

  it("エピソードがある場合は一覧を表示する", () => {
    const episodes: PodcastEpisode[] = [
      {
        id: "001",
        title: "プライベートとか普通とかの話",
        publishedDate: "2026/02/07",
        audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
      },
    ]
    usePodcastsMock.mockReturnValue(createUsePodcastsResult({ data: episodes }))

    renderList()

    expect(screen.getByRole("heading", { level: 2, name: "プライベートとか普通とかの話" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "プライベートとか普通とかの話" })).toHaveAttribute("href", "/podcast/001")
    expect(screen.getByText("2026/02/07 Episode 001")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: MINI_PLAYER_ARIA_LABELS.play })).toBeInTheDocument()
  })
})

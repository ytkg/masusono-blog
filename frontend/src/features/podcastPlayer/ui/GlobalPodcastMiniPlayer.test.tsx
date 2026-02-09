import { fireEvent, screen, waitFor, within } from "@testing-library/react"
import { Link, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { PodcastEpisode } from "@/features/podcast/model/podcast"
import {
  mockAudioPlaybackEvents,
  renderWithPodcastPlayerRouter,
} from "@/features/podcastPlayer/test/podcastPlayerTestUtils"
import PodcastEpisodeCard from "@/features/podcast/ui/PodcastEpisodeCard"
import GlobalPodcastMiniPlayer from "./GlobalPodcastMiniPlayer"

const episode: PodcastEpisode = {
  id: "001",
  title: "テストエピソード",
  publishedDate: "2026/02/08",
  audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
}

function PodcastPage() {
  return (
    <>
      <PodcastEpisodeCard episode={episode} />
      <Link to="/blog">ブログへ</Link>
    </>
  )
}

function BlogPage() {
  return (
    <>
      <div>ブログページ</div>
      <Link to="/podcast">ポッドキャストへ</Link>
    </>
  )
}

function renderWithRouter() {
  return renderWithPodcastPlayerRouter(
    <>
      <Routes>
        <Route path="/podcast" element={<PodcastPage />} />
        <Route path="/blog" element={<BlogPage />} />
      </Routes>
      <GlobalPodcastMiniPlayer />
    </>,
    { initialEntries: ["/podcast"] },
  )
}

async function navigateToBlogWithPlayback() {
  const card = screen.getByTestId("podcast-episode-card-001")
  fireEvent.click(within(card).getByRole("button", { name: "再生" }))

  await waitFor(() => {
    expect(screen.getByTestId("global-podcast-mini-player")).toBeInTheDocument()
  })

  fireEvent.click(screen.getByRole("link", { name: "ブログへ" }))
  expect(await screen.findByText("ブログページ")).toBeInTheDocument()
  return screen.getByTestId("global-podcast-mini-player")
}

describe("GlobalPodcastMiniPlayer", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("再生開始後に別ルートへ遷移してもミニプレイヤーを表示する", async () => {
    mockAudioPlaybackEvents()

    renderWithRouter()

    expect(screen.queryByTestId("global-podcast-mini-player")).not.toBeInTheDocument()

    const miniPlayer = await navigateToBlogWithPlayback()
    expect(miniPlayer).toBeInTheDocument()
    expect(within(miniPlayer).getByText("テストエピソード")).toBeInTheDocument()
    expect(within(miniPlayer).queryByText("ミニプレイヤー")).not.toBeInTheDocument()
  })

  it("背景タップでは折りたたまず、縮小ボタンで折りたたみ表示に切り替えできる", async () => {
    mockAudioPlaybackEvents()

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    expect(within(miniPlayer).queryByRole("button", { name: "プレイヤーを上下に移動" })).not.toBeInTheDocument()
    fireEvent.click(within(miniPlayer).getByText("テストエピソード"))
    expect(within(miniPlayer).queryByTestId("global-podcast-mini-player-thumbnail")).not.toBeInTheDocument()

    fireEvent.click(within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを縮小" }))

    await waitFor(
      () => {
        expect(within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを展開" })).toBeInTheDocument()
        expect(within(miniPlayer).queryByRole("button", { name: "プレイヤーを上下に移動" })).not.toBeInTheDocument()
        expect(within(miniPlayer).getByTestId("global-podcast-mini-player-thumbnail")).toBeInTheDocument()
        expect(within(miniPlayer).getByAltText("テストエピソード")).toBeInTheDocument()
      },
      { timeout: 2000 },
    )
  })

  it("再生操作ボタンをタップしても折りたたみ表示に切り替わらない", async () => {
    mockAudioPlaybackEvents()

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    fireEvent.click(within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを一時停止" }))

    expect(within(miniPlayer).queryByTestId("global-podcast-mini-player-thumbnail")).not.toBeInTheDocument()
    expect(within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを一時停止" })).toBeInTheDocument()
  })

  it("展開/縮小は Enter/Space キーでも操作できる", async () => {
    mockAudioPlaybackEvents()

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    const collapseButton = within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを縮小" })
    fireEvent.keyDown(collapseButton, { key: "Enter" })
    await waitFor(
      () => {
        expect(within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを展開" })).toBeInTheDocument()
      },
      { timeout: 2000 },
    )

    const expandButton = within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを展開" })
    fireEvent.keyDown(expandButton, { key: " " })
    expect(within(miniPlayer).queryByTestId("global-podcast-mini-player-thumbnail")).not.toBeInTheDocument()
  })

  it("閉じるボタンでミニプレイヤーを閉じて一時停止し、ポッドキャストページで再開できる", async () => {
    const { pauseSpy } = mockAudioPlaybackEvents()

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    fireEvent.click(within(miniPlayer).getByRole("button", { name: "ミニプレイヤーを閉じる" }))

    await waitFor(() => {
      expect(screen.queryByTestId("global-podcast-mini-player")).not.toBeInTheDocument()
    })
    expect(pauseSpy).toHaveBeenCalled()

    fireEvent.click(screen.getByRole("link", { name: "ポッドキャストへ" }))
    const card = await screen.findByTestId("podcast-episode-card-001")
    const playButton = within(card).getByRole("button", { name: "再生" })
    fireEvent.click(playButton)

    await waitFor(() => {
      expect(within(card).getByRole("button", { name: "一時停止" })).toBeInTheDocument()
    })
  })
})

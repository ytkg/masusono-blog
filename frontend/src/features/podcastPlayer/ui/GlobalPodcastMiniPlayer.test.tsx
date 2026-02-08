import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { Link, MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"
import type { PodcastEpisode } from "@/types/podcast"
import { PodcastPlayerProvider } from "@/features/podcastPlayer/PodcastPlayerContext"
import PodcastEpisodeCard from "@/components/PodcastEpisodeCard"
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
  return <div>ブログページ</div>
}

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={["/podcast"]}>
      <PodcastPlayerProvider>
        <Routes>
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/blog" element={<BlogPage />} />
        </Routes>
        <GlobalPodcastMiniPlayer />
      </PodcastPlayerProvider>
    </MemoryRouter>,
  )
}

async function navigateToBlogWithPlayback() {
  const card = screen.getByTestId("podcast-episode-card-001")
  fireEvent.click(within(card).getByRole("button", { name: "再生" }))

  await waitFor(() => {
    expect(screen.queryByTestId("global-podcast-mini-player")).not.toBeInTheDocument()
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
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"))
    })

    renderWithRouter()

    expect(screen.queryByTestId("global-podcast-mini-player")).not.toBeInTheDocument()

    const miniPlayer = await navigateToBlogWithPlayback()
    expect(miniPlayer).toBeInTheDocument()
    expect(within(miniPlayer).getByText("テストエピソード")).toBeInTheDocument()
    expect(within(miniPlayer).queryByText("ミニプレイヤー")).not.toBeInTheDocument()
  })

  it("操作不可領域をタップすると折りたたみ表示に切り替えできる", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"))
    })

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    expect(within(miniPlayer).queryByRole("button", { name: "プレイヤーを上下に移動" })).not.toBeInTheDocument()
    fireEvent.click(within(miniPlayer).getByText("テストエピソード"))

    expect(within(miniPlayer).getByRole("button", { name: "プレイヤーを展開" })).toBeInTheDocument()
    expect(within(miniPlayer).queryByRole("button", { name: "プレイヤーを上下に移動" })).not.toBeInTheDocument()
    expect(within(miniPlayer).getByTestId("global-podcast-mini-player-thumbnail")).toBeInTheDocument()
    expect(within(miniPlayer).getByAltText("テストエピソード")).toBeInTheDocument()
  })

  it("再生操作ボタンをタップしても折りたたみ表示に切り替わらない", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"))
    })

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    fireEvent.click(within(miniPlayer).getByRole("button", { name: "一時停止" }))

    expect(within(miniPlayer).queryByTestId("global-podcast-mini-player-thumbnail")).not.toBeInTheDocument()
    expect(within(miniPlayer).getByRole("button", { name: "一時停止" })).toBeInTheDocument()
  })

  it("縮小サムネイルのドラッグで位置を変更できる", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"))
    })

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    fireEvent.click(within(miniPlayer).getByText("テストエピソード"))
    const thumbnail = within(miniPlayer).getByTestId("global-podcast-mini-player-thumbnail")

    fireEvent.pointerDown(thumbnail, { pointerId: 1, button: 0, clientX: 40, clientY: 40 })
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 220, clientY: 180 })
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 220, clientY: 180 })

    expect(miniPlayer.style.top).not.toBe("")
    expect(miniPlayer.style.left).not.toBe("")
  })

  it("ドラッグ後に展開して再縮小すると同じ位置に戻る", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("play"))
      return Promise.resolve()
    })
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (this: HTMLMediaElement) {
      this.dispatchEvent(new Event("pause"))
    })

    renderWithRouter()

    const miniPlayer = await navigateToBlogWithPlayback()
    fireEvent.click(within(miniPlayer).getByText("テストエピソード"))
    const thumbnail = within(miniPlayer).getByTestId("global-podcast-mini-player-thumbnail")

    fireEvent.pointerDown(thumbnail, { pointerId: 1, button: 0, clientX: 40, clientY: 40 })
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 220, clientY: 180 })
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 220, clientY: 180 })
    expect(miniPlayer.style.top).not.toBe("")
    expect(miniPlayer.style.left).not.toBe("")
    const movedTop = miniPlayer.style.top
    const movedLeft = miniPlayer.style.left

    fireEvent.click(thumbnail)
    fireEvent.click(thumbnail)

    expect(within(miniPlayer).queryByTestId("global-podcast-mini-player-thumbnail")).not.toBeInTheDocument()
    expect(miniPlayer.style.top).toBe("")
    expect(miniPlayer.style.left).toBe("")

    fireEvent.click(within(miniPlayer).getByText("テストエピソード"))
    expect(miniPlayer.style.top).toBe(movedTop)
    expect(miniPlayer.style.left).toBe(movedLeft)
  })
})

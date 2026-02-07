import { render, screen } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { type MockedFunction, vi } from "vitest"
import PodcastDetail from "./PodcastDetail"
import { usePodcast } from "../hooks/usePodcast"
import { usePageMeta } from "../hooks/usePageMeta"
import type { PodcastEpisode } from "../types/podcast"

vi.mock("../hooks/usePodcast", () => ({
  usePodcast: vi.fn(),
}))

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

const usePodcastMock = usePodcast as unknown as MockedFunction<typeof usePodcast>
const usePageMetaMock = usePageMeta as unknown as MockedFunction<typeof usePageMeta>

const createUsePodcastResult = (overrides: Partial<ReturnType<typeof usePodcast>> = {}) =>
  ({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...overrides,
  }) as ReturnType<typeof usePodcast>

describe("PodcastDetail", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("エピソードIDがない場合はポッドキャスト一覧にリダイレクトする", async () => {
    usePodcastMock.mockReturnValue(createUsePodcastResult())

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<PodcastDetail />} />
          <Route path="/podcast" element={<div>ポッドキャスト一覧</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText("ポッドキャスト一覧")).toBeInTheDocument()
  })

  it("取得済みのエピソードを表示し、メタ情報を設定する", () => {
    const episode: PodcastEpisode = {
      id: "001",
      title: "テストエピソード",
      publishedDate: "2026/02/08",
      audioUrl: "https://storage.googleapis.com/masusono-podcast/001.mp3",
    }
    usePodcastMock.mockReturnValue(createUsePodcastResult({ data: episode }))

    render(
      <MemoryRouter initialEntries={[{ pathname: "/podcast/001", state: { episode } }]}>
        <Routes>
          <Route path="/podcast/:episodeId" element={<PodcastDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 2, name: "ポッドキャスト" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 1, name: "テストエピソード" })).toBeInTheDocument()
    expect(screen.getByText("2026/02/08 Episode 001")).toBeInTheDocument()
    expect(screen.getByLabelText("エピソード音声: テストエピソード")).toHaveAttribute(
      "src",
      "https://storage.googleapis.com/masusono-podcast/001.mp3",
    )
    expect(screen.getByRole("link", { name: "エピソード一覧に戻る" })).toHaveAttribute("href", "/podcast")
    expect(usePageMetaMock).toHaveBeenCalled()
    const metaArgs = usePageMetaMock.mock.calls[0]?.[0]
    expect(metaArgs).toMatchObject({ title: "テストエピソード", canonicalPath: "/podcast/001" })
    expect(metaArgs?.description).toContain("テストエピソード")
  })

  it("エラーがある場合はエラーメッセージを表示する", () => {
    usePodcastMock.mockReturnValue(createUsePodcastResult({ error: new Error("取得失敗") }))

    render(
      <MemoryRouter initialEntries={["/podcast/xyz"]}>
        <Routes>
          <Route path="/podcast/:episodeId" element={<PodcastDetail />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 2, name: "ポッドキャスト" })).toBeInTheDocument()
    expect(screen.getByText("取得失敗")).toBeInTheDocument()
  })
})

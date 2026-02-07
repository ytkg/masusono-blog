import { render, screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import Podcast from "./Podcast"
import { usePageMeta } from "../hooks/usePageMeta"

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

const usePageMetaMock = usePageMeta as unknown as MockedFunction<typeof usePageMeta>

describe("Podcast", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("メタ情報を設定し、公開済みエピソードを表示する", () => {
    render(<Podcast />)

    expect(screen.getByRole("heading", { level: 1, name: "ポッドキャスト" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { level: 2, name: "プライベートとか普通とかの話" })).toBeInTheDocument()
    expect(screen.getByText("2026/02/07 Episode 001")).toBeInTheDocument()
    const audio = screen.getByLabelText("エピソード音声: プライベートとか普通とかの話")
    expect(audio).toHaveAttribute("src", "https://storage.googleapis.com/masusono-podcast/001.mp3")
    expect(audio).toHaveAttribute("preload", "metadata")
    expect(audio).toHaveAttribute("playsinline")
    expect(usePageMetaMock).toHaveBeenCalledWith({
      title: "ポッドキャスト",
      description: "増田とその他！のポッドキャスト情報。番組のアーカイブや最新エピソードをお届けします。",
      canonicalPath: "/podcast",
    })
  })
})

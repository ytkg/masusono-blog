import { render, screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import Podcast from "./Podcast"
import { usePageMeta } from "../hooks/usePageMeta"

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

vi.mock("./PodcastEpisodesList", () => ({
  default: () => <div data-testid="podcast-episodes-list" />,
}))

const usePageMetaMock = usePageMeta as unknown as MockedFunction<typeof usePageMeta>

describe("Podcast", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("ページメタを設定し、エピソード一覧を表示する", () => {
    render(<Podcast />)

    expect(screen.getByRole("heading", { level: 1, name: "ポッドキャスト" })).toBeInTheDocument()
    expect(screen.getByTestId("podcast-episodes-list")).toBeInTheDocument()
    expect(usePageMetaMock).toHaveBeenCalledWith({
      title: "ポッドキャスト",
      description: "増田とその他！のポッドキャスト情報。番組のアーカイブや最新エピソードをお届けします。",
      canonicalPath: "/podcast",
    })
  })
})

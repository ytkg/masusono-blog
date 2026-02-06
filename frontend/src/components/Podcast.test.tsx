import { render, screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import Podcast from "./Podcast"
import { usePageMeta } from "../hooks/usePageMeta"

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

vi.mock("./Aimi", () => ({
  default: () => <div data-testid="aimi" />,
}))

const usePageMetaMock = usePageMeta as unknown as MockedFunction<typeof usePageMeta>

describe("Podcast", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("メタ情報を設定し、準備中メッセージと Aimi を表示する", () => {
    render(<Podcast />)

    expect(screen.getByRole("heading", { level: 1, name: "ポッドキャスト" })).toBeInTheDocument()
    expect(screen.getByText("準備中だよ")).toBeInTheDocument()
    expect(screen.getByTestId("aimi")).toBeInTheDocument()
    expect(usePageMetaMock).toHaveBeenCalledWith({
      title: "ポッドキャスト",
      description: "増田とその他！のポッドキャスト情報。番組のアーカイブや最新エピソードをお届けします（準備中）。",
      canonicalPath: "/podcast",
    })
  })
})

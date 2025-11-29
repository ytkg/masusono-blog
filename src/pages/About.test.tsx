import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import About from "./About"
import { usePageMeta } from "../hooks/usePageMeta"

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

const usePageMetaMock = usePageMeta as unknown as vi.MockedFunction<typeof usePageMeta>

describe("About", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("メタ情報を設定し、紹介コンテンツを表示する", () => {
    render(<About />)

    expect(screen.getByRole("heading", { level: 1, name: "「増田とその他！」について" })).toBeInTheDocument()
    expect(screen.getByText(/飲み仲間3人による/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "masusono.com" })).toHaveAttribute("href", "https://masusono.com")
    expect(usePageMetaMock).toHaveBeenCalledWith({
      title: "「増田とその他！」について",
      description: "飲み仲間3人による、日常をゆるく綴るプロジェクト「増田とその他！」の紹介ページです。",
      canonicalPath: "/about",
    })
  })
})

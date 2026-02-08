import { render, screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import Blog from "./Blog"
import { usePageMeta } from "../hooks/usePageMeta"

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

vi.mock("../components/ArticlesList", () => ({
  default: () => <div data-testid="articles-list" />,
}))

const usePageMetaMock = usePageMeta as unknown as MockedFunction<typeof usePageMeta>

describe("Blog", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("ページメタを設定し、記事一覧を表示する", () => {
    render(<Blog />)

    expect(screen.getByRole("heading", { level: 1, name: "ブログ" })).toBeInTheDocument()
    expect(screen.getByTestId("articles-list")).toBeInTheDocument()
    expect(usePageMetaMock).toHaveBeenCalledWith({
      title: "ブログ",
      description: "「増田とその他！」のブログ記事一覧。最近の出来事やお知らせ、コラムをまとめて読むことができます。",
      canonicalPath: "/blog",
    })
  })
})

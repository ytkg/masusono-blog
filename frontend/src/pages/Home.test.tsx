import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { type MockedFunction, vi } from "vitest"
import Home from "./Home"
import { usePageMeta } from "../hooks/usePageMeta"

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

vi.mock("../features/apps/masudaRun/MasudaRunApp", () => ({
  default: () => <div data-testid="masuda-run-app" />,
}))

vi.mock("../features/apps/numbers/NumbersApp", () => ({
  default: () => <div data-testid="numbers-app" />,
}))

const usePageMetaMock = usePageMeta as unknown as MockedFunction<typeof usePageMeta>

describe("Home", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("メタ情報を設定し、アプリランチャーとリンクカードを表示する", () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )

    expect(screen.getByRole("heading", { level: 1, name: "ようこそ" })).toBeInTheDocument()
    expect(screen.getByTestId("masuda-run-app")).toBeInTheDocument()
    expect(screen.getByTestId("numbers-app")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /ブログ/ })).toHaveAttribute("href", "/blog")
    expect(screen.getByRole("link", { name: /ポッドキャスト/ })).toHaveAttribute("href", "/podcast")
    expect(screen.getByRole("link", { name: /推し店/ })).toHaveAttribute("href", "/shops")
    expect(usePageMetaMock).toHaveBeenCalledWith({ canonicalPath: "/" })
  })
})

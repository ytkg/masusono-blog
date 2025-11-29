import { fireEvent, render, screen } from "@testing-library/react"
import { MemoryRouter, useNavigate } from "react-router-dom"
import { vi } from "vitest"
import Footer from "./Footer"

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom")
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

const useNavigateMock = useNavigate as unknown as vi.MockedFunction<typeof useNavigate>

describe("Footer", () => {
  const navigateMock = vi.fn()

  beforeEach(() => {
    navigateMock.mockReset()
    useNavigateMock.mockReturnValue(navigateMock)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("現在のパスに応じてタブをアクティブにする", () => {
    render(
      <MemoryRouter initialEntries={["/blog/123"]}>
        <Footer />
      </MemoryRouter>,
    )

    expect(screen.getByRole("button", { name: "ブログ" })).toHaveClass("Mui-selected")
    expect(screen.getByRole("button", { name: "ホーム" })).not.toHaveClass("Mui-selected")
  })

  it("タブを押下すると対応するパスに遷移する", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Footer />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole("button", { name: "ポッドキャスト" }))
    expect(navigateMock).toHaveBeenCalledWith("/podcast")
  })

  it("著作権表記に現在の西暦を表示する", () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )

    const year = new Date().getFullYear()
    expect(screen.getByText(`© ${year} 増田とその他！`)).toBeInTheDocument()
  })
})

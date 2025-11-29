import { render, screen } from "@testing-library/react"
import { vi } from "vitest"
import type { ReactNode } from "react"
import MasudaRunApp from "./MasudaRunApp"

const drawerSpy = vi.fn()

vi.mock("../components/DrawerLauncher", () => ({
  default: ({ title, buttonAriaLabel, children }: { title: string; buttonAriaLabel: string; children: ReactNode }) => {
    drawerSpy({ title, buttonAriaLabel })
    return (
      <div data-testid="drawer" data-title={title} data-aria-label={buttonAriaLabel}>
        {children}
      </div>
    )
  },
}))

vi.mock("./components/MasudaRunGame", () => ({
  default: () => <div data-testid="masuda-run-game" />,
}))

describe("MasudaRunApp", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("DrawerLauncher にゲームを埋め込み、タイトルとラベルを渡す", () => {
    render(<MasudaRunApp />)

    const drawer = screen.getByTestId("drawer")
    expect(drawer).toHaveAttribute("data-title", "増田RUN")
    expect(drawer).toHaveAttribute("data-aria-label", "増田RUNを開く")
    expect(screen.getByTestId("masuda-run-game")).toBeInTheDocument()
    expect(drawerSpy).toHaveBeenCalledWith({ title: "増田RUN", buttonAriaLabel: "増田RUNを開く" })
  })
})

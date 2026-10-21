import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { recordNavigationCommit } from "../shared/lib/navigationDiagnostics"
import AppLayout from "./AppLayout"

vi.mock("@inertiajs/react", () => ({ usePage: () => ({ url: "/" }) }))
vi.mock("../shared/lib/navigationDiagnostics", () => ({ recordNavigationCommit: vi.fn() }))

vi.mock("../components/Header", () => ({
  default: () => <div>Header</div>,
}))

vi.mock("../components/FloatingBottomNavigation", () => ({
  default: () => <div>FloatingBottomNavigation</div>,
}))

describe("AppLayout", () => {
  it("共通レイアウトと children を組み立てる", () => {
    render(
      <AppLayout>
        <div>MainContent</div>
      </AppLayout>,
    )

    expect(recordNavigationCommit).toHaveBeenCalledWith("/")
    expect(screen.getByText("Header")).toBeInTheDocument()
    expect(screen.getByText("MainContent")).toBeInTheDocument()
    expect(screen.getByText("FloatingBottomNavigation")).toBeInTheDocument()
  })
})

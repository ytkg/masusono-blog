import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HomeAppLaunchers from "./HomeAppLaunchers"

vi.mock("../apps/masudaRun/MasudaRunApp", () => ({
  default: () => <div>MasudaRunApp</div>,
}))

vi.mock("../apps/numbers/NumbersApp", () => ({
  default: () => <div>NumbersApp</div>,
}))

vi.mock("../apps/settings/SettingsApp", () => ({
  default: () => <div>SettingsApp</div>,
}))

describe("HomeAppLaunchers", () => {
  it("アプリ起動導線を並べる", () => {
    render(<HomeAppLaunchers />)

    expect(screen.getByText("MasudaRunApp")).toBeInTheDocument()
    expect(screen.getByText("NumbersApp")).toBeInTheDocument()
    expect(screen.getByText("SettingsApp")).toBeInTheDocument()
  })
})

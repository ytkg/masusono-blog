import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HomeAppLaunchers from "./HomeAppLaunchers"

vi.mock("../apps/masudaRun/MasudaRunApp", () => ({
  default: () => <div>MasudaRunApp</div>,
}))

describe("HomeAppLaunchers", () => {
  it("アプリ起動導線を並べる", async () => {
    render(<HomeAppLaunchers />)

    expect((await screen.findAllByText(/App$/)).map((app) => app.textContent)).toEqual(["MasudaRunApp"])
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HomeAppLaunchers from "./HomeAppLaunchers"

vi.mock("../apps/masudaAimi/MasudaAimiApp", () => ({
  default: () => <div>MasudaAimiApp</div>,
}))

vi.mock("../apps/masudaRun/MasudaRunApp", () => ({
  default: () => <div>MasudaRunApp</div>,
}))

vi.mock("../apps/numbers/NumbersApp", () => ({
  default: () => <div>NumbersApp</div>,
}))

vi.mock("../apps/anonymousSurvey/AnonymousSurveyApp", () => ({
  default: () => <div>AnonymousSurveyApp</div>,
}))

describe("HomeAppLaunchers", () => {
  it("アプリ起動導線を並べる", async () => {
    render(<HomeAppLaunchers />)

    expect((await screen.findAllByText(/App$/)).map((app) => app.textContent)).toEqual(["MasudaRunApp", "NumbersApp"])
    expect(screen.queryByText("MasudaAimiApp")).not.toBeInTheDocument()
    expect(screen.queryByText("AnonymousSurveyApp")).not.toBeInTheDocument()
    expect(screen.queryByText("SettingsApp")).not.toBeInTheDocument()
    expect(screen.queryByText("ZukanApp")).not.toBeInTheDocument()
  })
})

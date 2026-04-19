import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import HomeAppLaunchers from "./HomeAppLaunchers"

vi.mock("../apps/masudaRun/MasudaRunApp", () => ({
  default: () => <div>MasudaRunApp</div>,
}))

vi.mock("../apps/zukan/ZukanApp", () => ({
  default: () => <div>ZukanApp</div>,
}))

vi.mock("../apps/numbers/NumbersApp", () => ({
  default: () => <div>NumbersApp</div>,
}))

vi.mock("../apps/anonymousSurvey/AnonymousSurveyApp", () => ({
  default: () => <div>AnonymousSurveyApp</div>,
}))

vi.mock("../apps/settings/SettingsApp", () => ({
  default: () => <div>SettingsApp</div>,
}))

describe("HomeAppLaunchers", () => {
  it("アプリ起動導線を並べる", async () => {
    render(<HomeAppLaunchers />)

    expect((await screen.findAllByText(/App$/)).map((app) => app.textContent)).toEqual([
      "MasudaRunApp",
      "NumbersApp",
      "ZukanApp",
      "SettingsApp",
    ])
    expect(screen.queryByText("AnonymousSurveyApp")).not.toBeInTheDocument()
  })
})

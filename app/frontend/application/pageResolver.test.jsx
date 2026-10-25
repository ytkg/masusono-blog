import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { resolvePage } from "./pageResolver"

vi.mock("../shared/lib/navigationDiagnostics", () => ({ tracePageResolution: (load) => load() }))
vi.mock("../layouts/AppLayout", () => ({ default: ({ children }) => <main>{children}</main> }))
vi.mock("../pages/about", () => ({ default: () => <div>about page</div> }))
vi.mock("../pages/authors/index", () => ({ default: () => <div>authors page</div> }))
vi.mock("../pages/errors/not_found", () => ({
  default: Object.assign(() => <div>missing page</div>, { layout: (page) => <aside>{page}</aside> }),
}))

describe("resolvePage", () => {
  it.each(["about", "About", "authors", "Authors"])("%s のページを解決し共通レイアウトを付ける", async (name) => {
    const { default: Page } = await resolvePage(name)
    render(Page.layout(<Page />))
    expect(screen.getByRole("main")).toHaveTextContent(name.toLowerCase() === "about" ? "about page" : "authors page")
  })

  it("既に設定されたレイアウトを維持する", async () => {
    const { default: Page } = await resolvePage("errors/not_found")
    render(Page.layout(<Page />))
    expect(screen.getByRole("complementary")).toHaveTextContent("missing page")
    expect(screen.queryByRole("main")).not.toBeInTheDocument()
  })

  it("存在しないページは名前付きのエラーにする", async () => {
    await expect(resolvePage("does-not-exist")).rejects.toThrow("Inertia page not found: does-not-exist")
  })
})

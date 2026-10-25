import { describe, expect, it, vi } from "vitest"
import { createInertiaApp } from "@inertiajs/react"
import createServer from "@inertiajs/react/server"
import { renderToString } from "react-dom/server"
import InertiaApp from "../application/InertiaApp"
import { resolvePage } from "../application/pageResolver"

vi.mock("@inertiajs/react", () => ({ createInertiaApp: vi.fn() }))
vi.mock("@inertiajs/react/server", () => ({ default: vi.fn() }))
vi.mock("../application/pageResolver", () => ({ resolvePage: vi.fn() }))
vi.mock("../components/NavigationFailureDialog", () => ({ default: () => null }))

describe("SSR entrypoint", () => {
  it("ローカルホストでSSRを起動し、共通のページ解決と描画処理へ渡す", async () => {
    await import("./ssr")
    expect(createServer).toHaveBeenCalledWith(expect.any(Function), { host: "127.0.0.1" })
    const page = { component: "home", props: { title: "記事一覧" } }
    const response = { body: "rendered page" }
    createInertiaApp.mockResolvedValue(response)
    await expect(createServer.mock.calls[0][0](page)).resolves.toBe(response)
    const options = createInertiaApp.mock.calls[0][0]
    expect(options.page).toBe(page)
    expect(options.resolve).toBe(resolvePage)
    expect(options.render).toBe(renderToString)
    const App = ({ title }) => <h1>{title}</h1>
    const node = options.setup({ App, props: page.props })
    expect(node.type).toBe(InertiaApp)
    expect(node.props).toEqual({ App, props: page.props })
    expect(options.render(node)).toContain("<h1>記事一覧</h1>")
  })
})

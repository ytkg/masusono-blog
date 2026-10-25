import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createRoot, hydrateRoot } from "react-dom/client"
import { createInertiaApp, router } from "@inertiajs/react"
import { installAnalyticsNavigation } from "../shared/lib/analytics"
import { installNavigationDiagnostics } from "../shared/lib/navigationDiagnostics"
import { installNavigationRecovery } from "../shared/lib/navigationRecovery"
import InertiaApp from "../application/InertiaApp"
import { resolvePage } from "../application/pageResolver"

vi.mock("react-dom/client", () => ({ createRoot: vi.fn(), hydrateRoot: vi.fn() }))
vi.mock("@inertiajs/react", () => ({ createInertiaApp: vi.fn(), router: { cancelAll: vi.fn() } }))
vi.mock("../shared/lib/analytics", () => ({ installAnalyticsNavigation: vi.fn() }))
vi.mock("../shared/lib/navigationDiagnostics", () => ({ installNavigationDiagnostics: vi.fn() }))
vi.mock("../shared/lib/navigationRecovery", () => ({ installNavigationRecovery: vi.fn() }))
vi.mock("../application/InertiaApp", () => ({ default: () => null }))
vi.mock("../application/pageResolver", () => ({ resolvePage: vi.fn() }))

let serviceWorker, cacheStorage, renderPage, popstate

beforeEach(() => {
  vi.resetModules()
  vi.clearAllMocks()
  vi.stubEnv("DEV", false)
  serviceWorker = { register: vi.fn().mockResolvedValue({}), getRegistration: vi.fn().mockResolvedValue(undefined) }
  vi.stubGlobal("navigator", { serviceWorker })
  cacheStorage = { keys: vi.fn().mockResolvedValue([]), delete: vi.fn().mockResolvedValue(true) }
  vi.stubGlobal("caches", cacheStorage)
  renderPage = vi.fn()
  createRoot.mockReturnValue({ render: renderPage })
  const addEventListener = window.addEventListener.bind(window)
  vi.spyOn(window, "addEventListener").mockImplementation((name, callback, options) => {
    if (name === "popstate") popstate = callback
    addEventListener(name, callback, options)
  })
})

afterEach(() => {
  window.removeEventListener("popstate", popstate)
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

async function boot(serverRendered = false) {
  await import("./inertia.js")
  const options = createInertiaApp.mock.calls[0][0]
  const el = document.createElement("div")
  if (serverRendered) el.dataset.serverRendered = "true"
  const App = () => null
  const props = { initialPage: { component: "home" } }
  options.setup({ el, App, props })
  return { el, App, props, options }
}

describe("Inertia entrypoint", () => {
  it("遷移監視を登録して通常のページを描画し、戻る操作で背景取得を中止する", async () => {
    const { el, App, props, options } = await boot()
    expect(options.resolve).toBe(resolvePage)
    expect(installAnalyticsNavigation).toHaveBeenCalledWith(router)
    expect(installNavigationDiagnostics).toHaveBeenCalledWith(router)
    expect(installNavigationRecovery).toHaveBeenCalledWith(router)
    expect(createRoot).toHaveBeenCalledWith(el)
    const node = renderPage.mock.calls[0][0]
    expect(node.type).toBe(InertiaApp)
    expect(node.props).toEqual({ App, props })
    expect(hydrateRoot).not.toHaveBeenCalled()
    window.dispatchEvent(new PopStateEvent("popstate"))
    expect(router.cancelAll).toHaveBeenCalledWith({ sync: false })
    expect(serviceWorker.register).toHaveBeenCalledWith("/service-worker.js", { scope: "/" })
  })

  it("SSR済みのHTMLはhydrateする", async () => {
    const { el, App, props } = await boot(true)
    expect(createRoot).not.toHaveBeenCalled()
    const [root, node] = hydrateRoot.mock.calls[0]
    expect(root).toBe(el)
    expect(node.type).toBe(InertiaApp)
    expect(node.props).toEqual({ App, props })
  })

  it("service worker非対応でも描画する", async () => {
    vi.stubGlobal("navigator", {})
    await boot()
    expect(renderPage).toHaveBeenCalledOnce()
    expect(serviceWorker.register).not.toHaveBeenCalled()
  })

  it("本番の登録失敗を報告する", async () => {
    const failure = new Error("registration failed")
    serviceWorker.register.mockRejectedValue(failure)
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    await boot()
    await vi.waitFor(() => expect(error).toHaveBeenCalledWith("Service worker registration failed:", failure))
  })

  it("開発時は既存登録を解除し、このアプリのキャッシュだけ削除する", async () => {
    vi.stubEnv("DEV", true)
    const unregister = vi.fn().mockResolvedValue(true)
    serviceWorker.getRegistration.mockResolvedValue({ unregister })
    cacheStorage.keys.mockResolvedValue(["masusono-cache-v1", "other-cache", "masusono-cache-v2"])
    await boot()
    await vi.waitFor(() => expect(cacheStorage.delete).toHaveBeenCalledTimes(2))
    expect(cacheStorage.delete.mock.calls).toEqual([["masusono-cache-v1"], ["masusono-cache-v2"]])
    expect(unregister).toHaveBeenCalledOnce()
    expect(serviceWorker.register).not.toHaveBeenCalled()
  })

  it("開発時に登録がなくてもキャッシュを確認する", async () => {
    vi.stubEnv("DEV", true)
    await boot()
    await vi.waitFor(() => expect(cacheStorage.keys).toHaveBeenCalledOnce())
    expect(cacheStorage.delete).not.toHaveBeenCalled()
    expect(serviceWorker.register).not.toHaveBeenCalled()
  })

  it("開発時の解除失敗とキャッシュ取得失敗を報告する", async () => {
    vi.stubEnv("DEV", true)
    const failure = new Error("blocked")
    serviceWorker.getRegistration.mockResolvedValue({ unregister: vi.fn().mockRejectedValue(failure) })
    cacheStorage.keys.mockRejectedValue(failure)
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    await boot()
    await vi.waitFor(() => {
      expect(error).toHaveBeenCalledWith("Service worker unregister failed:", failure)
      expect(warn).toHaveBeenCalledWith("Failed to clear service worker caches in dev:", failure)
    })
  })
})

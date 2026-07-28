import { getInitialPageFromDOM } from "@inertiajs/core"
import { afterEach, describe, expect, it } from "vitest"

afterEach(() => {
  document.body.replaceChildren()
})

describe("Inertia の初期ページ", () => {
  it("v3 形式の script 要素から読み取れる", () => {
    const page = { component: "home", props: {}, url: "/", version: "development" }
    const script = document.createElement("script")

    script.dataset.page = "app"
    script.type = "application/json"
    script.textContent = JSON.stringify(page)
    document.body.append(script)

    expect(getInitialPageFromDOM("app")).toEqual(page)
  })

  it("旧形式の data-page 属性は初期ページとして扱わない", () => {
    const root = document.createElement("div")

    root.id = "app"
    root.dataset.page = JSON.stringify({ component: "home" })
    document.body.append(root)

    expect(getInitialPageFromDOM("app")).toBeNull()
  })
})

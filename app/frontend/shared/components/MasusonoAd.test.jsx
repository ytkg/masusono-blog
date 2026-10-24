import { render } from "@testing-library/react"
import { renderToString } from "react-dom/server"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import MasusonoAd from "./MasusonoAd"
import { ensureUserIdCookie } from "../lib/userId"

describe("MasusonoAd", () => {
  beforeEach(() => {
    document.cookie = "user_id=; Max-Age=0; Path=/"
    window.MasusonoAds = { render: vi.fn() }
  })

  afterEach(() => {
    document.cookie = "user_id=; Max-Age=0; Path=/"
    delete window.MasusonoAds
    vi.restoreAllMocks()
  })

  it("SSRではID未取得の広告要素を出力しない", () => {
    expect(renderToString(<MasusonoAd placement="search-bottom" />)).toBe("")
    expect(window.MasusonoAds.render).not.toHaveBeenCalled()
  })

  it.each(["search-bottom", "numbers-bottom", "others-bottom"])(
    "%s は初回Cookie作成後、管理画面と同じIDを付けてから抽選する",
    (placement) => {
      window.MasusonoAds.render.mockImplementation(() => {
        expect(document.querySelector(`[data-masusono-ad="${placement}"]`)).toHaveAttribute(
          "data-masusono-viewer-id",
          ensureUserIdCookie(),
        )
      })
      render(<MasusonoAd placement={placement} />)
      expect(window.MasusonoAds.render).toHaveBeenCalledOnce()
    },
  )

  it("Cookieが使えない場合はID属性を省略して抽選する", () => {
    vi.spyOn(document, "cookie", "set").mockImplementation(() => {})
    const { container } = render(<MasusonoAd placement="search-bottom" />)
    expect(container.querySelector("[data-masusono-ad]")).not.toHaveAttribute("data-masusono-viewer-id")
    expect(window.MasusonoAds.render).toHaveBeenCalledOnce()
  })

  it("再描画で変更されたIDを反映し、画面遷移でも抽選する", () => {
    document.cookie = "user_id=first; Path=/"
    const { container, rerender } = render(<MasusonoAd placement="others-bottom" refreshKey="/others" />)
    const firstElement = container.querySelector("[data-masusono-ad]")
    window.MasusonoAds.render.mockImplementation(() => {
      expect(container.querySelector("[data-masusono-ad]")).toHaveAttribute("data-masusono-viewer-id", "second")
    })
    document.cookie = "user_id=second; Path=/"
    rerender(<MasusonoAd placement="others-bottom" refreshKey="/others" />)
    expect(container.querySelector("[data-masusono-ad]")).not.toBe(firstElement)
    rerender(<MasusonoAd placement="others-bottom" refreshKey="/others?app=ads" />)
    expect(window.MasusonoAds.render).toHaveBeenCalledTimes(3)
  })
})

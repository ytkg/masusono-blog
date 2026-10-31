import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import AdsApp from "./AdsApp"

vi.mock("../shared/AppsDialogLauncher", () => ({
  default: ({ children, onOpen }) => (
    <div>
      <button onClick={onOpen}>広告を開く</button>
      {children}
    </div>
  ),
}))

afterEach(() => {
  vi.restoreAllMocks()
  document.cookie = "user_id=; Max-Age=0; Path=/"
})

it("共通CookieのIDをURLエンコードして広告を開く", () => {
  document.cookie = "user_id=existing%2Fuser; Path=/"
  render(<AdsApp />)
  fireEvent.click(screen.getByRole("button", { name: "広告を開く" }))
  expect(screen.getByTitle("広告")).toHaveAttribute("src", "https://ads.masusono.com/users/existing%2Fuser/ads")
})

it("Cookieがなければ共通IDを発行して使う", () => {
  render(<AdsApp />)
  fireEvent.click(screen.getByRole("button", { name: "広告を開く" }))
  const userId = document.cookie.match(/user_id=([^;]+)/)[1]
  expect(userId).toMatch(/^[0-9a-f-]{36}$/)
  expect(screen.getByTitle("広告")).toHaveAttribute("src", `https://ads.masusono.com/users/${userId}/ads`)
})

it("Cookieを保存できない場合は広告を読み込まず案内する", () => {
  vi.spyOn(document, "cookie", "set").mockImplementation(() => {})
  render(<AdsApp />)
  fireEvent.click(screen.getByRole("button", { name: "広告を開く" }))
  expect(screen.queryByTitle("広告")).not.toBeInTheDocument()
  expect(screen.getByRole("status")).toHaveTextContent("ブラウザのCookie設定を確認してください。")
})

it("対象記事を選択する新規出稿画面をiframeで開く", () => {
  document.cookie = "user_id=existing%2Fuser; Path=/"
  render(<AdsApp articleId="article/id ?記事&other=value" />)
  fireEvent.click(screen.getByRole("button", { name: "広告を開く" }))
  expect(screen.getByTitle("広告を出稿する")).toHaveAttribute(
    "src",
    `https://ads.masusono.com/users/existing%2Fuser/ads/new?articleId=${encodeURIComponent("article/id ?記事&other=value")}`,
  )
})

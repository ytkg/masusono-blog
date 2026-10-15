import { expect, test } from "@playwright/test"
import { richArticleContent } from "./contentFixtures"
import { mockPageProps, openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("code and Ruby output can be reached and scrolled with the keyboard", async ({ page }) => {
  await page.addInitScript(() => {
    window.Worker = class {
      addEventListener(type, listener) {
        if (type === "message") this.listener = listener
      }
      postMessage() {
        this.listener({ data: { stdout: "result\n".repeat(100), stderr: "" } })
      }
      terminate() {}
    }
  })
  await mockPageProps(page, "/articles/visual-article-1", (props) => {
    props.article.content = richArticleContent
  })
  await openPage(page, "/articles/visual-article-1")
  const code = page.getByRole("region", { name: "JavaScriptのコード" })
  await code.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(code).toBeFocused()
  await expect(code).toHaveCSS("outline", "rgb(0, 0, 0) solid 2px")
  await expect(code).toHaveCSS("outline-offset", "-2px")
  await page.keyboard.press("ArrowRight")
  await expect.poll(() => code.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)

  await page.keyboard.press("Tab")
  await expect(page.getByRole("button", { name: "▶ 実行" })).toBeFocused()
  await page.keyboard.press("Enter")
  await page.keyboard.press("Tab")
  await expect(page.getByRole("region", { name: "Rubyのコード" })).toBeFocused()
  await page.keyboard.press("Tab")
  const output = page.getByRole("region", { name: "Ruby実行結果" })
  await expect(output).toBeFocused()
  await expect(output).toHaveCSS("outline", "rgb(0, 0, 0) solid 2px")
  await expect(output).toHaveCSS("outline-offset", "-2px")
  await page.keyboard.press("ArrowDown")
  await expect.poll(() => output.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
})

test("RUN canvas has a visible keyboard focus and keeps its start control", async ({ page }) => {
  await openPage(page, "/others")
  await page.getByRole("button", { name: "増田RUNを開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  const canvas = page.getByRole("img", { name: "増田RUNのゲーム画面" })
  await canvas.focus()
  await page.keyboard.press("Shift+Tab")
  await page.keyboard.press("Tab")
  await expect(canvas).toBeFocused()
  await expect(canvas).toHaveCSS("outline", "rgb(0, 0, 0) solid 2px")
  await expect(canvas).toHaveCSS("outline-offset", "-2px")
  await expect(canvas).toHaveAccessibleDescription(/スペース\/↑でジャンプ/)
  await page.keyboard.press("Space")
  await expect(page.getByRole("button", { name: "ジャンプ", exact: true })).toBeVisible()
})

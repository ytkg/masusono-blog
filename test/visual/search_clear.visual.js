import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test("search stays ready for typing after clearing with pointer or keyboard", async ({ page }) => {
  await openPage(page, "/search?q=散歩")
  const input = page.getByRole("textbox", { name: "記事を検索" })
  for (const activation of ["pointer", "keyboard"]) {
    const clear = page.getByRole("button", { name: "検索語をクリア" })
    if (activation === "pointer") {
      await clear.click()
    } else {
      await clear.focus()
      await page.keyboard.press("Enter")
    }
    await expect(input).toHaveValue("")
    await expect(input).toBeFocused()
    expect(new URL(page.url()).searchParams.has("q")).toBe(false)
    await page.keyboard.type("散歩")
    await expect(input).toHaveValue("散歩")
    await expect(page.getByRole("link", { name: "週末の散歩で見つけたもの" })).toBeVisible()
  }
})

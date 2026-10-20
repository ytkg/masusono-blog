import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test("greed shopping, complete game, best and reset", async ({ page }) => {
  await page.addInitScript(() => {
    // Reproducible baskets, payer and legal decisive hands.
    Math.random = () => 0.5
  })
  await openPage(page, "/others")
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await expect(page.getByText("自己ベスト：記録なし")).toBeVisible()
  const screen = page.getByRole("region", { name: "強欲のゲーム画面" })
  const header = page.getByRole("dialog").getByRole("heading", { name: "強欲は身を滅ぼす？", exact: true, level: 2 })
  const bounds = await screen.boundingBox()
  const headerBounds = await header.boundingBox()
  expect(bounds.x).toBe(0)
  expect(bounds.width).toBe(page.viewportSize().width)
  expect(bounds.y).toBeGreaterThan(headerBounds.y + headerBounds.height)
  expect(bounds.y + bounds.height).toBe(page.viewportSize().height)
  await expect(page.getByRole("button", { name: "買い物を始める" })).toBeInViewport()

  await expect(page).toHaveScreenshot("greed-title.png")
  await page.getByRole("button", { name: "買い物を始める" }).click()
  const confirm = page.getByRole("button", { name: "カゴを確定して勝負" })
  await expect(confirm).toBeDisabled()
  await page.getByRole("button", { name: "塩むすびを追加", exact: true }).click()
  await expect(page.getByText("あなたのカゴ：100円 / 10,000円")).toBeVisible()
  await expect(page).toHaveScreenshot("greed-shopping.png")
  await page.getByRole("button", { name: "おつまみセットを追加", exact: true }).scrollIntoViewIfNeeded()
  await expect.poll(() => screen.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
  await expect(page.getByRole("button", { name: "閉じる", exact: true })).toBeInViewport({ ratio: 1 })
  await expect(confirm).toBeInViewport({ ratio: 1 })
  for (let round = 1; round <= 3; round++) {
    if (round > 1) await page.getByRole("button", { name: "塩むすびを追加", exact: true }).click()
    await confirm.click()
    await expect.poll(() => screen.evaluate((element) => element.scrollTop)).toBe(0)
    let attempts = 0
    while (!(await page.getByText("MIDNIGHT MART レシート", { exact: true }).isVisible())) {
      if (++attempts > 12) throw new Error("round failed to finish")
      const hand = page.getByRole("button", { name: "✊ グー", exact: true })
      const next = page.getByRole("button", { name: "次のじゃんけんへ" })
      if (await hand.isVisible()) await hand.click()
      else if (await next.isVisible()) await next.click()
      else await expect(page.getByText("MIDNIGHT MART レシート", { exact: true })).toBeVisible()
    }
    await expect(page.getByText(`現在の合計スコア：${round * 100}円`)).toBeVisible()
    if (round === 1) await expect(page).toHaveScreenshot("greed-receipt.png")
    await page.getByRole("button", { name: round === 3 ? "最終結果を見る" : "次のラウンドへ" }).click()
  }
  await expect(page.getByText("自己ベスト：300円")).toBeVisible()
  await expect(page).toHaveScreenshot("greed-final.png")
  await page.getByRole("button", { name: "閉じる", exact: true }).click()
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByText("自己ベスト：300円")).toBeVisible()
  await expect(page.getByRole("button", { name: "買い物を始める" })).toBeVisible()
  await page.reload()
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByText("自己ベスト：300円")).toBeVisible()
})

test("greed payer receipt and negative first best", async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.5 })
  await openPage(page, "/others")
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await page.getByRole("button", { name: "買い物を始める" }).click()
  for (let round = 1; round <= 3; round++) {
    for (let i = 0; i < 5; i++) await page.getByRole("button", { name: "ごほうび重を追加", exact: true }).click()
    await expect(page.getByRole("button", { name: "塩むすびを追加", exact: true })).toBeDisabled()
    await page.getByRole("button", { name: "カゴを確定して勝負" }).click()
    for (let i = 0; i < 6; i++) {
      if (await page.getByText("MIDNIGHT MART レシート", { exact: true }).isVisible()) break
      const hand = page.getByRole("button", { name: "✊ グー", exact: true })
      if (await hand.isVisible()) await hand.click()
      else await page.getByRole("button", { name: "次のじゃんけんへ" }).click()
    }
    await expect(page.getByText("あなたが勝ち残り、全員に奢る！")).toBeVisible()
    await expect(page.getByText("お支払い合計：17,900円")).toBeVisible()
    await expect(page.getByText("ラウンド収支：-17,900円")).toBeVisible()
    if (round === 1) {
      await page.getByText("MIDNIGHT MART レシート", { exact: true }).scrollIntoViewIfNeeded()
      await expect(page.getByRole("button", { name: "閉じる", exact: true })).toBeInViewport({ ratio: 1 })
      await expect(page).toHaveScreenshot("greed-payer-receipt.png")
    }
    await page.getByRole("button", { name: round === 3 ? "最終結果を見る" : "次のラウンドへ" }).click()
  }
  await expect(page.getByText("自己ベスト：-53,700円")).toBeVisible()
  await page.getByRole("button", { name: "閉じる", exact: true }).click()
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByText("自己ベスト：-53,700円")).toBeVisible()
})

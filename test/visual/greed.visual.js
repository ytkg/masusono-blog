import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

// Article fixture requests must reach page.route instead of the service worker.
test.use({ serviceWorkers: "block" })

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
    while (!(await page.getByText("領収証", { exact: true }).isVisible())) {
      if (++attempts > 12) throw new Error("round failed to finish")
      const hand = page.getByRole("button", { name: "✊ グー", exact: true })
      const next = page.getByRole("button", { name: "次のじゃんけんへ" })
      if (await hand.isVisible()) await hand.click()
      else if (await next.isVisible()) await next.click()
      else await expect(page.getByText("領収証", { exact: true })).toBeVisible()
    }
    await expect(page.getByText(`現在の合計スコア：${round * 100}円`)).toBeVisible()
    const receipt = page.getByRole("region", { name: "会計レシート" })
    await expect(receipt).not.toContainText(/あなた|CPU/)
    const chocolate = receipt.getByRole("row", { name: /板チョコ/ })
    await expect(chocolate.getByRole("cell").nth(1)).toHaveText("44")
    await expect(chocolate.getByRole("cell").nth(2)).toHaveText("6,600円")
    if (round === 1) await expect(page).toHaveScreenshot("greed-receipt.png")
    await page.getByRole("button", { name: round === 3 ? "最終結果を見る" : "次のラウンドへ" }).click()
  }
  await expect(page.getByText("自己ベスト：300円")).toBeVisible()
  await expect(page.getByRole("region", { name: "手に入った商品" })).toContainText("塩むすび ×3")
  await expect(page.getByText("全部ごちそうになりました", { exact: false })).toBeVisible()
  await expect(page).toHaveScreenshot("greed-final.png")
  await page.getByRole("button", { name: "再挑戦", exact: true }).click()
  await expect(page.getByText("あなたのカゴ：0円 / 10,000円")).toBeVisible()
  await expect(page.getByRole("region", { name: "手に入った商品" })).toHaveCount(0)
  await page.getByRole("button", { name: "閉じる", exact: true }).click()
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByText("自己ベスト：300円")).toBeVisible()
  await expect(page.getByRole("button", { name: "買い物を始める" })).toBeVisible()
  await page.reload()
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByText("自己ベスト：300円")).toBeVisible()
})

test("greed payer receipt and negative first best", async ({ page }) => {
  // Keep the real article page, using fixture content for the source article.
  await page.route("**/articles/uqu8cokro", async (route) => {
    const response = await route.fetch({ url: new URL("/articles/visual-article-1", route.request().url()).href })
    const payload = await response.json()
    payload.url = "/articles/uqu8cokro"
    payload.props.article.id = "uqu8cokro"
    payload.props.article.title = "強欲は身を滅ぼす？"
    await route.fulfill({ response, json: payload })
  })
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
      if (await page.getByText("領収証", { exact: true }).isVisible()) break
      const hand = page.getByRole("button", { name: "✊ グー", exact: true })
      if (await hand.isVisible()) await hand.click()
      else await page.getByRole("button", { name: "次のじゃんけんへ" }).click()
    }
    await expect(page.getByText("あなたが勝ち残り、全員に奢る！")).toBeVisible()
    await expect(page.getByText("お支払い合計：17,900円")).toBeVisible()
    await expect(page.getByRole("region", { name: "会計レシート" })).not.toContainText(/あなた|CPU/)
    await expect(page.getByText("今回のスコア：-17,900円")).toBeVisible()
    await expect(page.getByText("今日は納豆ご飯だ。", { exact: true })).toHaveCount(0)
    if (round === 1) {
      await page.getByText("領収証", { exact: true }).scrollIntoViewIfNeeded()
      await expect(page.getByRole("button", { name: "閉じる", exact: true })).toBeInViewport({ ratio: 1 })
      await expect(page).toHaveScreenshot("greed-payer-receipt.png")
    }
    await page.getByRole("button", { name: round === 3 ? "最終結果を見る" : "次のラウンドへ" }).click()
  }
  await expect(page.getByText("自己ベスト：-53,700円")).toBeVisible()
  await expect(page.getByRole("heading", { name: "自分のお支払い合計 53,700円" })).toBeVisible()
  await expect(page.getByRole("region", { name: "手に入った商品" })).toContainText("ごほうび重 ×15")
  await expect(page.getByText("今日は納豆ご飯だ。", { exact: true })).toBeVisible()
  await expect(page).toHaveScreenshot("greed-final-payer.png")
  const details = page.getByText("購入者ごとの商品明細", { exact: true })
  await details.nth(0).click()
  await expect(page.getByText("ごほうび重 ×5 · 10,000円", { exact: true }).first()).toBeVisible()
  await expect(page).toHaveScreenshot("greed-final-details.png")
  await page.getByRole("button", { name: "再挑戦", exact: true }).scrollIntoViewIfNeeded()
  await expect(page.getByRole("button", { name: "再挑戦", exact: true })).toBeInViewport({ ratio: 1 })
  await expect(page.getByText("今日は納豆ご飯だ。", { exact: true })).toBeInViewport({ ratio: 1 })
  await expect(page).toHaveScreenshot("greed-final-closing.png")
  await expect(page.getByRole("button", { name: "閉じる", exact: true })).toBeInViewport({ ratio: 1 })
  const sourceLink = page.getByRole("link", { name: "元になった記事を読む →" })
  await expect(sourceLink).toHaveAttribute("href", "/articles/uqu8cokro")
  await sourceLink.click()
  await expect(page).toHaveURL(/\/articles\/uqu8cokro$/)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "強欲は身を滅ぼす？", exact: true })).toBeVisible()
  await openPage(page, "/others")
  await page.getByRole("button", { name: "強欲を開く" }).click()
  await expect(page.getByText("自己ベスト：-53,700円")).toBeVisible()
  await page.getByRole("link", { name: "強欲は身を滅ぼす？を読む →" }).click()
  await expect(page).toHaveURL(/\/articles\/uqu8cokro$/)
  await expect(page.getByRole("dialog")).toHaveCount(0)
  await expect(page.getByRole("heading", { name: "強欲は身を滅ぼす？", exact: true })).toBeVisible()
})

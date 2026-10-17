import { expect, test } from "@playwright/test"
import { openPage } from "./helpers"

test.use({ serviceWorkers: "block" })

test("editing and saving display name keeps the settings form active", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "serviceWorker", {
      value: {
        register: async () => ({}),
        ready: Promise.resolve({ pushManager: { getSubscription: async () => null } }),
      },
    })
  })
  let reads = 0
  let finishSave
  const saveReady = new Promise((resolve) => { finishSave = resolve })
  await page.route("**/api/app/users/*.json", (route) => {
    reads++
    return route.fulfill({ json: { name: "現在名" } })
  })
  await page.route("**/api/app/users.json", async (route) => {
    await saveReady
    await route.fulfill({ json: {} })
  })
  await openPage(page, "/others")
  await page.getByRole("button", { name: "設定を開く" }).click()
  await expect(page.getByTestId("app-content")).toHaveAttribute("aria-hidden", "false")
  await expect(page.getByText("現在名", { exact: true })).toBeVisible()
  await page.getByRole("button", { name: "変更", exact: true }).click()
  const input = page.getByRole("textbox", { name: "表示名" })
  await expect(page.getByTestId("app-content")).not.toHaveAttribute("inert")
  await input.fill("新しい名前")
  await page.getByRole("button", { name: "保存", exact: true }).click()
  await expect(input).toBeDisabled()
  await expect(page.getByRole("button", { name: "保存中...", exact: true })).toBeDisabled()
  finishSave()
  await expect(page.getByText("新しい名前", { exact: true })).toBeVisible()
  await expect(page.getByTestId("app-content")).not.toHaveAttribute("inert")
  expect(reads).toBe(1)
  await page.getByRole("button", { name: "変更", exact: true }).click()
  await expect(input).toHaveValue("新しい名前")
})

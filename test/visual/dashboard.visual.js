import { test, expect } from "@playwright/test"
import { openPage, expectNoPageOverflow, mockPageProps } from "./helpers"

// Mocked HTML lacks a loopback address; limit this browser adjustment to dashboard screenshots.
test.use({
  launchOptions: {
    args: [
      "--host-resolver-rules=MAP dashboard.lvh.me 127.0.0.1",
      "--disable-features=LocalNetworkAccessChecks",
    ],
  },
})

const dashboardUrl = "http://dashboard.lvh.me:3000/"

test("dashboard overview", async ({ page }) => {
  await openPage(page, dashboardUrl)
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("記事のある毎日を、数字で。")
  await expectNoPageOverflow(page)
  await expect(page).toHaveScreenshot("dashboard-overview.png", { fullPage: true })
})

test("dashboard empty", async ({ page }) => {
  await mockPageProps(
    page,
    "/",
    (props) => {
      props.metrics = { rows: [] }
    },
    { url: "http://127.0.0.1:3000/", headers: { Host: "dashboard.lvh.me:3000" } },
  )
  await openPage(page, dashboardUrl)
  await expect(page.getByText("まだ集計データがありません。")).toBeVisible()
  await expectNoPageOverflow(page)
  await expect(page).toHaveScreenshot("dashboard-empty.png", { fullPage: true })
})

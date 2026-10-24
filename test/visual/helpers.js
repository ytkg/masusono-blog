import { expect } from "@playwright/test"
import { parse } from "parse5"

export async function waitForClientReady(page) {
  await expect(page.locator("#app")).toHaveAttribute("data-client-ready", "true")
}

// Keep the real Rails response and Inertia boot process; replace only this test's props.
export async function mockPageProps(page, path, transform) {
  await page.route(
    (url) => url.pathname === path,
    async (route) => {
      const response = await route.fetch()
      if (response.headers()["content-type"]?.includes("application/json")) {
        const payload = await response.json()
        transform(payload.props)
        await route.fulfill({ response, json: payload })
        return
      }
      let replaced = false
      let body = (await response.text()).replace(
        /(<script\b[^>]*data-page="app"[^>]*>)([\s\S]*?)(<\/script>)/,
        (_, start, json, end) => {
          const payload = JSON.parse(json)
          transform(payload.props)
          replaced = true
          return start + JSON.stringify(payload).replaceAll("<", "\\u003c") + end
        },
      )
      expect(replaced, "Inertia initial page must be replaced").toBe(true)
      // The replacement props differ from the server HTML: mount this mocked page afresh.
      const nodes = [parse(body, { sourceCodeLocationInfo: true })]
      let root
      while (nodes.length) {
        const node = nodes.pop()
        if (node.attrs?.some(({ name, value }) => name === "id" && value === "app")) {
          root = node
          break
        }
        nodes.push(...(node.childNodes || []))
      }
      expect(root, "Inertia root must be replaced").toBeTruthy()
      const { startOffset, endOffset } = root.sourceCodeLocation
      body = body.slice(0, startOffset) + '<div id="app"></div>' + body.slice(endOffset)
      await route.fulfill({ response, body })
    },
  )
}

export async function mockBlogmuraBanner(page) {
  await page.route("https://b.blogmura.com/diary/88_31.gif", (route) =>
    route.fulfill({ path: "test/visual/blogmura-banner.gif", contentType: "image/gif" }),
  )
}

export async function openPage(page, path) {
  await page.route("https://ads.masusono.com/ad.js", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  )
  await mockBlogmuraBanner(page)
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
  await waitForClientReady(page)
  await page.locator("main").waitFor()
  await page.evaluate(() => document.fonts.ready)
}

export async function expectNoPageOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width)
}

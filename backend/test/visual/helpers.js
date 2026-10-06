import { expect } from "@playwright/test"

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
      body = body.replace(
        /<div data-server-rendered="true" id="app">[\s\S]*<\/div>(\s*<\/body>)/,
        '<div id="app"></div>$1',
      )
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
  await mockBlogmuraBanner(page)
  const response = await page.goto(path)
  expect(response?.status()).toBe(200)
  await page.locator("main").waitFor()
  await page.evaluate(() => document.fonts.ready)
}

export async function expectNoPageOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(page.viewportSize().width)
}

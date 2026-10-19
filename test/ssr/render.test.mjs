import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { once } from "node:events"
import { setTimeout } from "node:timers/promises"
import { after, before, test } from "node:test"

let server
let output = ""
const baseUrl = "http://127.0.0.1:13714"
const article = {
  id: "ssr-article",
  title: "SSR記事",
  author: "SSR著者",
  authorId: "ssr-author",
  publishedDate: "2026/01/15",
  content: '<p>本文&nbsp;&amp;続き</p><pre><code class="language-ruby">puts 1</code></pre>',
}

before(async () => {
  server = spawn(process.execPath, ["ssr/ssr.mjs"], { stdio: ["ignore", "pipe", "pipe"] })
  server.stdout.on("data", (chunk) => {
    output += chunk
  })
  server.stderr.on("data", (chunk) => {
    output += chunk
  })
  for (let attempt = 0; attempt < 100; attempt++) {
    if (server.exitCode !== null) throw new Error(output)
    try {
      if ((await fetch(`${baseUrl}/health`)).ok) return
    } catch {}
    await setTimeout(100)
  }
  throw new Error(`SSR did not start: ${output}`)
})

after(async () => {
  if (!server || server.exitCode !== null) return
  const exited = once(server, "exit")
  server.kill("SIGTERM")
  await exited
})

async function render(component, url, props) {
  const response = await fetch(`${baseUrl}/render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ component, url, props, version: "test", encryptHistory: false, clearHistory: false }),
  })
  const result = await response.json()
  assert.equal(response.status, 200, JSON.stringify(result))
  return result
}

test("home initial HTML contains the article list and SEO metadata", async () => {
  const { head, body } = await render("home", "/", {
    articles: [article],
    pagination: { nextOffset: null },
  })
  assert.match(body, /data-server-rendered/)
  assert.match(body, /SSR記事/)
  assert.match(body, /本文/)
  assert.match(body, /href="\/articles\/ssr-article"/)
  const meta = head.join("")
  assert.match(meta, /<title[^>]*>ホーム \| 増田とその他！<\/title>/)
  assert.match(
    meta,
    /name="description" content="増田とその仲間たちが、日々の出来事や思ったことを気ままに綴る「増田とその他！」。日常のブログから、気軽に遊べるミニゲームまで。"/,
  )
  assert.match(meta, /rel="canonical" href="https:\/\/masusono.com\/"/)
})

test("article initial HTML contains content, links, styles and SEO metadata", async () => {
  const url = "/articles/ssr-article"
  // Repeat a page to catch shared server state leaking between requests.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { head, body } = await render("blog/show", url, {
      article,
      ogpImagePath: "/articles/ssr-article/ogp/test-version.png",
      relatedArticles: [{ tag: "散歩", articles: [{ id: "related-1", title: "関連する記事" }] }],
      yearAgoArticles: [{ id: "past-1", title: "1年前の同日の記事" }],
    })
    assert.ok(body.includes("本文"))
    assert.match(body, /<a[^>]+href="\/articles\/related-1"[^>]*>関連する記事<\/a>/)
    assert.match(body, /<a[^>]+href="\/articles\/past-1"[^>]*>1年前の同日の記事<\/a>/)
    assert.match(body, /data-server-rendered/)
    assert.match(body, /<a[^>]+href=/)
    assert.match(body, /data-emotion=/)
    const meta = head.join("")
    assert.doesNotMatch(meta, /Symbol\(react.fragment\)/)
    assert.match(meta, /<title/)
    assert.match(meta, /name="description"/)
    assert.match(
      meta,
      /property="og:image" content="https:\/\/masusono.com\/articles\/ssr-article\/ogp\/test-version.png"/,
    )
    assert.match(
      meta,
      /name="twitter:image" content="https:\/\/masusono.com\/articles\/ssr-article\/ogp\/test-version.png"/,
    )
    assert.match(meta, /name="twitter:card" content="summary_large_image"/)
    assert.match(meta, /property="og:image:width" content="1200"/)
    assert.match(meta, /property="og:image:height" content="630"/)
    assert.match(meta, /property="og:image:type" content="image\/png"/)
    assert.match(meta, /property="og:image:alt" content="増田とその他！：SSR記事"/)
    assert.ok(meta.includes(`href="https://masusono.com${url}"`))
    assert.ok(body.includes("puts 1"))
  }
})


test("logo preference is rendered per request without leaking between SSR pages", async () => {
  for (const enabled of [false, true, false]) {
    const { body } = await render("blog/show", "/articles/ssr-article", {
      article,
      app: { seasonalLogoEnabled: enabled },
    })
    assert.ok(body.includes(`alt="${enabled ? "増田とその他！と、私の体調" : "増田とその他！"}"`))
    assert.match(body, enabled ? /logo-autumn-health-v8/ : /logo-[^/]+\.webp/)
  }
})


test("the designated article keeps its logo with the preference off", async () => {
  for (const [url, limited] of [
    ["/articles/1cxjrah487", true],
    ["/articles/ssr-article", false],
    ["/articles/1cxjrah487?from=home#body", true],
  ]) {
    const { body } = await render("blog/show", url, {
      article: { ...article, id: url.includes("1cxjrah487") ? "1cxjrah487" : article.id },
      app: { seasonalLogoEnabled: false },
    })
    assert.ok(body.includes(`alt="${limited ? "増田とその他！と、私の体調" : "増田とその他！"}"`))
    assert.match(body, limited ? /logo-autumn-health-v8/ : /logo-[^/]+\.webp/)
  }
})

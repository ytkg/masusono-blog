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

test("article initial HTML contains content, links, styles and SEO metadata", async () => {
  const url = "/articles/ssr-article"
  // Repeat a page to catch shared server state leaking between requests.
  for (let attempt = 0; attempt < 2; attempt++) {
    const { head, body } = await render("blog/show", url, { article, relatedArticles: [{ id: "related-1", title: "関連する記事" }] })
    assert.ok(body.includes("本文"))
    assert.match(body, /<a[^>]+href="\/articles\/related-1"[^>]*>関連する記事<\/a>/)
    assert.match(body, /data-server-rendered/)
    assert.match(body, /<a[^>]+href=/)
    assert.match(body, /data-emotion=/)
    const meta = head.join("")
    assert.match(meta, /<title/)
    assert.match(meta, /name="description"/)
    assert.ok(meta.includes(`href="https://masusono.com${url}"`))
    assert.ok(body.includes("puts 1"))
  }
})

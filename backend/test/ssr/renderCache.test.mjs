import assert from "node:assert/strict"
import { test } from "node:test"
import { createCachedRenderer } from "../../app/frontend/ssr/renderCache.js"

const page = { component: "home", url: "/", version: "assets-1", props: { articles: [], flash: null } }

test("reuses identical payloads and renders changed props, URLs, components and asset versions", async () => {
  let calls = 0
  const render = createCachedRenderer(async () => ({ body: `render-${++calls}`, head: [] }))
  const original = await render(page)
  assert.deepEqual(await render(structuredClone(page)), original)
  for (const changed of [
    { ...page, url: "/authors" },
    { ...page, version: "assets-2" },
    { ...page, component: "authors/index" },
    { ...page, props: { ...page.props, articles: [{ id: "new-article" }] } },
    { ...page, props: { ...page.props, flash: { notice: "private notice" } } },
    { ...page, props: { ...page.props, errors: { title: "invalid" } } },
  ]) {
    assert.notDeepEqual(await render(changed), original)
  }
  assert.equal(calls, 7)
  assert.deepEqual(await render(page), original)
})

test("shares simultaneous identical renders without retaining failed results", async () => {
  let finish
  let calls = 0
  const render = createCachedRenderer(async () => {
    calls++
    await new Promise((resolve) => (finish = resolve))
    return { body: "rendered", head: [] }
  })
  const first = render(page)
  const second = render(structuredClone(page))
  finish()
  assert.deepEqual(await first, await second)
  assert.equal(calls, 1)

  let attempts = 0
  const failingRender = createCachedRenderer(async () => {
    if (++attempts === 1) throw new Error("SSR failure")
    return { body: "recovered", head: [] }
  })
  await assert.rejects(failingRender(page), /SSR failure/)
  assert.equal((await failingRender(page)).body, "recovered")
  assert.equal(attempts, 2)
})

test("expires results and evicts least recently used entries at the count limit", async () => {
  let time = 0
  let calls = 0
  const render = createCachedRenderer(async () => ({ body: String(++calls) }), {
    maxEntries: 2,
    ttlMs: 100,
    now: () => time,
  })
  const other = { ...page, url: "/about" }
  const original = await render(page)
  await render(other)
  assert.deepEqual(await render(page), original)
  await render({ ...page, url: "/authors" })
  assert.deepEqual(await render(page), original)
  await render(other)
  assert.equal(calls, 4)
  time = 100
  assert.notDeepEqual(await render(page), original)
  assert.equal(calls, 5)
})

test("bounds retained bytes and skips oversized results", async () => {
  let calls = 0
  const render = createCachedRenderer(async () => ({ body: String(++calls) }), { maxBytes: 12 })
  await render(page)
  await render({ ...page, url: "/about" })
  await render(page)
  assert.equal(calls, 3)

  let oversizedCalls = 0
  const oversized = createCachedRenderer(async () => ({ body: String(++oversizedCalls).repeat(100) }), {
    maxBytes: 12,
  })
  await oversized(page)
  await oversized(page)
  assert.equal(oversizedCalls, 2)
})

const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const publish = require('./publish-coverage.cjs')

for (const kind of ['ruby', 'frontend']) {
  test(`${kind}: publish line percentage and preserve existing file SHA`, async (t) => {
    process.env.COVERAGE_KIND = kind
    t.mock.method(fs, 'readFileSync', () => JSON.stringify(
      kind === 'ruby' ? { result: { line: 82.34 } } : { total: { lines: { pct: 82.34 } } },
    ))
    let update
    const github = { rest: {
      git: { getRef: async () => ({}) },
      repos: {
        getContent: async () => ({ data: { sha: 'old' } }),
        createOrUpdateFileContents: async (args) => { update = args },
      },
    } }
    await publish({ github, context: { repo: { owner: 'owner', repo: 'repo' }, sha: 'commit' } })
    assert.equal(update.sha, 'old')
    assert.equal(update.branch, 'coverage-badges')
    assert.deepEqual(JSON.parse(Buffer.from(update.content, 'base64')), {
      schemaVersion: 1, label: `${kind} coverage`, message: '82.3%', color: 'yellow',
    })
  })
}

test('create the branch and badge on first publication', async (t) => {
  process.env.COVERAGE_KIND = 'ruby'
  t.mock.method(fs, 'readFileSync', () => '{"result":{"line":100}}')
  const missing = async () => { throw Object.assign(new Error('missing'), { status: 404 }) }
  let created
  let updated
  const github = { rest: {
    git: { getRef: missing, createRef: async (args) => { created = args } },
    repos: { getContent: missing, createOrUpdateFileContents: async (args) => { updated = args } },
  } }
  await publish({ github, context: { repo: { owner: 'owner', repo: 'repo' }, sha: 'commit' } })
  assert.equal(created.sha, 'commit')
  assert.equal(created.ref, 'refs/heads/coverage-badges')
  assert.equal(updated.sha, undefined)
})

test('reject invalid coverage before calling GitHub', async (t) => {
  process.env.COVERAGE_KIND = 'ruby'
  t.mock.method(fs, 'readFileSync', () => '{"result":{"line":null}}')
  await assert.rejects(publish({ github: {}, context: {} }), /Invalid line coverage/)
})

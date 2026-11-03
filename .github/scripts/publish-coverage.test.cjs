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

for (const [percent, color] of [[0, 'orange'], [74.99, 'orange'], [75, 'yellow'], [89.99, 'yellow'], [90, 'brightgreen'], [100, 'brightgreen']]) {
  test(`badge color uses the unrounded coverage boundary at ${percent}`, async (t) => {
    process.env.COVERAGE_KIND = 'frontend'
    t.mock.method(fs, 'readFileSync', () => JSON.stringify({ total: { lines: { pct: percent } } }))
    let badge
    const github = { rest: {
      git: { getRef: async () => ({}) },
      repos: {
        getContent: async () => ({ data: { sha: 'old' } }),
        createOrUpdateFileContents: async ({ content }) => { badge = JSON.parse(Buffer.from(content, 'base64')) },
      },
    } }
    await publish({ github, context: { repo: { owner: 'owner', repo: 'repo' }, sha: 'commit' } })
    assert.equal(badge.color, color)
    assert.equal(badge.message, `${percent.toFixed(1)}%`)
  })
}

for (const percent of [-1, 101, '90']) {
  test(`reject invalid coverage ${JSON.stringify(percent)} before GitHub access`, async (t) => {
    process.env.COVERAGE_KIND = 'ruby'
    t.mock.method(fs, 'readFileSync', () => JSON.stringify({ result: { line: percent } }))
    await assert.rejects(publish({ github: {}, context: {} }), /Invalid line coverage/)
  })
}

test('reject an unknown coverage kind before reading files', async (t) => {
  process.env.COVERAGE_KIND = 'unknown'
  t.mock.method(fs, 'readFileSync', () => assert.fail('must not read a report'))
  await assert.rejects(publish({ github: {}, context: {} }), /Unknown coverage kind/)
})

for (const endpoint of ['getRef', 'getContent']) {
  test(`propagate ${endpoint} permission failures without creating or overwriting anything`, async (t) => {
    process.env.COVERAGE_KIND = 'ruby'
    t.mock.method(fs, 'readFileSync', () => '{"result":{"line":90}}')
    const error = Object.assign(new Error('forbidden'), { status: 403 })
    const fail = async () => { throw error }
    const github = { rest: {
      git: { getRef: endpoint === 'getRef' ? fail : async () => ({}), createRef: async () => assert.fail('must not create a branch') },
      repos: { getContent: fail, createOrUpdateFileContents: async () => assert.fail('must not overwrite a badge') },
    } }
    await assert.rejects(publish({ github, context: { repo: { owner: 'owner', repo: 'repo' }, sha: 'commit' } }), (caught) => caught === error)
  })
}

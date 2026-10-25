const fs = require('node:fs')

module.exports = async ({ github, context }) => {
  const kind = process.env.COVERAGE_KIND
  if (!['ruby', 'frontend'].includes(kind)) throw new Error('Unknown coverage kind')
  const report = JSON.parse(fs.readFileSync(
    kind === 'ruby' ? 'coverage/ruby/.last_run.json' : 'coverage/frontend/coverage-summary.json',
    'utf8',
  ))
  const percent = kind === 'ruby' ? report.result.line : report.total.lines.pct
  if (typeof percent !== 'number' || !Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error('Invalid line coverage percentage')
  }
  const badge = {
    schemaVersion: 1,
    label: `${kind} coverage`,
    message: `${percent.toFixed(1)}%`,
    color: percent >= 90 ? 'brightgreen' : percent >= 75 ? 'yellow' : 'orange',
  }
  const repo = context.repo
  const branch = 'coverage-badges'
  try {
    await github.rest.git.getRef({ ...repo, ref: `heads/${branch}` })
  } catch (error) {
    if (error.status !== 404) throw error
    await github.rest.git.createRef({ ...repo, ref: `refs/heads/${branch}`, sha: context.sha })
  }
  const path = `${kind}.json`
  let sha
  try {
    const { data } = await github.rest.repos.getContent({ ...repo, path, ref: branch })
    sha = data.sha
  } catch (error) {
    if (error.status !== 404) throw error
  }
  await github.rest.repos.createOrUpdateFileContents({
    ...repo, path, branch, sha,
    message: `Update ${kind} coverage for ${context.sha}`,
    content: Buffer.from(`${JSON.stringify(badge)}\n`).toString('base64'),
  })
}

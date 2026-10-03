const { test } = require('node:test');
const assert = require('node:assert/strict');
const { LABEL, isNonDeployFile, onlyNonDeployFiles, reconcileLabel, skipStaging, skipProduction } = require('./deploy-policy.cjs');

function fixture({ paths = ['backend/spec/models/example_spec.rb'], labels = [], actor = 'github-actions[bot]', action = 'synchronize', commits = ['merge'], associated = true } = {}) {
  const calls = [];
  const pr = { number: 1, state: 'open', labels: labels.map((name) => ({ name })), changed_files: paths.length,
    merged_at: '2026-10-03', merge_commit_sha: 'merge', base: { ref: 'main', repo: { full_name: 'owner/repo' } } };
  const files = paths.map((filename) => ({ filename }));
  const github = { rest: {
    pulls: { get: async () => ({ data: pr }), listFiles: 'files' },
    issues: { listEvents: 'events', getLabel: async () => ({}),
      createLabel: async (p) => calls.push(['create', p]),
      addLabels: async (p) => calls.push(['add', p]), removeLabel: async (p) => calls.push(['remove', p]) },
    repos: { listPullRequestsAssociatedWithCommit: 'prs', compareCommitsWithBasehead: async () => ({ data: {
      status: 'ahead', total_commits: commits.length, commits: commits.map((sha) => ({ sha })) } }) },
  }, paginate: async (method, params) => {
    if (method === 'files') return files;
    if (method === 'events') return [{ event: 'labeled', label: { name: LABEL }, actor: {
      login: actor, type: actor === 'github-actions[bot]' ? 'Bot' : 'User' } }];
    return associated && params.commit_sha !== 'direct' ? [pr] : [];
  } };
  const context = { repo: { owner: 'owner', repo: 'repo' }, sha: 'merge', ref: 'refs/heads/main',
    payload: { before: 'before', action, pull_request: { number: 1 } } };
  const core = { info: () => {}, warning: (message) => calls.push(['warning', message]) };
  return { github, context, core, calls, pr, files };
}

test('tests/docs are allowed; application, shared config, dependencies and published Markdown deploy', () => {
  for (const path of ['.github/scripts/deploy-policy.test.cjs', 'backend/app/frontend/README.md', 'README.md', 'backend/AGENTS.md', 'docs/diagram.png', 'backend/docs/a.md',
    'backend/spec/support/helper.rb', 'backend/test/visual/baselines/a.png', 'backend/.rspec',
    'backend/playwright.config.js', 'backend/app/frontend/a.test.jsx', 'backend/app/frontend/a.spec.ts',
    'backend/app/frontend/test/setup.js', 'scripts/test_visual_gate.py']) assert.equal(isNonDeployFile(path), true, path);
  for (const path of ['backend/app/models/a.rb', 'backend/app/frontend/a.jsx', 'backend/app/content.md',
    'backend/public/readme.md', 'backend/storage/a.md', 'backend/vite.config.ts', 'backend/package-lock.json',
    'backend/Gemfile', '.github/workflows/test.yml', 'backend/config/a.yml']) assert.equal(isNonDeployFile(path), false, path);
});

test('empty/truncated lists and renames from app files cannot skip deployment', () => {
  assert.equal(onlyNonDeployFiles([], 0), false);
  assert.equal(onlyNonDeployFiles([{ filename: 'README.md' }], 2), false);
  assert.equal(onlyNonDeployFiles([{ filename: 'README.md', previous_filename: 'backend/app/a.rb' }], 1), false);
  assert.equal(onlyNonDeployFiles([{ filename: 'README.md', previous_filename: 'docs/old.md' }], 1), true);
});

test('automatically labels mixed tests/docs and creates missing repository label', async () => {
  const f = fixture({ paths: ['README.md', 'backend/spec/a.rb'] });
  f.github.rest.issues.getLabel = async () => { if (!f.calls.length) throw { status: 404 }; };
  await reconcileLabel(f);
  assert.deepEqual(f.calls.map(([name]) => name), ['create', 'add']);
});

test('removes only automatic labels after runtime changes, preserving manual labels', async () => {
  for (const actor of ['github-actions[bot]', 'maintainer']) {
    const f = fixture({ paths: ['backend/app/a.rb'], labels: [LABEL], actor });
    await reconcileLabel(f);
    assert.deepEqual(f.calls.map(([name]) => name), actor === 'maintainer' ? [] : ['remove']);
  }
});

test('no changes for runtime-only, already labeled or closed PRs', async () => {
  for (const f of [fixture({ paths: ['backend/app/a.rb'] }), fixture({ labels: [LABEL] }), fixture()]) {
    if (!f.pr.labels.length && f.files[0].filename.includes('spec')) f.pr.state = 'closed';
    await reconcileLabel(f);
    assert.deepEqual(f.calls, []);
  }
});

test('staging handles manual labels, automatic add/remove races and human unlabel', async () => {
  const staging = 'ステージングデプロイ';
  assert.equal(await skipStaging(fixture({ paths: ['backend/app/a.rb'], labels: [staging, LABEL], actor: 'maintainer' })), true);
  assert.equal(await skipStaging(fixture({ labels: [staging] })), true);
  assert.equal(await skipStaging(fixture({ paths: ['backend/app/a.rb'], labels: [staging, LABEL] })), false);
  assert.equal(await skipStaging(fixture({ labels: [staging], action: 'unlabeled' })), false);
  assert.equal(await skipStaging(fixture({ paths: ['backend/app/a.rb'], labels: [] })), true);
});

test('production skips a labeled merge or tests/docs merged before labeler completes', async () => {
  assert.equal(await skipProduction(fixture({ paths: ['backend/app/a.rb'], labels: [LABEL], actor: 'maintainer' })), true);
  assert.equal(await skipProduction(fixture()), true);
  assert.equal(await skipProduction(fixture({ paths: ['backend/app/a.rb'], labels: [LABEL] })), false);
  assert.equal(await skipProduction(fixture({ paths: ['backend/app/a.rb'] })), false);
});

test('production deploys direct/mixed pushes, old associated PRs, truncated pushes and API failures', async () => {
  const direct = fixture({ associated: false });
  const mixed = fixture({ commits: ['direct', 'merge'] });
  const old = fixture(); old.pr.merge_commit_sha = 'old-merge';
  const truncated = fixture(); truncated.github.rest.repos.compareCommitsWithBasehead = async () => ({ data: {
    status: 'ahead', total_commits: 101, commits: [{ sha: 'merge' }] } });
  const unavailable = fixture(); unavailable.github.paginate = async () => { throw { status: 403 }; };
  const forced = fixture(); forced.context.payload.forced = true;
  for (const f of [direct, mixed, old, truncated, unavailable, forced]) assert.equal(await skipProduction(f), false);
  assert.equal(unavailable.calls[0][0], 'warning');
});


test('production paginates commits and requires every merged PR to qualify', async () => {
  const f = fixture();
  let pages = 0;
  f.github.rest.repos.compareCommitsWithBasehead = async ({ page = 1 }) => {
    pages++;
    return { data: { status: 'ahead', total_commits: 2,
      commits: [{ sha: page === 1 ? 'branch-commit' : 'merge' }] } };
  };
  assert.equal(await skipProduction(f), true);
  assert.equal(pages, 2);
  f.pr.base.ref = 'other';
  assert.equal(await skipProduction(f), false);
});

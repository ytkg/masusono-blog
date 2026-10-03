const LABEL = 'デプロイなし';

function isNonDeployFile(path) {
  if (['backend/app/frontend/README.md', '.github/scripts/deploy-policy.test.cjs'].includes(path)) return true;
  // Published assets/content must never be classified by extension alone.
  if (/^backend\/(public|app|storage)\//.test(path)) {
    return /^backend\/app\/frontend\/(.*\.(test|spec)\.(js|jsx|ts|tsx)|test\/.*)$/.test(path);
  }
  return /^backend\/(spec|test\/visual)\//.test(path) ||
    ['backend/.rspec', 'backend/playwright.config.js', 'scripts/test_visual_gate.py'].includes(path) ||
    /^(docs|backend\/docs)\//.test(path) || /\.md$/i.test(path);
}

function onlyNonDeployFiles(files, expectedCount) {
  return files.length > 0 && files.length === expectedCount && files.every((file) =>
    isNonDeployFile(file.filename) && (!file.previous_filename || isNonDeployFile(file.previous_filename)));
}

async function pullRequestPolicy({ github, context, number }) {
  const repo = context.repo;
  const { data: pr } = await github.rest.pulls.get({ ...repo, pull_number: number });
  const labeled = pr.labels.some((label) => label.name === LABEL);
  const events = labeled ? await github.paginate(github.rest.issues.listEvents, {
    ...repo, issue_number: number, per_page: 100,
  }) : [];
  const addition = events.filter((event) => event.event === 'labeled' && event.label?.name === LABEL).at(-1);
  const automatic = addition?.actor?.login === 'github-actions[bot]' && addition.actor.type === 'Bot';
  const files = await github.paginate(github.rest.pulls.listFiles, {
    ...repo, pull_number: number, per_page: 100,
  });
  return { pr, labeled, automatic, nonDeploy: onlyNonDeployFiles(files, pr.changed_files) };
}

async function reconcileLabel({ github, context, core }) {
  const number = context.payload.pull_request.number;
  const policy = await pullRequestPolicy({ github, context, number });
  if (policy.pr.state !== 'open') return;
  const params = { ...context.repo, issue_number: number };
  if (policy.nonDeploy && !policy.labeled) {
    try {
      await github.rest.issues.getLabel({ ...context.repo, name: LABEL });
    } catch (error) {
      if (error.status !== 404) throw error;
      try {
        await github.rest.issues.createLabel({ ...context.repo, name: LABEL, color: 'd4c5f9',
          description: '本番・ステージングのデプロイをスキップ（CIは実行）' });
      } catch (creationError) {
        // A concurrent PR may have created the same repository label.
        if (creationError.status !== 422) throw creationError;
        await github.rest.issues.getLabel({ ...context.repo, name: LABEL });
      }
    }
    await github.rest.issues.addLabels({ ...params, labels: [LABEL] });
    core.info(`Added ${LABEL}: tests/documentation only.`);
  } else if (!policy.nonDeploy && policy.labeled && policy.automatic) {
    await github.rest.issues.removeLabel({ ...params, name: LABEL });
    core.info(`Removed automatic ${LABEL}: deployable files changed.`);
  }
}

async function skipStaging({ github, context }) {
  const policy = await pullRequestPolicy({ github, context, number: context.payload.pull_request.number });
  if (!policy.pr.labels.some((label) => label.name === 'ステージングデプロイ')) return true;
  // Read the same policy as the labeler, avoiding races on synchronize. A human
  // label removal takes effect immediately; it is reconsidered on the next push.
  const update = ['opened', 'reopened', 'synchronize'].includes(context.payload.action);
  if (policy.labeled && !policy.automatic) return true;
  return update ? policy.nonDeploy : policy.labeled;
}

async function skipProduction({ github, context, core }) {
  try {
    const before = context.payload.before;
    if (!before || /^0+$/.test(before) || context.payload.forced) return false;
    const { data: comparison } = await github.rest.repos.compareCommitsWithBasehead({
      ...context.repo, basehead: `${before}...${context.sha}`, per_page: 100,
    });
    if (comparison.status !== 'ahead' || !comparison.commits.length) return false;
    const shas = new Set(comparison.commits.map((commit) => commit.sha));
    for (let page = 2; shas.size < comparison.total_commits; page++) {
      const { data } = await github.rest.repos.compareCommitsWithBasehead({
        ...context.repo, basehead: `${before}...${context.sha}`, per_page: 100, page,
      });
      const previousSize = shas.size;
      for (const commit of data.commits) shas.add(commit.sha);
      // Do not overlook commits if pagination is incomplete or inconsistent.
      if (shas.size === previousSize) return false;
    }
    if (shas.size !== comparison.total_commits) return false;
    const policies = new Map();
    for (const sha of shas) {
      const prs = await github.paginate(github.rest.repos.listPullRequestsAssociatedWithCommit, {
        ...context.repo, commit_sha: sha, per_page: 100,
      });
      let covered = false;
      for (const pr of prs) {
        if (!pr.merged_at || pr.base.ref !== context.ref.replace('refs/heads/', '') ||
            pr.base.repo.full_name !== `${context.repo.owner}/${context.repo.repo}` ||
            !shas.has(pr.merge_commit_sha)) continue;
        if (!policies.has(pr.number)) policies.set(pr.number,
          await pullRequestPolicy({ github, context, number: pr.number }));
        const policy = policies.get(pr.number);
        // Also handles a merge occurring before the automatic labeler finishes.
        if ((policy.labeled && !policy.automatic) || policy.nonDeploy) covered = true;
      }
      if (!covered) return false;
    }
    return true;
  } catch (error) {
    core.warning(`Could not confirm deployment skip; deploying normally (${error.status || 'API error'}).`);
    return false;
  }
}

module.exports = { LABEL, isNonDeployFile, onlyNonDeployFiles, pullRequestPolicy, reconcileLabel, skipStaging, skipProduction };

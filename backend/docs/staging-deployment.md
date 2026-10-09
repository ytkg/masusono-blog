# PR のステージングデプロイ手順

ステージングは、同一リポジトリの PR に `ステージングデプロイ` ラベルを付けて実行する。
GitHub Actions の `deploy-pr-cloud-run` が CI、イメージのビルド・公開、Cloud Run への反映を行い、
URL と対象コミットを PR にコメントする。ラベルが付いた状態で push すると自動で再デプロイされる。

デプロイの明示依頼を受け、対象 PR と反映するコミットを確認してから実行する。
ラベルによるデプロイとその確認にはローカル worktree・Docker 環境・GCP 認証情報の準備は不要。
コードの追加変更やローカル検証が必要な場合だけ、PR ブランチから worktree を作り直す。

## 1. 対象 PR を確認する

以下はリポジトリルート以外でも実行できる。`PR_NUMBER` は依頼された PR 番号に置き換える。

```bash
PR_NUMBER=550
REPO=ytkg/masusono-blog
gh pr view "$PR_NUMBER" --repo "$REPO" --json url,state,isCrossRepository,headRefName,headRefOid,labels
PR_BRANCH=$(gh pr view "$PR_NUMBER" --repo "$REPO" --json headRefName --jq .headRefName)
PR_SHA=$(gh pr view "$PR_NUMBER" --repo "$REPO" --json headRefOid --jq .headRefOid)
```

PR が open で同一リポジトリのブランチであること、対象の変更が push 済みであることを確認する。
`デプロイなし` ラベルがあるとステージングもスキップされる。付与理由と今回の依頼を確認し、
デプロイを実施する場合は対象 PR の同ラベルを外す。

```bash
gh pr edit "$PR_NUMBER" --repo "$REPO" --remove-label 'デプロイなし'
```

## 2. デプロイを開始する

GitHub コネクターが利用できる場合は、対象 PR に `ステージングデプロイ` ラベルを追加する機能を使う。
CLI では次を実行する。

```bash
gh pr edit "$PR_NUMBER" --repo "$REPO" --add-label 'ステージングデプロイ'
```

すでにラベルがある場合は、まず現在のコミットの実行状態を確認する。
実行中ならその完了を待ち、成功済みなら既存 URL を確認する。ラベルの付け直しによる重複実行は不要。
追加変更は worktree 内の `scripts/push.sh` で push すれば再デプロイされる。

## 3. 現在のコミットの workflow を確認する

```bash
gh run list --repo "$REPO" --workflow deploy-pr-cloud-run.yml \
  --branch "$PR_BRANCH" --commit "$PR_SHA" --limit 10 \
  --json databaseId,status,conclusion,url
```

実行が一覧に現れるまで少し時間がかかる場合がある。対象コミットの最新の `databaseId` を使う。
GitHub コネクターでは、対象コミットの workflow 一覧と各ジョブのステップを確認する。

```bash
RUN_ID=37832330607 # 一覧で確認した databaseId に置き換える
gh run watch "$RUN_ID" --repo "$REPO" --exit-status
gh pr checks "$PR_NUMBER" --repo "$REPO"
```

workflow は CI → イメージのビルド・公開 → `backend/deploy.sh` → PR コメント更新の順に進む。
サービス反映後もキャッシュ保存などの後処理が続くことがある。
失敗時は `gh run view "$RUN_ID" --repo "$REPO" --log-failed` で失敗箇所を確認する。
現在のコミットの失敗を再試行する場合は `gh run rerun "$RUN_ID" --repo "$REPO" --failed` を使う。

## 4. URL と反映内容を確認する

```bash
gh pr view "$PR_NUMBER" --repo "$REPO" --comments
```

`github-actions[bot]` の `Cloud Run ステージング` コメント（`<!-- cloud-run-staging -->`）で、
コミットが現在の `headRefOid` と一致することを確認し、記載された URL を開く。
既存コメントは再デプロイ時に更新されるため、古いコミットの URL 表示だけで完了と判断しない。
依頼された画面・機能を確認し、URL と検証結果を報告する。URL は推測せずコメントから取得する。
待機中に追加 push があった場合は、PR のブランチ・コミットを取得し直して最新の実行を確認する。

## 環境と後片付け

- 対象は GCP プロジェクト `masusono`、リージョン `asia-northeast1`。
- ステージングサービス名は `masusono-<正規化したPRブランチ名>`。
  例: `codex/calendar-tab` → `masusono-codex-calendar-tab`。長い名前にはハッシュが付く。
- PR のマージまたはブランチ削除時に、対応するサービスとイメージが自動削除される。
  ローカル worktree の削除はステージングサービスを削除しない。
- ラベルを外すだけでは既存のステージングサービスは削除されない。

実装の確認が必要な場合の参照先:

- [デプロイ workflow](../../.github/workflows/deploy-pr-cloud-run.yml)
- [デプロイ判定](../../.github/scripts/deploy-policy.cjs)
- [デプロイスクリプト](../deploy.sh)
- [ステージング削除 workflow](../../.github/workflows/cleanup-pr-cloud-run.yml)
- [デプロイの全体像](../README.md#cloud-run-へのデプロイ)

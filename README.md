# masusono-blog

masusono.com のブログとミニアプリを提供する Rails アプリケーションです。バックエンドは Rails、画面は Inertia + React/Vite で構成されています。

## はじめに

開発は `backend/` で Docker Compose を使います。

```bash
cd backend
docker compose up --build
```

- Rails: http://localhost:3000
- Vite: http://localhost:3036

よく使う検証コマンドです。リポジトリルートからは、Compose 定義を
`backend/compose.yml` として明示します。

```bash
docker compose -f backend/compose.yml run --rm backend bundle exec rspec
docker compose -f backend/compose.yml run --rm backend bundle exec rubocop
docker compose -f backend/compose.yml run --rm backend npm run lint
docker compose -f backend/compose.yml run --rm backend npm run format:check
docker compose -f backend/compose.yml run --rm backend npm test
```

`backend/` に移動して実行する場合は、従来どおり `docker compose` だけで同じコマンドを実行できます。
Git worktree で作業中は、ポートとボリュームを分離するため、上記の代わりに
`.codex/skills/masusono-worktree/scripts/compose.sh run --rm backend ...` を使います。

アプリの構成、microCMS・BigQueryの運用、API、ユーザーコンテンツID移行は [backend/README.md](backend/README.md) を参照してください。

## デプロイ

`main` への push（PRマージを含む）で GitHub Actions が Cloud Run の本番サービス `masusono` へデプロイします。リポジトリ内のPRは、`ステージングデプロイ` ラベルを付けると専用の Cloud Run ステージング環境へデプロイされ、URLがPRにコメントされます。ラベルが付いたまま更新すると再デプロイします。PRのマージまたはブランチ削除時に、対応するステージングサービスとイメージを削除します。

`デプロイなし` ラベルを付けると、本番・ステージングのビルド、イメージ公開、デプロイをスキップします。CI（テスト・静的解析）は通常どおり実行します。`ステージングデプロイ` と両方付いている場合もスキップし、`デプロイなし` を外すとステージングをデプロイします。既存ステージング環境のマージ・ブランチ削除時の後片付けは継続します。

PRの作成・再オープン・コミット更新時に、次のファイルだけの変更なら `デプロイなし` を自動付与します（テストとドキュメントの混在も対象）。

- `backend/spec/**`、`backend/test/visual/**`、`backend/app/frontend/test/**`
- フロントエンドの `*.test.{js,jsx,ts,tsx}` / `*.spec.{js,jsx,ts,tsx}`
- `backend/.rspec`、`backend/playwright.config.js`、`scripts/test_visual_gate.py`、`.github/scripts/deploy-policy.test.cjs`
- `.md` ファイル、`docs/**`、`backend/docs/**`（`backend/app/**`、`backend/public/**`、`backend/storage/**` の配信・アプリ用ファイルを除く。ただし `backend/app/frontend/README.md` は対象）

本体コード・共用設定・依存関係などが追加されたら、自動付与したラベルだけを外します。GitHubのラベル履歴の最後の付与者で判定し、手動付与分は保持します。自動付与分を手動管理に切り替える場合は、一度外してから付け直してください。手動で外した場合も、次のコミット更新時には変更内容から再判定します。リネームは変更前と変更後の両パスを確認します。

本番ではpushに含まれる全コミットの対応PRを確認します。直接push・未対応のコミットが混在する場合、コミットやファイル一覧の取得漏れ・APIエラーなどでスキップを確認できない場合は、通常どおりデプロイします。自動ラベル処理より先にマージされた場合も、対応PRの変更内容からテスト・ドキュメントのみかを判定します。

自動ラベル処理は `pull_request_target` でベースブランチのスクリプトだけを実行し、PR内のコードは実行しません。デプロイ判定のテストは `node --test .github/scripts/deploy-policy.test.cjs` で実行できます。

Cloud Run・Artifact Registry・GitHub Actions の詳細は [backend/README.md](backend/README.md) を参照してください。

## 開発時の注意

変更作業は Git worktree で分離します。具体的な手順と検証・外部サービス操作のルールは [AGENTS.md](AGENTS.md) を参照してください。

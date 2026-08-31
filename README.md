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

`main` への push（PRマージを含む）で GitHub Actions が Cloud Run の本番サービス `masusono` へデプロイします。リポジトリ内のPRは、更新のたびに専用の Cloud Run ステージング環境へデプロイされ、URLがPRにコメントされます。PRのマージまたはブランチ削除時に、対応するステージングサービスとイメージを削除します。

Cloud Run・Artifact Registry・GitHub Actions の詳細は [backend/README.md](backend/README.md) を参照してください。

## 開発時の注意

変更作業は Git worktree で分離します。具体的な手順と検証・外部サービス操作のルールは [AGENTS.md](AGENTS.md) を参照してください。

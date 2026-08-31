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

よく使う検証コマンドです。

```bash
cd backend
docker compose run --rm backend bundle exec rspec
docker compose run --rm backend bundle exec rubocop
docker compose run --rm backend npm run lint
docker compose run --rm backend npm run format:check
```

アプリの構成、microCMS・BigQueryの運用、API、ユーザーコンテンツID移行は [backend/README.md](backend/README.md) を参照してください。

## デプロイ

`main` への push（PRマージを含む）で GitHub Actions が Cloud Run の本番サービス `masusono` へデプロイします。リポジトリ内のPRは、更新のたびに専用の Cloud Run ステージング環境へデプロイされ、URLがPRにコメントされます。PRのマージまたはブランチ削除時に、対応するステージングサービスとイメージを削除します。

Cloud Run・Artifact Registry・GitHub Actions の詳細は [backend/README.md](backend/README.md) を参照してください。

## 開発時の注意

変更作業は Git worktree で分離します。具体的な手順と検証・外部サービス操作のルールは [AGENTS.md](AGENTS.md) を参照してください。

# masusono-blog contributor guide

このリポジトリの本体は `backend/` の Rails 8.1 / Ruby 4.0.1 アプリケーションです。画面は Inertia + React/Vite、外部コンテンツは microCMS、デプロイ先は Cloud Run です。

## 作業ツリー

コード・設定・ドキュメントを変更する作業は、必ず worktree で行います。作業開始前に `.codex/skills/masusono-worktree/SKILL.md` を読み、次で作成します。

```bash
.codex/skills/masusono-worktree/scripts/create-worktree.sh <task-slug> [base-ref]
```

作成後は worktree ルートで、Docker Compose のラッパーを使います。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh up --build
```

`main` で直接変更せず、未追跡ファイルや他の worktree の変更にも触れません。マージ済みで clean な worktree は、ユーザーの承認後にだけ削除します。

## 実装と検証

- バックエンド固有の実装・テスト規約は [backend/AGENTS.md](backend/AGENTS.md) に従う。
- 秘密情報、Rails master key、microCMS APIキー、Google Cloud認証情報を表示・コミットしない。
- Rubyは `.ruby-version` のバージョンを使う。Docker Compose を優先し、ホストで実行する場合は `rbenv exec` を使う。
- 変更範囲に応じたテストと静的解析を実行し、未実施の検証は理由とともに報告する。

リポジトリルートから通常の Docker Compose 検証を実行する場合は、Compose 定義を明示する。

```bash
docker compose -f backend/compose.yml run --rm backend bundle exec rspec
docker compose -f backend/compose.yml run --rm backend bundle exec rubocop
docker compose -f backend/compose.yml run --rm backend npm run lint
docker compose -f backend/compose.yml run --rm backend npm run format:check
docker compose -f backend/compose.yml run --rm backend npm test
```

`backend/` で実行する通常の開発手順では `docker compose` だけでよい。一方、管理対象の
worktree ではポート・ボリュームを分離するため、必ず
`.codex/skills/masusono-worktree/scripts/compose.sh` を使う。

## 外部サービス

Cloud Run デプロイ、microCMS更新・削除、BigQuery書き込み、GCPのIAM・ストレージ操作は外部状態を変更します。ユーザーから明示依頼を受け、対象と影響範囲を確認してから実行します。

---
name: masusono-worktree
description: Masusono Blog の変更タスクを Git worktree で分離し、Docker Compose 開発環境をタスク単位のポート・ボリュームで起動する。masusono-blog で実装、修正、機能追加、PR 作成、スタック PR に着手するときに使う。読み取りだけの調査・説明には使わない。
---

# Masusono Worktree

変更を安全に並行作業できる Git worktree で始め、各 worktree の Docker Compose 環境を独立させる。

## 適用判断

- コード、設定、ドキュメントなどを変更するタスクでは必ず使う。
- 読み取りだけの調査、レビュー、説明、状態確認では worktree を作らない。
- 明確に未マージの依存タスクがある場合は、そのブランチを親にしたスタックを選んでよい。選んだ理由と親ブランチをユーザーへ報告する。

## 作業開始

1. 既存のメイン worktree から、タスク内容を表す小文字の kebab-case スラッグを決める。
2. ユーザー指定のベースがなければ `origin/main` を使う。スクリプトは `origin/main` を fetch してから worktree を作る。
3. 次を実行する。

```bash
.codex/skills/masusono-worktree/scripts/create-worktree.sh <task-slug> [base-ref]
```

これにより `.worktrees/<task-slug>` と `codex/<task-slug>` ブランチを作成し、Docker 用の未追跡 `.env.worktree` に固定ポートと `COMPOSE_PROJECT_NAME` を書き込む。以後の編集、テスト、コミット、PR 作成はこの worktree で行う。

開始時は worktree のパス、ブランチ、ベース参照をユーザーに短く伝える。

## Docker Compose

worktree のルートで以下を使う。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh up --build
```

`compose.sh` は `.env.worktree` を読み込むため、別 worktree とホストポート・Compose プロジェクト名・名前付きボリュームが衝突しない。通常の `docker compose` を使う必要がある場合も、先に `.env.worktree` を読み込んで同じ環境変数を渡す。

## 完了後

- worktree やブランチは自動削除しない。
- PR がマージ済みで worktree が clean な場合、不要なら削除をユーザーへ提案する。
- ユーザーが削除を承認した場合のみ、対象の worktree とブランチを確認してから削除する。

## ガードレール

- 既存の worktree、ブランチ、`.env.worktree` を上書きしない。
- メイン worktree に未コミット変更があっても、それを変更・整理せず、独立した worktree で進める。
- デプロイ、PR マージ、push、外部サービスの変更は、通常どおりその操作の権限・承認を確認する。

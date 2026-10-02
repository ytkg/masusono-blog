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

### 新規 node_modules ボリュームの権限エラー

新規 worktree の `npm ci` が `/rails/node_modules` の `EACCES` で失敗した場合は、依存未準備による Vite manifest エラーとアプリのテスト失敗を区別する。以下は worktree ルートで実行する。

1. この worktree の vite が起動中なら `compose.sh stop vite` で止め、インストールを重ねない。以下の `compose.sh` は `.codex/skills/masusono-worktree/scripts/compose.sh` を指す。
2. `compose.sh config --format json` の出力から、vite の `/rails/node_modules` が `type: volume` の `node_modules_cache` であり、トップレベルの同ボリュームの `name` が `.env.worktree` の `COMPOSE_PROJECT_NAME` に対応する専用名であることを確認する。設定全体には環境変数が含まれるため表示せず、このマウントとボリューム名だけを抽出する。bind mount・external volume・別プロジェクトのボリュームなら、この手順で変更しない。
3. 実行ユーザーとディレクトリ所有者を確認する。

   ```bash
   .codex/skills/masusono-worktree/scripts/compose.sh run --rm --no-deps vite sh -c 'id; stat -c "%u:%g %a %n" /rails/node_modules'
   ```

4. 新規の専用ボリュームのルートが root 所有で、vite の実行ユーザーが現行設定の `1000:1000` と確認できた場合だけ、マウント先のディレクトリ自身の所有者を合わせる。

   ```bash
   .codex/skills/masusono-worktree/scripts/compose.sh run --rm --no-deps --user root vite chown 1000:1000 /rails/node_modules
   .codex/skills/masusono-worktree/scripts/compose.sh run --rm --no-deps vite npm ci --no-audit --no-fund
   ```

   再帰的な chown、ホストの `backend/` や他のボリュームの権限変更、ボリューム削除は行わない。実行ユーザーが異なる、または再実行でも失敗する場合は原因を調査し、権限変更の範囲を広げない。
5. 成功後に `compose.sh up --build -d` と `compose.sh logs vite` で Vite の起動を確認し、依存定義・lockfile の意図しない差分がないことを確認してから検証を再実行する。終了時は下記の `down` を使う。

## 完了後

ユーザーが起動継続を指定した場合を除き、この作業の Compose 環境を終了する。
worktree のルートで以下を実行する。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh down
```

- `stop` だけではコンテナとネットワークが残り、タスクごとのネットワークがアドレスプールを消費し続ける。
- `down` は対象プロジェクトのコンテナとネットワークを削除する。`-v` は付けず、名前付きボリュームのキャッシュを保持する。
- 他の worktree の環境は停止・削除しない。

### Docker のアドレスプール

多数の worktree を使う端末では、Docker Engine の `default-address-pools` を `/24` 単位にする。
Docker Desktop では Settings の Docker Engine にある既存 JSON に設定を追加し、再起動して反映する。
例えば LAN・VPN・既存 Docker ネットワークと重複しないことを確認できた場合は以下を使える。

```json
{
  "default-address-pools": [
    { "base": "10.240.0.0/16", "size": 24 }
  ]
}
```

この例では `/24` のネットワークを256個割り当てられる。既存ネットワークのサブネットは変わらず、新規作成分に適用される。
設定前に既存 JSON をバックアップし、他の設定を保持する。再起動は稼働中のコンテナに影響するため、稼働状態を記録して復帰を確認する。
未使用ネットワークの一括整理には `docker network prune` を使えるが、他のプロジェクトにも及ぶため、ユーザーから整理の依頼を受けた場合のみ実行する。
停止済みコンテナが参照するネットワークは prune では消えないので、対象プロジェクトで `down` する。

### worktree の保持

- worktree やブランチは自動削除しない。
- PR がマージ済みで worktree が clean な場合、不要なら削除をユーザーへ提案する。
- ユーザーが削除を承認した場合のみ、対象の worktree とブランチを確認してから削除する。

## ガードレール

- 既存の worktree、ブランチ、`.env.worktree` を上書きしない。
- メイン worktree に未コミット変更があっても、それを変更・整理せず、独立した worktree で進める。
- デプロイ、PR マージ、push、外部サービスの変更は、通常どおりその操作の権限・承認を確認する。

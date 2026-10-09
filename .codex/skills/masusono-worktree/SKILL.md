---
name: masusono-worktree
description: Masusono Blog の変更タスクを専用 Git worktree と Docker Compose 環境で分離し、PR 作成後の片付けと追加作業時の再作成を行う。masusono-blog の実装、修正、機能追加、PR 作成、スタック PR、作業環境の削除依頼で使う。読み取りだけの調査・説明には使わない。
---

# Masusono Worktree

変更を安全に並行作業できる Git worktree で始め、各 worktree の Docker Compose 環境を独立させる。

## 適用判断

- コード、設定、ドキュメントなどを変更するタスクでは必ず使う。
- 不要な作業環境の削除依頼では、下記の削除手順を使う。削除だけなら新しい worktree は作らない。
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

### node_modules ボリュームの初期化と権限エラー

`compose.sh up` や `compose.sh run --rm vite npm ci --no-audit --no-fund` は、
`node_modules_init` の正常終了後に backend / vite を起動する。初期化サービスは
このプロジェクトの `node_modules_cache` だけをマウントし、ボリュームのルートを
vite の実行ユーザー `1000:1000` に合わせる。通常は手動修復が不要。
新規環境で `run --no-deps` を使う場合は、先に
`compose.sh run --rm --no-deps node_modules_init` を実行する。
初期化は再帰的に所有者を変更しないため、既存ファイルの権限エラーは別途調査する。

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

ユーザーが作業環境の保持または起動継続を指定した場合を除き、PR 作成後にこの作業の環境を片付ける。マージや追加の削除指示を待たない。変更がリモートに保存されていることを確認し、下記の削除手順を使う。PR 作成前に作業を終了する場合も、起動した Compose 環境は停止する。
worktree のルートで以下を実行する。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh down
```

- `stop` だけではコンテナとネットワークが残り、タスクごとのネットワークがアドレスプールを消費し続ける。
- `down` でコンテナとネットワークを削除する。`-v` は付けず、下記の手順で所有プロジェクトと未使用を確認した専用ボリュームを対象名で削除する。PR 作成前の作業終了では worktree・ブランチ・ボリュームを保持する。
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

### PR 作成後の片付けと再作成

- PR 作成後は、push 済みで未保存の作業がない worktree・ローカルブランチ・専用ボリューム・再生成可能なDBを削除する。追加の承認は不要。保持または起動継続を指定された環境は残す。
- GitHub の PR とリモートブランチは削除しない。CI 結果は worktree の削除後も確認し、PR のリンクと先端コミットを作業記録に残す。
- 追加作業やローカル検証が必要になったら、PR のリモートブランチを fetch し、その参照を `create-worktree.sh` のベースに指定して作り直す。元の task-slug を再利用する場合は、対応する worktree とローカルブランチが削除済みであることを確認する。push 先は元の PR ブランチにする。

### 不要な作業環境の削除

PR 作成後の片付けと、ユーザーから不要な作業環境の削除を依頼された場合に使う。作業履歴から対象を特定し、他の作業環境には範囲を広げない。同じ対象の削除を重ねて確認しない。

- worktree のブランチと先端を確認し、リモートブランチを fetch して先端コミットが保存されていること、および PR がそのブランチを参照していることを確認する。未マージでも削除してよい。マージ済みの場合は最新のベースブランチへの反映も確認する。追跡ファイルの変更と未追跡ファイルが残る worktree は削除対象から外す。
- 無視ファイルも確認する。この作業で生成した再生成可能な開発/テスト用SQLite、ビルド出力、ログ、依存キャッシュは worktree とともに削除し、不要なDBの退避コピーは作らない。必要な独自データや用途不明のファイルがあれば保全し、その箇所だけユーザーに確認する。既存の退避コピーも、不要で削除依頼の対象と確認できたものは削除する。
- worktree を削除する前に、その環境の Compose ラッパーで `down` を実行する。設定全体には秘密情報が含まれるため表示せず、専用ボリュームの名前と所有プロジェクトだけ確認する。
- 専用ボリュームは Compose 設定と Docker の `com.docker.compose.project` / `com.docker.compose.volume` ラベルで対象を確認する。external・共有ボリュームと別プロジェクトのものは除外する。`down` 後に参照するコンテナがないことを確認し、対象名を明示した `docker volume rm <確認済みのボリューム名>` で削除する。worktree が削除済みなら、作業履歴のプロジェクト名と Docker ラベルから確認する。全体の `volume prune` や `system prune` は使わない。
- `git worktree remove <確認済みのパス>` と `git branch -d <確認済みのローカルブランチ>` で削除する。Git が削除を拒否した場合は原因を確認し、未保存の変更を強制削除しない。
- 対象の worktree・ブランチ・コンテナ・ネットワーク・ボリュームの残存がないことを確認し、削除結果と保全したものがあれば報告する。

## ガードレール

- 既存の worktree、ブランチ、`.env.worktree` を上書きしない。
- メイン worktree に未コミット変更があっても、それを変更・整理せず、独立した worktree で進める。
- デプロイ、PR マージ、push、外部サービスの変更は、通常どおりその操作の権限・承認を確認する。

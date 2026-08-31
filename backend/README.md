# masusono-blog バックエンド

masusono-blog の Rails アプリケーションです。公開ページは Inertia + React/Vite で提供し、一部の機能を JSON API、RSS、サイトマップとして提供します。

## ローカル開発

以下はすべて `backend/` で実行します。

```bash
docker compose up --build
```

初回は Vite の依存関係インストールに少し時間がかかります。Rails は `http://localhost:3000`、Vite は `http://localhost:3036` で起動します。

Dockerを使わない場合は、Rails と Vite を別々に起動します。

```bash
cd backend
bin/dev
```

別ターミナルで:

```bash
cd backend
npm run dev
```

`bin/dev` は Rails サーバーのみを起動するため、画面確認では `npm run dev` も必要です。Ruby/Bundler は `rbenv` 経由で実行してください。

## エンドポイント

- `GET /api/app/users/:user_id.json`
  - `user_id` に対応するユーザー情報を返す
- `POST /api/app/users.json`
  - ユーザー情報を登録する
- `GET /api/app/masuda_run/rankings.json`
  - 増田RUNアプリ用ランキング配列を返す
- `POST /api/app/masuda_run/rankings.json`
  - 増田RUNのランキングを登録する
- `GET /api/app/web_push/vapid_key.json`
  - Web Push公開鍵を返す
- `POST` / `DELETE /api/app/web_push/subscription.json`
  - Web Pushの購読を登録・解除する
- `GET /sitemap.xml`
  - 公開用サイトマップXMLを返す
- `GET /feed.xml`
  - ブログ記事全件のRSSフィードを返す

## 記事バックアップ

microCMS の記事を BigQuery に全件バックアップできます。BigQuery へは load job で投入し、`microcms_articles_backup` テーブルを毎回全件置き換えます。`tags` は microCMS のカンマ区切り文字列をそのまま保存します。

事前にホストで Application Default Credentials を設定してください。

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

`~/.config/gcloud/application_default_credentials.json` が作成されていることを確認してください。通常の `gcloud auth login` だけでは Application Default Credentials は作成されません。

Docker Compose から実行する場合、ホストの `~/.config/gcloud` がコンテナの `/home/rails/.config/gcloud` に read-only でマウントされます。

```bash
cd backend
BIGQUERY_PROJECT_ID=masusono \
BIGQUERY_DATASET_ID=blog \
docker compose run --rm backend bundle exec rails articles:backup_to_bigquery
```

初回実行時に dataset と table がなければ自動作成します。dataset location は `asia-northeast1` です。

タグ付け候補を確認する場合は、BigQuery から `tags` が空の記事、タグ付き既存記事、既存タグの件数を JSON で出力します。`articles:prepare_tagging` はバックアップ後に候補ファイルとレビュー用テンプレートを `tmp/tagging/` 配下へ作成します。
タグは記事同士の具体的なつながりを作るために使います。既存タグは参考情報であり、制約ではありません。2記事以上に自然に紐づくなら新しいタグを積極的に作って構いません。新規タグを作る場合は、そのタグでつながる既存記事も `tag-updates.json` に含め、既存記事側のタグ更新を忘れないようにします。`日常`、`生活`、`生き方`、`人間関係`、`内省` のような広いタグは、より具体的なタグで置き換えられるなら置き換えます。

```bash
cd backend
BIGQUERY_PROJECT_ID=masusono \
BIGQUERY_DATASET_ID=blog \
docker compose run --rm backend bundle exec rails articles:prepare_tagging
```

生成されるファイルは以下です。

- `tmp/tagging/candidates.json`: 候補記事、タグ付き既存記事、既存タグ件数
- `tmp/tagging/tag-updates.json`: 適用用 JSON。初期値は `{"tag_updates":[]}`
- `tmp/tagging/review.md`: レビュー用テンプレート

確認済みのタグ案を microCMS に反映する場合は、`tmp/tagging/tag-updates.json` に `id` と `tags` を書いてから適用します。適用後は自動で BigQuery へ再バックアップし、残り候補件数を表示します。

```bash
cd backend
BIGQUERY_PROJECT_ID=masusono \
BIGQUERY_DATASET_ID=blog \
docker compose run --rm backend bundle exec rails articles:apply_tag_updates_from_file
```

## キャッシュ方針

キャッシュ最適化は採用せず、Cloud Run のウォーム維持を主戦略とします。

- `ApiController` 配下のレスポンスは `Cache-Control: no-store` を返します
- Cloud Run のウォーム維持方針は `docs/cloud-run-warmup-strategy.md` を参照してください

## Web Push

ブラウザの「その他」→「設定」から通知を有効にすると、端末ごとのPush subscriptionをmicroCMSへ保存します。通知の許可は、利用者が「通知を受け取る」を押した場合にのみ要求します。

### microCMSの準備

複数コンテンツ形式で `web_push_subscriptions` APIを作成し、次のテキストフィールドを追加します。

- `endpoint`
- `p256dh`
- `auth`

このAPIは管理用データなので、コンテンツAPIキーは公開せず、Rails credentialsの既存 `microcms.api_key` だけでアクセスします。

### ユーザーコンテンツID移行

`users` APIのコンテンツIDは、前後空白を除去した `user_id` のSHA-256先頭32文字に `u-` を付けた値を正規IDとして使用します。microCMSの `users` APIで、コンテンツIDに英小文字・数字・`-` を許可し、`GET`・`PUT`・`DELETE` 権限を付与してください。

次のコマンドはデータを変更せず、移行候補・削除予定・要確認レコードをJSONで出力します。

```bash
docker compose run --rm backend bin/rails users:preview_content_id_migration
```

出力を確認して問題がなければ、正規IDへ作成・更新してから旧IDを削除します。実行時点で要確認レコードが1件でもある場合は中止されます。`CONFIRM=true` を明示しない限り、データ変更は行いません。

```bash
docker compose run --rm -e CONFIRM=true backend bin/rails users:apply_content_id_migration
```

### VAPID鍵の準備

次のコマンドで鍵ペアを生成し、標準出力をRails credentialsへ保存します。出力される秘密鍵はコミット・共有しません。

```bash
cd backend
rbenv exec bin/rails web_push:generate_vapid_keys
rbenv exec bin/rails credentials:edit
```

credentialsには次の形で設定します。`vapid_subject` は運用連絡先のメールアドレスまたはHTTPS URLです。

```yaml
web_push:
  vapid_public_key: "..."
  vapid_private_key: "..."
  vapid_subject: "mailto:YOUR_EMAIL@example.com"
```

### 通知の送信

デプロイ済み環境で、管理者だけが次のコマンドを実行します。`URL` はサイト内の絶対パスを指定します。

```bash
cd backend
TITLE='お知らせ' BODY='好きな本文を送れます' URL='/articles/example' rbenv exec bin/rails web_push:send
```

有効な全購読端末へ送信し、配信先から無効と判断された購読はmicroCMSから自動削除します。

## APIエラーレスポンス仕様

API で例外が発生した場合、レスポンス形式は次に統一します。

```json
{
  "error": {
    "code": "upstream_timeout",
    "message": "Upstream service request timed out.",
    "request_id": "7c4f8b7e-6d38-4a17-b6a1-1db1f31c2a6e"
  }
}
```

`ApplicationController` でのマッピング:

- `Microcms::FetchContentsService::FetchError`
  - upstream `408` -> `504 Gateway Timeout` (`upstream_timeout`)
  - upstream `429` -> `503 Service Unavailable` (`upstream_rate_limited`)
  - upstream `400..499` -> `424 Failed Dependency` (`upstream_client_error`)
  - upstream `500..599` -> `502 Bad Gateway` (`upstream_server_error`)
- `Faraday::TimeoutError` -> `504 Gateway Timeout` (`upstream_timeout`)
- `Faraday::ConnectionFailed` -> `502 Bad Gateway` (`upstream_connection_error`)
- その他の `Faraday::Error` -> `502 Bad Gateway` (`upstream_error`)

補足:
- 依存先（microCMS/HTTP）起因の障害は 5xx または 424 で返します。
- `error.request_id` は Rails の request id で、アプリログとの突合に使います。
- エラーレスポンスでは `Cache-Control: no-store` を返し、失敗レスポンスをキャッシュしません。

## APIレスポンス契約のキー記載順

`backend/docs/api-response-contract.md` では、可読性のために次の順序でキーを記載します。

1. 識別子（例: `id`）
2. 表示名（例: `title` / `name` / `label`）
3. 時系列情報（例: `publishedDate` / `lastmod`）
4. その他の属性

注記: JSON のキー順は本質的契約ではなく、上記はドキュメント表記の統一ルールです。

## レスポンス整形責務

- Model: 取得責務
- Usecase: API契約に合わせた整形責務
- Controller: `render` のみ
- Serializer: 現在は導入しない

この方針により、レスポンス契約の変更点は Usecase と request spec の差分として追跡します。

## API変更時の手順

1. `backend/docs/api-response-contract.md` を更新
2. Usecase で整形ロジックを実装/更新
3. request spec で契約（キー・型・件数・代表値）を固定

## ドキュメント相互整合性チェック（APIパス）

次の2ファイルで API パスをそろえる:

- `README.md`
- `docs/api-response-contract.md`

確認コマンド（`backend/` で実行）:

```bash
git grep -nE "(/api/app/users/:user_id\\.json|/api/app/masuda_run/rankings\\.json)" -- README.md docs/api-response-contract.md
git grep -nE '(^|`)/app/(users|masuda_run/rankings)\.json' -- README.md docs/api-response-contract.md || true
```

判定:

- 1本目のコマンドは2ファイルすべてにヒットすること
- 2本目のコマンドはヒットしないこと

## 運用メモ

- ドキュメント目次: `backend/docs/README.md`
- Cloud Run ウォーム維持戦略: `backend/docs/cloud-run-warmup-strategy.md`
- 改善バックログ（候補一覧）: `backend/docs/improvement-backlog.md`

## microCMS ページング保護

`Microcms::FetchContentsService` では、異常レスポンスや過大取得による過負荷を防ぐために以下のガードを入れています。

- 不正メタ（例: `limit <= 0`）を検知した場合は追加ページ取得を中断し、警告ログを出します
- 最大ページ数: `MICROCMS_MAX_PAGES`（デフォルト: `100`）
- 最大取得件数: `MICROCMS_MAX_TOTAL_COUNT`（デフォルト: `10000`）

環境変数が未設定、空文字、または不正値の場合はデフォルト値を使います。

## バックエンドのLint/テスト

`backend/` で実行します:

```bash
docker compose run --rm backend bundle exec rubocop
docker compose run --rm backend bundle exec rspec
```

ローカルで GitHub Actions 相当の主要チェックをまとめて回す場合:

```bash
bin/ci
```

## フロントエンドのLint/Format

`backend/` で実行します:

```bash
docker compose run --rm backend npm run lint
docker compose run --rm backend npm run format:check
docker compose run --rm backend npm run format
```

## Cloud Run へのデプロイ

`backend/` でデプロイスクリプトを実行します:

```bash
./deploy.sh
```

デプロイ先はチェックアウト中の Git ブランチで決まります。GitHub Actions では
`GITHUB_REF_NAME` を使うため、checkoutがデタッチされたHEADでも同じ規則で動作します。

- `main`: 本番サービス `masusono` へデプロイ
- その他のブランチ: ステージングサービス `masusono-<ブランチ名>` へデプロイ

ステージングのサービス名では、ブランチ名を英小文字化し、英数字以外の連続を `-` に置換します。
たとえば `feature/login` は `masusono-feature-login` になります。Cloud Run の63文字制限に
収めるため、ブランチ名由来の部分は54文字までです。デプロイ完了時には対象サービス名と
Cloud Run URL が表示されます。

Rails credentials の復号鍵はSecret Managerの `rails-master-key` からCloud Runへ注入します。
ローカルの `config/master.key` は手動デプロイに不要です。

### GitHub Actionsによる本番デプロイ

`.github/workflows/deploy-cloud-run.yml` は、`backend/` またはworkflow自身に関係する変更が
`main` へpush（PRマージを含む）されたときに起動します。`backend/bin/ci` の全チェックが
成功してから、OIDC / Workload Identity FederationでGCPへ認証し、本番サービスへデプロイします。
認証対象はGitHubリポジトリ `ytkg/masusono-blog` の `main` ブランチに限定されています。

`.github/workflows/deploy-pr-cloud-run.yml` は、同一リポジトリのPRを開く・再オープンする・更新する
たびに全CI後のステージングデプロイを行い、PRコメントへ最新URLを書き込みます。フォークからのPRは
デプロイ対象外です。

GitHub Actions は Artifact Registry へイメージをビルド・pushしてから、`deploy.sh` 経由でそのイメージをCloud Runへデプロイします。成果物はPR終了時に削除し、本番イメージとCloud Runソース用バケットには保持ポリシーを設定しています。

手動で `deploy.sh` を実行する場合は、`IMAGE_URI` が未指定ならソースデプロイ、指定した場合はイメージデプロイになります。

```bash
gcloud run deploy <ブランチに対応するサービス名> \
  --image "$IMAGE_URI" \
  --project masusono \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --max-instances 1 \
  --remove-env-vars RAILS_MASTER_KEY \
  --update-secrets RAILS_MASTER_KEY=rails-master-key:latest
```

前提条件:

- `gcloud` CLI がインストール済みで、認証済みであること

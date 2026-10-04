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

### 管理ミニアプリ

「その他！」から管理ミニアプリを開けます。ログイン・ダッシュボード・メディア一覧・記事一覧は
同じ画面内で切り替わり、ブラウザの URL は変わりません。ログインは `auth.takagi.dev` の認証 API を使い、
認証に成功したアカウントが利用できます。ログイン状態は最長7日間で、
期限後は再ログインが必要です。microCMS のメディア一覧ではファイル名検索とプレビュー、記事一覧ではタイトル検索と公開状態の絞り込みができます。各一覧は初回20件を取得し、追加分は「もっと見る」を押したときに取得します。
メディア一覧から画像を1件アップロードできます。画像以外と5MBを超える画像は送信前とサーバー側で拒否します。削除、複数ファイルの一括アップロード、ドラッグ＆ドロップ、記事投稿は提供しません。

メディア一覧では既存の `microcms.api_key` を使います。microCMS の API キー設定で、
マネジメント API の「メディアの取得」と「メディアのアップロード」権限を追加してください。キーはサーバー側だけで使い、
画面には送信しません。

記事一覧にも同じキーをサーバー側だけで使います。microCMS の API キー設定で、マネジメント API の
「コンテンツの取得（一覧・詳細）」、Content API の「GET」「下書き全取得」「公開終了全取得」権限を追加してください。
一覧は記事本文を取得せず、管理 API の状態・更新日時と Content API の `id,title` を結合して表示します。

管理ミニアプリは、認証状態・ログイン・メディア取得に `/api/app/management/` 以下の
JSON API を使います。認証トークンは画面へ返さず Rails セッションに保持し、
ログインとメディアアップロードのリクエストは CSRF トークンで保護します。

- `POST /api/app/navigation_failures`
  - 画面遷移の異常を診断ログに記録する。確認方法は [画面遷移エラーの診断](docs/navigation-error-diagnostics.md) を参照
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

`users` APIのコンテンツIDは、前後空白を除去した `user_id` のSHA-256先頭32文字に `u-` を付けた値を正規IDとして使用します。microCMSの `users` APIで、コンテンツIDに英小文字・数字・`-` を許可し、`GET`・`PUT`・`PATCH`・`DELETE` 権限を付与してください。

通常保存は正規IDへの `PUT` で作成し、既存IDの場合は `PATCH` で更新します。ユーザー取得も正規IDを使います。

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
  microcms_webhook_secret: "..."
```

### 通知の送信

デプロイ済み環境で、管理者だけが次のコマンドを実行します。`URL` はサイト内の絶対パスを指定します。

```bash
cd backend
TITLE='お知らせ' BODY='好きな本文を送れます' URL='/articles/example' rbenv exec bin/rails web_push:send
```

有効な全購読端末へ送信し、配信先から無効と判断された購読はmicroCMSから自動削除します。

### 新規記事公開時の自動通知

microCMSの `articles` APIで「カスタム通知」を追加し、通知先を次に設定します。

```
https://masusono.com/webhooks/microcms/articles
```

タイミングは「コンテンツの公開時・更新時」を選び、上記credentialsの `microcms_webhook_secret` と同じシークレットを設定します。Webhookの `type` が `new` の場合だけ通知するため、公開済み記事の更新では通知されません。Webhook署名は `x-microcms-signature` で検証し、記事情報はコンテンツIDからmicroCMSへ再取得します。

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

## フロントエンドのLint/Format/テスト

`backend/` で実行します:

```bash
docker compose run --rm backend npm run lint
docker compose run --rm backend npm run format:check
docker compose run --rm backend npm run format
docker compose run --rm backend npm test
```

Vitest の同時実行数はローカルで最大2、`CI` 環境で最大4です。Docker 上で
Rails・ブラウザとリソースを共有するため、CPU数だけで並列数を増やさず、同時に生成する jsdom 環境を抑えます。
フロントエンド全テストと Visual Regression は順番に実行してください。
他の worktree でも重い検証を同時に実行している場合は、終了を待つか、
`npm test -- --maxWorkers=1` でさらに並列数を減らせます。

管理対象の worktree では、上記の `docker compose` の代わりに worktree ルートから
`.codex/skills/masusono-worktree/scripts/compose.sh` を使います。Visual Regression の手順は
[test/visual/README.md](test/visual/README.md) を参照してください。

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

`.github/workflows/deploy-pr-cloud-run.yml` は、同一リポジトリのPRへ `ステージングデプロイ` ラベルを
付けたとき、またはそのラベルが付いたPRを再オープン・更新したときに、全CI後のステージングデプロイを
行い、PRコメントへ最新URLを書き込みます。フォークからのPRはデプロイ対象外です。ラベルを外しても
サービスは削除されず、PRのマージまたはブランチ削除時に削除されます。

GitHub Actions は Artifact Registry へイメージをビルド・pushしてから、`deploy.sh` 経由でそのイメージをCloud Runへデプロイします。成果物はPR終了時に削除し、残ったイメージも3日後に自動削除します。本番イメージは最新3世代を保持します。Cloud Runソース用バケットにも保持ポリシーを設定しています。

本番・ステージングともに Docker Buildx でビルドし、GitHub Actions に Docker レイヤーを
キャッシュします。`mode=max` で gem のインストールを含む中間ステージも保存するため、
Gemfile・Gemfile.lock・vendor が変わらないビルドでは依存関係のインストールを再利用できます。
同じキャッシュ scope を使い、PR は GitHub のアクセス制限の範囲で main のキャッシュを
参照します。PR が保存したキャッシュはその PR の merge ref 内に限定されます。
初回やキャッシュ失効後は通常のビルドが必要です。キャッシュ保存に失敗してもデプロイは継続します。
Actions のビルドサマリーで所要時間とキャッシュ利用状況を確認できます。

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

## 公開ページのSSR

ホーム・記事詳細・著者一覧・著者詳細・紹介ページはInertia SSRで本文とSEO情報を初回HTMLに含めます。検索・ミニアプリ・数字ページはブラウザで描画します。

Docker ComposeではViteのSSRエンドポイントをRailsから呼び出し、開発アセットはRailsのViteプロキシ経由で配信します。管理対象worktreeでは通常どおり専用の `compose.sh up --build` を使います。ホストでの開発はRailsと `npm run dev` を起動すると、Inertia RailsがViteを検出します。

`npm run build` はクライアントとSSRの両方をビルドします。サーバー専用バンドルは公開ディレクトリ外の `ssr/ssr.mjs` に出力し、Dockerのビルドでも生成します。本番イメージにはNode.js 22を含め、Pumaの `inertia_ssr` プラグインがSSRプロセスの起動・ヘルスチェック・異常終了後の再起動・終了を管理します。SSRはコンテナ内の127.0.0.1:13714だけで待ち受けます。

SSRに失敗したリクエストは初期propsを返してブラウザで描画します。Railsログの `[inertia-rails] SSR render failed` とPumaの `Inertia SSR` ログで障害を検知できます。

本番のSSRプロセスは、URL・全props・アセットバージョンを含むInertiaペイロードが完全一致する描画結果を5分間再利用します。記事やflashなどのデータが変われば別の描画になり、失敗した結果は保存しません。キャッシュはプロセス内だけに保持し、LRUで最大8MiB・32件に制限します。同一データの同時リクエストも1回の描画を共有します。初回・更新直後・プロセス再起動後は通常どおり描画し、開発時にはキャッシュしません。

検証には `npm run test:ssr`（実際の本番バンドルをNode.jsで描画）、 `bundle exec rspec spec/requests/ssr_spec.rb`（対象ページの選択・HTML・障害時の切り替え）、全画面の `scripts/check-visual.sh` を使用します。撮影環境では本番と同じSSRバンドルをPumaから起動し、クライアントとSSRの画像URLを一致させます。Visual RegressionにはJavaScript無効での本文・メタ情報検証と、hydration後の操作確認も含まれます。実際のCloud Runデプロイは別途実行します。

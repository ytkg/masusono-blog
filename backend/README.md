# masusono-blog バックエンド

masusono-blog の Rails API バックエンドです。

## ローカル開発

`backend/` で実行します:

```bash
docker compose up --build
```

## APIエンドポイント

- `GET /articles.json`
- `GET /metrics.json`
- `GET /podcasts.json`
- `GET /shops.json`
- `GET /sitemap.xml`

## キャッシュ方針（GET API）

`ApplicationController` 配下の GET レスポンスには、共通で以下を付与します。

- `Cache-Control: public, max-age=3600, must-revalidate`
- `ETag`

`If-None-Match` が一致した場合は `304 Not Modified` を返します。  
このため、GET の API エンドポイントを追加しても同じ方針が自動適用されます。

現在この方針が適用されるエンドポイント:
- `GET /articles.json`
- `GET /podcasts.json`
- `GET /metrics.json`
- `GET /shops.json`
- `GET /sitemap.xml`

## microCMS ページング保護

`Microcms::FetchContentsService` では、異常レスポンスや過大取得による過負荷を防ぐために以下のガードを入れています。

- 不正メタ（例: `limit <= 0`）を検知した場合は追加ページ取得を中断し、警告ログを出します
- 最大ページ数: `MICROCMS_MAX_PAGES`（デフォルト: `100`）
- 最大取得件数: `MICROCMS_MAX_TOTAL_COUNT`（デフォルト: `10000`）

環境変数が未設定、空文字、または不正値の場合はデフォルト値を使います。

## テスト

`backend/` で実行します:

```bash
bundle exec rspec
```

## Cloud Run へのデプロイ

`backend/` でデプロイスクリプトを実行します:

```bash
./deploy.sh
```

`deploy.sh` では以下を実行します:

```bash
gcloud run deploy masusono \
  --source . \
  --project masusono \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --set-env-vars RAILS_MASTER_KEY=$(cat config/master.key)
```

前提条件:

- `gcloud` CLI がインストール済みで、認証済みであること
- `config/master.key` が存在すること

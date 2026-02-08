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

## APIエラーレスポンス仕様

API で例外が発生した場合、レスポンス形式は次に統一します。

```json
{
  "error": {
    "code": "upstream_timeout",
    "message": "Upstream service request timed out."
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
- エラーレスポンスでは `Cache-Control: no-store` を返し、失敗レスポンスをキャッシュしません。

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

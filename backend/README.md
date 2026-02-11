# masusono-blog バックエンド

masusono-blog の Rails API バックエンドです。

## ローカル開発

`backend/` で実行します:

```bash
docker compose up --build
```

## Inertia ページ開発（`/about` PoC）

`/about` は Inertia Rails で返すようにしています。開発時は Rails に加えて Vite を起動してください。

```bash
cd backend
docker compose up --build
```

補足:
- 画面データは主に Inertia のサーバーサイド props で返します。

### Docker での起動

`compose.yml` には Rails (`backend`) と Vite (`vite`) の 2 サービスを定義しています。
依存インストールは `vite` サービスのみが担当し、`backend` は依存準備完了を待ってから起動します。
Rails 側は起動前に `tmp/pids/server.pid` を削除して重複起動エラーを回避します。

```bash
cd backend
docker compose up --build
```

- Rails: `http://localhost:3000`
- Vite dev server: `http://localhost:3036`

`/about` は Rails 経由で表示し、JS は Vite から配信されます。
初回起動時は `vite` コンテナで `npm install` が実行されるため、立ち上がりに時間がかかる場合があります。
`npm install` で権限エラーが出た場合は、`node_modules_cache` ボリュームを再作成してください。

```bash
cd backend
docker compose down -v
docker compose up --build
```

`ENOSPC: no space left on device` が出る場合は Docker のディスク不足です。以下を実行して空き容量を作ってから再実行してください。

```bash
docker system prune -af --volumes
docker builder prune -af
cd backend
docker compose up --build
```

## エンドポイント

- `GET /app/numbers/metrics.json`
  - Numbersアプリ用メトリクス（`blocks`）を返す
- `GET /app/masuda_run/rankings.json`
  - 増田RUNアプリ用ランキング配列を返す
- `GET /sitemap.xml`
  - 公開用サイトマップXMLを返す

## キャッシュ方針（GET API）

`ApplicationController` 配下の GET レスポンスには、共通で以下を付与します。

- `Cache-Control: public, max-age=3600, must-revalidate`
- `ETag`

`If-None-Match` が一致した場合は `304 Not Modified` を返します。  
このため、GET の API エンドポイントを追加しても同じ方針が自動適用されます。

現在この方針が適用されるエンドポイント:
- `GET /app/numbers/metrics.json`（Numbersアプリ用メトリクス）
- `GET /app/masuda_run/rankings.json`（増田RUNランキング）
- `GET /sitemap.xml`（サイトマップXML）

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

## 運用メモ

- Cloud Run オリジン到達率削減メモ: `backend/docs/cache-origin-reduction-plan.md`
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

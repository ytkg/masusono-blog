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

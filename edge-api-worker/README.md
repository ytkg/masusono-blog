# edge-api-worker

Hono を使って Cloud Run オリジンへのプロキシと Cache API キャッシュを行う Cloudflare Worker です。

## 役割

- `GET *.json` は Cache API に保存
- キャッシュヒット時は即返却し、裏で再検証
- `GET *.json` の `Cache-Control` は Worker 側設定で上書き
- それ以外のリクエストはオリジンへそのまま転送

## 事前準備

1. オリジン用ホストを用意する（例: `origin-api.masusono.com`）
2. `wrangler.toml` の `ORIGIN_API_BASE` を実オリジンURLに合わせる

## 開発

```bash
cd edge-api-worker
npm install
npm run dev
```

## デプロイ

```bash
cd edge-api-worker
npm run deploy
```

## 主な環境変数

- `ORIGIN_API_BASE`: Cloud Run 等のオリジンベースURL

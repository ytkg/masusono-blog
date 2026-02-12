# edge-api-worker

Cloud Run オリジンへのプロキシと `/api/**/*.json` 向けキャッシュ制御を行う Cloudflare Worker です。

## 役割

- `GET /api/**/*.json` のみをキャッシュ対象にする
- キャッシュヒット時は即返却し、`60s` 間隔で裏更新を試行する
- `max_stale=24h` を超えたキャッシュしかない場合は同期でオリジン取得する
- `Authorization` / `Cookie` / ユーザー文脈ヘッダ付きはバイパスする
- `4xx/5xx`・非 JSON・`1MB` 超レスポンスはキャッシュしない
- それ以外のパスはオリジンへ透過プロキシする

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

## 主要な固定値

- `max_stale`: `24h`
- `revalidate_interval`: `60s`
- オリジンタイムアウト: `10s`
- キャッシュ対象サイズ上限: `1MB`

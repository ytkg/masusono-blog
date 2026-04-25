# masuda_ai

Cloudflare Workers + Workers AI で動く「増田AI美」返信 API です。

## エンドポイント

- `GET /health`
- `POST /reply`

## リクエスト例

```json
{
  "message": "函館旅行なう！！",
  "history": [
    { "role": "user", "content": "こんにちは！" },
    { "role": "assistant", "content": "こんにちはー！笑 どうしたん、今日は😳" }
  ]
}
```

## レスポンス例

```json
{
  "reply": "えええいいないいなぁ😳 函館とか最高やん！！ なに食べたのー？🐟✨",
  "draft_reply": "函館旅行いいね。何か美味しいもの食べた？",
  "usage": null
}
```

## セットアップ

1. `cd masuda_ai`
2. `npm install`
3. `npm run dev`

`wrangler.jsonc` で Workers AI binding を `AI` に設定しています。

## デプロイ

```bash
cd masuda_ai
npm run deploy
```

## メモ

- モデルは `MASUDA_MODEL` で差し替え可能です
- CORS を絞りたい場合は `ALLOWED_ORIGIN` を設定してください
- 返信スタイルは `src/index.ts` の `MASUDA_SYSTEM_PROMPT` で調整できます
- 英語だけで返った場合は、日本語で再生成するフォールバックを入れています

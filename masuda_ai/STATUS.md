# Masuda AI Status

最終更新: 2026-04-26

## 概要

`masuda_ai` は Cloudflare Workers + Workers AI で動く、増田っぽい返答 API。

現在は 2 段構成:

1. `draft_reply`
通常の自然な返答を作る

2. `reply`
`draft_reply` を増田っぽい口調へ言い換える

デプロイ先:

- `https://masuda-ai.ytkg.workers.dev`

## 現在の API

- `POST /draft-reply`
- `POST /style-reply`
- `POST /reply`
- `GET /health`

### `POST /draft-reply`

入力:

```json
{
  "message": "しりとりしたい",
  "history": []
}
```

出力:

```json
{
  "draft_reply": "もちろん、しりとりしよう！ まずはりんごからどう？"
}
```

### `POST /style-reply`

入力:

```json
{
  "message": "しりとりしたい",
  "draft_reply": "もちろん、しりとりしよう！ まずはりんごからどう？",
  "style_strength": "normal"
}
```

出力:

```json
{
  "reply": "ええ、しりとりしよー！ まずはりんごからどう？"
}
```

### `POST /reply`

入力:

```json
{
  "message": "しりとりしたい",
  "history": [],
  "style_strength": "normal"
}
```

出力:

```json
{
  "reply": "ええ、しりとりしよー！ まずはりんごからどう？",
  "draft_reply": "もちろん、しりとりしよう！ まずはりんごからどう？"
}
```

## 現在のモデル構成

`wrangler.jsonc`

- `DRAFT_MODEL`: `@cf/meta/llama-3.1-8b-instruct-fast`
- `STYLE_MODEL`: `@cf/meta/llama-3.1-8b-instruct-fast`

備考:

- 以前 `@cf/openai/gpt-oss-120b` を試したが、`reasoning_content` だけ出して `content: null` になるケースが多く、変換段で不安定だった
- `@cf/zai-org/glm-4.7-flash` も試したが、レスポンス形式や thinking 周りの調整が必要で、現時点では運用コストが高かった
- 現在は「まず安定して返る」を優先して、両段とも `llama-3.1-8b-instruct-fast`

## 現在の実装方針

### draft 段

- system prompt で「自然な返答だけ」を作らせる
- キャラ付けはしない
- 会話履歴は直近 6 件まで

### style 段

- `draft_reply` だけを言い換える
- 新しく返答を考え直さない
- 会話を先に進めない
- 参考例の内容は混ぜず、口調だけ参考にする

参考例は `masudaCorpus.ts` の `STYLE_REWRITE_EXAMPLES` を使用。

単発フレーズではなく、`元文 -> 増田風` のペア例にしている。

## style_strength の現状

- `weak`
  - かなり原文寄り
- `normal`
  - 少し増田っぽくする
- `strong`
  - `ええ`、語尾の崩し、軽い親しみを少し足す

現状の課題:

- 入力によっては `weak` と `normal` の差がまだ薄い
- `strong` はそこそこ差が出る
- 参考例が強くハマるケースでは、強度差より参考例の影響が勝つ

## フロント側の現状

対象ファイル:

- `backend/app/frontend/features/apps/masudaAimi/MasudaAimiApp.jsx`

現状:

- ホームから `増田AI美` を開ける
- `/reply` を叩いて会話できる
- `style_strength` を UI から選べる
- `draft_reply` も画面に表示される
- `draft_reply === reply` の場合は draft 表示を出さない

## ここまでで分かったこと

### うまくいったこと

- API を `draft` と `style` で分けたことで、どちらが悪いか切り分けやすくなった
- `draft_reply` をフロントに出すことで、変換段で意味が壊れているか確認しやすくなった
- `STYLE_REWRITE_EXAMPLES` を単発口癖ではなくペア例にしたことで、変換品質が上がった

### うまくいかなかったこと

- reasoning 寄りの大きいモデルは、短い変換タスクで本文を返さず `reasoning_content` だけ出すことがあった
- `style` 段に会話履歴を多く渡すと、`draft_reply` の言い換えではなく返答再生成に寄りやすかった
- 単発の参考例をたくさん渡すと、内容を混ぜて壊れることがあった

## 次にやる候補

優先順高め:

1. `normal` と `weak` の差をもう少し出す
2. `style_strength` ごとに参考例数を変える
3. `style-reply` で参考例選択をさらに素直にする

状況次第:

4. `draft` と `style` で別モデルを再検討する
5. `style-reply` の参考例をカテゴリ別に増やす
6. フロントで `draft_reply` を折りたたみ表示にする

## 再開時の確認コマンド

### health

```bash
curl -sS https://masuda-ai.ytkg.workers.dev/health
```

### draft 単体

```bash
curl -X POST https://masuda-ai.ytkg.workers.dev/draft-reply \
  -H 'Content-Type: application/json' \
  -d '{"message":"しりとりしたい"}'
```

### style 単体

```bash
curl -X POST https://masuda-ai.ytkg.workers.dev/style-reply \
  -H 'Content-Type: application/json' \
  -d '{
    "message":"しりとりしたい",
    "draft_reply":"もちろん、しりとりしよう！ まずはりんごからどう？",
    "style_strength":"strong"
  }'
```

### full reply

```bash
curl -X POST https://masuda-ai.ytkg.workers.dev/reply \
  -H 'Content-Type: application/json' \
  -d '{
    "message":"函館にいるよ",
    "style_strength":"normal"
  }'
```

## 参考ファイル

- [src/index.ts](/Users/ytkg/Workspace/github.com/ytkg/masusono-blog/masuda_ai/src/index.ts)
- [src/masudaCorpus.ts](/Users/ytkg/Workspace/github.com/ytkg/masusono-blog/masuda_ai/src/masudaCorpus.ts)
- [MasudaAimiApp.jsx](/Users/ytkg/Workspace/github.com/ytkg/masusono-blog/backend/app/frontend/features/apps/masudaAimi/MasudaAimiApp.jsx)

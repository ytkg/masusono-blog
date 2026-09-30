# API Response Contract

この文書は現行 backend API のレスポンス契約の正本です。

- 対象: Users API、管理ミニアプリ API、`GET /api/app/masuda_run/rankings.json`、Web Push API、`GET /sitemap.xml`、`GET /feed.xml`
- 目的: 内部実装変更時でも外部契約（キー/型/意味）を維持する

## Users API

### GET /api/app/users/:user_id.json

| key | type | nullable | note |
| --- | --- | --- | --- |
| `userId` | `String` | No | リクエストしたユーザーID |
| `name` | `String` | Yes | 表示名。未登録の場合は `null` |

### POST /api/app/users.json

- Request: `{ "userId": "String", "name": "String" }`
- Response (`201 Created`): `{ "id": "String", "userId": "String", "name": "String" }`

## GET /api/app/masuda_run/rankings.json

- Response: `Array<Ranking>`

### Ranking

| key | type | nullable | note |
| --- | --- | --- | --- |
| `userId` | `String` | No | ユーザーID |
| `name` | `String` | No | 表示名。未登録または空の場合は `userId`、`userId` も空の場合は `NO NAME` |
| `score` | `Numeric` | No | スコア |
| `rankedAt` | `String` | No | 形式: `YYYY/MM/DD` |
| `rank` | `Integer` | No | 順位 |

## 管理ミニアプリ API

Rails セッションを使い、認証トークンはレスポンスに含めない。すべて `Cache-Control: no-store` を返し、エラーは下記の共通形式とする。

- `GET /api/app/management/session`: `{ "authenticated": Boolean, "csrf_token": String }`。未ログインでも取得できる。
- `POST /api/app/management/session`: `{ "username": String, "password": String }` と `X-CSRF-Token` を送る。成功時は GET と同じ形式を返す。
- `GET /api/app/management/media?page=1&q=...&token=...`: ログイン必須。`{ "media": Array, "total_count": Integer, "has_more": Boolean, "next_token": String | null, "page": Integer, "query": String }` を返す。`q` はファイル名検索、`page` は1始まりで1回に20件取得する。追加読み込みには前回の `next_token` を指定できる。各メディアには `id`、`url` と、存在する場合は `width`、`height`、`createdAt`、`updatedAt`、`alt`、`tags` を含む。
- `GET /api/app/management/articles?page=1&q=...&status=...`: ログイン必須。`{ "articles": Array, "total_count": Integer, "has_more": Boolean, "page": Integer, "query": String, "status": String }` を返す。`status` は `all`、`published`、`draft`、`published_and_draft`、`closed` のいずれかで、`q` と組み合わせられる。各記事には `id`、下書きがあればそのタイトルを優先した `title`、`status`（`PUBLISH`、`DRAFT`、`PUBLISH_AND_DRAFT`、`CLOSED`）、`updated_at` を含む。サーバー側で全件を結合・並べ替えるため、追加読み込み後も検索・絞り込み・更新日時降順が維持される。

## Web Push API

### GET /api/app/web_push/vapid_key.json

| key | type | nullable | note |
| --- | --- | --- | --- |
| `publicKey` | `String` | No | VAPID公開鍵。Push subscriptionの作成にだけ使用する |

### POST /api/app/web_push/subscription.json

- Request: `{ "subscription": { "endpoint": "String", "keys": { "p256dh": "String", "auth": "String" } } }`
- Response (`201 Created`): `{ "id": "String" }`

### DELETE /api/app/web_push/subscription.json

- Request: `{ "endpoint": "String" }`
- Response: `204 No Content`

## GET /sitemap.xml

- Content-Type: `application/xml; charset=utf-8`
- Response: XML sitemap

## GET /feed.xml

- Content-Type: `application/rss+xml; charset=utf-8`
- Response: RSS 2.0 feed
- 対象: ブログ記事全件

## Error contract

エラー時は次の JSON 形式を維持する。

```json
{
  "error": {
    "code": "upstream_timeout",
    "message": "Upstream service request timed out.",
    "request_id": "7c4f8b7e-6d38-4a17-b6a1-1db1f31c2a6e"
  }
}
```

| key | type | nullable | note |
| --- | --- | --- | --- |
| `error.code` | `String` | No | エラー種別 |
| `error.message` | `String` | No | 表示/記録用メッセージ |
| `error.request_id` | `String` | No | Rails の request id。ログ相関に使う |

## Cache contract

`ApiController` 配下のレスポンスは `Cache-Control: no-store` を返す。

- エラー時も `Cache-Control: no-store`

## README との整合性チェック

APIパスは次の2ファイルで一致させる。

- `README.md`
- `docs/api-response-contract.md`

確認コマンド（`backend/` で実行）:

```bash
git grep -nE "(/api/app/users/:user_id\\.json|/api/app/masuda_run/rankings\\.json)" -- README.md docs/api-response-contract.md
git grep -nE '(^|`)/app/(users|masuda_run/rankings)\.json' -- README.md docs/api-response-contract.md || true
```

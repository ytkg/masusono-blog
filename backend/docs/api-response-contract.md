# API Response Contract

この文書は現行 backend API のレスポンス契約の正本です。

- 対象: `GET /metrics.json`, `GET /masuda_run/rankings.json`, `GET /sitemap.xml`
- 目的: 内部実装変更時でも外部契約（キー/型/意味）を維持する

## GET /metrics.json

- Response: `Metrics`

### Metrics

| key | type | nullable | note |
| --- | --- | --- | --- |
| `blocks` | `Array<MetricBlock>` | No | 表示ブロック |

### MetricBlock

| key | type | nullable | note |
| --- | --- | --- | --- |
| `label` | `String` | No | 表示用タイトル |
| `value` | `String` | Yes | メトリクス値 |
| `children` | `Array<MetricBlock>` | Yes | 子ブロック |

## GET /masuda_run/rankings.json

- Response: `Array<Ranking>`

### Ranking

| key | type | nullable | note |
| --- | --- | --- | --- |
| `userId` | `String` | No | ユーザーID |
| `score` | `Numeric` | No | スコア |
| `rankedAt` | `String` | No | 形式: `YYYY/MM/DD` |
| `rank` | `Integer` | No | 順位 |

## GET /sitemap.xml

- Content-Type: `application/xml; charset=utf-8`
- Response: XML sitemap

## Error contract

エラー時は次の JSON 形式を維持する。

```json
{
  "error": {
    "code": "upstream_timeout",
    "message": "Upstream service request timed out."
  }
}
```

## Cache contract

GET API では次のキャッシュ方針を維持する。

- `Cache-Control: public, max-age=3600, must-revalidate`
- `ETag`
- `If-None-Match` 一致時は `304 Not Modified`
- エラー時は `Cache-Control: no-store` かつ `ETag` なし

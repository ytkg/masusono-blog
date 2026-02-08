# API Response Contract

この文書は backend API のレスポンス契約の正本です。

- 対象: `GET /articles.json`, `GET /podcasts.json`, `GET /metrics.json`, `GET /shops.json`, `GET /sitemap.xml`
- 目的: 内部実装変更時でも外部契約（キー/型/意味）を維持する

## 差分確認

- 確認日: 2026-02-09
- 現行実装（controller/usecase/model）と request spec を基準に確認
- 現行レスポンスとの差分: なし

## キー記載順ポリシー

可読性と保守性のため、JSON のキー記載順は次に統一する。

1. 識別子: `id`
2. 表示名: `title` / `name` / `label`
3. 時系列情報: `publishedDate` / `lastmod`
4. その他の属性: 本文、URL、座標、ネスト要素など

注記: JSON オブジェクトのキー順は契約の本質ではないため、このポリシーは読みやすさのための規約。

## GET /articles.json

- Response: `Array<Article>`

### Article

| key | type | nullable | note |
| --- | --- | --- | --- |
| `id` | `String` | No | 記事ID |
| `title` | `String` | No | 記事タイトル |
| `publishedDate` | `String` | No | 形式: `YYYY/MM/DD` |
| `content` | `String` | No | 本文（HTML） |
| `author` | `String` | Yes | 著者名。未設定時は `null` |

## GET /podcasts.json

- Response: `Array<Podcast>`

### Podcast

| key | type | nullable | note |
| --- | --- | --- | --- |
| `id` | `String` | No | 音声URLから抽出。抽出失敗時は空文字 |
| `title` | `String` | No | タイトル |
| `publishedDate` | `String` | No | 形式: `YYYY/MM/DD` |
| `audioUrl` | `String` | No | 音声URL |

## GET /metrics.json

- Response: `Metrics`

### Metrics

| key | type | nullable | note |
| --- | --- | --- | --- |
| `blocks` | `Array<MetricBlock>` | No | 表示ブロック |

### MetricBlock

`MetricBlock` は次の2種類。

1. `single` block

```json
{
  "kind": "single",
  "metric": {
    "label": "string",
    "value": "string"
  }
}
```

2. `group` block

```json
{
  "kind": "group",
  "label": "string",
  "groups": [
    {
      "label": "string",
      "value": "string",
      "children": [
        {
          "label": "string",
          "value": "string"
        }
      ]
    }
  ]
}
```

## GET /shops.json

- Response: `Array<Shop>`

### Shop

| key | type | nullable | note |
| --- | --- | --- | --- |
| `name` | `String` | No | 店名 |
| `category` | `String` | No | カテゴリ |
| `lat` | `Numeric` | No | 緯度 |
| `lng` | `Numeric` | No | 経度 |
| `url` | `String` | Yes | 外部URL |
| `desc` | `String` | Yes | 説明 |

## GET /sitemap.xml

- Content-Type: `application/xml; charset=utf-8`
- Response: XML sitemap

### XML structure

- Root: `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`
- Child: `<url>`

### URL element

| element | type | nullable | note |
| --- | --- | --- | --- |
| `loc` | `String` | No | 絶対URL |
| `lastmod` | `String` | Yes | 有効な日時のみ出力（UTC ISO8601） |
| `changefreq` | `String` | Yes | 更新頻度 |
| `priority` | `String` | Yes | 小数1桁文字列 |

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

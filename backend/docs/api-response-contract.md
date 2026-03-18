# API Response Contract

この文書は現行 backend API のレスポンス契約の正本です。

- 対象: `GET /api/app/numbers/metrics.json`, `GET /api/app/masuda_run/rankings.json`, `GET /sitemap.xml`
- 目的: 内部実装変更時でも外部契約（キー/型/意味）を維持する

## GET /api/app/numbers/metrics.json

- Response: `Metrics`

### Metrics

| key | type | nullable | note |
| --- | --- | --- | --- |
| `blocks` | `Array<MetricBlock>` | No | 表示ブロック |

補足:
- 現在の表示項目には `増田RUN総プレイ回数` を含む

### MetricBlock

| key | type | nullable | note |
| --- | --- | --- | --- |
| `label` | `String` | No | 表示用タイトル |
| `value` | `String` | Yes | メトリクス値 |
| `children` | `Array<MetricBlock>` | Yes | 子ブロック |

## GET /api/app/masuda_run/rankings.json

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

## README / Inertia移行計画 との整合性チェック

APIパスは次の3ファイルで一致させる。

- `README.md`
- `docs/inertia-migration-plan.md`
- `docs/api-response-contract.md`

確認コマンド（`backend/` で実行）:

```bash
git grep -nE "(/api/app/numbers/metrics\\.json|/api/app/masuda_run/rankings\\.json)" -- README.md docs/inertia-migration-plan.md docs/api-response-contract.md
git grep -nE '(^|`)/app/(numbers/metrics|masuda_run/rankings)\.json' -- README.md docs/inertia-migration-plan.md docs/api-response-contract.md || true
```

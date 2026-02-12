# `/api/**/*.json` キャッシュ戦略

- 最終更新: 2026-02-12
- 実装場所: `edge-api-worker`
- 目的: `GET /api/**/*.json` を対象に、ユーザー混入事故を防ぎつつオリジン負荷を下げる

## 1. スコープ

- 本仕様は `edge-api-worker` に実装する
- `backend` はオリジンAPIとして利用し、キャッシュ制御の主責務は持たない
- 第1弾は `/api/**/*.json` を除外なしで全対象とする

## 1.1 ドメイン構成

- 現状:
  - `https://masusono.com` は Cloud Run オリジン（`https://masusono-332902117625.asia-northeast1.run.app`）に向いている
- 移行後（本仕様）:
  - `https://masusono.com` の受け口を `edge-api-worker` に向ける
  - `edge-api-worker` が `/api/**/*.json` にキャッシュ戦略を適用する
  - `edge-api-worker` は必要に応じて Cloud Run オリジンへフォワードする

## 2. 適用条件

- リクエスト条件:
  - Method が `GET`
  - Path が `/api/**` かつ拡張子 `.json`
- キャッシュ対象レスポンス:
  - Status が `200`
  - `Content-Type` が `application/json` 系
  - レスポンスサイズが `1MB` 以下
- キャッシュ対象外:
  - `4xx` / `5xx`
  - `Content-Type` 不一致
  - レスポンスサイズ `1MB` 超

## 3. バイパス条件（混入防止）

次のいずれかに該当する場合はキャッシュせず、オリジンへバイパスする。

- `Authorization` ヘッダがある
- ユーザーごとに結果が変わるヘッダがある
- オリジンレスポンスの `Cache-Control` が `private`

補足:
- 現行 `/api/**/*.json` はユーザー固有情報を返さない前提

## 4. キャッシュキー

- キーは受信した `Path + Query` をそのまま利用する
- クエリ除外は行わない（`utm_*`, `fbclid`, `gclid` も除外しない）
- クエリ順序の正規化は行わない

## 5. 鮮度と再検証

- `max_stale`: `24h`
- `revalidate_interval`: `60s`
- キャッシュヒット時:
  - キャッシュを即時返却
  - `60s` 間隔で裏更新を試行する（`max_stale` 以内でも試行）
- 裏更新のオリジン取得タイムアウト: `10s`
- 裏更新結果:
  - `200`: キャッシュ本文とメタを更新
  - `304`: キャッシュ本文は据え置き、鮮度メタ（`fetched_at` など）のみ更新
  - 失敗: 既存キャッシュを維持し、次回に再試行
- `max_stale`（24h）超過キャッシュしかない場合:
  - 同期でオリジン取得して待つ

## 6. 受け入れ基準

- `GET /api/foo.json` を2回呼ぶ
  - 1回目: ミス -> オリジン取得 -> キャッシュ保存
  - 2回目: ヒット -> 即返却 + 条件一致時に裏更新実行
- `Authorization` 付き `GET /api/foo.json`
  - 常にバイパスされ、キャッシュされない
- `4xx` / `5xx`
  - キャッシュされない
- `1MB` 超レスポンス
  - キャッシュされない

## 7. 観測性

- 必須ログ項目:
  - `cache_status`（`hit` / `miss` / `bypass` / `stale`）
  - `cache_key_hash`（生キーは出力しない）
  - `origin_status`
  - `origin_ms`
  - `revalidate_result`（`success` / `failed` / `skipped`）
  - `reason`（バイパス理由・失敗理由）
- メトリクス最小セット:
  - ヒット率
  - オリジン到達率
  - 裏更新失敗率
  - `origin_ms` p95
- アラート:
  - 裏更新失敗率が5分平均で `20%` 超

## 8. ロールアウト

- 低リスクAPI 2〜3本で先行有効化
- 問題がなければ全 `/api/**/*.json` に段階展開

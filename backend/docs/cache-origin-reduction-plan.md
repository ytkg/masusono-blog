# Cloud Run オリジン到達率削減メモ

- 最終更新: 2026-02-11
- 目的: Cloud Run のコールドスタート影響を抑えるため、オリジン到達率を下げる
- 方針: まずは追加コストを極小化し、キャッシュで回避する

## 1. 背景

- 現状: Cloud Run は約15分無アクセス後にコールドスタートが発生し、初回応答が遅くなる
- 制約: 追加コストは可能な限り避けたい（常時起動は原則使わない）

## 2. このメモの使い方

- 話し合いで決まった内容を「決定事項」に追記する
- 未確定の論点は「未決事項」に残す
- 実装や検証は「実行ログ」に日付付きで追記する

## 3. 決定事項（現時点）

1. 目標は「高速化」より「Cloud Run への到達率を下げる」
2. 優先順位は以下
   - 静的配信をオリジン分離する（Cloud Storage + Cloud CDN 等）
   - CDN キャッシュを強化する
   - URL 設計をキャッシュフレンドリーにする（ハッシュ付きアセット）
   - 必要時のみ低コストなウォーム運用を検討する
3. まずは min instances を使わずに改善を試す
4. PWA Service Worker キャッシュは補助的に利用する
   - 再訪ユーザーのオリジン到達率を下げる効果は高い
   - 初回訪問や新規ユーザーのオリジン到達は減らせないため、主戦略は CDN とする

## 4. 推奨キャッシュ方針（初期案）

- 静的アセット（`*.js`, `*.css`, 画像）:
  - `Cache-Control: public, max-age=31536000, immutable`
- HTML:
  - `Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=600`
- API（リアルタイム性が不要なもの）:
  - `Cache-Control: public, max-age=0, s-maxage=60-300, stale-while-revalidate=300-600`
- 共通:
  - `ETag` を返す
  - `If-None-Match` 一致時は `304 Not Modified`

## 5. 未決事項

- Cloud CDN 前段化の対象パス:
  - `/`（HTML）
  - `/assets/*`（静的）
  - `/app/*.json`（API）
- API の許容鮮度:
  - Numbers / Rankings を何秒キャッシュできるか
- 認証付きエンドポイントの有無:
  - `Authorization` ヘッダ付きはキャッシュ制約が強いため別設計が必要

## 6. 次アクション

1. 現行レスポンスヘッダの棚卸し（本番の `Cache-Control` / `ETag` 有無）
2. パス単位の TTL 表を作成
3. 変更後に CDN ヒット率と Cloud Run リクエスト数を比較

## 7. 実行ログ

### 2026-02-11

- 初版作成
- 追加コストを抑えつつオリジン到達率を下げる方針を確定
- `/` のコード確認を実施
  - `HomeController#show` は `render inertia: "Home"` のみで、サーバー側のユーザー分岐は未実装
  - ただしレイアウトに `csrf_meta_tags` があり、HTMLへCSRFトークンを埋め込む構成
  - クライアント側では `ensureUserIdCookie()` が `user_id` Cookie を生成（表示内容の分岐には未使用）
  - 方針: `/` を共有キャッシュする場合は、CSRFトークンを含むHTMLキャッシュの扱いを要検討
- Service Worker の現状実装を確認
  - 既に `registerServiceWorker()` が本番で `/service-worker.js` を登録
  - `service-worker.js` はオフラインページの precache と、同一オリジンGETの runtime cache を実装
  - 位置づけ: SW は再訪の体感改善とオリジン削減に有効。ただし全体最適は CDN 併用が前提
- `/` を Service Worker で 1 日キャッシュする実装を追加
  - 対象: 同一オリジンのナビゲーション `pathname === "/"`
  - TTL: 24時間（`ROOT_CACHE_TTL_MS`）
  - 期限内はキャッシュ返却、期限切れはネットワーク再取得
  - ネットワーク失敗時は期限切れキャッシュをフォールバック利用
- `/` キャッシュ返却時のバックグラウンドウォームを追加
  - `/` へのナビゲーション時に `event.waitUntil()` で `/up?sw_warm=1` を非同期実行
  - クールダウン 10 分（`ORIGIN_WARMUP_COOLDOWN_MS`）で過剰ウォームを抑制
  - warmup リクエストは SW キャッシュを経由せず `cache: no-store` でオリジン到達
- SW のキャッシュ範囲を絞り込み
  - 問題: 同一オリジン GET の汎用分岐で `/` 以外もキャッシュされていた
  - 対応: 最終分岐を `fetch(event.request)` のみに変更し、汎用キャッシュを停止
  - 影響: SWキャッシュ対象は実質 `"/"`（TTL管理）とPWAアセットのみ

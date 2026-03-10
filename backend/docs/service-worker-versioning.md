# Service Worker 更新手順

- 対象ファイル: `backend/public/service-worker.js`
- 現行方針: `CACHE_NAME` を明示的に更新してキャッシュを切り替える

## 更新が必要なケース

- `PRECACHE_URLS` を追加・削除したとき
- オフラインフォールバックの挙動を変えたとき
- PWA アセットのキャッシュ条件を変えたとき
- 古いキャッシュを確実に捨てたい変更を入れたとき

## 手順

1. `public/service-worker.js` の `CACHE_NAME` を次のバージョンへ更新する  
   例: `masusono-cache-v8` -> `masusono-cache-v9`
2. 必要なら `PRECACHE_URLS` を更新する
3. 本番反映後、`activate` で旧 `masusono-cache-*` が削除されることを前提に確認する
4. 実機またはブラウザで以下を確認する
   - 新しい Service Worker が登録される
   - `/offline.html` がオフライン時に表示される
   - `manifest.webmanifest` と icons が取得できる

## 開発時の補足

- `app/frontend/entrypoints/inertia.jsx` では `import.meta.env.DEV` のときに Service Worker を unregister し、`masusono-cache-*` を削除する
- そのため、開発中は通常 `CACHE_NAME` を更新しなくてよい

## 注意点

- `CACHE_NAME` を更新しないまま `PRECACHE_URLS` だけ変えても、既存利用者には古いキャッシュが残る可能性がある
- キャッシュ破棄を伴う変更では、PR に更新理由を書いておく

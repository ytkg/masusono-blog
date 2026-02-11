# Inertia Rails 移行計画

- 最終更新: 2026-02-11
- 対象: `backend` (Rails) + `frontend` (React SPA)
- 参照: `https://inertia-rails.dev/llms-full.txt`

## 1. このドキュメントの目的

- いま何が移行済みで、何が未移行かを一目で分かるようにする
- 実装順序と完了条件を明確にする
- 壁打ち用の論点を整理し、意思決定を残す

## 2. 移行方針（確定）

- 方針: 段階移行（Strangler Fig）
- 方針詳細:
  - 既存 API（`*.json`）は当面維持
  - 画面は Inertia に順次寄せる
  - 小さくリリースし、ロールバック可能な単位で進める

## 3. 現在地（サマリー）

### 3.1 ページ移行状況

- [x] `/` (Home)
- [x] `/about`
- [x] `/blog`
- [x] `/blog/:articleId`
- [x] `/podcast`
- [x] `/podcast/:episodeId`
- [x] `/shop`

### 3.2 基盤整備状況

- [x] Inertia Rails / Vite Rails 導入
- [x] Inertia レイアウト / エントリポイント作成
- [x] Docker 開発環境（Rails + Vite）整備
- [x] MUI テーマ / 共通レイアウト（Header/Footer）移植
- [x] Shop 地図（Leaflet）移植
- [x] Home の `HomeAppLaunchers` / `AppsDrawerLauncher` 移植
- [x] `MasudaRun` 本体（キャンバスゲーム）移植

## 4. 残タスク（優先度順）

### P0: リリース整備（先に終わらせる）

- [ ] `/shop` -> `/shops` の最終切替
  - 画面URLを `/shops` に戻し、`/shop` は 301 リダイレクトへ変更
  - `sitemap` / canonical / 内部リンク / 手動確認チェックリストを同時更新
- [ ] API コントローラーの段階的削除計画を確定
  - 利用中エンドポイントの棚卸し
  - 廃止対象と廃止時期（告知含む）を決める

### P1: 運用・監視

- [ ] 監視メトリクス定義（エラー率・レイテンシ）
  - 監視対象: `/up`, 主要画面, `*.json`, `sitemap.xml`
  - しきい値と通知先（Slack/メール等）を確定

### P2: 後片付け

- [ ] 旧 `frontend` 資産の扱いを決定
  - 削除するか、アーカイブとして残すか
  - CI/README/Runbook の参照先を `backend` 中心に統一

## 4.1 厳しめ棚卸し（2026-02-10）

### ページ移植

- ページ本体（`/`, `/about`, `/blog`, `/blog/:id`, `/podcast`, `/podcast/:id`, `/shop`）は移植済み

### 機能差分（未解消）

- [x] `/shops` の画面互換差分は許容（既知・対応不要）
  - 旧SPAは `/shops` が画面URL
  - 現状は `/shop` が画面、`/shops` は JSON API（`resources :shops`）
- [x] sitemap の `/shops` 出力差分は許容（既知・対応不要）
- [x] ScrollRestoration の同等処理を移植
- [x] `ensureUserIdCookie` の同等処理を移植
- [x] OGP/Twitter メタの更新処理を同等化

### PWA 差分（進行中）

- [x] `manifest.webmanifest` の配信
- [x] Service Worker（`/service-worker.js`）登録（最小構成）
- [x] `theme-color` / Apple touch icon / icon assets の配信
- [x] オフライン時のフォールバック方針（`/offline.html`）を実装
- [x] iOS/Android のインストール導線確認（Androidは実機未所持のため確認スキップ）

## 5. Podcast ミニプレイヤー確認チェック

- [x] `/podcast` で任意エピソード再生時にミニプレイヤーが表示される
- [x] 展開時に再生/一時停止・10秒送り/戻し・シークが機能する
- [x] 縮小ボタンでサムネイル表示へ切り替わる
- [x] サムネイルをドラッグ移動できる（クリック競合なし）
- [x] 閉じると非表示になり、再生再開で再表示される
- [x] `/podcast/:episodeId` 遷移後も再生状態が維持される

## 6. API と命名の扱い

- API は当面維持（`/articles.json`, `/podcasts.json`, `/shops.json` など）
- API コントローラー（`app/controllers/api/*`）は段階移行のための暫定実装
  - 最終的には削除予定（Inertia 画面への完全切替完了後）
- ドキュメント上の機能セクション名は単数で統一:
  - `Shop`（旧: `Shops`）
- 画面URLは段階移行中のみ `/shop` を利用し、完全切替後に `/shops` へ戻す
- API エンドポイント名を変更する場合は別タスクで扱う
  - 互換性影響があるため、移行完了後に判断する

## 7. 直近の実装順（提案）

1. `/shop` -> `/shops` の最終切替を実施
2. 監視メトリクス（エラー率/レイテンシ）を確定
3. API コントローラーの削除計画を確定
4. 旧 `frontend` 資産の扱いを確定

## 8. 意思決定メモ（未確定）

- [ ] API を最終的にどこまで公開維持するか
- [ ] `/shop` から `/shops` 切替のタイミング（告知有無含む）
- [ ] 旧 `frontend` ディレクトリの最終扱い（削除/保管）

## 9. PWA 実機確認チェックリスト

### 9.1 Android (Chrome)

- [x] 今回は実機未所持のため対象外（確認スキップ）

### 9.2 iOS (Safari)

- [x] `/` へアクセス後、共有メニュー経由の案内文言が表示される
- [x] 「ホーム画面に追加」後、ホーム画面から起動できる
- [x] 起動後に主要導線（Home / Blog / Podcast / Shop）が表示・遷移できる
- [x] ネットワークOFFで新規遷移時、`/offline.html` が表示される

### 9.3 判定と記録

- [x] iOS で導線・起動・オフライン表示が確認できた
- [x] 端末OS/ブラウザバージョンと結果を本ドキュメントへ追記した

## 10. 切り戻し手順

### 10.1 切り戻し判断基準

- 主要導線（`/`, `/blog`, `/podcast`, `/shop`）で継続的な 5xx が発生する
- PWA 導入後に起動不能・白画面・深刻な表示崩れが再現する
- API 応答が契約を満たさず、主要機能が実質停止する

### 10.2 切り戻し対象

- Rails ルーティング変更（`PagesController` / `Api` 名前空間）
- Inertia エントリ・レイアウト周辺
- PWA 関連ファイル（`manifest.webmanifest`, `service-worker.js`, `offline.html`）

### 10.3 実施手順

1. 直近安定版の Git タグまたはコミットを特定する
2. リリースブランチを安定版コミットへ戻して再デプロイする
3. ブラウザキャッシュ/Service Worker 影響を抑える
   - `service-worker.js` はバージョンが進んだ状態で配信する
   - 必要に応じて SW 登録解除コードを一時反映する
4. ヘルスチェックと主要導線を確認する
   - `/up`
   - `/`, `/about`, `/blog`, `/podcast`, `/shop`
   - `/articles.json`, `/podcasts.json`, `/metrics.json`, `/shops.json`, `/sitemap.xml`
5. 障害チャネルに「切り戻し完了」と「影響範囲」を共有する

### 10.4 確認コマンド（例）

```bash
curl -i https://<host>/up
curl -i https://<host>/
curl -i https://<host>/blog
curl -i https://<host>/podcast
curl -i https://<host>/shop
curl -i https://<host>/articles.json
curl -i https://<host>/podcasts.json
curl -i https://<host>/metrics.json
curl -i https://<host>/shops.json
curl -i https://<host>/sitemap.xml
```

### 10.5 ロールフォワード条件

- 原因と再発防止策（最小1件）が整理されている
- ステージングで request spec + 主要導線の手動確認が完了している
- PWA 更新影響（SW/キャッシュ）を含む確認が完了している

## 11. 最終動作確認チェックリスト

### 11.1 画面遷移

- [x] `/` が表示される
- [x] `/about` が表示される
- [x] `/blog` が表示される
- [x] `/blog/:id`（存在する記事）が表示される
- [x] `/blog/:id`（存在しない記事）で 404 表示になる
- [x] `/podcast` が表示される
- [x] `/podcast/:id`（存在する回）が表示される
- [x] `/podcast/:id`（存在しない回）で 404 表示になる
- [x] `/shop` が表示される

### 11.2 Home / アプリランチャー

- [x] Home の時刻表示が1秒ごとに更新される
- [x] Home の `HomeAppLaunchers` から各アプリが開ける
- [x] `MasudaRun` が起動し、操作できる
- [x] `Numbers` が数値カードを表示できる
- [x] `Settings` が開ける

### 11.3 Blog

- [x] 記事一覧が表示される
- [x] 記事カードから詳細へ遷移できる
- [x] 詳細から「記事一覧に戻る」で一覧へ戻れる

### 11.4 Podcast / ミニプレイヤー

- [x] 一覧から再生開始できる
- [x] 再生中に別ページへ遷移しても再生が継続する
- [x] ミニプレイヤー展開で再生/一時停止・10秒送り/戻し・シークができる
- [x] ミニプレイヤー縮小時にサムネイル表示される
- [x] 縮小サムネイルをドラッグ移動できる
- [x] サムネイル画像が期待アイコンで表示される
- [x] 閉じる操作後、再生再開で再表示される

### 11.5 Shop

- [x] 地図が表示される
- [x] カテゴリフィルタが動作する
- [x] 店カード選択で地図上のフォーカスが連動する
- [x] 店カードの外部リンクが開ける

### 11.6 API / 契約

- [x] `/articles.json` が 200 + JSON を返す
- [x] `/podcasts.json` が 200 + JSON を返す
- [x] `/metrics.json` が 200 + JSON を返す
- [x] `/shops.json` が 200 + JSON を返す
- [x] `/sitemap.xml` が 200 + XML を返す

### 11.7 SEO / メタ

- [x] 各ページで title が正しく切り替わる
- [x] 各ページで canonical が正しい
- [x] `og:title` / `og:description` / `og:url` が設定される
- [x] `twitter:title` / `twitter:description` が設定される

### 11.8 PWA

- [x] `manifest.webmanifest` が配信される
- [x] `service-worker.js` が配信され、登録される
- [x] iOS でホーム画面追加して起動できる
- [x] オフライン時に `offline.html` が表示される

### 11.9 記録

- [x] 実施環境（URL / ブラウザ / OS / 日時）を記録した
- [x] NG項目があれば再現手順とログを記録した
- [x] 最終判定（Go / No-Go）を記録した

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
  - 画面分離のための BFF エンドポイント（`/app/*`）と `sitemap.xml` を維持
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

## 4. 残タスク（2026-02-11 時点）

- [x] `/shop` は単数URLのまま維持する（`/shops` へは戻さない）
- [x] `sitemap.xml` は `SitemapsController`（ネームスペースなし）で配信
- [ ] 監視（Cloud Monitoring）は保留
  - 現時点では導入しない
  - 必要時に `/up` + 主要導線 + `/app/*.json` + `/sitemap.xml` を対象に再検討

## 4.1 厳しめ棚卸し（2026-02-10）

### ページ移植

- ページ本体（`/`, `/about`, `/blog`, `/blog/:id`, `/podcast`, `/podcast/:id`, `/shop`）は移植済み

### 機能差分（未解消）

- [x] `/shops` の画面互換差分は許容（既知・対応不要）
  - 旧SPAは `/shops` が画面URL
  - 現状は `/shop` が画面（旧 `/shops` JSON API は削除済み）
- [x] sitemap の `/shops` 出力差分は許容（既知・対応不要）
- [x] ScrollRestoration の同等処理を移植
- [x] `ensureUserIdCookie` の同等処理を移植
- [x] OGP/Twitter メタの更新処理を同等化

### PWA 差分（完了）

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

- ページ組み替え耐性のため、アプリ単位 BFF エンドポイントを維持
  - `GET /app/numbers/metrics.json`
  - `GET /app/masuda_run/rankings.json`
- `GET /sitemap.xml` は公開配信のため維持
- `sitemap.xml` は `SitemapsController` で配信
- ドキュメント上の機能セクション名は単数で統一:
  - `Shop`（旧: `Shops`）
- 画面URLは `/shop` を正式採用する
- API エンドポイント名を変更する場合は別タスクで扱う
  - 互換性影響があるため、移行完了後に判断する

## 7. 直近の実装順（提案）

1. 監視導入が必要になった時点で Cloud Monitoring を設定
2. 運用上の確認項目（手動スモーク）のみ維持
3. 大きな機能追加時に本ドキュメントを更新

## 8. 意思決定メモ（確定）

- [x] `sitemap.xml` の配置: `SitemapsController`（ネームスペースなし）
- [x] URL 方針: `/shop` を維持
- [x] 旧 `frontend` ディレクトリの扱い: 削除済み

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
   - `/app/numbers/metrics.json`, `/app/masuda_run/rankings.json`, `/sitemap.xml`
5. 障害チャネルに「切り戻し完了」と「影響範囲」を共有する

### 10.4 確認コマンド（例）

```bash
curl -i https://<host>/up
curl -i https://<host>/
curl -i https://<host>/blog
curl -i https://<host>/podcast
curl -i https://<host>/shop
curl -i https://<host>/app/numbers/metrics.json
curl -i https://<host>/app/masuda_run/rankings.json
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

- [x] `/app/numbers/metrics.json` が 200 + JSON を返す
- [x] `/app/masuda_run/rankings.json` が 200 + JSON を返す
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

## 12. 完全に非API化する設計メモ

### 12.1 方針

- `*.json` エンドポイントは原則廃止する
- 画面データは Inertia の `props` で返す
- 画面内の再取得は Inertia の再訪問（`router.reload`）で行う

### 12.2 対象（2026-02-11 時点）

- 廃止済み:
  - `/metrics.json`
  - `/masuda_run/rankings.json`
- 置換済み:
  - `/app/numbers/metrics.json`
  - `/app/masuda_run/rankings.json`
- 維持:
  - `/sitemap.xml`（公開サイト向け配信のため）

### 12.3 実装結果

1. `metrics` / `masuda_run/rankings` の旧JSON APIを削除
2. `HomeController#show` から該当データ取得を除外
3. `GET /app/numbers/metrics.json` / `GET /app/masuda_run/rankings.json` を追加
4. Home 内ミニアプリは「ドロワー起動時に `/app/*` を取得」へ変更
5. request spec / 契約ドキュメントを新エンドポイントに更新

### 12.4 注意点

- ランキングを高頻度で更新すると、Inertia 再訪問による負荷が増える
- リアルタイム性が必要な場合は、該当機能のみ別方式（SSE 等）を検討する

## 13. Inertia Rails 改善候補（`llms-full.txt` 照合）

- 作成日: 2026-02-11
- 参照: `https://inertia-rails.dev/llms-full.txt`
- 目的: 現状実装とのギャップを整理し、着手順を明確にする

### 13.1 優先度 High

- [x] Asset versioning を有効化する
  - 現状:
    - `config/initializers/inertia_rails.rb` に `version` 設定がない
  - 期待効果:
    - デプロイ後の古いフロント資産参照（キャッシュ食い違い）を抑止
  - 対応案:
    - `inertia_config(version: ...)` を設定し、Vite 側のビルドバージョンに連動させる

- [ ] ページ解決を lazy import 化する（初期JS削減）
  - 現状:
    - `app/frontend/entrypoints/inertia.jsx` で `import.meta.glob(..., { eager: true })`
  - 期待効果:
    - 初回ロードを軽量化し、遷移時に必要ページのみ読み込む
  - 対応案:
    - `createInertiaApp` の `resolve` を async 化し、遅延読み込みへ変更する

- [x] 共有 props（`inertia_share`）を `ApplicationController` に集約する
  - 現状:
    - `ApplicationController` で共通共有データ定義がない
  - 期待効果:
    - ページ間の共通データ注入を統一し、重複実装を削減
  - 対応案:
    - flash、共通メタ、必要な環境情報のみをサーバー側で共有する

### 13.2 優先度 Medium

- [ ] 重い props を Deferred / Optional 化する
  - 現状:
    - `BlogIndexUsecase` などで外部取得由来データを同期で組み立て
  - 期待効果:
    - 初回表示を優先し、重いデータは後段読み込みに分離できる
  - 対応案:
    - `InertiaRails.optional` / `InertiaRails.defer` と partial reload を併用する

- [x] `Link` の prefetch を導線単位で導入する
  - 現状:
    - グローバルナビや一覧導線で `prefetch` 未設定
  - 期待効果:
    - 体感遷移速度を改善
  - 対応案:
    - 高頻度遷移導線のみ段階導入し、外部API負荷を計測しながら調整する

- [x] request spec を Inertia 構造検証寄りに寄せる
  - 現状:
    - `response.body` の文字列一致中心
  - 期待効果:
    - マークアップ変更に強いテストへ改善
  - 対応案:
    - component 名と props の検証を中心にしたテストへ移行する

### 13.3 優先度 Low

- [ ] 履歴暗号化（history encryption）の適用を検討する
  - 現状:
    - `render inertia:` 時に暗号化フラグ未利用
  - 期待効果:
    - 履歴経由で保持される情報の露出リスクを低減
  - 対応案:
    - センシティブな props を扱う画面から限定適用する

### 13.4 推奨着手順

- [x] Asset versioning
- [ ] Lazy import 化
- [x] `inertia_share` 基盤
- [ ] Deferred / Optional props
- [x] prefetch とテスト改善

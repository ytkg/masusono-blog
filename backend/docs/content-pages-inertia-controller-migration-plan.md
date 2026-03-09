# コンテンツページ Inertia Controller 移行設計メモ

- 最終更新: 2026-02-16
- 目的: クライアント側 API 取得をやめ、Inertia Rails のサーバーprops返却に統一する
- 前提: キャッシュ戦略は採用せず、Cloud Run は定期ヘルスチェック運用（`docs/cloud-run-warmup-strategy.md`）

## 1. 背景

現状のコンテンツページは、ページ遷移後にフロントエンドが `GET /api/...` を呼び出して描画データを取得している。
この構成では、初回表示時に追加のHTTP往復が発生するため、コールドスタート時の体感遅延が目立ちやすい。

## 2. 方針（決定）

1. コンテンツページは Inertia Controller でデータを組み立てて返す
2. ページ表示のためのクライアント側 `fetch`/`useSWR` は廃止する
3. 既存の整形ロジックは Usecase を再利用し、レスポンス契約の重複を避ける
4. 画面URLは現状維持（`/blog`, `/blog/:article_id`, `/podcast`, `/podcast/:episode_id`, `/shop`）

## 3. 移行対象

- 一覧ページ:
  - `/blog`
  - `/podcast`
  - `/shop`
- 詳細ページ:
  - `/blog/:article_id`
  - `/podcast/:episode_id`

## 4. サーバー構成案

- 追加Controller（例）:
  - `BlogController#index`
  - `BlogController#show`
  - `PodcastController#index`
  - `PodcastController#show`
  - `ShopController#index`
- データ取得:
  - `Api::Blog::ArticlesIndexUsecase`
  - `Api::Podcast::EpisodesIndexUsecase`
  - `Api::Shop::ShopsIndexUsecase`
- 描画:
  - `render inertia: "Blog", props: ...`
  - `render inertia: "BlogDetail", props: ...`
  - `render inertia: "Podcast", props: ...`
  - `render inertia: "PodcastDetail", props: ...`
  - `render inertia: "Shop", props: ...`

## 5. props 契約案

- `Blog#index`
  - `articles: Array<Article>`
- `Blog#show`
  - `article: Article | null`
  - `notFound: Boolean`
- `Podcast#index`
  - `episodes: Array<Episode>`
- `Podcast#show`
  - `episode: Episode | null`
  - `notFound: Boolean`
- `Shop#index`
  - `shops: Array<Shop>`

補足:
- `show` は未存在ID時の扱いを「404レスポンス」または「200 + notFound props」に統一する。
- 既存仕様との整合上、まずは controller 側で明示的に方針決定してから実装する。

## 6. フロントエンド変更方針

- `useSWR` / `fetchJson` ベースの取得を対象ページから除去
- ページコンポーネントは Inertia props を直接受け取る
- ローディング表示（初回API待ち前提）は不要化
- エラー表示は「ページ描画失敗」より「サーバー側ステータス/エラーページ」に寄せる

## 7. APIエンドポイントの扱い

- 旧 `/api/blog/articles.json`, `/api/podcast/episodes.json`, `/api/shop/shops.json` は廃止済み
- 継続して公開するJSON APIは app系エンドポイントと `/sitemap.xml` のみ

## 8. 段階移行手順

1. Controller と route を追加（既存画面URLを controller 経由へ）
2. 各 page を server props 参照に置換
3. 不要 hook（`useArticles`, `useArticle`, `useEpisodes`, `useEpisode`, `useShops`）を削除
4. request spec / routing spec を server props 前提に更新
5. 廃止した旧コンテンツAPIの request spec は削除する

## 9. 受け入れ条件

- コンテンツページ表示時に対象 `GET /api/...` が発生しない
- `/blog`, `/podcast`, `/shop` の初期表示で必要データが props に存在する
- 詳細ページで未存在IDの挙動が方針どおりに統一される
- 既存の主要UI（一覧表示・詳細表示・戻る導線）が維持される

## 10. 未決事項

1. 詳細ページ未存在時の仕様を 404 と 200(notFound) のどちらに統一するか
2. 互換維持APIの廃止タイミング
3. Inertia partial reload の利用有無（初版は不採用想定）

## 11. 実装時チェック（メモ）

- 変更後に実行:
  - `docker compose run --rm backend bundle exec rubocop`
  - `docker compose run --rm backend bundle exec rspec`
- ドキュメント更新:
  - `docs/inertia-migration-plan.md`
  - `README.md`（必要に応じてデータ取得方式の記述を更新）

# masusono-blog

[![ruby coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fytkg%2Fmasusono-blog%2Fcoverage-badges%2Fruby.json)](https://github.com/ytkg/masusono-blog/actions/workflows/backend-rspec.yml)
[![frontend coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fytkg%2Fmasusono-blog%2Fcoverage-badges%2Ffrontend.json)](https://github.com/ytkg/masusono-blog/actions/workflows/frontend-vitest.yml)

masusono-blog の Rails アプリケーションです。公開ページは Inertia + React/Vite で提供し、一部の機能を JSON API、RSS、サイトマップとして提供します。

詳しい仕様・運用手順は [目的別の目次](docs/README.md) から、作業に必要な項目だけ参照してください。

## ローカル開発

以下はすべてリポジトリルートで実行します。

```bash
docker compose up --build
```

管理対象の worktree では、ポートとボリュームを分離するため、通常の `docker compose` の代わりに次のラッパーを使います。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh up --build -d
```

初回は Vite の依存関係インストールに少し時間がかかります。Rails は `http://localhost:3000`、Vite は `http://localhost:3036` で起動します。

Dockerを使わない場合は、Rails と Vite を別々に起動します。

```bash
bin/dev
```

別ターミナルで:

```bash
npm run dev
```

`bin/dev` は Rails サーバーのみを起動するため、画面確認では `npm run dev` も必要です。Ruby/Bundler は `rbenv` 経由で実行してください。

## ブラウザごとの表示設定

[表示設定](docs/display-settings.md) を参照してください。

## エンドポイント

### 管理ミニアプリ

「その他！」から管理ミニアプリを開けます。ログイン・ダッシュボード・メディア一覧・記事一覧は
同じ画面内で切り替わり、ブラウザの URL は変わりません。ログインは `auth.takagi.dev` の認証 API を使い、
認証に成功したアカウントが利用できます。ログイン状態は最長7日間で、
期限後は再ログインが必要です。microCMS のメディア一覧ではファイル名検索とプレビュー、記事一覧ではタイトル検索と公開状態の絞り込みができます。各一覧は初回20件を取得し、追加分は「もっと見る」を押したときに取得します。
メディア一覧から画像を1件アップロードできます。画像以外と5MBを超える画像は送信前とサーバー側で拒否します。削除、複数ファイルの一括アップロード、ドラッグ＆ドロップ、記事投稿は提供しません。

メディア一覧では既存の `microcms.api_key` を使います。microCMS の API キー設定で、
マネジメント API の「メディアの取得」と「メディアのアップロード」権限を追加してください。キーはサーバー側だけで使い、
画面には送信しません。

記事一覧にも同じキーをサーバー側だけで使います。microCMS の API キー設定で、マネジメント API の
「コンテンツの取得（一覧・詳細）」、Content API の「GET」「下書き全取得」「公開終了全取得」権限を追加してください。
一覧は記事本文を取得せず、管理 API の状態・更新日時と Content API の `id,title` を結合して表示します。

管理ミニアプリは、認証状態・ログイン・メディア取得／アップロード・記事取得に `/api/app/management/` 以下の
JSON API を使います。認証トークンは画面へ返さず Rails セッションに保持し、
ログインとメディアアップロードのリクエストは CSRF トークンで保護します。

- `GET /api/app/articles?offset=0`
  - トップページ用に公開記事を10件ずつ取得。次の取得位置は `pagination.nextOffset`（末尾は `null`）。初回のトップページも10件だけ取得し、スクロールで追加読み込みする。
- `POST /api/app/navigation_failures`
  - 画面遷移の異常を診断ログに記録する。確認方法は [画面遷移エラーの診断](docs/navigation-error-diagnostics.md) を参照
- `GET /api/app/users/:user_id.json`
  - `user_id` に対応するユーザー情報を返す
- `POST /api/app/users.json`
  - ユーザー情報を登録する
- `GET /api/app/masuda_run/rankings.json`
  - 増田RUNアプリ用ランキング配列を返す
- `POST /api/app/masuda_run/rankings.json`
  - 増田RUNのランキングを登録する
- `POST /api/app/masuda_tataki/points.json`
  - 増田たたきの終了時にスコア分のポイントを付与する（0点・途中終了は対象外、失敗時の自動再送なし）
- `GET /api/app/web_push/vapid_key.json`
  - Web Push公開鍵を返す
- `GET /api/app/web_push/subscription.json?endpoint=...`
  - 通知の購読がサーバーの配信対象に登録されているかを返す
- `POST` / `DELETE /api/app/web_push/subscription.json`
  - Web Pushの購読を登録・解除する
- `GET /sitemap.xml`
  - 公開用サイトマップXMLを返す
- `GET /feed.xml`
  - ブログ記事全件のRSSフィードを返す

## 記事バックアップ

[記事バックアップとタグ更新](docs/article-backup.md) を参照してください。

## キャッシュ方針

キャッシュ最適化は採用せず、Cloud Run のウォーム維持を主戦略とします。

- `ApiController` 配下のレスポンスは `Cache-Control: no-store` を返します
- Cloud Run のウォーム維持方針は `docs/cloud-run-warmup-strategy.md` を参照してください

## Web Push

[Web Push](docs/web-push.md) を参照してください。

## APIエラーレスポンス仕様

API で例外が発生した場合、レスポンス形式は次に統一します。

```json
{
  "error": {
    "code": "upstream_timeout",
    "message": "Upstream service request timed out.",
    "request_id": "7c4f8b7e-6d38-4a17-b6a1-1db1f31c2a6e"
  }
}
```

`ApiController` でのマッピング（メッセージ定義は `ApplicationController`）:

- `Microcms::FetchContentsService::FetchError`
  - upstream `408` -> `504 Gateway Timeout` (`upstream_timeout`)
  - upstream `429` -> `503 Service Unavailable` (`upstream_rate_limited`)
  - upstream `400..499` -> `424 Failed Dependency` (`upstream_client_error`)
  - upstream `500..599` -> `502 Bad Gateway` (`upstream_server_error`)
- `Faraday::TimeoutError` -> `504 Gateway Timeout` (`upstream_timeout`)
- `Faraday::ConnectionFailed` -> `502 Bad Gateway` (`upstream_connection_error`)
- その他の `Faraday::Error` -> `502 Bad Gateway` (`upstream_error`)

補足:
- 依存先（microCMS/HTTP）起因の障害は 5xx または 424 で返します。
- `error.request_id` は Rails の request id で、アプリログとの突合に使います。
- エラーレスポンスでは `Cache-Control: no-store` を返し、失敗レスポンスをキャッシュしません。

## APIレスポンス契約のキー記載順

`docs/api-response-contract.md` では、可読性のために次の順序でキーを記載します。

1. 識別子（例: `id`）
2. 表示名（例: `title` / `name` / `label`）
3. 時系列情報（例: `publishedDate` / `lastmod`）
4. その他の属性

注記: JSON のキー順は本質的契約ではなく、上記はドキュメント表記の統一ルールです。

## レスポンス整形責務

[バックエンドの責務](docs/architecture.md) を参照してください。

## API変更時の手順

[API 変更ルール](docs/architecture.md#api-変更手順) を参照してください。

## ドキュメント相互整合性チェック（APIパス）

次の2ファイルで API パスをそろえる:

- `README.md`
- `docs/api-response-contract.md`

確認コマンド（リポジトリルートで実行）:

```bash
git grep -nE "(/api/app/users/:user_id\\.json|/api/app/masuda_run/rankings\\.json)" -- README.md docs/api-response-contract.md
git grep -nE '(^|`)/app/(users|masuda_run/rankings)\.json' -- README.md docs/api-response-contract.md || true
```

判定:

- 1本目のコマンドは2ファイルすべてにヒットすること
- 2本目のコマンドはヒットしないこと

## 運用メモ

- ドキュメント目次: `docs/README.md`
- Cloud Run ウォーム維持戦略: `docs/cloud-run-warmup-strategy.md`
- 改善バックログ（候補一覧）: `docs/improvement-backlog.md`

## microCMS ページング保護

`Microcms::FetchContentsService` では、異常レスポンスや過大取得による過負荷を防ぐために以下のガードを入れています。

- 不正メタ（例: `limit <= 0`）を検知した場合は追加ページ取得を中断し、警告ログを出します
- 最大ページ数: `MICROCMS_MAX_PAGES`（デフォルト: `100`）
- 最大取得件数: `MICROCMS_MAX_TOTAL_COUNT`（デフォルト: `10000`）

環境変数が未設定、空文字、または不正値の場合はデフォルト値を使います。

## バックエンドのLint/テスト

リポジトリルートで実行します:

```bash
docker compose run --rm backend bundle exec rubocop
docker compose run --rm backend bundle exec rspec
```

ローカルで GitHub Actions 相当の主要チェックをまとめて回す場合:

```bash
rbenv exec bin/ci
```

`config/ci.rb` はセットアップ、RuboCop、bundler-audit、Brakeman、テストDB準備、
RSpec、ESLint、Prettier、Vitest、本番 SSR バンドルのテストを順に実行します。
bundler-audit は既知の脆弱性を検出すると失敗し、現行設定に ignore はありません。
Brakeman は警告または解析エラーで失敗します。`npm audit` はこのチェックに含みません。

## フロントエンドのLint/Format/テスト

リポジトリルートで実行します:

```bash
docker compose run --rm backend npm run lint
docker compose run --rm backend npm run format:check
docker compose run --rm backend npm run format
docker compose run --rm backend npm test
```

Vitest の同時実行数はローカルで最大2、`CI` 環境で最大4です。Docker 上で
Rails・ブラウザとリソースを共有するため、CPU数だけで並列数を増やさず、同時に生成する jsdom 環境を抑えます。
フロントエンド全テストと Visual Regression は順番に実行してください。
他の worktree でも重い検証を同時に実行している場合は、終了を待つか、
`npm test -- --maxWorkers=1` でさらに並列数を減らせます。

管理対象の worktree では、上記の `docker compose` の代わりに worktree ルートから
`.codex/skills/masusono-worktree/scripts/compose.sh` を使います。Visual Regression の手順は
[test/visual/README.md](test/visual/README.md) を参照してください。

## Cloud Run へのデプロイ

[Cloud Run へのデプロイ](docs/deployment.md) を参照してください。

## 記事のOGP画像

記事詳細の共有用画像は既存ロゴと記事タイトルから自動生成します。仕様・キャッシュ・画像プレビュー・検証方法は [記事のOGP画像](docs/article-ogp.md) を参照してください。

## トップページ・記事詳細のSSR

[トップページ・記事詳細のSSR](docs/ssr.md) を参照してください。

## 作業環境

変更作業は Git worktree で分離します。手順は [AGENTS.md](AGENTS.md) を参照してください。

## 旧 backend ディレクトリからの移行

Rails アプリケーションはリポジトリ直下に配置しています。`app/frontend/` を含め、コマンドはリポジトリルートで実行します。

既存 checkout の `backend/` にある Git 管理外のファイルは、Git の更新では移動されません。旧 `backend/` は Git・Docker・Cloud Run の除外対象として残し、秘密情報や古い DB の誤取り込みを防ぎます。必要な `config/master.key`・環境ファイル・`storage/` のローカル DB は、起動前に新しい配置先に同名ファイルがないことを確認して個別に移してください。不要なログやビルド出力は再生成できます。管理対象 worktree の再生成可能なデータは、通常の片付け手順に従います。

### 本棚ミニアプリ

`GET /api/app/bookshelf` と `GET /api/app/bookshelf/:isbn/cover` を使用します。[取得・公開前の設定と削除窓口](docs/bookshelf.md)、[レスポンス契約](docs/api-response-contract.md)を参照してください。

## テストカバレッジ

[テストカバレッジ](docs/coverage.md) を参照してください。

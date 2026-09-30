# Backend contributor guide

`backend/` は Rails 8.1 / Ruby 4.0.1 のアプリケーションです。公開ページは
Inertia + React/Vite で提供し、一部の機能は JSON API、RSS、サイトマップとして
提供しています。このファイルは、このディレクトリ配下で作業するエージェント向けの
実装・検証ルールです。

## 作業の基本

- 変更前に、対象の実装・テスト・設定・関連ドキュメントを読み、既存の命名と設計に
  合わせる。無関係なリファクタリングやロックファイルの更新は含めない。
- Ruby は `.ruby-version` で固定された **4.0.1** を使う。ホストのシステム Ruby
  （macOS では 2.6 のことがある）や `/usr/bin/bundle` は使わない。
- ホストで Ruby を実行する場合は `rbenv exec` を使う。環境差を避けたい場合は、以下の
  Docker Compose コマンドを `backend/` で実行する。
- worktree で作業する場合は、リポジトリルートの
  `.codex/skills/masusono-worktree/scripts/compose.sh` を使う。以降の `docker compose`
  の例は通常の `backend/` 作業用であり、worktree では同じ引数をこのラッパーへ渡す。
- 秘密情報（`config/master.key`、`RAILS_MASTER_KEY`、microCMS キー、ADC の内容）を
  表示・コミット・ログ出力しない。値が必要な作業は、変数名と設定方法だけを案内する。
- デプロイ、データ削除、microCMS の更新、BigQuery への書き込みなど外部状態を変える
  操作は、ユーザーが明示的に依頼した場合だけ実行する。実行前に対象と影響範囲を確認する。

## ローカル開発

すべて `backend/` で実行する。

```bash
docker compose up --build
```

Rails は `http://localhost:3000`、Vite は `http://localhost:3036` で起動する。
Docker を使わない場合は、rbenv で `bin/dev` を実行し、別ターミナルで Node.js 22 により
`npm run dev` を実行する。依存関係の更新では lockfile に従い `npm ci` を優先し、意図しない
`package-lock.json` の差分を作らない。

## 実装方針

- HTML ページは Inertia の props を返す。ページ固有のデータ整形は `app/usecases/`、表示は
  `app/frontend/` に置き、コントローラは usecase 呼び出しと render に留める。
- JSON API のレスポンス整形も usecase が担う。API を変更する場合は
  `docs/api-response-contract.md` と request spec を同じ変更で更新する。
- API は `ApiController` の共通エラー形式、`Cache-Control: no-store`、request ID を維持する。
  upstream（microCMS）エラーを個別コントローラで握りつぶしたり、成功レスポンスとして返したりしない。
- 外部 HTTP は既存の `Microcms::*` サービスを再利用し、テストでは WebMock でネットワークを
  無効化する。実ネットワークに依存するテストは追加しない。
- `import.meta.glob` でページを読み込む箇所では、`*.test.jsx` と `*.spec.jsx` を除外する。
- 公開 URL、API、RSS、サイトマップに関わる変更では、ルート、関連ドキュメント、テストを
  まとめて見直す。

## テストの規約

- RSpec の usecase spec は原則として `subject(:result) { described_class.call }` を使う。
- 共通の mock/stub は外側の `before` に置き、`context` では差分だけを `let` などで上書きする。
- 戻り値または例外を検証しているときは、同じ振る舞いに対する冗長な interaction expectation を
  追加しない。
- `before` 内だけで使う値はローカル変数にし、上書きが必要なテストデータだけを `let` にする。

## 検証

変更範囲に応じて、少なくとも対応するチェックを実行する。Ruby とフロントエンドの両方に
影響する変更、またはリリース前の確認では `bin/ci` を優先する。
画面の見た目を変更した場合は、対象画面の Visual Regression も実行する。差分が意図したものなら、実画像・差分画像を確認して基準画像を同じ PR で更新し、更新後にもう一度比較を成功させる。基準画像の更新だけを目的にコマンドを実行しない。具体的な手順は [Visual Regression README](test/visual/README.md) を参照する。

```bash
# Ruby の静的解析とテスト（Docker）
docker compose run --rm backend bundle exec rubocop
docker compose run --rm backend bundle exec rspec

# ホスト環境（Ruby 4.0.1 と Node.js 22 が準備済みの場合）
bin/ci

# フロントエンドだけを変更した場合
npm run lint
npm run format:check
npm test
```

RSpec がデータベース準備を必要とする環境では、先に
`RAILS_ENV=test bin/rails db:prepare` を実行する。検証できない場合は、実行していない
コマンドとその理由を完了報告に明記する。自動修正コマンドは、対象外の差分を生まないことを
確認してから使う。

## 運用タスク

- 記事のタグ更新は `README.md` の「記事バックアップ」の手順に従う。候補を確認して
  `add` / `remove` と最終タグを提案し、ユーザーの承認後にだけ microCMS へ適用する。
- BigQuery 操作には `BIGQUERY_PROJECT_ID` と `BIGQUERY_DATASET_ID`、およびホストの ADC が必要。
  認証情報をリポジトリ内へコピーしない。
- Cloud Run へのデプロイは `deploy.sh` を使うが、これは本番環境を変更する操作であるため、
  明示依頼と確認なしに実行しない。

## 参考

- ローカル起動・API・記事運用: `README.md`
- API 契約: `docs/api-response-contract.md`
- Cloud Run のウォーム維持: `docs/cloud-run-warmup-strategy.md`
- GitHub Actions と同等のチェック: `config/ci.rb`

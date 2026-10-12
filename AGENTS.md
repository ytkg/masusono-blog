# masusono-blog contributor guide

このリポジトリの本体はリポジトリ直下の Rails 8.1 / Ruby 4.0.1 アプリケーションです。画面は Inertia + React/Vite、外部コンテンツは microCMS、デプロイ先は Cloud Run です。

## 作業ツリー

コード・設定・ドキュメントを変更する作業は、必ず worktree で行います。作業開始前に `.codex/skills/masusono-worktree/SKILL.md` を読み、次で作成します。

```bash
.codex/skills/masusono-worktree/scripts/create-worktree.sh <task-slug> [base-ref]
```

作成後は worktree ルートで、Docker Compose のラッパーを使います。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh up --build
```

`main` で直接変更せず、未追跡ファイルや他の worktree の変更にも触れません。
PR 作成後は、ユーザーが作業環境の保持または起動継続を指定した場合を除き、
その作業の worktree・ローカルブランチ・専用ボリュームと、再生成可能な開発・テスト用DBを
片付けます。マージや追加の削除指示を待つ必要はありません。

削除前に、変更が push 済みで PR のリモートブランチに保存されていることと、
追跡ファイルの変更・未追跡ファイルがないことを確認します。GitHub の PR とリモートブランチは
残し、CI確認は片付け後も継続します。追加作業やローカル検証が必要になった場合は、
対象の PR ブランチから worktree と開発環境を作り直します。

片付けでは、その worktree の Compose ラッパーの `down` でコンテナとネットワークを削除します。
`stop` だけではネットワークが残り、worktree が増えるとアドレスプールが枯渇します。
専用ボリュームは所有プロジェクトと未使用を確認して対象名で削除し、一括削除は行いません。
他の作業環境には触れません。必要な独自データや用途不明のファイルは保全し、
必要なものだけ確認します。不要なDBの退避コピーを作る必要はありません。
対象の確認と削除方法は [masusono-worktree スキルの「不要な作業環境の削除」](.codex/skills/masusono-worktree/SKILL.md#不要な作業環境の削除) に従います。

## 変更依頼とPull Request

コード・設定・依存関係・ドキュメントの変更依頼では、GitHub Issue の有無にかかわらず、
ユーザーから停止指示、レビューのみの依頼、または PR作成不要の指定がない限り、
実装・必要な検証・コミット・push・Pull Request作成までを一連の作業として完了する。
変更や検証の完了だけで作業を終了しない。

Pull Request には実行した検証を記載する。対応する GitHub Issue がある場合は、
`Closes #<番号>` で紐づける。

push は worktree 内の `scripts/push.sh` を使う。画面に関わる変更がある場合は全画面の
Visual Regression が成功するまで push しない。絞り込んだテストの成功を最終検証の代わりにしない。

## 実装と検証

- 実装・テスト規約はこのファイルの「実装方針」「テストの規約」に従う。
- 秘密情報、Rails master key、microCMS APIキー、Google Cloud認証情報を表示・コミットしない。
- Rubyは `.ruby-version` のバージョンを使う。Docker Compose を優先し、ホストで実行する場合は `rbenv exec` を使う。
- 変更範囲に応じたテストと静的解析を実行し、未実施の検証は理由とともに報告する。

通常の開発環境では、リポジトリルートから次を実行する。

```bash
docker compose run --rm backend bundle exec rspec
docker compose run --rm backend bundle exec rubocop
docker compose run --rm backend npm run lint
docker compose run --rm backend npm run format:check
docker compose run --rm backend npm test
```

リポジトリルートで実行する通常の開発手順では `docker compose` だけでよい。一方、管理対象の
worktree ではポート・ボリュームを分離するため、必ず
`.codex/skills/masusono-worktree/scripts/compose.sh` を使う。

## 外部サービス

Cloud Run デプロイ、microCMS更新・削除、BigQuery書き込み、GCPのIAM・ストレージ操作は外部状態を変更します。ユーザーから明示依頼を受け、対象と影響範囲を確認してから実行します。

ステージングデプロイを依頼されたら、まず [PR のステージングデプロイ手順](docs/staging-deployment.md) に従う。
通常は対象 PR への `ステージングデプロイ` ラベル付与で実行する。ラベル操作とリモートの完了確認だけなら
ローカル worktree や Docker 環境を再作成しない。対象コミットの workflow と PR コメントのコミット、
URL 上の反映内容を確認して報告する。手順で解決できない場合だけ関連 workflow やスクリプトを調査する。

## 実装方針

- アプリケーションの Controller は、1 アクションにつき専用の Usecase を1つ呼ぶ。
  URL の別名が同じアクションへ到達する場合は同じ Usecase を使う。薄い Usecase も許す。
  Rails のヘルスチェックとルート定義のリダイレクトはアプリケーションのアクションに含めない。
- Usecase は Controller からのみ呼ぶ。Usecase 同士の呼び出しや、Job・Batch からの呼び出しはしない。
  共通の処理は `app/services/` または Model に置き、各入口から利用する。
- Controller は HTTP の入出力、認証・CSRF・セッション管理、HTTP ステータス、render・redirect を担う。
  Usecase の結果や例外を HTTP ステータスへ変換し、Usecase から HTTP ステータスを返さない。
- Usecase は処理の順序を組み立て、最終的な Inertia props・JSON 等のレスポンスデータを整形する。
  HTTP 固有の CSRF トークン等は Controller で付加する。表示は `app/frontend/` に置く。
- Concern は独立した小さい補助メソッドの共有に使う。アクションの処理手順を隠す用途には使わない。
  複数層で共有する補助メソッドは `app/services/concerns/` に置く。
- JSON API を変更する場合は `docs/api-response-contract.md` と request spec を同じ変更で更新する。
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
画面の見た目を変更した場合は、worktree ルートの `scripts/check-visual.sh` で全画面の Visual Regression を実行する。共通部品は別画面・長文・展開・通知・フォーカスなどにも影響するため、対象画面だけの成功を最終検証にしない。差分が意図したものなら、実画像・差分画像を確認して基準画像を同じ PR で更新し、更新後に全画面の比較を成功させる。基準画像の更新だけを目的にコマンドを実行しない。コミット後の push には `scripts/push.sh` を使う。具体的な手順は [Visual Regression README](test/visual/README.md) を参照する。

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

フロントエンド全テストと Visual Regression は順番に実行する。同じホストで両者を
同時に走らせると、CPU・メモリの競合でタイムアウトすることがある。Vitest の
同時実行数は `vite.config.ts` でローカル最大2・CI最大4に制限している。

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

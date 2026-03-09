# 改善バックログ（2026-03-10 再棚卸し）

- 最終更新: 2026-03-10
- 目的: `backend` の改善候補を実装事実ベースで管理し、着手順を明確にする
- 調査範囲: `README.md`, `AGENTS.md`, `docs/*.md`, `.github/*`, `config/*`, `app/**/*`, `spec/**/*`

## 0. 監査サマリー（今回の確定事項）

- [x] API パスを `README.md` / `docs/inertia-migration-plan.md` / `docs/api-response-contract.md` で `/api/app/...` に統一済み
- [x] 上記3ファイルの相互整合性チェック手順を追加済み
- [x] Dependabot に npm エコシステム更新を追加済み（`.github/dependabot.yml`）
- [x] フロント単体テスト基盤（Vitest + React Testing Library）は導入済み
- [x] `SeoHead` の canonical は絶対URL出力へ統一済み
- [x] バックログに残っていた `ApplicationController#inertia_render` / `MICROCMS_*_ENDPOINT` は現行コード上で未検出
- [ ] CI の test ジョブが `bin/rails db:test:prepare test` のままで、RSpec中心運用と乖離
- [ ] CI に frontend lint / format check が未追加
- [ ] PR テンプレートが未整備（`.github/pull_request_template.md` なし）
- [x] ドキュメント内に旧表記が残存（`/app/*`, `/app/*.json`）
- [x] `sitemap.xml` の静的URLに `/shops` が残り、画面URL `/shop` と不整合

## 1. P0（今週）

- [ ] CI test を `bundle exec rspec` ベースに移行する（`.github/workflows/ci.yml`）
- [ ] CI に `npm run lint` / `npm run format:check` を追加する
- [x] `sitemap.xml` の `/shops` 方針を決定する（`/shop` へ変更 or `/shops` リダイレクト追加）
- [ ] `spec/routing/routes_spec.rb` に `/api/app/*`, `/sitemap.xml`, `/up` のルーティング検証を追加する
- [ ] API エラーレスポンスに `request_id` を含める（調査容易化）
- [x] `docs/inertia-migration-plan.md` の `/app/*` / `/app/*.json` を `/api/app/*` 系に統一する
- [x] Cloud Run ウォーム維持戦略を正本に統一し、旧キャッシュ戦略 docs を廃止する

## 2. P1（次スプリント）

- [ ] `bin/ci` を CI 本体と同じ実行内容に揃える（Ruby lint/test + frontend lint）
- [ ] API controller / usecase の返却契約を統一する（`{ json:, status: }` 形式に寄せるかを決定）
- [x] 未使用コードを整理する（`ApplicationController#inertia_render`, `MICROCMS_*_ENDPOINT`）
- [ ] `docs/` の目次ページを追加し、運用導線を一本化する
- [ ] `bundler-audit` 設定のプレースホルダ（`CVE-THAT-DOES-NOT-APPLY`）を実運用値へ更新する
- [ ] PR テンプレートを追加し、影響範囲/検証観点/ロールバック手順を固定化する

## 3. P2（品質・設計）

- [x] フロント単体テスト基盤（Vitest）を導入し、hooks / shared lib から優先してテスト追加
- [ ] 主要導線の E2E（Playwright）を最小構成で導入（`/`, `/blog`, `/podcast`, `/shop`）
- [ ] `fetchJson` のエラー表現を API 契約（`error.code`, `error.message`）へ接続する
- [ ] SWR hook の重複パターンを共通化する（一覧系 hook のボイラープレート削減）
- [x] `SeoHead` の canonical を絶対URL出力へ統一する
- [ ] `ApiController` の `no-store` 契約を request spec で網羅し、回帰を防止する
- [ ] `MetricsIndexUsecase`（231行）の責務分割を検討する

## 4. セキュリティ・運用

- [ ] `config/environments/production.rb` の `force_ssl` / `host_authorization` の運用方針を確定する
- [ ] CORS 許可 origin を環境変数で管理できる形へ変更する（`config/initializers/cors.rb`）
- [ ] `deploy.sh` の `RAILS_MASTER_KEY` 直渡しを廃止し、Secret Manager 等へ移行する
- [ ] `bundler-audit` / `npm audit` の fail 条件を文書化し、CIに組み込む
- [ ] SAST / Secret scan（CodeQL, Gitleaks 等）導入可否を決定する
- [ ] 構造化ログ（JSON）を標準化し、`request_id`, `path`, `status`, `duration_ms` を必須化する

## 5. データ・外部連携

- [ ] microCMS タイムアウト値（10s/5s）を環境変数化する
- [ ] microCMS 再試行ポリシー（429/5xx）を実装し、specで固定する
- [ ] upstream 障害時のフォールバック戦略（前回成功データ利用可否）を決める
- [ ] Cloud Scheduler の実行間隔と監視項目を見直し、ウォーム維持運用へ反映する
- [ ] Cloud Run での SQLite（`storage/*.sqlite3`）運用を継続するか再評価する

## 6. 小さめ改善（細かい候補）

- [ ] `docs/inertia-migration-plan.md` / `docs/cloud-run-warmup-strategy.md` の最終更新日を現状へ更新する
- [ ] `spec/requests` に `/up` の正常系を追加する
- [ ] `README.md` に `bin/ci` の位置づけと実行例を追記する
- [ ] `bin/dev`（ホスト実行時）の Vite 同時起動方針を明記する
- [ ] CI で RSpec 結果（JUnit等）をアーティファクト化する
- [ ] GitHub Actions に path filter を導入し、不要ジョブを抑制する
- [ ] Service Worker のバージョン更新手順をドキュメント化する

## 7. バックログ運用ルール

- [ ] 各項目に owner（担当）と target date（期限）を付与する
- [ ] 実施しない項目は削除せず、理由を1行で追記する
- [ ] 毎週1回 P0/P1 を見直し、P2以降は隔週で棚卸しする

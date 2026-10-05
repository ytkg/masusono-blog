# 改善バックログ（2026-10-05 実装照合）

- 最終更新: 2026-10-05
- 目的: `backend` の改善候補を実装事実ベースで管理し、着手順を明確にする
- 調査範囲: `README.md`, `AGENTS.md`, `docs/*.md`, `.github/*`, `config/*`, `app/**/*`, `spec/**/*`

本書は改善候補の一覧です。未完了項目の優先度・担当・期限は別途判断が必要です。
削除済みの移行計画や旧 URL に関する項目は過去の対応履歴として記載しています。

## 0. 監査サマリー（実装で確認した事項）

- [x] 現行 API パスを `README.md` / `docs/api-response-contract.md` で `/api/app/...` に統一済み（移行計画は撤去済み）
- [x] 上記2ファイルの相互整合性チェック手順を追加済み
- [x] Dependabot に npm エコシステム更新を追加済み（`.github/dependabot.yml`）
- [x] フロント単体テスト基盤（Vitest + React Testing Library）は導入済み
- [x] `SeoHead` の canonical は絶対URL出力へ統一済み
- [x] バックログに残っていた `ApplicationController#inertia_render` / `MICROCMS_*_ENDPOINT` は現行コード上で未検出
- [x] CI の test ジョブが `bundle exec rspec` ベースへ移行済み
- [x] CI に frontend lint / format check を追加済み
- [x] PR テンプレートを追加済み（`backend/.github/pull_request_template.md`。リポジトリルートの `.github/` には配置されていない）
- [x] 旧 API 表記（`/app/*`, `/app/*.json`）を修正済み
- [x] 旧ショップ URL の不整合は解消済み。現行の routes / sitemap に `/shop`・`/shops` はない

## 1. P0（過去の対応履歴）

- [x] CI test を `bundle exec rspec` ベースに移行する（現行: `.github/workflows/backend-rspec.yml`）
- [x] CI に `npm run lint` / `npm run format:check` を追加する（現行: `.github/workflows/frontend-eslint.yml` / `frontend-prettier.yml`）
- [x] `sitemap.xml` の `/shops` 方針を決定する（`/shop` へ変更 or `/shops` リダイレクト追加）
- [x] `spec/routing/routes_spec.rb` に `/api/app/*`, `/sitemap.xml`, `/up` のルーティング検証を追加する
- [x] API エラーレスポンスに `request_id` を含める（調査容易化）
- [x] `docs/inertia-migration-plan.md` の `/app/*` / `/app/*.json` を `/api/app/*` 系に統一する
- [x] Cloud Run ウォーム維持戦略を正本に統一し、旧キャッシュ戦略 docs を廃止する

## 2. P1（過去の対応履歴）

- [x] `bin/ci` を CI 本体と同じ実行内容に揃える（Ruby lint/test + frontend lint）
- [x] controller / usecase の返却契約を統一する（Inertia は `{ props:, status: }`、API は `{ json:, status: }`、XML は `{ body:, content_type:, status: }`）
- [x] 未使用コードを整理する（`ApplicationController#inertia_render`, `MICROCMS_*_ENDPOINT`）
- [x] `docs/` の目次ページを追加し、運用導線を一本化する
- [x] `bundler-audit` 設定のプレースホルダ（`CVE-THAT-DOES-NOT-APPLY`）を削除し、ignore なし運用へ更新した
- [x] `backend/.github/pull_request_template.md` に影響範囲/検証観点/ロールバック手順を記載済み
- [ ] PR テンプレートを当初の配置予定であるリポジトリルートの `.github/` に配置する

## 3. P2（品質・設計）

- [x] フロント単体テスト基盤（Vitest）を導入し、hooks / shared lib から優先してテスト追加
- [x] 主要導線のブラウザE2Eは撤去済み。主要確認は request spec / frontend test に集約
- [x] `fetchJson` の `ApiError` に `status`, `code`, `message`, `requestId` を接続済み（`app/frontend/shared/lib/fetchJson.js`）
- [x] 共通の `useApiSWR` を導入済み。現行の利用箇所は増田RUNランキング（公開ページは Inertia props、管理一覧は `useAdminList` を使用）
- [x] `SeoHead` の canonical を絶対URL出力へ統一する
- [x] `ApiController` の `no-store` 契約を request spec で網羅し、回帰を防止する
- [x] `MetricsIndexUsecase` の責務を分割した（article 集計 / payload 構築 / orchestration）

## 4. セキュリティ・運用

- [x] `assume_ssl` / `force_ssl` と `ProductionSecurity::ALLOWED_HOSTS` を設定済み（`docs/production-https-host-authorization.md`）
- [ ] CORS 許可 origin を環境変数で管理できる形へ変更する（`config/initializers/cors.rb`）
- [x] `deploy.sh` は環境変数の直渡しを削除し、Secret Manager の `rails-master-key:latest` を使用
- [x] `bundler-audit` は ignore なしで CI / `bin/ci` に導入済み。失敗条件は README に記載
- [ ] `npm audit` の失敗条件を決め、CI に組み込む（未導入）
- [x] SAST は Brakeman を CI / `bin/ci` に導入済み（警告・解析エラーで失敗）
- [ ] Secret scan（Gitleaks 等）や追加の CodeQL 導入可否を決定する
- [x] 本番ログを JSON 化し、`request_completed` に `request_id`, `path`, `status`, `duration_ms` を記録済み（`lib/structured_logging/`）

## 5. データ・外部連携

- [ ] microCMS タイムアウト値（10s/5s）を環境変数化する
- [ ] microCMS 再試行ポリシー（429/5xx）を実装し、specで固定する
- [ ] upstream 障害時のフォールバック戦略（前回成功データ利用可否）を決める
- [ ] Cloud Scheduler の実行間隔と監視項目を見直し、ウォーム維持運用へ反映する
- [ ] Cloud Run での SQLite（`storage/*.sqlite3`）運用を継続するか再評価する

## 6. 小さめ改善（細かい候補）

- [x] `docs/inertia-migration-plan.md` / `docs/cloud-run-warmup-strategy.md` の最終更新日を現状へ更新する
- [x] `spec/requests` に `/up` の正常系を追加する
- [x] `README.md` に `bin/ci` の位置づけと実行例を追記する
- [x] `bin/dev`（ホスト実行時）の Vite 同時起動方針を明記する
- [ ] CI で RSpec 結果（JUnit等）をアーティファクト化する
- [x] Ruby / frontend の個別 CI workflow に path filter を導入済み。全画面 Visual Regression は全 PR で実行する
- [x] Service Worker のバージョン更新手順をドキュメント化する

## 7. バックログ運用ルール

- [ ] 各項目に owner（担当）と target date（期限）を付与する
- [ ] 実施しない項目は削除せず、理由を1行で追記する
- [ ] 毎週1回 P0/P1 を見直し、P2以降は隔週で棚卸しする

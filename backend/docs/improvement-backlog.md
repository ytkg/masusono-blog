# 改善バックログ（2026-02-13 更新）

- 最終更新: 2026-02-13
- 目的: `backend` の改善候補を「実装事実ベース」で優先度管理する
- 調査範囲: `README.md`, `AGENTS.md`, `.github/workflows/ci.yml`, `.github/dependabot.yml`, `config/routes.rb`, `app/controllers/**/*.rb`, `spec/requests/**/*.rb`, `docs/*.md`

## 0. 監査サマリー（今回反映した事実）

- [x] API エラーフォーマットの統一は実装済み（`error.code`, `error.message`, `no-store`）
- [x] API request spec は主要エンドポイントをカバー済み（`spec/requests` 11件）
- [x] Dependabot は Bundler/GitHub Actions の更新が有効
- [ ] `README.md` / 一部 `docs/*.md` の API パスが実装と不一致（`/app/...` と `/api/app/...` が混在）
- [ ] CI の test ジョブが `bin/rails ... test` のままで、現行運用（RSpec中心）と乖離
- [ ] Frontend のテスト基盤（Vitest/Playwright）が未導入
- [ ] PR テンプレートが未作成

## 1. P0（今週着手）

- [ ] ドキュメントの API パスを実装に合わせて統一する（`/api/app/numbers/metrics.json`, `/api/app/masuda_run/rankings.json`）
- [ ] `README.md` / `docs/inertia-migration-plan.md` / `docs/api-response-contract.md` の相互整合性チェックを追加する
- [ ] CI test を `bundle exec rspec` ベースへ移行し、`bin/rails ... test` 依存を解消する
- [ ] CI に frontend lint/format check（`npm run lint`, `npm run format:check`）を追加する
- [ ] エラーレスポンスへ `request_id` を含める（問い合わせ時の調査性向上）

## 2. P1（次スプリント）

- [ ] Dependabot に npm エコシステム更新を追加する（`package.json` 対象）
- [ ] PR テンプレートを作成し、影響範囲/検証項目/ロールバック手順を必須化する
- [ ] `docs/` の目次ページを追加し、運用ドキュメントへの導線を一本化する
- [ ] `bin/ci` を整備し、ローカルで CI 相当（rubocop + rspec + frontend lint）を1コマンド化する
- [ ] `sitemap.xml` の URL 重複・不正日付の検知テストを追加する

## 3. P2（品質と運用の底上げ）

- [ ] フロント単体テスト基盤（Vitest）を導入し、主要 hooks/components に振る舞いテストを追加する
- [ ] 主要導線の E2E（Playwright）を最小セットで導入する（`/`, `/blog`, `/podcast`, `/shop`）
- [ ] 構造化ログ（JSON）を標準化し、`request_id`, `path`, `status`, `duration_ms` を必須化する
- [ ] Cloud Monitoring の最低限アラート（5xx率, p95）を定義する
- [ ] デプロイ後スモークチェック手順を `docs/` に明文化する

## 4. セキュリティ・ガバナンス

- [ ] セキュリティヘッダ方針（CSP, HSTS, X-Content-Type-Options）を定義し段階適用する
- [ ] `bundler-audit` / `npm audit` の fail 条件を CI 運用として明文化する
- [ ] CORS 設定の許可 origin を環境変数化し、環境差分をコード外管理する
- [ ] microCMS API キーのローテーション手順を文書化する
- [ ] SAST/Secret scan（CodeQL/Gitleaks等）の導入可否を決定する

## 5. バックログ運用ルール

- [ ] 各項目に owner（担当）と target date（期限）を付与する
- [ ] 実施しない項目は削除せず、理由を1行で追記する
- [ ] 毎週1回、P0/P1 のみを見直す（P2 は隔週）

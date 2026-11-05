# テスト監査のファイル一覧

一覧の基準: `63509376`。契約照合は PR #844 (`75176fc7`) と [Issue #845](https://github.com/ytkg/masusono-blog/issues/845) と [Issue #847](https://github.com/ytkg/masusono-blog/issues/847) 、[Issue #849](https://github.com/ytkg/masusono-blog/issues/849) 、[Issue #851](https://github.com/ytkg/masusono-blog/issues/851) 、[Issue #853](https://github.com/ytkg/masusono-blog/issues/853)・[Issue #854](https://github.com/ytkg/masusono-blog/issues/854) の変更を含むソースで更新した。全体の目的と完了条件は [監査記録](testing-audit.md)、追跡は [Issue #819](https://github.com/ytkg/masusono-blog/issues/819)。

アプリ・バッチ・運用スクリプト・設定・CI・DB定義を含む。画像・フォント・lockfile・暗号化資格情報・テスト自体は一覧から除く。隣接テスト欄はファイル名からの候補であり、内容を照合した証拠ではない。既存の過去の部分監査を未転記の行も「未照合」にしており、テストがないという意味ではない。

「契約照合済」は現行の呼出元における正常・異常・境界・競合・後始末と、記載したunit / SSR / visualの対応を読み、具体的な残不足がないと判断した状態。任意入力の全組合せや将来仕様の保証ではない。「部分照合」は記載した契約のみ確認済みで、残る確認がある状態。残る確認が必要な場合は理由欄に明記する。全体の完了は未照合と未解決の契約を解消し、unit / request / SSR / visual / scriptの責務を照合してから判定する。

対象 415 ファイル。契約照合済 68件、未照合 331件、部分照合 16件。未照合は既存テストがないという意味ではない。

| 実装ファイル | 状態 | テストまたは候補 | 確認した契約・追加不要理由／残作業 |
| --- | --- | --- | --- |
| `.codex/skills/masusono-worktree/scripts/compose.sh` | 部分照合 | scripts/test_worktree_scripts.py | 環境なしの実行抑止、環境変数と複数引数の保持、Docker終了コードを偽Dockerで照合。 |
| `.codex/skills/masusono-worktree/scripts/create-worktree.sh` | 部分照合 | scripts/test_worktree_scripts.py | slug不正、主worktree、明示base、既存path/branch保護、fetch/base不備、予約・使用中portを一時Gitで照合。並行作成は追加照合が必要。 |
| `.github/scripts/deploy-policy.cjs` | 未照合 | .github/scripts/deploy-policy.test.cjs | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/scripts/publish-coverage.cjs` | 未照合 | .github/scripts/publish-coverage.test.cjs | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/backend-brakeman.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/backend-bundler-audit.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/backend-rspec.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/backend-rubocop.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/cleanup-pr-cloud-run.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/configure-cloud-run-artifact-retention.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/deploy-cloud-run.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/deploy-policy-test.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/deploy-pr-cloud-run.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/frontend-eslint.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/frontend-prettier.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/frontend-visual.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/frontend-vitest.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/label-no-deploy.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `.github/workflows/publish-coverage.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `Dockerfile` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `Dockerfile.visual` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `Dockerfile.visual-backend` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/batches/articles/apply_tag_updates_batch.rb` | 未照合 | spec/batches/articles/apply_tag_updates_batch_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/batches/articles/apply_tag_updates_from_file_batch.rb` | 未照合 | spec/batches/articles/apply_tag_updates_from_file_batch_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/batches/articles/backup_to_bigquery_batch.rb` | 部分照合 | spec/batches/articles/backup_to_bigquery_batch_spec.rb | Issue #853で実microCMS取得の不正contentsを0件とせずload_job/truncateへ進まないことをfake BigQueryで検証。全体のschema/ADC/cleanup照合、件数・ページ保護で返る部分結果をsnapshotに使う契約は未完了。 |
| `app/batches/articles/export_tagging_candidates_batch.rb` | 未照合 | spec/batches/articles/export_tagging_candidates_batch_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/batches/articles/prepare_tagging_batch.rb` | 未照合 | spec/batches/articles/prepare_tagging_batch_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/batches/users/apply_content_id_migration_batch.rb` | 未照合 | spec/batches/users/apply_content_id_migration_batch_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/batches/users/preview_content_id_migration_batch.rb` | 未照合 | spec/batches/users/preview_content_id_migration_batch_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/about_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/admin/articles_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/admin/base_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/admin/media_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/admin/sessions_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api/app/analytics_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api/app/articles_controller.rb` | 契約照合済 | spec/requests/articles_pagination_spec.rb; spec/requests/upstream_response_shape_spec.rb | offset省略0/正常・不正型/配列/Hash/nilの400と通信抑止、JSON status/no-store/統一502・request ID/no-ETagを実usecaseで照合。文字列化で例外になるという仮説は元実装で再現せず、guard追加不要だった。 |
| `app/controllers/api/app/bookshelf_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api/app/calendar_articles_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api/app/masuda_run/rankings_controller.rb` | 契約照合済 | spec/requests/api_app_masuda_run_rankings_spec.rb; spec/requests/api_error_contract_spec.rb; spec/requests/api_string_input_contract_spec.rb | GET/POSTのJSON/type/status/no-storeと共通エラー、実usecaseで小数拒否・整数値互換・付与失敗を照合。 実usecaseのJSON型不正/欠落400と副作用なしをIssue #849で照合。 |
| `app/controllers/api/app/masuda_tataki/points_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api/app/navigation_failures_controller.rb` | 契約照合済 | spec/requests/navigation_failures_spec.rb; spec/requests/production_logging_spec.rb | 型/未知項目/共通header/400、ASCII/UTF8 2048/2049、chunked・長さなし、IP別20/21と期限を前回照合。Issue #851で全公開キーの値と型がloggerへ渡ること、本番経路の機微情報除外・ID相関を追加。 |
| `app/controllers/api/app/sentence_articles_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api/app/users_controller.rb` | 契約照合済 | spec/requests/api_app_users_spec.rb; spec/requests/api_string_input_contract_spec.rb; spec/requests/api_error_contract_spec.rb | path/body入力、JSON/type/status/no-storeと共通エラーを照合。実usecaseを使い型不正/欠落拒否と正常trimを検証。 |
| `app/controllers/api/app/web_push/subscriptions_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api/app/web_push/vapid_keys_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/api_controller.rb` | 部分照合 | spec/requests/api_error_contract_spec.rb; spec/requests/api_app_bookshelf_spec.rb; spec/requests/api_app_masuda_tataki_points_spec.rb | 全6入口の代表4xx/5xx/timeout/connection、408/429、399/400/499/500/599/600の範囲境界、generic Faradayを既存消費側で照合。共通JSON/no-store/no-ETag/requestId。セッション/CSRF方針の全呼出元との照合は残る。 |
| `app/controllers/application_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/article_images_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/authors_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/blog_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/feeds_controller.rb` | 契約照合済 | spec/requests/feeds_spec.rb; spec/requests/api_error_contract_spec.rb | RSS本文/type/status/no-store、120件・重複・不正日時、CORS任意originと4xx/5xx/timeout/connectionの共通JSON。独自分岐のないrender入口に追加unit不要。 |
| `app/controllers/home_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/numbers_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/others_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/search_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/controllers/sitemaps_controller.rb` | 契約照合済 | spec/requests/sitemaps_spec.rb; spec/requests/api_error_contract_spec.rb | XML本文/type/status/no-store、120件・空日時fallback・重複・不正日時、4xx/5xx/timeout/connectionの共通JSON。独自分岐なし。 |
| `app/controllers/webhooks/microcms/articles_controller.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/application/AppProviders.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/application/InertiaApp.jsx` | 未照合 | app/frontend/application/InertiaApp.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/application/pageResolver.jsx` | 契約照合済 | app/frontend/application/pageResolver.test.jsx; test/ssr/*.test.mjs | 大文字小文字・flat/index、既存layout保持、未知ページエラーを照合。production import graphはSSRで、module完了/拒否の診断はnavigationDiagnosticsで保証するため重複fixtureは足さない。 |
| `app/frontend/components/FloatingBottomNavigation.jsx` | 未照合 | app/frontend/components/FloatingBottomNavigation.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/components/Header.jsx` | 未照合 | app/frontend/components/Header.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/components/NavigationFailureDialog.jsx` | 未照合 | app/frontend/components/NavigationFailureDialog.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/components/mainNavigationLinks.jsx` | 未照合 | app/frontend/components/mainNavigationLinks.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/components/navigationStyles.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/entrypoints/inertia.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/entrypoints/inertia.jsx` | 未照合 | app/frontend/entrypoints/inertia.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/AdminApp.jsx` | 未照合 | app/frontend/features/apps/admin/AdminApp.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/AdminArticles.jsx` | 未照合 | app/frontend/features/apps/admin/AdminArticles.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/AdminListFeedback.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/AdminMedia.jsx` | 未照合 | app/frontend/features/apps/admin/AdminMedia.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/AdminSearchForm.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/AdminSectionHeader.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/MediaDetailDialog.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/MediaItemCard.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/MediaPreview.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/MediaUploadField.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/adminListReducer.js` | 契約照合済 | app/frontend/features/apps/admin/adminListReducer.test.js; app/frontend/features/apps/admin/useAdminMedia.test.jsx | 記事/媒体reset差、追加dedup・順序/総数/状態不変、失敗/再試行/初回・追加の待機解除を照合。未知actionは現callerに存在せず、switchのdefaultだけの試験は追加しない。 |
| `app/frontend/features/apps/admin/mediaData.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/admin/useAdminArticles.js` | 部分照合 | app/frontend/features/apps/admin/AdminArticles.test.jsx | 公開状態/日本語query/追加page/再検索とエラー復旧を照合。queryのパラメータ区切り文字を含む検索のconsumer保証は追加照合が必要。 |
| `app/frontend/features/apps/admin/useAdminList.js` | 契約照合済 | app/frontend/features/apps/admin/useAdminMedia.test.jsx; app/frontend/features/apps/admin/AdminApp.test.jsx; app/frontend/features/apps/admin/AdminArticles.test.jsx | 初回と追加の成功/401/通信失敗、検索変更と古い成功/401、古いfinallyの待機状態変更抑止、同時取得抑止、cursor再試行、refresh・離脱abortを照合。URL生成とAPI形状はcaller/Backendの契約。 |
| `app/frontend/features/apps/admin/useAdminMedia.js` | 部分照合 | app/frontend/features/apps/admin/useAdminMedia.test.jsx; app/frontend/features/apps/admin/AdminMedia.test.jsx | 媒体URL/ページ/tokenと件数reset、取得競合と復旧は照合済み。query/tokenの特殊文字を含むURL生成のconsumer保証は追加照合が必要。 |
| `app/frontend/features/apps/admin/useMediaUpload.js` | 契約照合済 | app/frontend/features/apps/admin/useMediaUpload.test.jsx; app/frontend/features/apps/admin/AdminMedia.test.jsx | 選択キャンセル・非画像・5MiB許容/+1拒否、FormData/CSRF、送信中/成功/401/失敗再試行、input復元とref不在を照合。failure.messageなしは標準fetch/ApiErrorでは発生しない防御枝で、型を外した架空例外は足さない。 |
| `app/frontend/features/apps/ads/AdsApp.jsx` | 未照合 | app/frontend/features/apps/ads/AdsApp.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/bookshelf/BookshelfApp.jsx` | 未照合 | app/frontend/features/apps/bookshelf/BookshelfApp.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/bookshelf/useBookshelf.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/greed/FinalRecap.jsx` | 未照合 | app/frontend/features/apps/greed/FinalRecap.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/greed/GreedApp.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/greed/GreedGame.jsx` | 未照合 | app/frontend/features/apps/greed/GreedGame.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/greed/Receipt.jsx` | 未照合 | app/frontend/features/apps/greed/Receipt.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/greed/ReceiptDialog.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/greed/Storefront.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/greed/game.js` | 未照合 | app/frontend/features/apps/greed/game.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/MasudaRunApp.jsx` | 未照合 | app/frontend/features/apps/masudaRun/MasudaRunApp.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/components/GamePrimaryAction.jsx` | 未照合 | app/frontend/features/apps/masudaRun/components/GamePrimaryAction.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/components/GameScoreboard.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/components/MasudaRunGame.jsx` | 未照合 | app/frontend/features/apps/masudaRun/components/MasudaRunGame.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/components/MasudaRunRankings.jsx` | 未照合 | app/frontend/features/apps/masudaRun/components/MasudaRunRankings.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/hooks/useMasudaRunAssets.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/hooks/useMasudaRunInput.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/hooks/useMasudaRunLoop.js` | 部分照合 | app/frontend/features/apps/masudaRun/hooks/useMasudaRunLoop.test.jsx | 固定更新、停止／復帰、衝突記録、RAF解除、canvas/context/監視対象欠落を照合。描画分岐はvisualとの追加照合が必要。 |
| `app/frontend/features/apps/masudaRun/hooks/useMasudaRunRestartCooldown.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/hooks/useRankings.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/canvas.js` | 部分照合 | app/frontend/features/apps/masudaRun/lib/canvas.test.js | 幅・高さ制限、未計測、DPR未定義／0／1未満／2倍を照合。 |
| `app/frontend/features/apps/masudaRun/lib/constants.js` | 未照合 | app/frontend/features/apps/masudaRun/lib/constants.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/draw.js` | 未照合 | app/frontend/features/apps/masudaRun/lib/draw.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/index.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/input.js` | 未照合 | app/frontend/features/apps/masudaRun/lib/input.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/render.js` | 未照合 | app/frontend/features/apps/masudaRun/lib/render.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/time.js` | 未照合 | app/frontend/features/apps/masudaRun/lib/time.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/update.js` | 未照合 | app/frontend/features/apps/masudaRun/lib/update.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaRun/lib/world.js` | 未照合 | app/frontend/features/apps/masudaRun/lib/world.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaSlot/MasudaSlotApp.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaSlot/MasudaSlotGame.jsx` | 未照合 | app/frontend/features/apps/masudaSlot/MasudaSlotGame.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaSlot/SlotHelp.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaSlot/game.js` | 未照合 | app/frontend/features/apps/masudaSlot/game.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaSlot/reels.js` | 未照合 | app/frontend/features/apps/masudaSlot/reels.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaSlot/slot.css` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaTataki/MasudaTatakiApp.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaTataki/MasudaTatakiGame.jsx` | 未照合 | app/frontend/features/apps/masudaTataki/MasudaTatakiGame.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaTataki/MasudaTatakiHole.jsx` | 未照合 | app/frontend/features/apps/masudaTataki/MasudaTatakiHole.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaTataki/TatakiFieldArt.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaTataki/assets.js` | 未照合 | app/frontend/features/apps/masudaTataki/assets.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaTataki/game.js` | 未照合 | app/frontend/features/apps/masudaTataki/game.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/masudaTataki/useMasudaTatakiGame.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/NumbersDistributionChart.jsx` | 未照合 | app/frontend/features/apps/numbers/NumbersDistributionChart.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/NumbersMetricsTable.jsx` | 未照合 | app/frontend/features/apps/numbers/NumbersMetricsTable.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/NumbersPreview.jsx` | 未照合 | app/frontend/features/apps/numbers/NumbersPreview.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/NumbersTrendChart.jsx` | 未照合 | app/frontend/features/apps/numbers/NumbersTrendChart.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/TrendChartDateLabels.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/TrendChartLines.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/TrendChartSelection.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/TrendChartSvg.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/TrendChartTooltip.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/TrendLegend.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/trendChartData.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/trendChartGeometry.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/numbers/trendChartPath.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/settings/SettingsApp.jsx` | 未照合 | app/frontend/features/apps/settings/SettingsApp.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/settings/SettingsSection.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/settings/useDisplayName.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/settings/useWebPushSettings.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/settings/webPush.js` | 未照合 | app/frontend/features/apps/settings/webPush.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/AppActivityContext.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/AppDialogHeader.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/AppLoadingScreen.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/AppsDialogLauncher.jsx` | 未照合 | app/frontend/features/apps/shared/AppsDialogLauncher.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/AppsLoadingContext.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/LauncherZoomTransition.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/appDialogAnimation.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/apps/shared/loadImage.js` | 契約照合済 | app/frontend/features/apps/shared/loadImage.test.js | 成功/失敗、中断済み/進行中abort、遅い成功/失敗の無視、重複settleとイベント/abort購読解除を照合。cache evictはこの関数の契約外。 |
| `app/frontend/features/apps/shared/useAppLoadingTasks.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/authors/AuthorProfile.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/authors/AuthorsList.jsx` | 未照合 | app/frontend/features/authors/AuthorsList.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/authors/authorProfileStyles.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/AllSentenceFeed.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleActions.jsx` | 未照合 | app/frontend/features/blog/ArticleActions.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleAuthorAvatar.jsx` | 未照合 | app/frontend/features/blog/ArticleAuthorAvatar.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleBody.jsx` | 未照合 | app/frontend/features/blog/ArticleBody.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleCard.jsx` | 未照合 | app/frontend/features/blog/ArticleCard.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleHtml.jsx` | 未照合 | app/frontend/features/blog/ArticleHtml.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleMetaText.jsx` | 未照合 | app/frontend/features/blog/ArticleMetaText.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticlePlainHeader.jsx` | 未照合 | app/frontend/features/blog/ArticlePlainHeader.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleSearchBox.jsx` | 未照合 | app/frontend/features/blog/ArticleSearchBox.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleSearchSuggestions.jsx` | 未照合 | app/frontend/features/blog/ArticleSearchSuggestions.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleStructuredHtml.jsx` | 未照合 | app/frontend/features/blog/ArticleStructuredHtml.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticleTags.jsx` | 未照合 | app/frontend/features/blog/ArticleTags.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/ArticlesList.jsx` | 未照合 | app/frontend/features/blog/ArticlesList.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/CalendarFeed.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/CodeBlock.jsx` | 未照合 | app/frontend/features/blog/CodeBlock.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/HighlightedCode.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/HomeTabs.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/LoadMoreArticles.jsx` | 未照合 | app/frontend/features/blog/LoadMoreArticles.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/RubyExecutableCodeBlock.jsx` | 未照合 | app/frontend/features/blog/RubyExecutableCodeBlock.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/SentenceFeed.jsx` | 未照合 | app/frontend/features/blog/SentenceFeed.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/SentenceFeedCard.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/articleBodyHtmlSx.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/articleCopyText.js` | 契約照合済 | app/frontend/features/blog/articleCopyText.test.js | 段落/改行/inline/文字参照、埋込み・hidden・commentの除外、本文なし、preの先頭末尾/入れ子空白、表のth/tdタブと行境界を照合。 |
| `app/frontend/features/blog/articleExcerpt.js` | 未照合 | app/frontend/features/blog/articleExcerpt.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/articleHtmlText.js` | 契約照合済 | app/frontend/features/blog/articleHtmlText.test.js; test/ssr/*.test.mjs | browser/SSRの同じ断片処理、壊れたHTML/不正文字参照/未知entity、inline・block・table境界、埋込み/hidden/comment除外を照合。静的HTML抽出の契約で、CSSのcomputed style解釈は行わない。 |
| `app/frontend/features/blog/articlePages.js` | 契約照合済 | app/frontend/features/blog/articlePages.test.js; app/frontend/pages/home.test.jsx | 配列とcursorのinteger/前進/null契約、初出ID保持・重複排除・元状態の不変・古いscroll除去を照合。取得失敗はHome consumerで空一覧と区別。 |
| `app/frontend/features/blog/articleSearch.js` | 未照合 | app/frontend/features/blog/articleSearch.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/articleSearchTerm.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/articleSearchText.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/articleSearchToken.js` | 未照合 | app/frontend/features/blog/articleSearchToken.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/articleStats.js` | 契約照合済 | app/frontend/features/blog/articleStats.test.js; app/frontend/features/blog/ArticleCard.test.jsx | 正の文字数/0.5分/数値文字列、0・負・非有限・欠落の文字数非表示、有効文字数と不正読了時間の併存を照合。 |
| `app/frontend/features/blog/articleStructuredHtmlParts.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/codeBlockData.js` | 未照合 | app/frontend/features/blog/codeBlockData.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/codeBlockLanguage.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/feedRequests.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/parseArticleTags.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/rubyCodeRunner.worker.js` | 未照合 | app/frontend/features/blog/rubyCodeRunner.worker.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/runRubyCode.js` | 未照合 | app/frontend/features/blog/runRubyCode.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/sentenceArticleData.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/sentenceFeedData.js` | 未照合 | app/frontend/features/blog/sentenceFeedData.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/sentenceFeedItems.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/sentenceFeedLayout.js` | 未照合 | app/frontend/features/blog/sentenceFeedLayout.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/useArticleSearchQuery.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/useCalendarFeed.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/useHomeArticles.js` | 契約照合済 | app/frontend/pages/home.test.jsx; test/visual/home_pagination.visual.js | 重複追加防止、最終cursor、同時取得抑止、同位置再試行、離脱中断・遅い旧応答の無視、履歴/scroll復元と保存失敗時の表示をconsumerで保証。APIページの型/進行性はarticlePagesで保証。 |
| `app/frontend/features/blog/useHomeScrollRestoration.js` | 契約照合済 | app/frontend/features/blog/useHomeScrollRestoration.test.jsx; test/visual/home_pagination.visual.js | 最新一覧/scrollの前景保存・背景無視、二段RAF後の復元、0位置、途中離脱と変更前の予約取消、購読解除を照合。実ブラウザの戻る復元も保証。 |
| `app/frontend/features/blog/useHomeTabState.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/useRememberedFeed.js` | 契約照合済 | app/frontend/pages/home.test.jsx | こよみ/書き出しの遅延取得、空配列キャッシュ、失敗と同URL再試行、tab離脱のabort・古い結果の履歴汚染抑止をconsumerで保証。loadは各callerのPromise関数で、同期例外を投げる架空のloaderは追加しない。 |
| `app/frontend/features/blog/useSentenceFeedLayout.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/useSentenceFeedProgress.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/features/blog/useSentenceFeedState.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/layouts/AppLayout.jsx` | 未照合 | app/frontend/layouts/AppLayout.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/layouts/pageLayout.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/about.jsx` | 未照合 | app/frontend/pages/about.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/authors/index.jsx` | 未照合 | app/frontend/pages/authors/index.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/authors/show.jsx` | 未照合 | app/frontend/pages/authors/show.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/blog/show.jsx` | 未照合 | app/frontend/pages/blog/show.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/errors/not_found.jsx` | 未照合 | app/frontend/pages/errors/not_found.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/home.jsx` | 未照合 | app/frontend/pages/home.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/numbers/index.jsx` | 未照合 | app/frontend/pages/numbers/index.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/others/index.jsx` | 未照合 | app/frontend/pages/others/index.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/pages/search.jsx` | 未照合 | app/frontend/pages/search.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/AuxiliaryIconButton.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/ContentItemCard.jsx` | 未照合 | app/frontend/shared/components/ContentItemCard.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/EmptyStatus.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/LoadingStatus.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/MasusonoAd.jsx` | 未照合 | app/frontend/shared/components/MasusonoAd.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/PageContainer.jsx` | 未照合 | app/frontend/shared/components/PageContainer.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/PageHeading.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/SectionHeading.jsx` | 未照合 | app/frontend/shared/components/SectionHeading.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/SeoHead.jsx` | 未照合 | app/frontend/shared/components/SeoHead.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/components/StatusAlert.jsx` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/hooks/useApiSWR.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/hooks/useImmediateRemember.js` | 契約照合済 | app/frontend/pages/home.test.jsx; test/visual/home_pagination.visual.js | consumerで即時履歴/React状態/refの同期、素早い戻り、旧応答の履歴汚染抑止、履歴保存例外後のページ追加と次cursorを照合。keyは各callerの固定値で、実行中の任意key差替えの新機能は試験対象に足さない。 |
| `app/frontend/shared/hooks/usePageVisible.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/lib/analytics.js` | 契約照合済 | app/frontend/shared/lib/analytics.test.js; test/visual/analytics.visual.js | 許可前のGoogle抑止、公開パス/計測ID/UUID、Cookie・遷移と古い許可応答の競合、再試行、URL/fragment/並行重複、履歴・クリックを照合。実ブラウザのGoogleは偽応答。SSRではeffectの計測呼出しがないため窓不在の枝だけを重複追加しない。 |
| `app/frontend/shared/lib/appendUniqueById.js` | 契約照合済 | app/frontend/features/blog/articlePages.test.js; app/frontend/features/apps/admin/adminListReducer.test.js | IDを持つ記事/媒体配列の既存ID・追加内重複、初出データ/順序保持、元配列の不変を両consumerで保証。helperの同じ入出力を別testへ複製しない。 |
| `app/frontend/shared/lib/fetchJson.js` | 契約照合済 | app/frontend/shared/lib/fetchJson.test.js | no-store、JSON/204/HTTP契約と非JSON、request ID優先、型不正・表示文言のown-key、Headers形式と追記・中断signal、成功JSON失敗とtransport/Abort例外保持を照合。 |
| `app/frontend/shared/lib/homeNavigation.js` | 契約照合済 | app/frontend/shared/lib/homeNavigation.test.js; app/frontend/pages/home.test.jsx | 一度だけのintent、通常/修飾/処理済みクリック、Storage取得/読込/書込/削除の失敗を照合。通常の戻る履歴と明示ホーム操作の区別はHomeの消費側で保証。 |
| `app/frontend/shared/lib/htmlBlockTags.js` | 契約照合済 | app/frontend/features/blog/articleHtmlText.test.js; app/frontend/features/blog/articleCopyText.test.js | 静的タグ集合。代表的block・hr・inlineと前後境界を両parserで保証する。定数一覧をそのまま期待値に複写するだけの試験は追加しない。 |
| `app/frontend/shared/lib/locationEvents.js` | 部分照合 | app/frontend/shared/lib/locationEvents.test.js | パス・検索・ハッシュ、通知イベント、SSRのwindow欠落を照合。 |
| `app/frontend/shared/lib/navigationDiagnostics.js` | 契約照合済 | app/frontend/shared/lib/navigationDiagnostics.test.js; test/visual/navigation_diagnostics.visual.js | 段階・停止/遅延閾値、公開URL/保存値/時刻の境界、Storage/Observer不在、古いmodule/commit/ResourceTiming、背景受付・中断・重複visibility、解除時のtimer/RAFと再登録を照合。実ブラウザでPWA・先読みmodule失敗・復元も保証。cancel済みtimer/RAFをブラウザ仕様に反して実行するだけの分岐試験は追加しない。 |
| `app/frontend/shared/lib/navigationFailureReporter.js` | 部分照合 | app/frontend/shared/lib/navigationFailureReporter.test.js | 個人情報除外、外部URL・壊れたURI、上限、オフライン再送、HTTP失敗の終端、完了callback、解除中失敗を照合。 |
| `app/frontend/shared/lib/navigationPrefetch.js` | 契約照合済 | app/frontend/components/FloatingBottomNavigation.test.jsx; test/visual/home_pagination.visual.js | activeリンク除外、hover/mount、homeの30s/5m、path変更時のremountをconsumerで保証。古い先読みと戻りの競合は実ブラウザで保証。 |
| `app/frontend/shared/lib/navigationRecovery.js` | 契約照合済 | app/frontend/shared/lib/navigationRecovery.test.js; test/visual/navigation_recovery.visual.js | 前景/先読み/非同期の区別、通常Inertia/500/409、network/HTTP失敗・Abort、URLなし/外部URL、finish/navigateの帰属と復旧案内、オフライン再送・上限・購読解除を照合。 |
| `app/frontend/shared/lib/rememberedState.js` | 契約照合済 | app/frontend/shared/lib/rememberedState.test.js; app/frontend/pages/home.test.jsx; test/visual/home_pagination.visual.js | Inertia履歴なしの無操作、既存履歴フィールド保持、即時保存、容量/権限制限での表示・次cursor更新を照合。DataCloneErrorは伝播。履歴不能時の戻る位置保証はしない。PC/スマホで本物のInertiaも検証。 |
| `app/frontend/shared/lib/seasonalLogo.js` | 契約照合済 | app/frontend/shared/lib/seasonalLogo.test.jsx; test/visual/logo_setting.visual.js; test/ssr/*.test.mjs | campaign分離、保存不可/読込拒否/書込拒否、同期/フォーカス/解除、期限・HTTP/HTTPS属性を照合。SSR初期値とrequest間分離は既存production SSR/実ブラウザで保証済みのため重複unitは足さない。 |
| `app/frontend/shared/lib/truncateText.js` | 契約照合済 | app/frontend/features/blog/articleExcerpt.test.js; app/frontend/pages/blog/show.test.jsx | 実callerの80/120 UTF-16予算でexact-fit、切れるemoji・結合文字/旗/家族の保持を照合。callerにない負/小数の任意予算を新しい契約として追加しない。 |
| `app/frontend/shared/lib/useVisibleHealthPhrase.js` | 未照合 | app/frontend/shared/lib/useVisibleHealthPhrase.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/lib/userId.js` | 契約照合済 | app/frontend/shared/lib/userId.test.js | Cookieの既存/作成、encode/decode・期限更新・HTTP/HTTPS属性、壊れたencode、保存不可/読込拒否/UUID API不在を照合。SSRではeffectからの呼出しがない。 |
| `app/frontend/shared/styles/focusStyles.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/styles/supportingActionStyles.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/shared/styles/typographyStyles.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/ssr/ssr.jsx` | 未照合 | app/frontend/ssr/ssr.test.jsx | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/styles/fonts.css` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/styles/index.css` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/frontend/theme.js` | 未照合 | app/frontend/theme.test.js | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/jobs/application_job.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/mailers/application_mailer.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/models/application_record.rb` | 未照合 | spec/models/application_record_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/models/article.rb` | 未照合 | spec/models/article_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/models/article_content_image_url_optimizer.rb` | 未照合 | spec/models/article_content_image_url_optimizer_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/models/author.rb` | 未照合 | spec/models/author_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/models/author_image_url_optimizer.rb` | 契約照合済 | spec/models/author_image_url_optimizer_spec.rb; spec/services/author_payload_builder_spec.rb | microCMS HTTPS画像の192px化・既存query保持/上書き、対象外host/http/relative/不正型/URLの同一値返却。URL汎用parserの契約は別行で照合する。 |
| `app/models/current_request.rb` | 契約照合済 | spec/lib/structured_logging/request_context_spec.rb; spec/requests/production_logging_spec.rb | CurrentAttributesのrequest_id/path宣言のみ。通常/例外時のouter復元と本番連続リクエストでの設定・消去を照合。framework storageを再実装していないため独自thread mock不要。 |
| `app/models/masuda_run_ranking.rb` | 未照合 | spec/models/masuda_run_ranking_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/models/microcms_image_url.rb` | 未照合 | spec/models/microcms_image_url_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/admin/articles_page_builder.rb` | 未照合 | spec/services/admin/articles_page_builder_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/admin/auth_client.rb` | 未照合 | spec/services/admin/auth_client_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/admin/authenticated_session.rb` | 未照合 | spec/services/admin/authenticated_session_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/api/app/web_push/subscription_input.rb` | 未照合 | spec/services/api/app/web_push/subscription_input_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/article_ogp_image.rb` | 未照合 | spec/services/article_ogp_image_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/article_payload_builder.rb` | 未照合 | spec/services/article_payload_builder_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/articles_page_query.rb` | 契約照合済 | spec/requests/articles_pagination_spec.rb; spec/requests/upstream_response_shape_spec.rb | 10進非負offset、初回10/末尾full/部分/空/上流総件数不一致でも空ならcursor停止、実受信件数でのcursor更新、body整形、upstream失敗伝播を実queryで照合。empty guard除去を新規testが検出。 |
| `app/services/author_payload_builder.rb` | 契約照合済 | spec/services/author_payload_builder_spec.rb | id/名前の必須値、payload全キー、画像4別名のString/Hash/欠落/不正型とicon優先を照合。CMSのauthor Hashが呼出元契約。 |
| `app/services/bookshelf/candidates.rb` | 未照合 | spec/services/bookshelf/candidates_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/bookshelf/catalog.rb` | 未照合 | spec/services/bookshelf/catalog_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/bookshelf/cover.rb` | 未照合 | spec/services/bookshelf/cover_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/bookshelf/isbn.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/calendar_date_validator.rb` | 契約照合済 | spec/services/concerns/date_display_formatter_spec.rb; spec/services/{rss,sitemap}_xml_builder_spec.rb; spec/services/numbers/metrics_trend_builder_spec.rb; spec/services/year_ago_articles_builder_spec.rb; spec/services/bookshelf/candidates_spec.rb | 全5呼出元を読み、完全な年月日とDate.valid_date?の検証に統一。部分値に現在日付を補わず、表示/両XML/集計で退行検証。ISO限定の前年検索/本棚は既に部分値を拒否し互換性維持。 |
| `app/services/concerns/author_name_extractor.rb` | 部分照合 | spec/services/author_payload_builder_spec.rb; spec/services/article_payload_builder_spec.rb; spec/services/rss_article_items_builder_spec.rb | 著者Hash/String/nil・名前trim、画像4別名/型とicon優先を消費側で照合。複数キーで上位が空/不正な場合の意図確認が残る。 |
| `app/services/concerns/date_display_formatter.rb` | 契約照合済 | spec/services/concerns/date_display_formatter_spec.rb; spec/services/article_payload_builder_spec.rb; spec/usecases/api/app/masuda_run/rankings_index_usecase_spec.rb | JSTと日越え、date-only正規化、nil/空/不正暦日/部分値の保持、Date/Time/RFC形式の既存互換を照合。 |
| `app/services/concerns/required_user_id.rb` | 契約照合済 | spec/usecases/api/app/users/{create,show}_usecase_spec.rb; spec/usecases/api/app/masuda_run/rankings_create_usecase_spec.rb; spec/requests/api_string_input_contract_spec.rb | 全3呼出元の必須値と非String拒否を照合。JSON nil/空/空白は既存requiredエラーを維持し、数字/bool/配列/Hashは副作用前に拒否。 |
| `app/services/concerns/xml_date_formatter.rb` | 契約照合済 | spec/services/rss_xml_builder_spec.rb; spec/services/sitemap_xml_builder_spec.rb | 両XML呼出元のnil/空白/不正型/存在しない月日、閏日・小数秒・年を跨ぐ両オフセットを照合。失敗は項目を残し日付タグだけ省略。 Issue #849で年月日を欠く文字列の現在日時補完を抑止し、両builderで照合。 |
| `app/services/concerns/xml_escaper.rb` | 契約照合済 | spec/services/rss_xml_builder_spec.rb; spec/services/sitemap_xml_builder_spec.rb | 両XML呼出元で制御文字除去、RSSのテキスト/属性で全5記号と既存entityの文字列復元をstrict/nonet parserで照合。重複するhelper単体テストは追加不要。 |
| `app/services/microcms/articles/update_tags_service.rb` | 未照合 | spec/services/microcms/articles/update_tags_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/connection_factory.rb` | 契約照合済 | spec/services/microcms/connection_factory_spec.rb; spec/requests/upstream_response_shape_spec.rb | timeout10/open_timeout5とURL options保持を既存specで照合。独自retry middlewareはなく、不正応答が再送されないことを実HTTP fixtureの回数でも確認。 |
| `app/services/microcms/create_content_service.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/fetch_articles_service.rb` | 契約照合済 | spec/services/microcms/fetch_articles_service_spec.rb; spec/services/microcms/fetch_articles_page_spec.rb; spec/services/microcms/fetch_response_shape_spec.rb; spec/requests/upstream_response_shape_spec.rb | endpoint指定だけの継承。実HTTP fixtureで通常・厳密な1ページ・不正応答・後続不正を照合。共通取得/認証/上限は親で検証し同じ内部mockを追加しない。 |
| `app/services/microcms/fetch_authors_service.rb` | 契約照合済 | spec/services/microcms/fetch_authors_service_spec.rb; spec/services/microcms/fetch_contents_service_spec.rb | endpointとorders=publishedAtだけを指定。実HTTP fixtureのquery/header/dataと、super.mergeが他の共通引数を保持するsourceを照合。共通JSON/ページ保護は親の対応specで検証。 |
| `app/services/microcms/fetch_contents_service.rb` | 契約照合済 | spec/services/microcms/fetch_contents_service_spec.rb; spec/services/microcms/fetch_response_shape_spec.rb; spec/requests/upstream_response_shape_spec.rb | 初回/追加ページ、filters/ids・認証/順序、最大ページ/件数と不正設定fallback、HTTP失敗優先、strict pageの型/負値/位置不一致/件数制限を照合。Issue #853で不正JSON/過深nest/root/list/要素型をFetchError502へ統一し本文とcauseを抑止。空配列/全件legacy metadataなしを維持し、不正contentsの正常0件化は廃止。 |
| `app/services/microcms/fetch_managed_articles_service.rb` | 未照合 | spec/services/microcms/fetch_managed_articles_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/fetch_media_service.rb` | 未照合 | spec/services/microcms/fetch_media_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/masuda_run/create_ranking_service.rb` | 未照合 | spec/services/microcms/masuda_run/create_ranking_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/masuda_run/fetch_rankings_service.rb` | 契約照合済 | spec/services/microcms/masuda_run/fetch_rankings_service_spec.rb; spec/requests/upstream_response_shape_spec.rb | score/date順・限定10件のquery・limit省略/0/負/不正文字列の全件fallback、総件数0/不明の区別・HTTP失敗優先を照合。現行callerは固定整数limitかnil。限定経路も共通parse_pageへ合流し、不正metadata root/nonStringは任意件数不明nilにする。 |
| `app/services/microcms/upload_media_service.rb` | 未照合 | spec/services/microcms/upload_media_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/users/client.rb` | 未照合 | spec/services/microcms/users/client_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/users/delete_service.rb` | 未照合 | spec/services/microcms/users/delete_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/users/fetch_all_service.rb` | 契約照合済 | spec/services/microcms/fetch_contents_service_spec.rb; spec/services/microcms/fetch_response_shape_spec.rb | users endpoint定数だけの継承。Users Clientと同じURLをsource照合。独自分岐はなく認証/JSON/ページングの契約は共通親で検証し、定数を写すだけのtestは不要。 |
| `app/services/microcms/users/fetch_by_user_id_service.rb` | 未照合 | spec/services/microcms/users/fetch_by_user_id_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/users/fetch_by_user_ids_service.rb` | 未照合 | spec/services/microcms/users/fetch_by_user_ids_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/users/identity.rb` | 未照合 | spec/services/microcms/users/identity_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/users/upsert_by_content_id_service.rb` | 未照合 | spec/services/microcms/users/upsert_by_content_id_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/microcms/web_push_subscriptions_service.rb` | 部分照合 | spec/services/microcms/web_push_subscriptions_service_spec.rb | 既存CRUD/header/HTTP失敗と不正lookupによるPOST/PATCH/DELETE中断をfake HTTPで照合。POST成功の不正JSON/id欠落・lookupのid欠落/型を処理前に検証する契約が残る。 |
| `app/services/navigation_failure_payload_builder.rb` | 契約照合済 | spec/services/navigation_failure_payload_builder_spec.rb; spec/requests/navigation_failures_spec.rb; spec/requests/production_logging_spec.rb | 全kind/stage/controller state/data source/visibility、Boolean・全timing受渡し、不正列挙/型/整数範囲、公開pathの外部/scheme/非公開/不正URI/512境界、token/MIMEのASCII whitelistと100境界、build12桁、検索語/未知項目除去を照合。 |
| `app/services/numbers/article_character_counter.rb` | 契約照合済 | spec/services/numbers/article_character_counter_spec.rb; spec/services/numbers/article_metric_spec.rb | タグ/属性/画像代替除外、entityとgrapheme、結合emoji、空白/不可視文字、script/style/template/noscript/iframe/hidden部分木除外、aria-hidden可視保持、本文欠落を照合。 |
| `app/services/numbers/article_metric.rb` | 契約照合済 | spec/services/numbers/article_metric_spec.rb; spec/services/numbers/article_character_counter_spec.rb | 本文HTMLと欠落時の文字数委譲のみ。異常・Unicodeは委譲先で検証済みで重複unit不要。 |
| `app/services/numbers/article_metrics_summary.rb` | 契約照合済 | spec/services/numbers/metrics_query_spec.rb | 全体/著者/分布の整合、nil本文も分母、著者Hash/String/空白/nil集約、空一覧、0/199/200から1999/2000・9000まで全分布境界を実summaryで照合。単体の同じfixture追加不要。 |
| `app/services/numbers/author_rows_sorter.rb` | 契約照合済 | spec/services/numbers/author_rows_sorter_spec.rb; spec/services/numbers/metrics_query_spec.rb | 増田を含む名前優先、自然順の数字先頭/複数部分・文字列prefix、値保持と空一覧。正規化済みString名Hashが呼出元契約。 |
| `app/services/numbers/metrics_payload_builder.rb` | 契約照合済 | spec/services/numbers/metrics_payload_builder_spec.rb | 全体→著者の順序と全キー、桁区切り・平均の四捨五入、0件dash/0文字を照合。整数カウントはsummary生成値で任意型検証不要。 |
| `app/services/numbers/metrics_query.rb` | 契約照合済 | spec/services/numbers/metrics_query_spec.rb | 全件→集約/分布/推移整合、1h cache内保持/期限後更新、空/取得失敗伝播を照合。identity別文字数cacheは1回のread-only構築内で再利用し永続化しない。 |
| `app/services/numbers/metrics_trend_builder.rb` | 部分照合 | spec/services/numbers/metrics_trend_builder_spec.rb; spec/services/numbers/metrics_query_spec.rb | JST/Date.current、0件/end<start、将来記事まで延長、開始前累積、7/8日窓、無効暦日/部分値除外とDate入力を照合。publishedAtとlegacy publishedDateの両方を含む不正値時の優先契約が残る。 |
| `app/services/points_grant_service.rb` | 未照合 | spec/services/points_grant_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/related_articles_builder.rb` | 未照合 | spec/services/related_articles_builder_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/rss_article_items_builder.rb` | 契約照合済 | spec/services/rss_article_items_builder_spec.rb; spec/usecases/feeds_show_usecase_spec.rb; spec/requests/feeds_spec.rb | ID欠落除外/最初の重複保持、URLと本文/日時の受渡し、著者Hash/String/nilとtrimを照合。日付検証はXML側で対応済。 |
| `app/services/rss_xml_builder.rb` | 契約照合済 | spec/services/rss_xml_builder_spec.rb; spec/usecases/feeds_show_usecase_spec.rb; spec/requests/feeds_spec.rb | 全項目とatom属性の記号・既存entityの復元、XML制御文字、日付欠落/不正型/無効暦日/UTC境界、任意著者/本文と120件のRSSを照合。正常文字列をXML構造として解釈しない。 Issue #849で年/日付を欠く文字列をpubDateから除き、記事とno-store保持をrequestでも照合。 |
| `app/services/sitemap_entries_builder.rb` | 契約照合済 | spec/services/sitemap_entries_builder_spec.rb; spec/usecases/sitemaps_index_usecase_spec.rb; spec/requests/sitemaps_spec.rb | 静的→著者→記事の順序、ID欠落除外、種類別の重複排除、日時の優先順位/空値fallback、固定priorityを照合。非空で不正な日時はXML側が省略し、ここで再選択する仕様ではない。 |
| `app/services/sitemap_xml_builder.rb` | 契約照合済 | spec/services/sitemap_xml_builder_spec.rb; spec/usecases/sitemaps_index_usecase_spec.rb; spec/requests/sitemaps_spec.rb | locの記号/制御文字、lastmodの欠落/不正型/暦日/UTC境界、属性出力を照合。priorityは現行呼出元の固定数値であり任意型の入力検証は不要。 Issue #849で年/日付を欠く文字列をlastmodから除き、記事とno-store保持をrequestでも照合。 |
| `app/services/web_push/article_notification_payload.rb` | 未照合 | spec/services/web_push/article_notification_payload_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/web_push/article_published_notifier.rb` | 未照合 | spec/services/web_push/article_published_notifier_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/web_push/send_notification_service.rb` | 未照合 | spec/services/web_push/send_notification_service_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/services/year_ago_articles_builder.rb` | 未照合 | spec/services/year_ago_articles_builder_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/about_index_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/admin/articles_index_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/admin/media_create_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/admin/media_index_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/admin/sessions_create_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/admin/sessions_show_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/analytics/configuration_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/api/app/masuda_run/rankings_create_usecase.rb` | 契約照合済 | spec/usecases/api/app/masuda_run/rankings_create_usecase_spec.rb; spec/requests/api_app_masuda_run_rankings_spec.rb; spec/requests/api_string_input_contract_spec.rb | Issue #847: 端数拒否、整数値Float/文字列互換、0点、型不正/NaN/Infinity、上限追加なし、登録失敗時付与なし/付与失敗非致命を照合。 非String userIdは登録/付与前に拒否し、nil/空/空白はrequiredエラーを維持。Issue #849で入力型を補完。 |
| `app/usecases/api/app/masuda_run/rankings_index_usecase.rb` | 未照合 | spec/usecases/api/app/masuda_run/rankings_index_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/api/app/masuda_tataki/points_create_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/api/app/navigation_failures_create_usecase.rb` | 契約照合済 | spec/requests/navigation_failures_spec.rb; spec/requests/production_logging_spec.rb | 検証済payloadをloggerへ渡すだけの手順。全公開項目・未知項目抑止・invalid400・本番イベント/ID/機微情報除外を実usecase経由で照合。重複mock単体不要。 |
| `app/usecases/api/app/users/create_usecase.rb` | 契約照合済 | spec/usecases/api/app/users/create_usecase_spec.rb; spec/requests/api_string_input_contract_spec.rb; spec/requests/api_app_users_spec.rb | userId/nameの型・必須値、ID/nameのtrimとUnicode保持、固定content ID/保存/JSONを照合。Identityの汎用文字列変換は変更せずAPI入口で検証。 |
| `app/usecases/api/app/users/show_usecase.rb` | 契約照合済 | spec/usecases/api/app/users/show_usecase_spec.rb; spec/requests/api_app_users_spec.rb; spec/requests/api_error_contract_spec.rb | 正常・未登録name nil、必須ID/非String拒否、404と権限エラー区別、共通upstreamエラーを照合。 |
| `app/usecases/api/app/web_push/subscriptions_create_usecase.rb` | 未照合 | spec/usecases/api/app/web_push/subscriptions_create_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/api/app/web_push/subscriptions_destroy_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/api/app/web_push/subscriptions_show_usecase.rb` | 未照合 | spec/usecases/api/app/web_push/subscriptions_show_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/api/app/web_push/vapid_public_key_usecase.rb` | 未照合 | spec/usecases/api/app/web_push/vapid_public_key_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/article_images_show_usecase.rb` | 未照合 | spec/usecases/article_images_show_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/articles_page_usecase.rb` | 契約照合済 | spec/requests/articles_pagination_spec.rb; spec/requests/upstream_response_shape_spec.rb | 共通Query結果をjsonキーへ渡す薄い入口。正常と不正入力/上流異常の実requestで照合済みで、同じmockの単体testは不要。 |
| `app/usecases/author_show_usecase.rb` | 未照合 | spec/usecases/author_show_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/authors_index_usecase.rb` | 未照合 | spec/usecases/authors_index_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/blog_index_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/blog_show_usecase.rb` | 未照合 | spec/usecases/blog_show_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/bookshelf_cover_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/bookshelf_index_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/calendar_articles_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/feeds_show_usecase.rb` | 契約照合済 | spec/usecases/feeds_show_usecase_spec.rb; spec/requests/feeds_spec.rb; spec/requests/api_error_contract_spec.rb | 全件取得と固定channel/URL/content type、120件・重複・不正日時、upstream失敗のHTTP契約を照合。手順だけの薄いusecaseへの同じmock検証は不要。 |
| `app/usecases/home_index_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/numbers_index_usecase.rb` | 未照合 | spec/usecases/numbers_index_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/others_index_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/search_index_usecase.rb` | 未照合 | spec/usecases/search_index_usecase_spec.rb | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/sentence_articles_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/usecases/sitemaps_index_usecase.rb` | 契約照合済 | spec/usecases/sitemaps_index_usecase_spec.rb; spec/requests/sitemaps_spec.rb; spec/requests/api_error_contract_spec.rb | 記事/著者全件と固定base/type、static/author/article、120件/重複/不正日時、upstream失敗を照合。 |
| `app/usecases/webhooks/microcms/articles_create_usecase.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/views/inertia.html.erb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/views/layouts/_apple_splash_screens.html.erb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/views/layouts/application.html.erb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/views/layouts/mailer.html.erb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `app/views/layouts/mailer.text.erb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/brakeman` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/bundler-audit` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/ci` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/dev` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/docker-entrypoint` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/jobs` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/rails` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/rake` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/rubocop` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/setup` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `bin/thrust` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `compose.visual.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `compose.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/application.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/boot.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/bundler-audit.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/cache.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/ci.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/database.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/environment.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/environments/development.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/environments/production.rb` | 部分照合 | spec/requests/production_logging_spec.rb; spec/requests/production_request_security_spec.rb | RequestId解決後かつExecutor内のRequestContext、実logger/formatter/subscriberを本番bootして照合。SSL/hostは既存security specで照合。cache/queue/storage等残る本番設定の確認は未完了。 |
| `config/environments/test.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/initializers/cors.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/initializers/filter_parameter_logging.rb` | 部分照合 | spec/requests/production_logging_spec.rb | failure全体filterにより実APIの標準パラメータログにも本文/トークン/検索語を出さないことを照合。endpointや他のfilter項目の呼出元照合は残る。 |
| `config/initializers/inertia_rails.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/initializers/inflections.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/initializers/visual_test_fixtures.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/initializers/vite_ruby_watched_files.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/locales/en.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/production_security.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/puma.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/queue.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/recurring.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/routes.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/skylight.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/storage.yml` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `config/vite.json` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `db/cache_schema.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `db/queue_schema.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `db/seeds.rb` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `deploy.sh` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `eslint.config.mjs` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `lib/structured_logging/event_logger.rb` | 契約照合済 | spec/lib/structured_logging/event_logger_spec.rb; spec/requests/production_logging_spec.rb | ログlevelの399/400/499/500、duration丸め、payload/CurrentRequest fallback、microCMS failure/warning文脈、診断両ID区別と予約キー保護、production JSON型/compactを照合。本番の実診断APIも非stubで相関と機微情報除外を確認。 |
| `lib/structured_logging/json_formatter.rb` | 契約照合済 | spec/lib/structured_logging/json_formatter_spec.rb; spec/requests/production_logging_spec.rb | UTC小数3桁/severity、event JSON展開、非JSON/JSON配列/非String(nil/数値/Hash)fallback、改行/引用符/日本語の1行往復。現行構造化callerはtimestamp/severityをpayloadに入れず予約metaを競合させない。 |
| `lib/structured_logging/request_context.rb` | 契約照合済 | spec/lib/structured_logging/request_context_spec.rb; spec/requests/production_logging_spec.rb | env同一性とquery除外、outer文脈へ通常/例外後の復元、本番実配線で入力/生成ID・連続/例外リクエストと終了後nilを照合。 |
| `lib/structured_logging/request_subscriber.rb` | 契約照合済 | spec/lib/structured_logging/request_subscriber_spec.rb; spec/requests/production_logging_spec.rb | 二重installでも購読1回、payload/duration引渡しとunsubscribeを既存specで照合。本番bootと実診断controllerイベントのrequest_completedを追加確認。 |
| `package.json` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `playwright.config.js` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `public/manifest.webmanifest` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `public/offline.html` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `public/robots.txt` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `public/service-worker.js` | 部分照合 | app/frontend/test/serviceWorker.test.js | 通知URLの受信・クリック再検証、壊れたJSON、キャッシュ鮮度、導入・削除の待機と失敗。外部URL・null・非GETは既存／追加テストで照合。 |
| `scripts/check-visual.sh` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `scripts/greed-balance.mjs` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `scripts/push.sh` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `scripts/simulate-masuda-slot.mjs` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `scripts/visual-docs-only.sh` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |
| `vite.config.ts` | 未照合 | — | 契約と既存テストの照合・追加不要理由は未記録。 |

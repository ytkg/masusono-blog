# テスト不足の監査

追跡: [Issue #819](https://github.com/ytkg/masusono-blog/issues/819)

## 対象と完了条件

対象は main のアプリケーション、バッチ、運用スクリプト、CI用スクリプト。既存の unit / request / SSR / Visual Regression を合わせて、正常系・異常系・境界値・非同期の競合・後始末を照合する。

カバレッジ100%や、全テストが成功したことだけでは「追加するテストがない」と判定しない。各領域の振る舞いと既存テストを確認し、具体的に不足している保証を補完する。実ブラウザで保証している処理には、数字を上げるだけのDOMモックテストを重ねない。未確認の領域が残る間は監査完了としない。

## 2026-11-03 第1回

ベースは `7f672be1`。調査用に実装350ファイルの初期一覧を作成し、全RSpecとVitestのカバレッジから調査対象を抽出した。一覧の作成は全ファイルのレビュー完了を意味しない。public / bin / デプロイスクリプト等も後続の一覧に含める。

| 領域 | 確認・補完した保証 | テスト |
| --- | --- | --- |
| ポイント付与 | 不正なユーザーIDで通信しない、200文字のIDと最小・最大金額を保持 | `spec/services/points_grant_service_spec.rb` |
| 遷移診断入力 | 不正URL・過長パス、HTTP整数の境界と型、request IDの上限 | `spec/services/navigation_failure_payload_builder_spec.rb` |
| 通知購読入力 | 購読オブジェクトの型、配信先のホスト・URI、鍵長の境界・欠落 | `spec/services/api/app/web_push/subscription_input_spec.rb` |
| メディアアップロード | 通信・JSON失敗の原因を保持、ファイル欠落、ファイル名によるヘッダー混入防止 | `spec/services/microcms/upload_media_service_spec.rb` |
| 本棚の書影 | 許可外・認証情報付き・不正URL、設定欠落時の通信抑止、JSON失敗 | `spec/services/bookshelf/cover_spec.rb` |
| ユーザー取得 | 単一取得、404と上流障害の区別、不正JSON | `spec/services/microcms/users/client_spec.rb` |
| 管理画面 | 認証状態取得・ログイン失敗後の回復、追加取得失敗後の同一ページ再試行、古い401を無視 | `AdminApp.test.jsx` / `useAdminMedia.test.jsx` |
| 設定 | Cookie利用不可、名前取得失敗・空の応答、通知解除失敗後の状態維持と再試行 | `SettingsApp.test.jsx` |
| Web Push | 許可拒否・保留、開発環境と非対応ブラウザ、解除時に購読がない場合 | `webPush.test.js` |
| SEO | 既定値、相対URLの正規化、共有画像・代替テキスト・カード形式 | `SeoHead.test.jsx` |
| 遷移復旧 | AbortError、完了済み先読み、成功後の案内解除・購読解除、外部URLを診断に含めない | `navigationRecovery.test.js` |

体調ロゴの画面内判定は `visible_health_phrase.visual.js` が実ブラウザでヘッダーによる遮蔽・全画面オーバーレイ・非表示・複数出現・フッター帯を検証している。関連unitテストは文字範囲と監視解除を担当するため、unitカバレッジの低さだけで同じ保証を追加しなかった。

### 検証

- 基準: RSpec 576件、Vitest 118ファイル792件成功。
- 追加後: RSpec 620件、Vitest 118ファイル813件、SSR 4件成功。
- RuboCop、ESLint、Prettier、Brakeman、coverage公開用スクリプトのテスト成功。
- フロント分岐カバレッジ: 90.48% → 91.67%。行カバレッジ: 96.93% → 97.52%。数値はunitテストの計測であり、画面比較の範囲を含まない。
- 代表6箇所（ポイント上限、診断ID長、アップロード例外変換、鍵長、一覧再試行、通知許可）を一時的に変更し、追加テストが失敗することを確認。実装は全復元済み。
- `bin/ci` はGem auditのみ失敗。ベースと同じsqlite3 2.10.1にGHSA-4fqr-96q8-xrfxが検出される。依存定義は未変更で、更新は既存PR #814の対象。

## 2026-11-05 境界・外部応答の追加確認

ベース `63509376`。全体監査の一部として次の25例を追加した。実装の変更はない。

| 領域 | 追加した保証 | テスト |
| --- | --- | --- |
| 本棚書誌 | 候補なしの通信抑止、未登録・不完全書誌と障害の区別、初回timeout/503/不正JSON、後続JSON失敗時の部分結果保持、20秒ちょうどでの取得抑止 | `spec/services/bookshelf/catalog_spec.rb` |
| 通知購読入力 | endpointの2,000文字許容と2,001文字拒否、endpoint/p256dh/authそれぞれのnil・空文字・空白拒否 | `spec/services/api/app/web_push/subscription_input_spec.rb` |
| 前年記事 | 同一時刻を異なるタイムゾーン表記で受けた際のIDによる安定順序 | `spec/services/year_ago_articles_builder_spec.rb` |

- 全RSpec: 754件成功。行カバレッジ99.71%（2420/2427）。RuboCop（変更spec3ファイル）成功。
- 退行検出: 時間予算の `<=` を `<` に変えると追加テスト1件、入力長の `>` を `>=` に変えると既存テスト1件と追加endpoint境界1件が失敗することを確認。実装は復元し、全RSpec成功を確認した。
- 最初の全体実行は新規環境のnode依存が未準備でVite manifest関連31件が失敗。専用Composeのviteで `npm ci` を実行して解消した。
- フロント・画面の変更がないためVitest/SSR専用コマンド/画面比較は今回は未実施。RSpec内のSSR request specは全体実行に含む。
- 再確認した未解決箇所: `public/service-worker.js` は通知URLの `//example.com` を許し、クリック時にも外部URLへ解決する。既存unitテストはこの境界を扱っていない。仕様・呼出元との照合と回帰テストが引き続き必要。

この回は全実装ファイルの照合、フロント全体のカバレッジ取得、残るスクリプトの監査を完了していない。全体監査 #819 は継続する。

## 残る作業

監査は継続中。次を含む全領域の照合が必要。

- Backend: 外部クライアントの未実行例外、OGP描画失敗、バッチ設定不備、Controller / Usecase / Model / Concernのテスト責務。
- Frontend: 遷移診断・analytics、ゲームの寿命と入力、グラフ、検索・フィード、ページと共有部品の残る分岐。既存実ブラウザ・SSRテストとの重複を確認する。
- Scripts / configuration: Visual gate、push、coverage公開、deploy policy、起動・デプロイ手順の失敗と中断。
- 追加テストの退行検出、必要な全体検証と最新PRコミットのCI確認。

この記録は、リポジトリ全体に追加すべきテストがなくなったという結論ではない。

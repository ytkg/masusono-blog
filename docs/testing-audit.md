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

## 残る作業

監査は継続中。次を含む全領域の照合が必要。

- Backend: 外部クライアントの未実行例外、OGP描画失敗、バッチ設定不備、Controller / Usecase / Model / Concernのテスト責務。
- Frontend: 遷移診断・analytics、ゲームの寿命と入力、グラフ、検索・フィード、ページと共有部品の残る分岐。既存実ブラウザ・SSRテストとの重複を確認する。
- Scripts / configuration: Visual gate、push、coverage公開、deploy policy、起動・デプロイ手順の失敗と中断。
- 追加テストの退行検出、必要な全体検証と最新PRコミットのCI確認。

この記録は、リポジトリ全体に追加すべきテストがなくなったという結論ではない。


## 2026-11-05 ブラウザ境界と作業環境

ベース `63509376`。ファイルごとの照合を継続できるよう、[実装・設定・CIの一覧](testing-audit-inventory.md) を保存した。対象415件のうち今回読んだ9件の契約を部分照合として記録し、全ファイルを確認済みとは扱っていない。

追加はVitest33例とworktreeスクリプト12例。初回の追加18例を実装修正前に実行し、通知URL・通知JSON・監視対象欠落で12件の失敗を確認した。

| 領域 | 追加した保証 | 実装の修正 |
| --- | --- | --- |
| 通知URL | protocol-relative・バックスラッシュ・改行・壊れたURL・非文字列を受信とクリックで検証し、正しい記事URLのクエリとハッシュは保持 | URLとして解決し同一オリジンを確認する共通処理。保存済み通知も再検証 |
| Service Worker | 壊れたJSONの既定通知、旧キャッシュ削除の完了待機・削除失敗時の制御抑止 | JSON解析失敗時は既定データを使用。キャッシュ処理自体は変更なし |
| Cookie | user_idのHTTP/HTTPS属性・期限更新と符号化、限定ロゴのSecure属性 | 変更なし |
| canvas | canvas/context/ラッパー欠落、DPR未定義・0・1未満・2倍 | ラッパー欠落時はResizeObserver.observeにnullを渡さない |
| 場所と診断 | windowなしのSSR、外部・不正URL、配信callbackのタイミングとHTTP失敗の終端、通信失敗時の再送、呼出元指定のキュー上限 | 変更なし |
| worktree/Compose | slug不正、主checkoutと指定base、既存path/branch保護、fetch/base失敗、予約・使用中port、環境欠落、複数引数と終了コード | 変更なし。テストは一時Gitと偽Docker/lsofを使い、CIのpush-gateへ追加 |

検証: Vitest 121ファイル897例、SSR13例、Nodeスクリプト38例、新規Python12例、既存Visual gate16例、ESLint、Prettier、git diff --check成功。フロント分岐93.83%、行98.15%。Composeの複数引数転送と予約ポート回避を一時的に壊すと新規テストが失敗することを確認し、実装は復元した。

Rubyの実装・テストは変更していないため、この回はRSpecと全bin/ciは未実施。画面比較は指定pushスクリプトで全画面を実施する。通知URL・JSONの変更はキャッシュ内容やオフライン処理を変えないため、CACHE_NAMEは変更しない。全体監査 #819 は継続する。

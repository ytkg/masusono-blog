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


## 2026-11-05 遷移状態・ブラウザ保存障害

[Issue #845](https://github.com/ytkg/masusono-blog/issues/845)。親は PR #844 / `75176fc7`。一覧と前回の境界補完を引き継ぐため同ブランチを基点にした。作業開始時の最新main `cf5ba253` は説明文削除だけの差分で、今回の契約照合対象に変更はない。

Vitest92例と、PC/スマホで実行する履歴障害のブラウザ4ケースを追加した。

| 領域 | 補完した契約 |
| --- | --- |
| 遷移診断 | 古いmodule成功/拒否、Storage読書き・削除不備、Observer不在/未対応、重複commit/visibility、背景受付/finish、初期・早すぎる・別URLのcommit、解除と再登録、ResourceTimingの順序と別取得、公開URL/保存サイズ/ID/計測値とpointerの境界 |
| 復旧・analytics | 正常/500のInertia先読み、URLなし通信失敗、無関係/一致するfinish、許可取得の通信失敗後の同URL再試行 |
| ブラウザ保存 | Cookie読込/書込拒否・UUID APIなし・ロゴ購読解除、ホームintentのStorage不備、HTTP/Abort/JSON失敗の例外保持 |
| 管理 | 古い初回成功/401が新検索の待機状態・認証を変えないこと、5MiB許容/+1拒否との境界、ファイル選択キャンセル |
| 記事 | コピーからのcomment除外とpre空白・tableセル区切り、browser/SSRのcomment一致、文字数/読了時間の0・不正値・欠落・数値文字列 |
| 履歴 | 即時history保存の容量/権限制限後も記事を表示し次cursorへ進むこと。DataCloneErrorは伝播 |

履歴の赤テスト2例で、`history.replaceState` 例外時に画面の記事が増えずstateRefだけ先行する失敗を確認した。現在のInertia配布物でもreplaceStateの容量・スロットリングエラーは表示状態を維持する方針だったため、アプリ独自の即時保存も `SecurityError` / `QuotaExceededError` を扱うよう修正した。履歴保存ができない間の戻る位置は保証せず、表示と取得位置は更新する。ほかの例外は隠さない。実ブラウザでも本物のRails/Inertiaを使い両エラーと手動ページ追加を確認した。

検証:

- 全Vitest: 122ファイル989例成功（親897例から92例追加）。分岐94.92%、行98.32%。本番SSR13例、Nodeスクリプト38例成功。
- 実ブラウザの履歴障害4ケース成功。最終の全画面比較は `scripts/push.sh` で実行し、PRに結果を記載する。
- 保存サイズの `>` を `>=` に変える、古い初回応答のguardを除く、画像サイズの `>` を `>=` に変える一時変更で、追加テストが各1件失敗することを確認。実装は全復元済み。
- Rubyの実装・テストは変更していないためRSpec・全bin/ciは未実施。外部サービスの通信・設定変更・デプロイは行っていない。

一覧は契約照合済25件、部分照合9件、未照合381件。過去の一時記録から、loadImage・pageResolver・重複排除・先読み・scroll復元・grapheme等の追加不要理由をテスト対応と共に転記した。代表例の成功だけで全体を完了扱いにしていない。管理URLの特殊文字、RUNの描画、worktreeの並行作成等と、未照合のBackend/Frontend/設定/運用が引き続き残る。


## 2026-11-05 RUN整数契約・XMLとHTTPの境界

[Issue #847](https://github.com/ytkg/masusono-blog/issues/847)。監査一覧を引き継ぐため、PR #846 / `de0fd3db` を基点にした。

RSpec40例を追加。RUNのJSON `1.5` / `-0.5` が `1` / `0` で登録される問題をusecaseとrequest計4例の赤テストで確認し、数値を整数へ損失なく変換できることを検証するよう修正した。整数値 `1.0` / `-0.0` と整数文字列は維持し、RUNに新しい上限は加えていない。ポイントAPIの上限超過やタイムアウトでもランキング登録成功を維持し、自動再送しない既存契約を確認した。

そのほか、HTTP分類の399/400/499/500/599/600、RSSの全テキスト・atom属性における記号/既存entityの往復、著者の名前欠落と画像4別名の型・優先順位を補完。XMLの日付・全件・重複排除など既存テストの責務を読んで一覧へ対応付けた。

検証:

- `bin/ci` 成功。RSpec769例、Vitest122ファイル989例、SSR13例、coverage公開スクリプトのNodeテスト、RuboCop/ESLint/Prettier、Gem audit、Brakemanが成功。今回の依存定義変更はない。
- 退行検出として端数guard除去でrequest2例、HTTP下限を401に変更すると1例、ampersandエスケープ除去で1例が失敗することを確認。すべて元に戻した。
- 全画面比較は指定の `scripts/push.sh` で実施し、結果をPRへ記録する。外部サービスの実通信・設定変更・デプロイは行っていない。

一覧は契約照合済37件、部分照合14件、未照合364件。非StringのuserId、表示日付の部分値、複数著者画像キーで上位が不正な場合などの契約確認が残る。前回からの部分照合や他領域も含め、全体監査 #819 は継続中。

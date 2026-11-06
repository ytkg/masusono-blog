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

一覧は契約照合済34件、部分照合17件、未照合364件。非StringのuserId、表示日付の部分値、複数著者画像キーで上位が不正な場合などの契約確認が残る。前回からの部分照合や他領域も含め、全体監査 #819 は継続中。

追加プローブで、XML日付の文字列 `12` が現在の年月を補完し、`Feb 30` が年補完後に翌月へ丸められることを確認した。年を欠く文字列の許容契約は未確定なので、XMLの日付helperと両builderは部分照合に戻した。今回の画面比較中に変更したのはこの監査記録だけで、検証対象の実装は同一。


## 2026-11-05 入力型・完全な日付・診断サイズ

[Issue #849](https://github.com/ytkg/masusono-blog/issues/849)。親は PR #848 / `1505c2d5`。RSpec72例を追加した。

実装前の46例の失敗により、APIの文字列契約をすり抜けるJSON値と、年/日付を欠く値の現在日時依存の補完を確認した。RUN/UsersのuserIdは共通presence検証で型も拒否し、Usersのnameは正規化前に型を検証する。nil/空/空白のrequiredエラー、正常なtrim・Unicode・固定content IDを維持し、バッチも使うIdentity.normalizeは変更していない。

CalendarDateValidatorの全5呼出元を読み、年月日がそろっていて有効な暦日のみ通すよう修正した。表示は元の値を返し、両XMLは日付タグだけ省略し、Numbersの集計は対象から除く。完全なDate/Time/RFC文字列と従来のISO/JST・閏日の互換性を維持する。ISOのみ許容する前年検索・本棚は既に部分値を除外しており、全RSpecで互換性を確認した。

診断のASCII/UTF-8 2048/2049バイト、Content-Lengthなしchunked、length/encoding双方なし、IP別20/21・61秒後解除は既存実装で成功し、実装修正は不要だった。インストール済みRailsのcontent_length/raw_post実装も読み、chunkedはraw bodyのbytesizeを参照し、両ヘッダーなしは本文を診断として解釈しないことを確認した。

Numbersは既存の全分布境界・キャッシュ・四捨五入・空件数等のテストを対応付け、著者Hash/String/空白/nil集約、template/noscript除外、名前の途中と先頭の数値順を補完した。

検証:

- 最終 `bin/ci` 成功: RSpec841例、Vitest122ファイル989例、SSR13例、Nodeスクリプト、RuboCop/ESLint/Prettier、Gem audit、Brakeman。
- 型guard除去でrequest10例、部分日付guardを旧式に戻すと7例、診断の `>` を `>=` に変えると3例が失敗。全て復元して最終bin/ciを実行した。
- 全画面比較は `scripts/push.sh` で実施し結果をPRに記載する。外部実通信・設定変更・デプロイは行っていない。

一覧は照合済51件、部分13件、未照合351件。全体監査 #819 は継続中。診断whitelistとpayload builderの全項目対応、複数著者画像で上位キーが不正な場合、Numbersの両日付キーの優先契約、既存Frontend/運用/設定の照合が残る。


## 2026-11-05 本番ログの文脈と診断契約

[Issue #851](https://github.com/ytkg/masusono-blog/issues/851)。親は PR #850 / `c13acc4d`。RSpec52例を追加した。

本番環境を別Rubyプロセスで起動し、実際のmiddleware登録からstackを組む赤テストを追加。RequestContextがRequestIdより前、さらにExecutorの外にあり、下流ではIDとpathが両方nilとなることを確認した。登録をRequestIdの直後へ移し、ID解決後かつExecutor内で文脈を設定する。通常・連続・ID自動生成・例外応答と終了後nil、実microCMSログの文脈と診断ログの送信ID、request_completedとの相関まで検証した。テスト内で本番アプリと検証用terminalを起動するが外部サーバーやデプロイは使わない。

本番の実診断APIへ機微情報を含むfixtureを送り、標準のParametersログ自体が出ていること、その値がFILTEREDであること、検証済みイベントも本文/トークン/検索語を含まないことを確認した。WebMockで本番boot前から子プロセスの外部HTTPも禁止し、検証中のSkylight agentも無効化している。

診断の全公開キー・全列挙値、path512/513、content_type100/101、build12桁、schemeだけを持つURI、JSON formatterの非String/改行/引用符、loggerのlevel境界・microCMS warning・予約キー保護を補完。既存のRequestContext outer復元とRequestSubscriber二重installのテストは重複させず、本番の実接続と対応付けた。

検証:

- 最終bin/ci成功。全画面比較の結果をPRへ記載する。RSpec893例、Vitest122ファイル989例、SSR13例、Nodeスクリプト、lint/format、Gem audit、Brakeman成功。
- 登録順を旧式へ戻すと1例、診断whitelistのsince_resume_ms除去で2例、URI scheme検証除去で1例、formatterのTypeError処理除去で3例が失敗。標準パラメータfilter除去でも本番テストが失敗することを確認し、すべて復元した。
- 外部実通信・設定変更・デプロイは行っていない。

一覧は照合済59件、部分14件、未照合342件。本番設定はログ配線部分のみを照合し、cache/queue/storage等を一括完了扱いにしていない。endpoint等のパラメータfilter、既存Frontend・設定・運用の未照合も残る。全体監査 #819 は継続する。


## 2026-11-05 上流JSON・ページング境界

[Issue #853](https://github.com/ytkg/masusono-blog/issues/853) と [Issue #854](https://github.com/ytkg/masusono-blog/issues/854)。親は PR #852 / `b9c0756f`。RSpec77例を追加し、不要になった低水準parserの2例を削除した（総数は893→968）。

query付きURLへの回数照合を修正したテストで元の実装を再実行し、60例中47例の失敗を確認した。不正JSON、過深nest、非Object root、欠落/非配列contents、不正な要素をHTTP取得境界でFetchError502へ統一。元の本文をerror bodyへ含めず、JSON parserのcauseも切り離す。HTTP失敗はJSON解析より先に元のstatusを使う。正常0件の空配列、全件取得/RUN限定のmetadataなし旧形式は維持し、ページ指定取得は従来どおり要求と一致するmetadataを必須とする。

非配列contentsを空一覧へ変換する旧testは、不正応答を正常0件に見せるため修正した。RUNの限定取得も共通parse_pageを使うようにし、唯一のproduction callerがなくなったparse_contents/contents_fromと重複testを削除。任意の総件数だけは壊れたmetadataを不明nilとし、0件と区別する既存契約を維持した。

7つの公開入口で共通JSON/no-store/no-ETag/request IDと再送なしを実HTTP fixtureで確認。購読の不正lookupでPOST/PATCH/DELETEを始めず、バックアップの不正取得でload_job/truncateへ進まないこともfake HTTP/BigQueryで確認した。実BigQuery/microCMSの状態変更は行っていない。

記事offsetの複合入力は元実装で全16例成功し、型例外の仮説は再現しなかった。余分な型guardは取り消してIssueを訂正し、Hash/配列/nilの回帰testだけを残した。空ページなのに上流の総件数が続きを示す場合もcursorを停止するtestを補完した。

検証:

- 最終bin/ci成功: RSpec968例、Vitest122ファイル989例、SSR13例、Nodeスクリプト、RuboCop/ESLint/Prettier、Gem audit、Brakeman。
- 非配列を空へ戻す/要素型guard除去/RUN検証迂回/cause維持/metadata root guard除去で、それぞれ7/10/4/5/5例が失敗。空cursor guard除去でも1例失敗。全復元し対象120例を再確認した。
- 全画面比較は標準CI完了後に `scripts/push.sh` で実行し、PRへ結果を記録する。比較中にビルド・RSpec・全体CIを重ねない。

一覧は照合済68件、部分16件、未照合331件。購読のPOST応答/id検証や、バックアップがページ保護で返る部分結果をsnapshotへ使う契約は未完了。前回からのFrontend/設定/運用の照合も含め、全体監査 #819 は継続する。

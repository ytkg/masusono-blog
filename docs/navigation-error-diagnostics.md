# スマートフォンの画面遷移エラー

Inertia 3 の非 Inertia 応答は通常、レスポンス本文をモーダルに表示する。空の本文や表示できない HTML では白い枠になる。画面表示直後のナビゲーション先読みも同じ異常応答を保持するため、タップで利用した時点で表示される場合がある。

`navigationRecovery.js` は `httpException` / `networkError` / `prefetched` を捕捉する。非 Inertia 応答での遷移失敗と通信失敗は再読み込み・閉じるボタンのある案内に置き換える。再読み込みは通常の GET で失敗した遷移先を開き、先読みキャッシュを使わない。正規の Inertia エラーページ、409 のバージョン更新、キャンセルは従来の処理を維持する。先読みだけの失敗は表示中の画面を遮らない。

## Cloud Logging で確認

デプロイ後の失敗から記録される。Log Explorer で次を使う。

```
resource.type="cloud_run_revision"
jsonPayload.event="navigation_failed"
```

`response_request_id` がある場合、その ID で `request_completed` ログを検索すると、失敗した Rails リクエストを照合できる。`report_request_id` は診断の POST 自体の ID なので区別する。

- `status=200` と `content_type=text/html`: HTML 応答の混入やキャッシュを調べる。
- `status>=500`: Rails の例外や Cloud Run の応答を調べる。
- `kind=network_error`: `online` と Service Worker の制御状態を確認する。応答がないためリクエスト ID はない。
- `prefetch=true`: 先読み段階の失敗。
- `elapsed_ms`: 前景遷移は `before`、先読みは `start` を観測してから失敗までの時間（ミリ秒）。開始を観測できない場合は省略する。ページを開いてからの時間ではない。
- `prefetch_in_flight=true` と短い `elapsed_ms`: 先読み中の早いタップで発生した遷移失敗。

診断はブラウザから送られた観測値であり、HTTP ステータスを含め、サーバー側のログとの照合が必要。Cloud Run が Rails より前で返したエラーは Rails の ID を含まないことがある。

新しい記録は1ページにつき最大10件（再送を除く）。オフラインや送信自体が通信失敗した場合はメモリ内に保持し、接続復帰時に再送する。ページを閉じるか診断ハンドラを解除すると未送信の記録は失われる。診断 API 自体が4xx/5xxを返した記録は再送しない。レスポンス本文・検索語・Cookie・認証情報・例外メッセージは送信しない。

## Vite のバージョン計算の競合対策

`conflicting chdir during another chdir block` は、アセットバージョンの計算が同じプロセス内で並行し、`Dir.chdir` が競合すると発生する。先読み中のタップだけでなく、別ユーザーの同時アクセスでも起こり得る。

本番の Inertia バージョンは、すべての initializer が完了した起動時に `ViteRuby.digest` を一度計算して固定する。Cloud Run のリビジョン内のファイルは変更されない前提で、リクエスト中に再計算しない。アセットが変更されたデプロイでは新しいプロセスが新しいバージョンを計算し、古いバージョンからのアクセスには従来どおり409による再読み込みを行う。開発・テスト環境は `development` を維持する。

独自の `watched_files_digest` はアプリのルートを `Dir.glob` の `base` と絶対パスに指定し、作業ディレクトリを変更しない。キャッシュの時刻と計算結果は一組で更新し、並行処理が未完成の値を参照しないようにする。ファイルの並び・ダイジェストの形式・フロントテストの除外・途中で消えたファイルの扱いは維持する。

本番ファイルをプロセス起動後に書き換える運用では、バージョンを更新するためにプロセスの再起動が必要になる。

## PWAのフッター遷移が遅い・止まる場合

フッターで指・マウスを離した段階（`pointerup`）から記録し、クリック、Inertiaの遷移受付までを区別する。移動が12pxを超えた操作、キャンセル、1秒以上の長押し、修飾クリック・別タブ・現在のページへの操作は計測しない。キーボード操作などpointerイベントがない場合はクリックから計測する。履歴移動・取り消された遷移は停止として扱わない。Inertia受付前に通常のページ移動で`pagehide`が発生した記録は削除し、再起動時の誤報を防ぐ。ロゴや本文をDOM走査する計測は追加しない。

| 項目 | 観測地点 |
| --- | --- |
| `release_ms` | フッターで指・マウスを離した時点（0ms）。pointerイベントなしなら省略 |
| `tap_ms` | クリック到達時点（キーボード等はここが0ms） |
| `request_ms` | Inertiaの前景 `before` |
| `response_ms` | Resource Timingで対象URLのfetch/XHR完了を観測。先読みキャッシュ利用ならタップ時点。未対応環境では省略 |
| `data_ready_ms` | Inertiaの `beforeUpdate`。応答処理のキューを抜け、画面更新用のデータを利用可能になった時点 |
| `module_start_ms`, `module_end_ms` | ページと共通レイアウトの遅延import開始・完了 |
| `commit_ms` | 対象URLのReact layout effect（DOM更新後） |
| `frame_ms` | その後2回のrequestAnimationFrameに到達。実画面への表示やGPU処理完了そのものを保証する値ではない |

`stage` は最後に到達した段階、各 `*_ms` は指離し（pointerイベントなしならクリック）からの累積時間。差分で段階間の所要時間を調べる。`response_ms` は通知時点の時計であり、Resource Timingのコールバック自体が遅れて届く場合がある。`data_ready_ms` にはInertiaの応答処理待ちも含まれるため、サーバー所要時間と同一視しない。

- `navigation_stalled`: 前景で5秒経っても描画フレームに到達しない。1回の遷移につき1件。
- `navigation_slow`: 描画フレームまで前景で3秒以上かかった。停止から復旧した場合は停止時の記録と完了時の記録が両方出ることがある。
- `module_load_error`: 遅延importの失敗。先読みデータ利用中のため既存の通信エラーイベントが出ない場合も記録する。元の例外は再throwし、遷移の動作は変更しない。
- `navigation_interrupted`: 描画フレームまで到達しなかった保存記録を次回起動時に発見した。ユーザーによる途中終了や再読み込みも含み、必ずしもアプリの異常ではない。

PWA判別は `navigator.standalone` と `(display-mode: standalone)` を使う。`service_worker=true` だけでは通常ブラウザとPWAを区別できない。`build_version` は不調なPWAと新しく開いたブラウザで実行コードが同じかを比較するために使う。`backgrounded` と `since_resume_ms` は復帰直後の発生を調べるための値。背景時間は遅延時計から除外し、非表示中は停止タイマーを止める。

PWAはlocalStorage、通常ブラウザはタブ単位のsessionStorageに直近1件だけ保存する。正常完了・送信のHTTP応答受信で削除し、通信失敗・オフラインでは接続復帰や次回起動時に再送する。記録の有効期間は24時間。新しいタップは古い記録を上書きする。ストレージが利用不可の場合はメモリ内の計測だけを続ける。再送時は `recovered=true` とし、保存データを再検証してから送る。例外メッセージ・モジュールURL・検索語・本文・Cookie・永続的な利用者IDは保存も送信もしない。

新しい診断の送信は1ページにつき5件まで（再送を除く）。既存の通信失敗診断は従来の10件まで。送信先・イベントは既存の `/api/app/navigation_failures` と `navigation_failed` を使い、APIの2048 bytes制限、1分20件制限、no-storeを維持する。

まず `standalone=true` と対象の `build_version` で絞り、`stage` と各時刻を確認する。

```
resource.type="cloud_run_revision"
jsonPayload.event="navigation_failed"
jsonPayload.standalone=true
```

`response_ms` が短く `data_ready_ms` が長いなら応答処理待ち、`module_start_ms` があり `module_end_ms` がなければ追加JavaScriptの読込・評価待ち、`commit_ms` があり `frame_ms` がなければフレーム待ちを疑う。ブラウザ全体が固まるとタイマーも送信も動かないので、次回起動時の記録が重要になる。保存記録が残らないケースやService Worker経由のリクエスト自体が届かないケースは、これだけで原因確定できない。

`stage=release` で停止すれば指離し後にクリック未到達、`stage=tap` で `request_ms` がなければクリック後にInertia未受付を示す。ブラウザがイベントをJavaScriptへ渡す前の停止や、指を離す前の停止は記録できない。通常のページ移動・終了で受付前の記録を削除するため、この段階の停止はページを開いたまま5秒待った際の送信が重要になる。

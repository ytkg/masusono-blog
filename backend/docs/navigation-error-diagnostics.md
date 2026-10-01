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
- `prefetch_in_flight=true` と短い `elapsed_ms`: 先読み中の早いタップで発生した遷移失敗。

診断はブラウザから送られた観測値であり、HTTP ステータスを含め、サーバー側のログとの照合が必要。Cloud Run が Rails より前で返したエラーは Rails の ID を含まないことがある。

新しい記録は1ページにつき最大10件（再送を除く）。オフラインや送信自体が通信失敗した場合はメモリ内に保持し、接続復帰時に再送する。ページを閉じると未送信の記録は失われる。診断 API 自体が4xx/5xxを返した記録は再送しない。レスポンス本文・検索語・Cookie・認証情報・例外メッセージは送信しない。

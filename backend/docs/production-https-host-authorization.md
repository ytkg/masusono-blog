# 本番 HTTPS と Host Authorization

本番の Rails アプリケーションは Cloud Run の TLS 終端の内側で稼働します。
`config/environments/production.rb` では `assume_ssl` と `force_ssl` を有効にし、
アプリケーション内ではすべてのリクエストを HTTPS として扱います。Cloud Run は公開入口で
HTTPS を提供するため、コンテナに HTTP で届くことによる不要なリダイレクトループを防げます。

## 許可する Host

`config.hosts` は次だけを許可します。

- `masusono.com`
- `www.masusono.com`
- プロジェクト `332902117625` の `asia-northeast1` にある `masusono` 本番・PR ステージング
  サービスの deterministic Cloud Run URL

`static.masusono.com` は Rails を経由しない静的アセット用のドメインなので、ここには追加しません。

Cloud Run のサービス URL は `gcloud run services describe <service> --format 'value(status.url)'`
で確認できます。URL が上記の形式に一致しない場合は、許可範囲を広げず、Cloud Run の URL 形式・
リージョン・プロジェクト番号を確認してから正規表現を更新してください。

PR のステージングコメントは、`deploy.sh` が決定的 URL
`https://<service>-332902117625.asia-northeast1.run.app` を出力します。`status.url` が返す
非決定的な `*.a.run.app` URL は allowlist に含めないでください。

## `/up` とヘルスチェック

`/up` に Host Authorization の例外はありません。例外を置くと、不正な Host ヘッダーであっても
ヘルスチェック用パスを通過できてしまうためです。Cloud Run の HTTP probe を設定するときは、
`Host: masusono.com` をカスタムヘッダーとして指定します。probe の HTTP ヘッダーは Cloud Run の
設定で明示的に追加できます。

通常の外部監視も `https://masusono.com/up` を使います。Cloud Run の ingress では HTTPS が終端され、
Rails は `assume_ssl` によりそのリクエストを HTTPS と認識します。

## 新しい公開ドメインを追加する手順

1. Cloud Run のカスタムドメインまたはロードバランサーと TLS 証明書を先に準備する。
2. `config/environments/production.rb` の `config.hosts` に完全一致のホスト名を追加する。
3. `backend/spec/requests/production_request_security_spec.rb` に許可ケースを追加する。
4. `bundle exec rspec spec/requests/production_request_security_spec.rb` を実行し、PR をマージする。
5. デプロイ後、`https://<新ドメイン>/up` が 200、未許可 Host が 403 となることを確認する。

ホストの追加をワイルドカードで済ませないでください。サブドメインを追加する必要がある場合も、
公開対象を限定した正規表現と対応するテストを使います。

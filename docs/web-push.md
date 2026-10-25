# Web Push

コマンドはリポジトリルートで実行します。管理対象 worktree では `docker compose` を専用 Compose ラッパーに置き換えます。

ブラウザの「その他」→「設定」から通知を有効にすると、端末ごとのPush subscriptionをmicroCMSへ保存します。通知の許可は、利用者が「通知を受け取る」を押した場合にのみ要求します。

### microCMSの準備

複数コンテンツ形式で `web_push_subscriptions` APIを作成し、次のテキストフィールドを追加します。

- `endpoint`
- `p256dh`
- `auth`

このAPIは管理用データなので、コンテンツAPIキーは公開せず、Rails credentialsの既存 `microcms.api_key` だけでアクセスします。

### ユーザーコンテンツID移行

`users` APIのコンテンツIDは、前後空白を除去した `user_id` のSHA-256先頭32文字に `u-` を付けた値を正規IDとして使用します。microCMSの `users` APIで、コンテンツIDに英小文字・数字・`-` を許可し、`GET`・`PUT`・`PATCH`・`DELETE` 権限を付与してください。

通常保存は正規IDへの `PUT` で作成し、既存IDの場合は `PATCH` で更新します。ユーザー取得も正規IDを使います。

次のコマンドはデータを変更せず、移行候補・削除予定・要確認レコードをJSONで出力します。

```bash
docker compose run --rm backend bin/rails users:preview_content_id_migration
```

出力を確認して問題がなければ、正規IDへ作成・更新してから旧IDを削除します。実行時点で要確認レコードが1件でもある場合は中止されます。`CONFIRM=true` を明示しない限り、データ変更は行いません。

```bash
docker compose run --rm -e CONFIRM=true backend bin/rails users:apply_content_id_migration
```

### VAPID鍵の準備

次のコマンドで鍵ペアを生成し、標準出力をRails credentialsへ保存します。出力される秘密鍵はコミット・共有しません。

```bash
rbenv exec bin/rails web_push:generate_vapid_keys
rbenv exec bin/rails credentials:edit
```

credentialsには次の形で設定します。`vapid_subject` は運用連絡先のメールアドレスまたはHTTPS URLです。

```yaml
web_push:
  vapid_public_key: "..."
  vapid_private_key: "..."
  vapid_subject: "mailto:YOUR_EMAIL@example.com"
  microcms_webhook_secret: "..."
```

### 通知の送信

デプロイ済み環境で、管理者だけが次のコマンドを実行します。`URL` はサイト内の絶対パスを指定します。

```bash
TITLE='お知らせ' BODY='好きな本文を送れます' URL='/articles/example' rbenv exec bin/rails web_push:send
```

有効な全購読端末へ送信し、配信先から無効と判断された購読はmicroCMSから自動削除します。

### 新規記事公開時の自動通知

microCMSの `articles` APIで「カスタム通知」を追加し、通知先を次に設定します。

```
https://masusono.com/webhooks/microcms/articles
```

タイミングは「コンテンツの公開時・更新時」を選び、上記credentialsの `microcms_webhook_secret` と同じシークレットを設定します。Webhookの `type` が `new` の場合だけ通知するため、公開済み記事の更新では通知されません。Webhook署名は `x-microcms-signature` で検証し、記事情報はコンテンツIDからmicroCMSへ再取得します。

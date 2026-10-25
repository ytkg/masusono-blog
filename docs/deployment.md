# Cloud Run へのデプロイ

コマンドはリポジトリルートで実行します。管理対象 worktree では `docker compose` を専用 Compose ラッパーに置き換えます。

リポジトリルートでデプロイスクリプトを実行します:

```bash
./deploy.sh
```

デプロイ先はチェックアウト中の Git ブランチで決まります。GitHub Actions では
`DEPLOY_BRANCH` を明示します。判定の優先順は `DEPLOY_BRANCH`、`GITHUB_REF_NAME`、
チェックアウト中のブランチです。デタッチされた HEAD では前者のいずれかが必要です。

- `main`: 本番サービス `masusono` へデプロイ
- その他のブランチ: ステージングサービス `masusono-<ブランチ名>` へデプロイ

ステージングのサービス名では、ブランチ名を英小文字化し、英数字以外の連続を `-` に置換します。
たとえば `feature/login` は `masusono-feature-login` になります。Cloud Run の63文字制限に
収めるため、正規化したブランチ名が54文字を超える場合は先頭45文字と
元のブランチ名の SHA-256 先頭8文字を `-` で結合します。デプロイ完了時には対象サービス名と
Cloud Run URL が表示されます。

Rails credentials の復号鍵はSecret Managerの `rails-master-key` からCloud Runへ注入します。
ローカルの `config/master.key` は手動デプロイに不要です。

### GitHub Actionsによる本番デプロイ

`main` への push（PRマージを含む）のうち、ルートのファイル・アプリケーションのディレクトリ・本番デプロイ workflow・デプロイ判定スクリプトの変更で GitHub Actions が起動し、デプロイ判定・CI・イメージビルドを経て Cloud Run の本番サービス `masusono` へデプロイします。リポジトリ内のPRは、`ステージングデプロイ` ラベルを付けると専用の Cloud Run ステージング環境へデプロイされ、URLがPRにコメントされます。ラベルが付いたまま更新すると再デプロイします。PRのマージまたはブランチ削除時に、対応するステージングサービスとイメージを削除します。

`デプロイなし` ラベルを付けると、本番・ステージングのビルド、イメージ公開、デプロイをスキップします。デプロイ workflow 内の CI もスキップします。個別の CI（テスト・静的解析）は、各 workflow の変更ファイル条件に従って実行します。`ステージングデプロイ` と両方付いている場合もスキップし、`デプロイなし` を外すとステージングをデプロイします。既存ステージング環境のマージ・ブランチ削除時の後片付けは継続します。

PRの作成・再オープン・コミット更新時に、次のファイルだけの変更なら `デプロイなし` を自動付与します（テストとドキュメントの混在も対象）。

- `spec/**`、`test/visual/**`、`app/frontend/test/**`
- フロントエンドの `*.test.{js,jsx,ts,tsx}` / `*.spec.{js,jsx,ts,tsx}`
- `.rspec`、`playwright.config.js`、`scripts/test_visual_gate.py`、`.github/scripts/deploy-policy.test.cjs`
- `.md` ファイル、`docs/**`（`app/**`、`public/**`、`storage/**` の配信・アプリ用ファイルを除く。ただし `app/frontend/README.md` は対象）

本体コード・共用設定・依存関係などが追加されたら、自動付与したラベルだけを外します。GitHubのラベル履歴の最後の付与者で判定し、手動付与分は保持します。自動付与分を手動管理に切り替える場合は、一度外してから付け直してください。手動で外した場合も、次のコミット更新時には変更内容から再判定します。リネームは変更前と変更後の両パスを確認します。

本番ではpushに含まれる全コミットの対応PRを確認します。直接push・未対応のコミットが混在する場合、コミットやファイル一覧の取得漏れ・APIエラーなどでスキップを確認できない場合は、通常どおりデプロイします。自動ラベル処理より先にマージされた場合も、対応PRの変更内容からテスト・ドキュメントのみかを判定します。

自動ラベル処理は `pull_request_target` でベースブランチのスクリプトだけを実行し、PR内のコードは実行しません。デプロイ判定のテストは `node --test .github/scripts/deploy-policy.test.cjs` で実行できます。



`.github/workflows/deploy-pr-cloud-run.yml` は、同一リポジトリのPRへ `ステージングデプロイ` ラベルを
付けたとき、またはそのラベルが付いたPRを再オープン・更新したときに、全CI後のステージングデプロイを
行い、PRコメントへ最新URLを書き込みます。フォークからのPRはデプロイ対象外です。ラベルを外しても
サービスは削除されず、PRのマージまたはブランチ削除時に削除されます。

GitHub Actions は Artifact Registry へイメージをビルド・pushしてから、`deploy.sh` 経由でそのイメージをCloud Runへデプロイします。成果物はPR終了時に削除し、残ったイメージも3日後に自動削除します。本番イメージは最新3世代を保持します。Cloud Runソース用バケットにも保持ポリシーを設定しています。

本番・ステージングともに、デプロイ要否の判定後に全 CI とイメージのビルド・公開を並列実行し、両方が成功した場合だけ Cloud Run へ反映します。CI が失敗した場合もイメージが公開されることはありますが、サービスには反映されません。

Docker Buildx でビルドし、GitHub Actions に Docker レイヤーを
キャッシュします。`mode=max` で gem のインストールを含む中間ステージも保存するため、
Gemfile・Gemfile.lock・vendor が変わらないビルドでは依存関係のインストールを再利用できます。
同じキャッシュ scope を使い、PR は GitHub のアクセス制限の範囲で main のキャッシュを
参照します。PR が保存したキャッシュはその PR の merge ref 内に限定されます。
初回やキャッシュ失効後は通常のビルドが必要です。キャッシュ保存に失敗してもデプロイは継続します。
Actions のビルドサマリーで所要時間とキャッシュ利用状況を確認できます。

手動で `deploy.sh` を実行する場合は、`IMAGE_URI` が未指定ならソースデプロイ、指定した場合はイメージデプロイになります。

```bash
gcloud run deploy <ブランチに対応するサービス名> \
  --image "$IMAGE_URI" \
  --project masusono \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --max-instances 1 \
  --remove-env-vars RAILS_MASTER_KEY \
  --update-secrets RAILS_MASTER_KEY=rails-master-key:latest
```

前提条件:

- `gcloud` CLI がインストール済みで、認証済みであること

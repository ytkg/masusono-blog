# 記事バックアップとタグ更新

コマンドはリポジトリルートで実行します。管理対象 worktree では `docker compose` を専用 Compose ラッパーに置き換えます。

microCMS の記事を BigQuery に全件バックアップできます。BigQuery へは load job で投入し、`microcms_articles_backup` テーブルを毎回全件置き換えます。`tags` は microCMS のカンマ区切り文字列をそのまま保存します。

事前にホストで Application Default Credentials を設定してください。

```bash
gcloud auth application-default login
gcloud auth application-default set-quota-project YOUR_PROJECT_ID
```

`~/.config/gcloud/application_default_credentials.json` が作成されていることを確認してください。通常の `gcloud auth login` だけでは Application Default Credentials は作成されません。

Docker Compose から実行する場合、ホストの `~/.config/gcloud` がコンテナの `/home/rails/.config/gcloud` に read-only でマウントされます。

```bash
BIGQUERY_PROJECT_ID=masusono \
BIGQUERY_DATASET_ID=blog \
docker compose run --rm backend bundle exec rails articles:backup_to_bigquery
```

初回実行時に dataset と table がなければ自動作成します。dataset location は `asia-northeast1` です。

タグ付け候補を確認する場合は、BigQuery から `tags` が空の記事、タグ付き既存記事、既存タグの件数を JSON で出力します。`articles:prepare_tagging` はバックアップ後に候補ファイルとレビュー用テンプレートを `tmp/tagging/` 配下へ作成します。
タグは記事同士の具体的なつながりを作るために使います。既存タグは参考情報であり、制約ではありません。2記事以上に自然に紐づくなら新しいタグを積極的に作って構いません。新規タグを作る場合は、そのタグでつながる既存記事も `tag-updates.json` に含め、既存記事側のタグ更新を忘れないようにします。`日常`、`生活`、`生き方`、`人間関係`、`内省` のような広いタグは、より具体的なタグで置き換えられるなら置き換えます。

```bash
BIGQUERY_PROJECT_ID=masusono \
BIGQUERY_DATASET_ID=blog \
docker compose run --rm backend bundle exec rails articles:prepare_tagging
```

生成されるファイルは以下です。

- `tmp/tagging/candidates.json`: 候補記事、タグ付き既存記事、既存タグ件数
- `tmp/tagging/tag-updates.json`: 適用用 JSON。初期値は `{"tag_updates":[]}`
- `tmp/tagging/review.md`: レビュー用テンプレート

確認済みのタグ案を microCMS に反映する場合は、`tmp/tagging/tag-updates.json` に `id` と `tags` を書いてから適用します。適用後は自動で BigQuery へ再バックアップし、残り候補件数を表示します。

```bash
BIGQUERY_PROJECT_ID=masusono \
BIGQUERY_DATASET_ID=blog \
docker compose run --rm backend bundle exec rails articles:apply_tag_updates_from_file
```

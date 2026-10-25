# masusono-blog

Rails / Inertia + React。起動方法は [README](README.md)、詳細は [目的別の目次](docs/README.md)。文書を一括で読まず、作業に該当する文書・節だけ参照する。

- コード・設定・ドキュメントの変更には [masusono-worktree](.codex/skills/masusono-worktree/SKILL.md) を使い、専用 worktree と Compose ラッパーで作業する。main や他の作業環境を変更しない。
- 変更依頼は、ユーザーが止めた場合やレビューのみ・PR 不要の場合を除き、検証・コミット・push・PR 作成・CI 確認まで完了する。PR に検証結果を記載し、対応 Issue は `Closes #番号` で結ぶ。
- push は `scripts/push.sh` を使う。PR 作成後の専用環境の片付けは worktree Skill に従う。保持の指定がなければマージを待たず片付ける。

- バックエンド・API 変更前に [責務と API 変更ルール](docs/architecture.md) を参照する。

## 検証・外部操作

- 変更範囲に応じて検証し、未実施の項目は理由を報告する。Ruby とフロント両方の変更・リリース前は `bin/ci` を優先し、テストを変更するときは [テスト規約](docs/testing.md) を参照する。
- 画面変更は [Visual Regression](test/visual/README.md) の全画面比較を成功させる。絞り込みや基準画像の更新だけで検証を済ませない。
- 秘密情報を表示・コミットしない。Cloud Run、microCMS、BigQuery、GCP の外部状態を変更する操作は、ユーザーの明示依頼と対象・影響範囲の確認を必要とする。
- ステージングは [PR デプロイ手順](docs/staging-deployment.md)、記事タグ更新は [記事バックアップ](README.md#記事バックアップ) を参照し、追加・削除と最終タグを提案して承認後に適用する。

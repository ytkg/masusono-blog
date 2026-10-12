# masusono-blog

Rails / Inertia + React の構成・起動方法は [README](README.md) を参照する。

- コード・設定・ドキュメントの変更には [masusono-worktree](.codex/skills/masusono-worktree/SKILL.md) を使い、専用 worktree と Compose ラッパーで作業する。main や他の作業環境を変更しない。
- 変更依頼は、ユーザーが止めた場合やレビューのみ・PR 不要の場合を除き、検証・コミット・push・PR 作成・CI 確認まで完了する。PR に検証結果を記載し、対応 Issue は `Closes #番号` で結ぶ。
- push は `scripts/push.sh` を使う。PR 作成後の専用環境の片付けは worktree Skill に従う。保持の指定がなければマージを待たず片付ける。

## 責務

- アプリの Controller は1アクションにつき専用 Usecase を1つ呼ぶ。URL の別名は同じ入口を使い、薄い Usecase も許す。Rails のヘルスチェックとルートのリダイレクトは対象外。
- Usecase は Controller からのみ呼び、Usecase 同士・Job・Batch からは呼ばない。共通処理は Service / Model に置く。
- Controller は HTTP 入出力・認証・CSRF・セッション・HTTP ステータス・render / redirect、Usecase は処理手順と最終 props / JSON 等のデータ整形を担う。
- Concern は独立した小さい補助メソッドに留め、アクションの処理手順を隠さない。層をまたぐ共通 Concern は `app/services/concerns/` に置く。
- API 変更時は [レスポンス契約](docs/api-response-contract.md) と request spec を更新する。共通エラー・no-store・request ID と upstream 障害の扱いを維持する。

## 検証・外部操作

- 変更範囲に応じて検証し、未実施の項目は理由を報告する。Ruby とフロント両方の変更・リリース前は `bin/ci` を優先し、テストを変更するときは [テスト規約](docs/testing.md) を参照する。
- 画面変更は [Visual Regression](test/visual/README.md) の全画面比較を成功させる。絞り込みや基準画像の更新だけで検証を済ませない。
- 秘密情報を表示・コミットしない。Cloud Run、microCMS、BigQuery、GCP の外部状態を変更する操作は、ユーザーの明示依頼と対象・影響範囲の確認を必要とする。
- ステージングは [PR デプロイ手順](docs/staging-deployment.md)、記事タグ更新は [記事バックアップ](README.md#記事バックアップ) を参照し、追加・削除と最終タグを提案して承認後に適用する。

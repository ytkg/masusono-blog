# ドキュメント目次

`docs/` 配下の運用・設計メモの入口です。迷ったらこのページから辿ります。

## 作業に応じて読む

必要な行のリンクだけを開き、目次の全リンクを先読みしない。コマンドはリポジトリルートで実行する。

| 作業 | 参照先 |
| --- | --- |
| 起動・開発コマンド | [README](../README.md#ローカル開発) |
| 変更作業の開始・push・片付け | [worktree Skill](../.codex/skills/masusono-worktree/SKILL.md) |
| バックエンドの責務・API 変更 | [設計ルール](architecture.md)、[API 契約](api-response-contract.md) |
| テストの変更・実行 | [テスト規約](testing.md)、[全画面比較](../test/visual/README.md)、[カバレッジ](coverage.md) |
| 記事バックアップ・タグ更新 | [手順](article-backup.md) |
| 通知の設定・送信 | [Web Push](web-push.md) |
| デプロイ・CI のデプロイ判定 | [Cloud Run](deployment.md)、[PR ステージング](staging-deployment.md) |
| SSR・ページング | [描画構成と検証](ssr.md) |
| 限定ロゴ・表示設定 | [表示設定](display-settings.md) |
| 改善候補の選定・更新 | [改善バックログ](improvement-backlog.md) |

## 開発・設計

- [テスト規約](./testing.md)
  - RSpec の書き方、外部 HTTP のモック、検証実行時の注意

- [記事のOGP画像](./article-ogp.md)
  - 自動生成、公開状態・キャッシュの扱いと画像プレビュー

- [Inertia SSR](ssr.md)
  - トップページ・記事詳細の描画構成とページング
- [本棚](bookshelf.md)
  - 取得・公開前の設定と削除窓口
- [GA4](ga4.md)
  - アクセス解析の設定
- [Greed](games/greed.md)
  - ゲームの仕様
- [著者プロフィール更新手順](./zukan-profile-update.md)
  - 記事が増えたときに、人物像プロフィールを同じ判断軸で更新する手順

## 運用

- [PR のステージングデプロイ手順](./staging-deployment.md)
  - ラベル付与、対象コミットの実行状況、URL と反映内容の確認

- [Cloud Run ウォーム維持戦略](./cloud-run-warmup-strategy.md)
  - キャッシュではなくウォーム維持で運用する前提と監視方針
- [本番 HTTPS と Host Authorization](./production-https-host-authorization.md)
  - HTTPS の扱い、許可ホストとヘルスチェックの設定
- [画面遷移エラーの診断](./navigation-error-diagnostics.md)
  - 遷移失敗の復旧 UI と Cloud Logging での調査
- [Service Worker 更新手順](./service-worker-versioning.md)
  - PWA キャッシュを切り替えるときの更新ルール

## 更新ルール

- API の契約変更時は `api-response-contract.md` と request spec を同時に更新する
- 優先度や未完了項目が変わったら `improvement-backlog.md` を更新する
- 大きな設計判断を足したら、この目次にも 1 行追加する

- 共通ルールは `AGENTS.md`、詳細は該当する文書に置く。README は起動・概要・参照先を中心にし、同じ仕様を複数箇所に記載しない。
- 新しい手順はこの目次に対象作業を添えて追加する。既存文書の移動時は参照リンクも更新する。

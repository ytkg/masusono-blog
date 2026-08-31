# ドキュメント目次

`backend/docs/` 配下の運用・設計メモの入口です。迷ったらこのページから辿ります。

## 最初に読む

- [改善バックログ](./improvement-backlog.md)
  - いま何が未完了で、どの順で着手するかを見る
- [API Response Contract](./api-response-contract.md)
  - 公開 API のレスポンス契約とエラー契約を確認する

## 開発・設計

- [Inertia Rails 移行計画](./inertia-migration-plan.md)
  - 画面移行の現在地、完了条件、切り戻し方針
- [コンテンツページ Inertia Controller 移行設計メモ](./content-pages-inertia-controller-migration-plan.md)
  - コンテンツページを server props 化した背景と設計判断
- [増その図鑑プロフィール更新手順](./zukan-profile-update.md)
  - 記事が増えたときに、人物像プロフィールを同じ判断軸で更新する手順

## 運用

- [Cloud Run ウォーム維持戦略](./cloud-run-warmup-strategy.md)
- [本番 HTTPS と Host Authorization](./production-https-host-authorization.md)
  - キャッシュではなくウォーム維持で運用する前提と監視方針
- [Service Worker 更新手順](./service-worker-versioning.md)
  - PWA キャッシュを切り替えるときの更新ルール

## 更新ルール

- API の契約変更時は `api-response-contract.md` と request spec を同時に更新する
- 優先度や未完了項目が変わったら `improvement-backlog.md` を更新する
- 大きな設計判断を足したら、この目次にも 1 行追加する

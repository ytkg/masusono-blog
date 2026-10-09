# ドキュメント目次

`backend/docs/` 配下の運用・設計メモの入口です。迷ったらこのページから辿ります。

## 最初に読む

- [改善バックログ](./improvement-backlog.md)
  - いま何が未完了で、どの順で着手するかを見る
- [API Response Contract](./api-response-contract.md)
  - 公開 API のレスポンス契約とエラー契約を確認する

## 開発・設計

- [記事のOGP画像](./article-ogp.md)
  - 自動生成、公開状態・キャッシュの扱いと画像プレビュー

- [バックエンド README](../README.md#記事詳細のssr)
  - 現行の Inertia 描画構成、記事詳細の SSR とページング
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

# GA4 計測の運用（Issue #522）

## 設定と公開前の準備

本番の `deploy.sh` は `GA4_MEASUREMENT_ID=G-5930S30RWS` を設定し、プレビューには空文字を設定する。
Rails の production 環境かつ `https://masusono.com` の公開ページでのみタグを読み込む。
ID 未設定・無効時は読み込まない。`/others`（管理ミニアプリを含む）と API は対象外。
広告連携と Google Signals は使用しない。ライターの本文変更は不要。

**公開前に GA 管理者が実施すること:**

1. 対象プロパティの Web ストリームが `https://masusono.com`、測定 ID が上記 ID であることを確認する。
2. Web ストリームの「拡張計測機能」でページビューの「ブラウザの履歴イベントに基づくページ変更」を無効化する。
   自動イベントを管理ページに混ぜないため、この導入では拡張計測機能全体をオフにする。
   コードの `send_page_view: false` だけでは履歴変更の自動イベントは止まらない。
3. イベントスコープのカスタムディメンションを `source_article_id`、`target_article_id`、`link_position` で作成する。
   表示順は1始まり。イベント名は `related_article_click`。
4. 現行サイトには計測のプライバシー告知がない。オーナーが利用対象と告知・同意方針を確認し、必要な表示を公開前に整える。
   告知案: 「当サイトは利用状況の把握に Google Analytics を使用します。Cookie 等を用いて閲覧ページや流入元を収集します。」
   [Google のデータ利用説明](https://policies.google.com/technologies/partner-sites)へのリンクも添える。
   同意が必要な運用では、同意取得とタグ読み込みの連携を追加してから公開する。
5. 本番公開は PR マージ後の通常のリリース手順で行う。PR 作成日を計測開始日として扱わない。

[Google の page_view 仕様](https://developers.google.com/analytics/devguides/collection/ga4/views)を参照。

## 公開後の確認

広告ブロッカーを無効化したテストブラウザで Network の `collect` 通信と GA のリアルタイムを確認する。
Tag Assistant を使う場合は DebugView も利用できる。開発環境から本番にテスト送信しない。

- 記事 A に直接アクセスして `page_view` が1件。URL（UTM を含む）と表示タイトルが一致する。
- Inertia リンクで記事 B に移動、戻るで A、進むで B: 各操作で1件ずつ。SSR/hydration、再描画、本文展開では追加しない。
- 同じURLの部分更新とハッシュ変更は追加しない。再読込は新しい閲覧として1件送る。
- 関連記事をクリック・キーボード選択・中ボタンで開く: 各選択で `related_article_click` が1件。
  `source_article_id`、`target_article_id`、`link_position` が表示と一致する。
- `/others` では管理操作を含め計測しない。プレビュー、ローカル、ID 未設定で GA タグ通信がなく、通常の閲覧ができる。
- 例: `https://masusono.com/?utm_source=x&utm_medium=social&utm_campaign=ga4_launch`
  から入り、「レポート → 集客 → トラフィック獲得」でセッションの参照元/メディアとキャンペーンを確認する。
  UTM は運営が投稿 URL に付ける。認証情報や個人情報を URL に入れない。

記事別閲覧は「エンゲージメント → ページとスクリーン」のページパス/タイトルを使う。
関連記事は「エンゲージメント → イベント」の `related_article_click`、詳細分析は「探索」で上記カスタムディメンションを使う。
通常レポートとカスタム定義への反映は即時とは限らない。

## 計測開始の記録

本番受信を確認した担当者が次を Issue #522 に共有する。導入前の履歴は復元できない。

- 公開日時・先端コミット:
- 初回受信確認日時（JST）・計測開始日:
- 対象プロパティ / ストリーム URL:
- 上記の送信件数・パラメータ・UTM・除外の確認結果:
- 運営が参照するレポートとカスタム定義:
- 告知・同意方針と表示場所:

このファイルの追加時点では、本番公開・GA 管理画面の設定・受信確認は未実施。

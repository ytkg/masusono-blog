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
   表示順は1始まり。イベント名は関連記事が `related_article_click`、1年前の記事が `year_ago_article_click`。
4. `/about` にCookieのブラウザIDを使った再訪・回遊の計測とGoogleのデータ利用説明を表示する。
   表示名・メール・プロフィールは送らず、IDを認証や管理権限には使わない。
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
- 1年前の記事をクリック・キーボード選択・中ボタンで開く: 各選択で `year_ago_article_click` が1件。
  関連記事と同じパラメータで元記事・遷移先・表示位置を記録する。
- `/others` では管理操作を含め計測しない。プレビュー、ローカル、ID 未設定で GA タグ通信がなく、通常の閲覧ができる。
- 例: `https://masusono.com/?utm_source=x&utm_medium=social&utm_campaign=ga4_launch`
  から入り、「レポート → 集客 → トラフィック獲得」でセッションの参照元/メディアとキャンペーンを確認する。
  UTM は運営が投稿 URL に付ける。認証情報や個人情報を URL に入れない。

記事別閲覧は「エンゲージメント → ページとスクリーン」のページパス/タイトルを使う。
関連記事と1年前の記事は「エンゲージメント → イベント」の `related_article_click` と `year_ago_article_click`、詳細分析は「探索」で上記カスタムディメンションを使う。
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

## ブラウザIDとオーナー除外（Issue #626・#638）

初回イベント前に既存ヘルパーで `user_id` Cookieを確保し、そのUUIDをGA4の
`client_id`に設定する。ログイン用 `user_id` と一意IDのカスタムディメンションは使用しない。
一般閲覧でプロフィール登録APIは呼ばない。Cookie保存不可・不正ID・判定API失敗時は
計測を停止して通常閲覧を継続する。Cookie削除後は新しいUUIDを使用する。

除外一覧はサーバーの `Analytics::ConfigurationUsecase::EXCLUDED_BROWSER_IDS` に固定リストとして保持する。
`GA4_EXCLUDED_BROWSER_IDS` 環境変数は除外判定に使用しない。
クライアントへは現在のCookieについて計測可否だけを返し、一覧はHTML・JS・API・URLへ出さない。
初回送信・ページビュー送信前、Inertia遷移と戻る/進む時に判定する。
クリックはそのページで承認済みのCookieのIDに対してのみ送信する。
判定中・除外対象・管理ページでは `ga-disable` を有効にし、自動エンゲージメントも止める。
除外ブラウザの初回表示ではGoogleタグの読込・初期化も行わない。

### 固定リストの更新手順

1. オーナーが対象のiPhone Safariで「その他！→設定→ユーザーID」の表示IDを選択し、手動コピーする。
2. 公開コードへの記載についてオーナーの許可を確認する。許可のない実IDは公開Issue・PR・ソース・ログに貼らない。
3. `app/usecases/analytics/configuration_usecase.rb` の `EXCLUDED_BROWSER_IDS` にIDを追加する。
   既存の除外IDを保持し、関連テストを更新して通常のPR・リリース手順で本番へ反映する。
   IDの追加・変更にはコード変更とリリースが必要となる。
4. リリース反映後にページを再読込し、初回表示・再読込・ページ移動・戻る/進む・両クリックで
   Googleタグと `collect` の通信が発生しないことをSafari実機で確認する。
   回線変更ではCookieが維持されるので除外継続。別ブラウザ・Cookie削除では再登録する。
5. 未登録ブラウザの `collect` の `cid` が設定画面のUUIDと一致し、別日の再訪でも維持されること、
   GA4探索のデバイスIDと対応することを確認する。Cookie削除で別IDとなることも確認する。

この変更の公開日時・先端コミットと、除外登録の適用日時（JST）を別々に記録する。
UUID移行によってユーザー数が変わるため、分析では移行前後を区別する。
過去データへの付け直しや除外、別端末の同一人物への結合は行わない。
Issue #638 で提供・公開記載を承認されたIDを固定リストに登録した。
この固定リスト変更の本番公開・Safari実機・GA4受信/探索の確認は未実施。

仕様: [client_id設定](https://developers.google.com/analytics/devguides/collection/ga4/reference/config#client_id)、
[ga-disableによる送信停止](https://developers.google.com/tag-platform/security/guides/privacy)。

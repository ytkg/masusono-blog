# トップページ・記事詳細のSSR

コマンドはリポジトリルートで実行します。管理対象 worktree では `docker compose` を専用 Compose ラッパーに置き換えます。

トップページ（`/`）と記事詳細（`/articles/:id`）をInertia SSRで描画し、本文・リンク・SEO情報を初回HTMLに含めます。トップページは初回取得の最大10件を描画し、続きはブラウザで取得します。著者・紹介・検索・ミニアプリ・数字ページはブラウザで描画します。

描画構成は `application/InertiaApp.jsx` でブラウザとSSRに共通化しています。`ArticleBody` は抜粋と展開を担当し、`ArticleHtml` はSSRと初回描画のHTMLを揃え、コード操作部品をマウント後に読み込みます。HTMLからの文字抽出は、ブラウザでは非表示のtemplate、SSRではparse5を使います。

トップページと追加取得APIは `ArticlesPageQuery` で同じ記事・ページング情報を作り、それぞれのusecaseがpropsまたはJSONとして返します。フロントエンドでは `articlePages.js` がレスポンス検証と重複除去、`useHomeArticles` が取得状態、`useHomeScrollRestoration` が履歴復元を担当します。自動取得の距離は `HOME_TABS` にタブごとに定義しています。

Docker ComposeではViteのSSRエンドポイントをRailsから呼び出し、開発アセットはRailsのViteプロキシ経由で配信します。管理対象worktreeでは通常どおり専用の `compose.sh up --build` を使います。ホストでの開発はRailsと `npm run dev` を起動すると、Inertia RailsがViteを検出します。

`npm run build` はクライアントとSSRの両方をビルドします。サーバー専用バンドルは公開ディレクトリ外の `ssr/ssr.mjs` に出力し、Dockerのビルドでも生成します。本番イメージにはNode.js 22を含め、Pumaの `inertia_ssr` プラグインがSSRプロセスの起動・ヘルスチェック・異常終了後の再起動・終了を管理します。SSRはコンテナ内の127.0.0.1:13714だけで待ち受けます。

SSRに失敗したリクエストは初期propsを返してブラウザで描画します。Railsログの `[inertia-rails] SSR render failed` とPumaの `Inertia SSR` ログで障害を検知できます。

検証には `npm run test:ssr`（実際の本番バンドルをNode.jsで描画）、 `bundle exec rspec spec/requests/ssr_spec.rb`（対象ページの選択・HTML・障害時の切り替え）、全画面の `scripts/check-visual.sh` を使用します。撮影環境では本番と同じSSRバンドルをPumaから起動し、クライアントとSSRの画像URLを一致させます。Visual RegressionにはJavaScript無効での本文・メタ情報検証と、hydration後の操作確認も含まれます。実際のCloud Runデプロイは別途実行します。

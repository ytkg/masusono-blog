# 公開ページのスクリーンショットテスト

Playwright が実際の Rails URL を開き、PC とスマートフォンの初期表示範囲を比較します。撮影用ブラウザには日本語明朝フォントを導入し、縦書きの表示を固定します。撮影用サーバーでは `VISUAL_TEST=1` を指定し、`test/visual/fixtures.rb` の固定データを使います。この設定は開発環境の撮影用サーバーにだけ適用されます。外部の microCMS や管理者資格情報は不要です。

## worktree で実行

worktree のルートから実行します。初回は Playwright の Docker イメージを取得するため時間がかかります。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh -f backend/compose.visual.yml up --build -d backend vite
.codex/skills/masusono-worktree/scripts/compose.sh -f backend/compose.visual.yml run --build --rm visual
```

通常のリポジトリで実行する場合は、`docker compose -f backend/compose.yml -f backend/compose.visual.yml` に同じ引数を続けます。

テストはファイル内も含めて並列実行し、CIでは4ワーカー、ローカルでは2ワーカーを使います。各テストのブラウザコンテキストとモックは独立させ、共有する撮影用データは変更しません。並列数は `run --rm visual npm run test:visual -- --workers=1` のように指定できます。

コピー通知の自動終了・表示保持とRuby実行の警告は、Playwrightの仮想時計を進めて検証します。実時間で数秒待たずに、同じ時間経過後の振る舞いと基準画像を確認します。

## 基準画像の更新

画面変更が意図したものか確認したうえで、次を実行します。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh -f backend/compose.visual.yml run --build --rm visual npm run test:visual:update
```

基準画像は [public_pages.visual.js-snapshots](./public_pages.visual.js-snapshots) に保存し、テストコードと一緒に Git で管理します。差分が意図した変更なら、更新された画像を同じ PR でレビューしてください。CI は基準画像を自動更新しません。

画面の見た目を変更した場合は、PR を作成する前に対象画面の通常の比較を実行してください。対象画面が未登録なら、比較テストも追加します。差分が意図した変更だった場合に限り基準画像を更新し、もう一度通常の比較を成功させてからコミットします。GitHub Actions の `frontend-visual` はステージングデプロイの有無にかかわらず全 PR で比較を実行します。失敗時は `visual-test-results` artifact で差分を確認してください。

失敗時の実画像・差分画像・トレースは `backend/test-results/`、HTML レポートは `backend/playwright-report/` に出力されます。CI では `visual-test-results` という成果物から確認できます。

Issue #220 の 17 状態に設定画面の入力・保存・通知更新エラーを加えた、20 状態・40 画像を対象にしています。設定エラーは撮影用の API・ブラウザ機能のモックで再現し、操作対象との間隔が 8px であることも確認します。管理ミニアプリのログイン、ダッシュボード、メディア一覧、画像詳細も含みます。管理画面の認証 API と microCMS メディア一覧は撮影用サーバーで固定応答にし、画像はリポジトリ内のアイコンを表示します。

Issue #239 の状態表示も対象に含めます。コピー成功・失敗、ランキングの空状態・取得失敗、Ruby 実行の読み込み・警告・失敗をデスクトップと390px幅で再現し、14画像を比較します。コピー成功の自動終了、失敗の表示保持と明示的な閉じる操作も検証します。

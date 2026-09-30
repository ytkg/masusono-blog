# 公開ページのスクリーンショットテスト

Playwright が実際の Rails URL を開き、PC とスマートフォンの初期表示範囲を比較します。撮影用サーバーでは `VISUAL_TEST=1` を指定し、`test/visual/fixtures.rb` の固定データを使います。この設定は開発環境の撮影用サーバーにだけ適用されます。外部の microCMS や管理者資格情報は不要です。

## worktree で実行

worktree のルートから実行します。初回は Playwright の Docker イメージを取得するため時間がかかります。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh -f backend/compose.visual.yml up --build -d backend vite
.codex/skills/masusono-worktree/scripts/compose.sh -f backend/compose.visual.yml run --rm visual
```

通常のリポジトリで実行する場合は、`docker compose -f backend/compose.yml -f backend/compose.visual.yml` に同じ引数を続けます。

## 基準画像の更新

画面変更が意図したものか確認したうえで、次を実行します。

```bash
.codex/skills/masusono-worktree/scripts/compose.sh -f backend/compose.visual.yml run --rm visual npm run test:visual:update
```

基準画像は [public_pages.visual.js-snapshots](./public_pages.visual.js-snapshots) に保存し、テストコードと一緒に Git で管理します。差分が意図した変更なら、更新された画像を同じ PR でレビューしてください。CI は基準画像を自動更新しません。

失敗時の実画像・差分画像・トレースは `backend/test-results/`、HTML レポートは `backend/playwright-report/` に出力されます。CI では `visual-test-results` という成果物から確認できます。

現在は Issue #220 のうち、PR #212 を待つ管理ミニアプリ以外の 13 状態・26 画像を対象にしています。管理ミニアプリのログイン、ダッシュボード、メディア一覧、画像詳細は PR #212 の画面が完成した後に追加します。

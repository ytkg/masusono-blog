# テストカバレッジ

コマンドはリポジトリルートで実行します。管理対象 worktree では `docker compose` を専用 Compose ラッパーに置き換えます。

RSpec は SimpleCov、Vitest は V8 で行カバレッジを計測します。未実行ファイルも集計対象です。
Ruby は `app/**/*.rb` と `lib/**/*.rb`、フロントは `app/frontend/**/*.{js,jsx}` と
`public/service-worker.js` を対象にし、テストファイルは除外します。
SSR・Visual Regression の実行結果はカバレッジに合算しません。

```bash
docker compose run --rm -e RAILS_ENV=test backend bin/rails db:prepare
docker compose run --rm -e RAILS_ENV=test -e COVERAGE=true backend bundle exec rspec
docker compose run --rm vite npm run test:coverage
```

HTML レポートは `coverage/ruby/index.html` と `coverage/frontend/index.html` に生成されます。
`bin/ci` と各 GitHub Actions のテストでも計測し、Actions のレポートは14日間 artifact に保存します。
README のバッジは main の成功した各テストの最新行カバレッジです。
main の CI が `coverage-badges` ブランチの JSON を自動更新し、Shields.io がバッジを描画します。
初回マージ後の main CI が成功するまではバッジの数値は表示されません。
ブランチは自動生成物専用です。カバレッジの最低値による CI の失敗条件は設けていません。

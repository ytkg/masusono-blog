# Frontend 開発規約（抜粋）

## Import パス

- `src` 配下への参照は `@/...` を使う。
- 同一ディレクトリ内の参照だけ `./...` を使う。
- `../...` の相対 import は追加しない。

## ディレクトリ運用

- 現在の共通設定は `src/constants.ts` に置く。
- 新規トップレベルディレクトリを作る場合は、この `docs` か `README.md` に用途を追記する。

## `src/app` の責務

- アプリケーション全体の初期化を担う（例: エントリポイント、グローバル Provider、Router）。
- 画面共通レイアウトや全体導線を組み立てる。
- 機能実装は `features` / `pages` / `shared` を組み合わせる側に限定し、個別機能の詳細ロジックは持たない。

## `src/shared` の責務

- ドメイン非依存で再利用可能な要素を置く（例: 汎用 UI、ユーティリティ、型、共通定数）。
- 複数の `pages` / `features` から参照される共通実装を提供する。
- アプリ固有の起動処理やルーティング、個別ページ事情への依存は持たない。

## 依存方向ルール（`app` / `shared`）

- `src/app` は `src/pages`・`src/features`・`src/shared` に依存してよい。
- `src/shared` は `src/app`・`src/pages`・`src/features` に依存しない。
- `src/shared` 内の依存は `src/shared` 内で完結させる。

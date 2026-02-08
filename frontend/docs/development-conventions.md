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

## `shared` に置く候補の棚卸し（2026-02-08）

- 判定基準は「ドメイン非依存」「複数箇所で再利用」「`app` への逆依存なし」。
- 2026-02-08 時点で第1バッチ（`fetchJson` / `mergeSx` / `PageContainer`）は移設済み。

| 対象 | 現パス（2026-02-08更新） | `shared` 配置案 | 判定 | 根拠 |
| --- | --- | --- | --- | --- |
| `fetchJson` | `src/shared/api/fetchJson.ts` | `src/shared/api/fetchJson.ts` | 完了 | APIドメインに依存しない HTTP JSON 取得関数。`hooks` 4箇所で共通利用。 |
| `mergeSx` | `src/shared/lib/sx.ts` | `src/shared/lib/sx.ts` | 完了 | MUIの `sx` マージ処理。共通コンポーネント 4箇所で利用。 |
| `PageContainer` | `src/shared/ui/PageContainer.tsx` | `src/shared/ui/PageContainer.tsx` | 完了 | ページ共通の余白レイアウト。`pages` 6箇所で利用。 |
| `ContentCard` | `src/components/ContentCard.tsx` | `src/shared/ui/ContentCard.tsx` | 候補（中） | 表示ドメイン非依存のカード枠。複数カード系コンポーネントで利用。 |
| `ContentCardSkeleton` | `src/components/ContentCardSkeleton.tsx` | `src/shared/ui/ContentCardSkeleton.tsx` | 候補（中） | `ContentCard` と対で再利用される汎用スケルトン。 |
| `FeatureLinkCard` | `src/components/FeatureLinkCard.tsx` | `src/shared/ui/FeatureLinkCard.tsx` | 保留 | 汎用UIだが `react-router-dom` 依存があるため、`shared/ui` 直下か `shared/navigation` 配下かを要検討。 |

## `shared` 対象外（現時点）

- `src/pages/*`: ルート単位の画面責務を持つため `shared` 対象外。
- `src/components/Header.tsx` / `src/components/Footer.tsx` / `src/components/ScrollRestoration.tsx`: アプリ全体レイアウトとルーティングに依存するため `app` 側責務。
- `src/hooks/useArticles.ts` / `src/hooks/usePodcasts.ts` / `src/hooks/useShops.ts` / `src/hooks/useMetrics.ts`: APIエンドポイントとレスポンス型がドメイン依存のため `shared` 対象外。

## 次の移行バッチ（提案）

- 第2バッチ: `ContentCard` / `ContentCardSkeleton` / `FeatureLinkCard` を、ルーティング依存の整理後に移設。

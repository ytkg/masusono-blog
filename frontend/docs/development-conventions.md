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
- `src/main.tsx` は DOM マウントのみを担当し、起動ロジックは `src/app` に置く。
- `src/app/RootApp.tsx` で `StrictMode` / `ThemeProvider` / `BrowserRouter` / Service Worker 初期化を扱う。
- `src/app/App.tsx` はアプリ横断 Provider の合成のみを担当する。
- `src/app/AppLayout.tsx` はヘッダー・フッター・共通レイアウトを担当する。
- `src/app/AppRoutes.tsx` はルート定義のみを担当する。

## `src/shared` の責務

- ドメイン非依存で再利用可能な要素を置く（例: 汎用 UI、ユーティリティ、型、共通定数）。
- 複数の `pages` / `features` から参照される共通実装を提供する。
- アプリ固有の起動処理やルーティング、個別ページ事情への依存は持たない。

## Phase 3 の責務整理（home / shops / apps）

- `src/features/home/ui` はホーム固有 UI を担当する。
- `src/features/home/ui/HomePage.tsx` は composition を担当し、表示ブロックは `HomeHero` / `HomeAppLaunchers` / `HomeFeatureLinks` に分割する。
- `src/features/home/ui/UechanBirthdaySection.tsx` はホーム専用表示として `home` 配下で管理する。
- `src/features/shops` は推し店ドメインの型・取得・画面を自己完結させる（`model/shop`, `hooks/useShops`, `ui/ShopsPage`）。
- `src/features/apps/ui/AppsDrawerLauncher.tsx` は apps 内の共通ランチャー UI として扱う。
- `src/features/apps/masudaRun` / `src/features/apps/numbers` は各アプリ固有実装のみを持つ。
- `src/pages/Home.tsx` / `src/pages/Shops.tsx` は feature ページを呼び出す薄いルート層に限定する。

## 依存方向ルール（`app` / `shared`）

- `src/app` は `src/pages`・`src/features`・`src/shared` に依存してよい。
- `src/shared` は `src/app`・`src/pages`・`src/features` に依存しない。
- `src/shared` 内の依存は `src/shared` 内で完結させる。
- `src/pages`・`src/features`・`src/shared` から `src/app` を import しない。
- 上記の import 境界は `frontend/biome.json` の `style.noRestrictedImports` で lint 強制する。
- 旧パス（例: `@/utils/fetchJson`, `@/utils/sx`, `@/components/PageContainer` など）も lint で禁止する。

## `shared` に置く候補の棚卸し（2026-02-08）

- 判定基準は「ドメイン非依存」「複数箇所で再利用」「`app` への逆依存なし」。
- 2026-02-08 時点で第1・第2バッチの対象は移設済み。

| 対象 | 現パス（2026-02-08更新） | `shared` 配置案 | 判定 | 根拠 |
| --- | --- | --- | --- | --- |
| `fetchJson` | `src/shared/api/fetchJson.ts` | `src/shared/api/fetchJson.ts` | 完了 | APIドメインに依存しない HTTP JSON 取得関数。`hooks` 4箇所で共通利用。 |
| `mergeSx` | `src/shared/lib/sx.ts` | `src/shared/lib/sx.ts` | 完了 | MUIの `sx` マージ処理。共通コンポーネント 4箇所で利用。 |
| `PageContainer` | `src/shared/ui/PageContainer.tsx` | `src/shared/ui/PageContainer.tsx` | 完了 | ページ共通の余白レイアウト。`pages` 6箇所で利用。 |
| `ContentCard` | `src/shared/ui/ContentCard.tsx` | `src/shared/ui/ContentCard.tsx` | 完了 | 表示ドメイン非依存のカード枠。複数カード系コンポーネントで利用。 |
| `ContentCardSkeleton` | `src/shared/ui/ContentCardSkeleton.tsx` | `src/shared/ui/ContentCardSkeleton.tsx` | 完了 | `ContentCard` と対で再利用される汎用スケルトン。 |
| `FeatureLinkCard` | `src/shared/navigation/FeatureLinkCard.tsx` | `src/shared/navigation/FeatureLinkCard.tsx` | 完了 | ルーティング依存を明示するため `shared/navigation` に配置。 |

## `shared` 対象外（現時点）

- `src/pages/*`: ルート単位の画面責務を持つため `shared` 対象外。
- `src/components/Header.tsx` / `src/components/Footer.tsx` / `src/components/ScrollRestoration.tsx`: アプリ全体レイアウトとルーティングに依存するため `app` 側責務。
- `src/features/blog/hooks/useArticles.ts` / `src/features/podcast/hooks/usePodcasts.ts` / `src/features/shops/hooks/useShops.ts` / `src/hooks/useMetrics.ts`: APIエンドポイントとレスポンス型がドメイン依存のため `shared` 対象外。

## 次の移行バッチ（提案）

- 第4バッチ候補: 旧パス参照を防ぐため、import 境界ルールを lint で自動検証する。

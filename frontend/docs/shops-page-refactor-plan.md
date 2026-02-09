# 推し店ページ リファクタ前仕様固定（Issue #66-1）

## 目的

- `frontend/src/features/shops/ui/ShopsPage.tsx` の分割実装前に、現行挙動を仕様として固定する。
- 実装者による解釈差分が出やすい状態遷移（初期選択・絞り込み時の選択補正・空表示）を先に明文化する。

## 対象ファイル（現行）

- `frontend/src/features/shops/ui/ShopsPage.tsx`
- `frontend/src/features/shops/hooks/useShops.ts`
- `frontend/src/features/shops/model/shop.ts`

## 現仕様（2026-02-09 時点）

- データ取得は `useShops()`（SWR）で行い、`revalidateOnFocus: false`。
- 地図は Leaflet で描画し、初回表示時は全店舗座標の `fitBounds` で全体表示に調整する。
- カテゴリ絞り込みは `ALL`（ラベル: `すべて`）と、取得データ由来カテゴリの昇順表示。
- カード一覧は絞り込み結果を表示し、カードクリックで選択店舗を更新する。
- マーカークリックで選択店舗を更新し、選択店舗のツールチップを開く。
- 選択店舗がある場合、地図は対象店舗へ `setView` する（ズームは `max(14, 現在ズーム)`）。

## 維持仕様（このIssueで変えない挙動）

- カテゴリ絞り込みが機能すること。
- カードクリックで対象マーカーが選択されること。
- マーカークリックで対象カードが選択状態になること。
- 初回表示時に全体が見えるズームへ調整されること。
- 一覧領域の状態別表示（loading/error/empty/loaded）の意味を維持すること。

## 状態別UI仕様（固定）

| 状態 | 判定条件 | 一覧領域の表示 | 地図領域の表示 |
| --- | --- | --- | --- |
| `loading` | `isLoading === true && shops.length === 0` | `ContentCardSkeletonList` を4件表示 | 地図コンテナは表示（Leaflet初期化は通常どおり） |
| `error` | `loading` ではなく `error` が存在 | 「データの取得に失敗しました。」 | 地図コンテナは表示 |
| `empty` | `loading` ではなく `error` なし、かつ `filteredShops.length === 0` | 「表示する推し店がありません。」 | 地図コンテナは表示（マーカーなし） |
| `loaded` | `loading` ではなく `error` なし、かつ `filteredShops.length > 0` | 店舗カード一覧（カテゴリチップ、説明、外部リンク） | 絞り込み対象のマーカーを表示 |

補足:

- `loading` 判定は「初回空配列ローディング」のみを対象にする。
- `error` と `empty` は同時に成立させない（`error` を優先）。

## 選択同期ルール（固定）

選択IDは `name-category-lat(小数5桁)-lng(小数5桁)#連番` 形式の安定IDを使用する。

- 同一情報の店舗が複数件ある場合でも `#1`, `#2` の連番で衝突を回避する。
- ID解決は `frontend/src/features/shops/lib/shopSelection.ts` の純関数で行う。

1. 初期表示（選択未設定）
- `filteredShops` が1件以上ある場合、先頭店舗を選択する。
- `filteredShops` が0件の場合、選択は `null` のままにする。

2. filter変更時（カテゴリ切り替え時）
- 変更後の `filteredShops` に現在選択中IDが含まれる場合は、選択を維持する。
- 含まれない場合は、変更後 `filteredShops` の先頭店舗へ選択を補正する。
- 変更後 `filteredShops` が0件の場合は、選択を `null` にする。

3. 選択解除条件
- 絞り込み結果が0件になったときは必ず `null` に解除する。
- データ再取得や条件変更で選択中IDが一覧から消えた場合は解除せず、先頭店舗へ補正する。

4. 地図・一覧の相互同期
- カードクリック時: 対応IDを選択し、地図側はその地点へ移動して該当ツールチップを開く。
- マーカークリック時: 対応IDを選択し、一覧側はそのIDを選択中として扱う。

## 空状態の解釈（固定）

- `empty` は「API成功だが表示対象が0件」または「カテゴリ絞り込み結果が0件」を含む。
- 文言は現行どおり「表示する推し店がありません。」を使用する。

## 実装フェーズへの引き継ぎ

- 次工程（Issue #66-2 以降）では、上記仕様を満たす範囲で責務分離・hook分割を行う。
- 仕様変更が必要になった場合は、このドキュメントを先に更新してから実装を変更する。

## 責務境界（Issue #66 完了後）

- `frontend/src/features/shops/ui/ShopsPage.tsx`
  - 画面メタ設定とコンテナ呼び出しのみを担当する。
- `frontend/src/features/shops/ui/ShopsPageContainer.tsx`
  - データ取得、絞り込み、選択状態遷移、Viewへの受け渡しを担当する。
- `frontend/src/features/shops/ui/ShopsPageView.tsx`
  - 地図・絞り込みUI・一覧UIの画面構成のみを担当する。
- `frontend/src/features/shops/hooks/useLeafletMap.ts`
  - 地図初期化/破棄、マーカー同期、座標ガードを担当する。
- `frontend/src/features/shops/lib/shopSelection.ts`
  - 安定ID生成と選択補正ルール（純関数）を担当する。

## エラー表示方針（Issue #66-C）

- `useShops` は UI向けの `errorMessage` と開発向けの `rawError` を分離して返す。
- 一覧表示は `errorMessage` のみを表示し、開発向け詳細はUIに露出しない。

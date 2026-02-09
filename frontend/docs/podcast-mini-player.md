# Podcastミニプレイヤー仕様

## 目的

- ポッドキャスト再生中に別ページへ遷移しても、再生を継続できるようにする。
- 再生操作（再生/一時停止、シーク）をページ横断で継続できるようにする。

## 構成

- 再生状態管理: `frontend/src/features/podcastPlayer/PodcastPlayerContext.tsx`
- 表示判定ロジック: `frontend/src/features/podcastPlayer/miniPlayerVisibility.ts`
- 表示判定hook: `frontend/src/features/podcastPlayer/hooks/useMiniPlayerVisibility.ts`
- UI本体: `frontend/src/features/podcastPlayer/ui/GlobalPodcastMiniPlayer.tsx`
- UI状態管理: `frontend/src/features/podcastPlayer/hooks/useGlobalPodcastMiniPlayerUi.ts`
- FLIPアニメーション: `frontend/src/features/podcastPlayer/hooks/useMiniPlayerFlipAnimation.ts`
- 閉じる状態管理: `frontend/src/features/podcastPlayer/hooks/useMiniPlayerDismissal.ts`
- 再生UI: `frontend/src/features/podcast/ui/PodcastAudioPlayer.tsx`（`variant="mini"`）

## 表示ルール

`shouldShowMiniPlayer()` の判定ルールは以下。

1. `currentEpisode` がない場合は非表示。
2. `currentEpisode` がある場合は常に表示。

（`pathname` の参照や `visibleEpisodeId` を使った可視判定は廃止され、再生中であれば常にグローバルミニプレイヤーが表示されます。）

## 操作仕様

### 展開状態

- ミニプレイヤーの再生UIを表示する。
- 左下の縮小ボタンで縮小状態へ遷移する。
- 左上の閉じるボタンでミニプレイヤーを閉じ、再生を一時停止する（再生位置は保持）。
- 閉じた後でも、ポッドキャストページの再生ボタンから続き再生できる。
- シークバーはドラッグ中 (`onChange`) に即時シークする。
- シークバーのドラッグ終了 (`onChangeCommitted`) では位置確定のみ行い、追加シークはしない。

### 縮小状態

- サムネイルのみ表示する。
- 初回縮小時（未ドラッグ時）は右下に表示する。
- サムネイルをドラッグして、縦横に移動できる。
- 画面外に出ないように、上下左右に `8px` マージンで位置をクランプする。
- サムネイルをタップすると展開する。

### 位置保持

- 縮小状態で移動した位置は保持する。
- 一度展開して再度縮小した場合、直前の縮小位置に戻る。
- 再生対象がなくなった場合（`currentEpisode === null`）、縮小状態と位置はリセットする。

### 停止

- グローバルミニプレイヤーの `stop()` 操作、PokéEpisodeCard の「停止」ボタンは実体的に一時停止で、現在の再生位置を保持したまま再生を止める。
- 「停止」後に再生ボタンを押すと、同じエピソード・同じ位置から `playEpisode()` で再開できる。
- QA/Storybook では「停止＝一時停止で currentTime が変わらない」ことを確認する。

### アニメーション

- 縮小時/拡大時は、表示前後の実際の矩形差分を使う FLIP アニメーションで遷移する。
- 縮小後サムネイルをドラッグで移動している場合も、その現在位置に向かって縮小する。
- 拡大時も逆方向の FLIP を適用し、縮小位置から展開パネルへ自然につながる。
- 速度は通常設定で、縮小 `260ms` / 拡大 `340ms`（`cubic-bezier(0.22, 1, 0.36, 1)`）。
- `prefers-reduced-motion: reduce` の場合はアニメーションを無効化する。

## 実装上の補足

- ドラッグ開始/終了は Pointer Events で処理する。
- ドラッグ中の誤タップ展開を防ぐため、`3px` 超の移動をドラッグとして扱う。
- ミニプレイヤーは `z-index` を `appBar + 1` として常に前面表示する。

## a11y 仕様（Issue #65-C）

### aria-label 一覧（ミニプレイヤー）

- 縮小ボタン: `ミニプレイヤーを縮小`
- 閉じるボタン: `ミニプレイヤーを閉じる`
- 展開サムネイル: `ミニプレイヤーを展開`
- 再生ボタン: `ミニプレイヤーで再生`
- 一時停止ボタン: `ミニプレイヤーを一時停止`
- 10秒戻し: `ミニプレイヤーで10秒戻る`
- 10秒送り: `ミニプレイヤーで10秒進む`
- シークバー: `ミニプレイヤーの再生位置: {エピソードタイトル}`

### キーボード操作の期待動作

- `Tab`: ミニプレイヤー内の操作要素へフォーカス移動できること。
- `Enter` / `Space`: `ミニプレイヤーを縮小` を操作すると縮小されること。
- `Enter` / `Space`: `ミニプレイヤーを閉じる` を操作すると閉じて一時停止されること。
- `Enter` / `Space`: `ミニプレイヤーを展開` を操作すると展開されること。
- `Enter` / `Space`: 再生・10秒戻し・10秒送りを操作できること。
- `ArrowLeft` / `ArrowRight` / `Home` / `End`: シークバー操作ができること（MUI Slider 標準挙動）。

## 既知の制約

- 縮小位置はメモリ上の状態で保持し、リロード後には復元しない。
- 位置保持はセッション内のみ有効。

## テスト

- 表示判定: `frontend/src/features/podcastPlayer/miniPlayerVisibility.test.ts`
- ミニプレイヤー操作: `frontend/src/features/podcastPlayer/ui/GlobalPodcastMiniPlayer.test.tsx`
## ポッドキャストページのエピソードカード

- 個別の埋め込みプレイヤーは廃止し、ミニプレイヤーと同じアイコンを使った単一のトグルボタンで再生/停止を切り替える。
- ボタンの `aria-live`/`aria-pressed` を設定して状態変化が読み上げられるようにし、`playEpisode(episode)` / `stop()` を呼び出す。
- 詳細な再生制御（シークや10秒送り/戻し、一時停止）はグローバルミニプレイヤーに集約される。
 - 操作ボタンは単一で、再生中/停止中で `再生` / `停止` 表示を切り替える。 `aria-pressed` / `aria-live` を設定し、状態変化が読み上げられるようにうまく扱う。

## QA / 受け入れ

- 停止操作は一時停止で、現在位置を保持する（再開時は currentTime が保持されていること）。Storybook では `PodcastMiniPlayer` で停止→再生の順に操作し、シークバーの位置が維持されることを確認。
- 受け入れ条件にもあるように、停止中もミニプレイヤーは表示され、`currentEpisode` を持ち続けること。

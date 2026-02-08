# podcastPlayer リファクタ配置計画（Issue #65）

## 目的

- `podcastPlayer` の責務分離を進める前提として、配置方針と依存方向を固定する。
- 以降の作業（Issue #65 の 2 以降）で、ファイル再配置と import 整理の判断を迷わない状態にする。

## 最終ディレクトリ構成（到達形）

```text
frontend/src/features/podcastPlayer/
  PodcastPlayerContext.tsx
  PodcastPlayerContext.test.tsx
  model/
    miniPlayerVisibility.ts
    miniPlayerVisibility.test.ts
    podcastPlayerState.ts
    visibleEpisodeState.ts
  hooks/
    usePodcastPlayerController.ts
    usePodcastPlayerAudioEvents.ts
    useMiniPlayerVisibility.ts
    useCollapsedMiniPlayerDrag.ts
    useCollapsedMiniPlayerDrag.test.tsx
  lib/
    formatAudioError.ts
  ui/
    GlobalPodcastMiniPlayer.tsx
    GlobalPodcastMiniPlayer.test.tsx
    ExpandedMiniPlayerPanel.tsx
    CollapsedMiniPlayerThumbnail.tsx
```

## レイヤ責務（1行定義）

- `model`: UIやDOMに依存しない状態・判定・型（純粋ロジック）を扱う。
- `hooks`: Reactの状態管理と副作用を扱い、`model`/`lib` を組み合わせる。
- `lib`: 副作用周辺の共通関数や整形処理を置く（ドメインルールは持たない）。
- `ui`: 表示とイベント入力に集中し、状態遷移ロジックは持たない。

## import 依存方向（固定ルール）

- `ui -> hooks/lib/model`
- `hooks -> lib/model`
- `model -> 依存なし`

補足:

- `ui` から `ui` 以外への依存は上記3層のみ許可し、`PodcastPlayerContext.tsx` を含む上位組み立てには依存しない。
- `hooks` は `ui` に依存しない（表示コンポーネントを import しない）。
- `model` は React・MUI・Router・DOM API へ依存しない。

## 既存ファイル移動マッピング（現パス -> 新パス）

| 現在 | 新パス（到達形） | 方針 |
| --- | --- | --- |
| `frontend/src/features/podcastPlayer/PodcastPlayerContext.tsx` | `frontend/src/features/podcastPlayer/PodcastPlayerContext.tsx` | 位置は維持。Provider組み立てと公開API受け渡しに責務を限定する。 |
| `frontend/src/features/podcastPlayer/PodcastPlayerContext.test.tsx` | `frontend/src/features/podcastPlayer/PodcastPlayerContext.test.tsx` | 位置は維持。公開APIとProvider組み立て確認に責務を限定する。 |
| `frontend/src/features/podcastPlayer/miniPlayerVisibility.ts` | `frontend/src/features/podcastPlayer/model/miniPlayerVisibility.ts` | 表示判定を `model` へ移し、純粋関数として扱う。 |
| `frontend/src/features/podcastPlayer/miniPlayerVisibility.test.ts` | `frontend/src/features/podcastPlayer/model/miniPlayerVisibility.test.ts` | `model` の単体テストとして同階層に移す。 |
| `frontend/src/features/podcastPlayer/ui/GlobalPodcastMiniPlayer.tsx` | `frontend/src/features/podcastPlayer/ui/GlobalPodcastMiniPlayer.tsx` | UI層として位置維持。表示分岐とprops接続に集中させる。 |
| `frontend/src/features/podcastPlayer/ui/GlobalPodcastMiniPlayer.test.tsx` | `frontend/src/features/podcastPlayer/ui/GlobalPodcastMiniPlayer.test.tsx` | UI統合テストとして位置維持。 |
| `frontend/src/features/podcastPlayer/ui/ExpandedMiniPlayerPanel.tsx` | `frontend/src/features/podcastPlayer/ui/ExpandedMiniPlayerPanel.tsx` | UI部品のため位置維持。 |
| `frontend/src/features/podcastPlayer/ui/CollapsedMiniPlayerThumbnail.tsx` | `frontend/src/features/podcastPlayer/ui/CollapsedMiniPlayerThumbnail.tsx` | UI部品のため位置維持。 |
| `frontend/src/features/podcastPlayer/ui/useCollapsedMiniPlayerDrag.ts` | `frontend/src/features/podcastPlayer/hooks/useCollapsedMiniPlayerDrag.ts` | ドラッグ制御は表示ではなく振る舞いなので `hooks` へ移す。 |
| `frontend/src/features/podcastPlayer/ui/useCollapsedMiniPlayerDrag.test.tsx` | `frontend/src/features/podcastPlayer/hooks/useCollapsedMiniPlayerDrag.test.tsx` | 対応する hook テストとして `hooks` 階層へ移す。 |

## 追加予定ファイル（Issue #65 の後続タスク用）

- `frontend/src/features/podcastPlayer/model/podcastPlayerState.ts`
- `frontend/src/features/podcastPlayer/model/visibleEpisodeState.ts`
- `frontend/src/features/podcastPlayer/hooks/usePodcastPlayerController.ts`
- `frontend/src/features/podcastPlayer/hooks/usePodcastPlayerAudioEvents.ts`
- `frontend/src/features/podcastPlayer/hooks/useMiniPlayerVisibility.ts`
- `frontend/src/features/podcastPlayer/lib/formatAudioError.ts`

上記の追加ファイルは、Issue #65 の 2〜7 の作業で段階的に実装する。

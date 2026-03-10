import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useGlobalPodcastMiniPlayerUi } from "../hooks/useGlobalPodcastMiniPlayerUi"
import { useMiniPlayerDismissal } from "../hooks/useMiniPlayerDismissal"
import { useMiniPlayerFlipAnimation } from "../hooks/useMiniPlayerFlipAnimation"
import { useMiniPlayerVisibility } from "../hooks/useMiniPlayerVisibility"
import { usePodcastPlayer } from "../usePodcastPlayer"
import GlobalPodcastMiniPlayer from "./GlobalPodcastMiniPlayer"

vi.mock("../usePodcastPlayer", () => ({
  usePodcastPlayer: vi.fn(),
}))

vi.mock("../hooks/useGlobalPodcastMiniPlayerUi", () => ({
  useGlobalPodcastMiniPlayerUi: vi.fn(),
}))

vi.mock("../hooks/useMiniPlayerDismissal", () => ({
  useMiniPlayerDismissal: vi.fn(),
}))

vi.mock("../hooks/useMiniPlayerFlipAnimation", () => ({
  useMiniPlayerFlipAnimation: vi.fn(),
}))

vi.mock("../hooks/useMiniPlayerVisibility", () => ({
  useMiniPlayerVisibility: vi.fn(),
}))

vi.mock("./CollapsedMiniPlayerThumbnail", () => ({
  default: ({ title }) => <div>collapsed:{title}</div>,
}))

vi.mock("./ExpandedMiniPlayerPanel", () => ({
  default: ({ title }) => <div>expanded:{title}</div>,
}))

function mockBase() {
  vi.mocked(usePodcastPlayer).mockReturnValue({
    currentEpisode: { id: "ep-1", title: "第1回" },
    isPlaying: false,
    currentTime: 0,
    duration: 120,
    togglePlayPause: vi.fn(),
    pause: vi.fn(),
    seekBy: vi.fn(),
    seekTo: vi.fn(),
  })
  vi.mocked(useGlobalPodcastMiniPlayerUi).mockReturnValue({
    isCollapsed: false,
    playerRef: { current: null },
    containerStyle: { top: "0px" },
    containerSx: { width: 320 },
    startDrag: vi.fn(),
    expand: vi.fn(),
    collapse: vi.fn(),
  })
  vi.mocked(useMiniPlayerDismissal).mockReturnValue({
    isDismissed: false,
    dismiss: vi.fn(),
  })
  vi.mocked(useMiniPlayerFlipAnimation).mockReturnValue({
    collapseWithAnimation: vi.fn(),
    expandWithAnimation: vi.fn(),
    animationSx: { opacity: 1 },
  })
  vi.mocked(useMiniPlayerVisibility).mockReturnValue({
    isVisible: true,
    reason: "HAS_CURRENT_EPISODE",
  })
}

describe("GlobalPodcastMiniPlayer", () => {
  it("表示条件を満たさないときは何も描画しない", () => {
    mockBase()
    vi.mocked(useMiniPlayerVisibility).mockReturnValue({
      isVisible: false,
      reason: "NO_CURRENT_EPISODE",
    })

    const { container } = render(<GlobalPodcastMiniPlayer />)

    expect(container).toBeEmptyDOMElement()
  })

  it("collapsed/expanded を切り替えて描画する", () => {
    mockBase()
    const { rerender } = render(<GlobalPodcastMiniPlayer />)

    expect(screen.getByTestId("global-podcast-mini-player")).toHaveAttribute(
      "data-visibility-reason",
      "HAS_CURRENT_EPISODE",
    )
    expect(screen.getByText("expanded:第1回")).toBeInTheDocument()

    vi.mocked(useGlobalPodcastMiniPlayerUi).mockReturnValue({
      isCollapsed: true,
      playerRef: { current: null },
      containerStyle: undefined,
      containerSx: { width: 80 },
      startDrag: vi.fn(),
      expand: vi.fn(),
      collapse: vi.fn(),
    })

    rerender(<GlobalPodcastMiniPlayer />)

    expect(screen.getByText("collapsed:第1回")).toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AppLayout from "./AppLayout"

vi.mock("../components/Header", () => ({
  default: () => <div>Header</div>,
}))

vi.mock("../components/Footer", () => ({
  default: () => <div>Footer</div>,
}))

vi.mock("../components/PwaInstallButton", () => ({
  default: () => <div>PwaInstallButton</div>,
}))

vi.mock("../features/podcastPlayer/ui/GlobalPodcastMiniPlayer", () => ({
  default: () => <div>GlobalPodcastMiniPlayer</div>,
}))

vi.mock("../features/podcastPlayer/PodcastPlayerContext.jsx", () => ({
  PodcastPlayerProvider: ({ children }) => <div data-testid="podcast-player-provider">{children}</div>,
}))

describe("AppLayout", () => {
  it("共通レイアウトと children を組み立てる", () => {
    render(
      <AppLayout>
        <div>MainContent</div>
      </AppLayout>,
    )

    expect(screen.getByTestId("podcast-player-provider")).toBeInTheDocument()
    expect(screen.getByText("Header")).toBeInTheDocument()
    expect(screen.getByText("MainContent")).toBeInTheDocument()
    expect(screen.getByText("PwaInstallButton")).toBeInTheDocument()
    expect(screen.getByText("GlobalPodcastMiniPlayer")).toBeInTheDocument()
    expect(screen.getByText("Footer")).toBeInTheDocument()
  })
})

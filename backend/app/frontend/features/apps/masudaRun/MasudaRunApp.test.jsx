import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { getUserIdFromCookie } from "../../../utils/userId"
import useRankings from "./hooks/useRankings"
import MasudaRunApp from "./MasudaRunApp"

vi.mock("../../../utils/userId", () => ({
  getUserIdFromCookie: vi.fn(),
}))

vi.mock("./hooks/useRankings", () => ({
  default: vi.fn(),
}))

vi.mock("../ui/AppsDrawerLauncher", () => ({
  default: ({ title, onOpen, children }) => (
    <div>
      <button onClick={() => void onOpen()}>{title}</button>
      {children}
    </div>
  ),
}))

vi.mock("./components/MasudaRunGame", () => ({
  default: ({ onScoreSubmit, rankings }) => (
    <div>
      <button onClick={() => void onScoreSubmit(1234)}>submit-score</button>
      <div>{`rankings:${rankings?.length ?? 0}`}</div>
    </div>
  ),
}))

describe("MasudaRunApp", () => {
  it("初回 open で有効化し、その後は refresh する", async () => {
    const refreshRankings = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useRankings).mockImplementation((enabled) => ({
      rankings: [],
      rankingsLoading: enabled,
      error: null,
      rankingsError: false,
      refreshRankings,
      submitRanking: vi.fn(),
    }))

    render(<MasudaRunApp />)

    expect(useRankings).toHaveBeenCalledWith(false)
    fireEvent.click(screen.getByRole("button", { name: "増田RUN" }))

    await waitFor(() => {
      expect(useRankings).toHaveBeenLastCalledWith(true)
    })

    fireEvent.click(screen.getByRole("button", { name: "増田RUN" }))

    await waitFor(() => {
      expect(refreshRankings).toHaveBeenCalledTimes(1)
    })
  })

  it("有効化後のみランキング送信し、cookie がなければ送らない", async () => {
    const submitRanking = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useRankings).mockImplementation((enabled) => ({
      rankings: [{ rank: 1 }],
      rankingsLoading: false,
      error: null,
      rankingsError: false,
      refreshRankings: vi.fn(),
      submitRanking: enabled ? submitRanking : vi.fn(),
    }))
    vi.mocked(getUserIdFromCookie).mockReturnValue("cookie-user")

    const { rerender } = render(<MasudaRunApp />)
    fireEvent.click(screen.getByRole("button", { name: "submit-score" }))
    expect(submitRanking).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: "増田RUN" }))
    rerender(<MasudaRunApp />)
    fireEvent.click(screen.getByRole("button", { name: "submit-score" }))

    await waitFor(() => {
      expect(submitRanking).toHaveBeenCalledWith(1234, "cookie-user")
    })

    vi.mocked(getUserIdFromCookie).mockReturnValue(null)
    fireEvent.click(screen.getByRole("button", { name: "submit-score" }))
    expect(submitRanking).toHaveBeenCalledTimes(1)
  })
})

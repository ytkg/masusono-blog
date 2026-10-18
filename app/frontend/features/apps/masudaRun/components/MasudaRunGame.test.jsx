import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it, vi } from "vitest"
import MasudaRunGame from "./MasudaRunGame"
import { AppActivityProvider } from "../../shared/AppActivityContext"

vi.mock("../assets/masuda_run.webp", () => ({ default: "/player.png" }))
vi.mock("../assets/other1.webp", () => ({ default: "/short.png" }))
vi.mock("../assets/other2.webp", () => ({ default: "/tall.png" }))

vi.mock("../hooks/useMasudaRunAssets", () => ({
  useMasudaRunAssets: vi.fn(),
}))

vi.mock("../hooks/useMasudaRunInput", () => ({
  useMasudaRunInput: vi.fn(() => ({
    onPrimaryPointerDown: vi.fn(),
    onPrimaryClick: vi.fn(() => true),
  })),
}))

vi.mock("../hooks/useMasudaRunRestartCooldown", () => ({
  useMasudaRunRestartCooldown: vi.fn(),
}))

const { useMasudaRunLoopMock } = vi.hoisted(() => ({
  useMasudaRunLoopMock: vi.fn(),
}))

vi.mock("../hooks/useMasudaRunLoop", () => ({
  useMasudaRunLoop: useMasudaRunLoopMock,
}))

vi.mock("./MasudaRunRankings", () => ({
  default: ({ rankings }) => <div>{`rankings:${rankings?.length ?? 0}`}</div>,
}))

vi.mock("../lib", async () => {
  const actual = await vi.importActual("../lib")
  return {
    ...actual,
    CFG: { ...actual.CFG, BASE_W: 900, BASE_H: 300, MAX_JUMPS: 2, JUMP_VY: -11, SPIN_MS: 500 },
    createInitialWorld: vi.fn(() => ({
      player: { vy: 0, onGround: true, jumps: 0, spin: 0 },
    })),
    getStoredHighScore: vi.fn(() => 42),
    getNow: vi.fn(() => 1000),
  }
})

describe("MasudaRunGame", () => {
  it("操作不可の間はボタンでも開始・ジャンプせず、再開時は同じラウンドを維持する", () => {
    useMasudaRunLoopMock.mockReset()
    const game = (active) => (
      <AppActivityProvider value={active}>
        <MasudaRunGame rankings={[]} rankingsLoading={false} rankingsError={false} />
      </AppActivityProvider>
    )
    const { rerender } = render(game(false))
    fireEvent.click(screen.getByRole("button", { name: "スタート" }))
    expect(screen.getByRole("button", { name: "スタート" })).toBeInTheDocument()
    rerender(game(true))
    fireEvent.click(screen.getByRole("button", { name: "スタート" }))
    const player = useMasudaRunLoopMock.mock.calls.at(-1)[0].refs.worldRef.current.player
    rerender(game(false))
    fireEvent.click(screen.getByRole("button", { name: "ジャンプ" }))
    expect(player.jumps).toBe(0)
    rerender(game(true))
    fireEvent.click(screen.getByRole("button", { name: "ジャンプ" }))
    expect(player.jumps).toBe(1)
    expect(useMasudaRunLoopMock.mock.calls.at(-1)[0].refs.worldRef.current.player).toBe(player)
  })

  it("初期表示でスコアとランキングを描画し、スタートできる", async () => {
    useMasudaRunLoopMock.mockReset()
    render(
      <MasudaRunGame rankings={[{ rank: 1 }]} rankingsLoading={false} rankingsError={false} onScoreSubmit={vi.fn()} />,
    )

    expect(screen.getByText("スコア 00000")).toBeInTheDocument()
    expect(screen.getByText("ハイスコア 00042")).toBeInTheDocument()
    expect(screen.getByText("rankings:1")).toBeInTheDocument()
    const canvas = screen.getByRole("img", { name: "増田RUNのゲーム画面" })
    expect(canvas).toHaveAttribute("tabindex", "0")
    expect(canvas).toHaveAccessibleDescription(/スペース\/↑でジャンプ/)

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "スタート" }))
    })

    expect(screen.getByRole("button", { name: "ジャンプ" })).toBeInTheDocument()
  })

  it("gameover になったラウンドでスコア送信する", async () => {
    useMasudaRunLoopMock.mockReset()
    const onScoreSubmit = vi.fn().mockResolvedValue(undefined)
    useMasudaRunLoopMock.mockImplementation(({ state, setState, refs }) => {
      const scoreRef = refs.scoreRef
      useEffect(() => {
        if (state === "playing") {
          scoreRef.current = 88
          setState("gameover")
        }
      }, [state, setState, scoreRef])
    })

    render(<MasudaRunGame rankings={[]} rankingsLoading={false} rankingsError={false} onScoreSubmit={onScoreSubmit} />)

    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "スタート" }))
    })

    await waitFor(() => {
      expect(onScoreSubmit).toHaveBeenCalledWith(88)
    })
    expect(screen.getByRole("button", { name: "リスタート" })).toBeInTheDocument()
  })

  it("cooldown 中はリスタートを無効化する", async () => {
    useMasudaRunLoopMock.mockReset()
    const { getNow } = await import("../lib")
    vi.mocked(getNow).mockReturnValue(100)
    useMasudaRunLoopMock.mockImplementation(({ state, setState, setRestartReadyAt }) => {
      useEffect(() => {
        if (state === "playing") {
          setRestartReadyAt(999)
          setState("gameover")
        }
      }, [state, setState, setRestartReadyAt])
    })

    render(<MasudaRunGame rankings={[]} rankingsLoading={false} rankingsError={false} onScoreSubmit={vi.fn()} />)
    act(() => {
      fireEvent.click(screen.getByRole("button", { name: "スタート" }))
    })

    expect(await screen.findByRole("button", { name: "リスタート" })).toBeDisabled()
  })
  it("pointer操作後の抑止されたclickではジャンプを重ねない", () => {
    useMasudaRunLoopMock.mockReset()
    render(<MasudaRunGame rankings={[]} rankingsLoading={false} rankingsError={false} />)
    fireEvent.pointerDown(screen.getByRole("button", { name: "スタート" }))
    fireEvent.click(screen.getByRole("button", { name: "ジャンプ" }), { detail: 1 })
    const player = useMasudaRunLoopMock.mock.calls.at(-1)[0].refs.worldRef.current.player
    expect(player.jumps).toBe(0)
    fireEvent.click(screen.getByRole("button", { name: "ジャンプ" }))
    expect(player.jumps).toBe(1)
  })
})

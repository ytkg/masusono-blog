import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { useSeekSliderState } from "../hooks/useSeekSliderState"
import PodcastAudioPlayer from "./PodcastAudioPlayer"

vi.mock("../hooks/useSeekSliderState", () => ({
  useSeekSliderState: vi.fn(),
}))

describe("PodcastAudioPlayer", () => {
  it("操作ボタンと再生時間を表示する", () => {
    vi.mocked(useSeekSliderState).mockReturnValue({
      displayedCurrentTime: 65,
      sliderValue: 65,
      handleSeekChange: vi.fn(),
      handleSeekCommit: vi.fn(),
    })
    const onTogglePlayback = vi.fn()
    const onSeekBy = vi.fn()

    render(
      <PodcastAudioPlayer
        title="第1回"
        isPlaying={false}
        currentTime={10}
        duration={120}
        onTogglePlayback={onTogglePlayback}
        onSeekBy={onSeekBy}
        onSeekTo={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "再生" }))
    fireEvent.click(screen.getByRole("button", { name: "10秒戻る" }))
    fireEvent.click(screen.getByRole("button", { name: "10秒進む" }))

    expect(onTogglePlayback).toHaveBeenCalledTimes(1)
    expect(onSeekBy).toHaveBeenNthCalledWith(1, -10)
    expect(onSeekBy).toHaveBeenNthCalledWith(2, 10)
    expect(screen.getByText("01:05 / 02:00")).toBeInTheDocument()
    expect(screen.getByRole("slider", { name: "エピソード再生位置: 第1回" })).toBeInTheDocument()
  })

  it("mini variant では mini 用の aria-label を使う", () => {
    vi.mocked(useSeekSliderState).mockReturnValue({
      displayedCurrentTime: 0,
      sliderValue: 0,
      handleSeekChange: vi.fn(),
      handleSeekCommit: vi.fn(),
    })

    render(
      <PodcastAudioPlayer
        title="第2回"
        isPlaying
        currentTime={0}
        duration={0}
        onTogglePlayback={vi.fn()}
        onSeekBy={vi.fn()}
        onSeekTo={vi.fn()}
        variant="mini"
      />,
    )

    expect(screen.getByRole("button", { name: "ミニプレイヤーを一時停止" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "ミニプレイヤーで10秒戻る" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "ミニプレイヤーで10秒進む" })).toBeDisabled()
    expect(screen.getByRole("slider", { name: "ミニプレイヤーの再生位置: 第2回" })).toBeDisabled()
  })
})

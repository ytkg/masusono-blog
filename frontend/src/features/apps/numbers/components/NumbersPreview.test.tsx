import { render, screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import NumbersPreview from "./NumbersPreview"
import { useMetrics } from "@/features/apps/numbers/hooks/useMetrics"
import type { MetricsResponse } from "@/features/apps/numbers/model/metrics"

vi.mock("@/features/apps/numbers/hooks/useMetrics", () => ({
  useMetrics: vi.fn(),
}))

const useMetricsMock = useMetrics as unknown as MockedFunction<typeof useMetrics>

const createMetricsState = (override: Partial<ReturnType<typeof useMetrics>>) =>
  ({
    data: undefined,
    error: undefined,
    isLoading: false,
    isValidating: false,
    mutate: vi.fn(),
    ...override,
  }) as ReturnType<typeof useMetrics>

describe("NumbersPreview", () => {
  it("ロード中はスケルトンを表示する", () => {
    useMetricsMock.mockReturnValue(createMetricsState({ isLoading: true }))
    const { container } = render(<NumbersPreview />)

    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0)
  })

  it("エラー時のメッセージを表示する", () => {
    useMetricsMock.mockReturnValue(createMetricsState({ error: new Error("fail") }))
    render(<NumbersPreview />)

    expect(screen.getByText("データの取得に失敗しました。")).toBeInTheDocument()
  })

  it("取得したメトリクスを描画する", () => {
    const response: MetricsResponse = {
      blocks: [
        { label: "公開からの日数", value: "10 日" },
        {
          label: "ブログ",
          value: null,
          children: [
            {
              label: "総記事数",
              value: "3 本",
              children: [{ label: "増田の総記事数", value: "2 本" }],
            },
          ],
        },
      ],
    }
    useMetricsMock.mockReturnValue(createMetricsState({ data: response }))
    render(<NumbersPreview />)

    expect(screen.getByText("公開からの日数")).toBeInTheDocument()
    expect(screen.getByText("10 日")).toBeInTheDocument()
    expect(screen.getByText("ブログ")).toBeInTheDocument()
    expect(screen.getByText("総記事数")).toBeInTheDocument()
    expect(screen.getByText("3 本")).toBeInTheDocument()
    expect(screen.getByText("増田の総記事数")).toBeInTheDocument()
  })
})

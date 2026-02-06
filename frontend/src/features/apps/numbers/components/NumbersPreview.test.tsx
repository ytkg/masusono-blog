import { render, screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import NumbersPreview from "./NumbersPreview"
import { useMetrics } from "../../../../hooks/useMetrics"
import type { MetricsResponse } from "../../../../types/metrics"

vi.mock("../../../../hooks/useMetrics", () => ({
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
  it("読み込み中を表示する", () => {
    useMetricsMock.mockReturnValue(createMetricsState({ isLoading: true }))
    render(<NumbersPreview />)

    expect(screen.getByText("読み込み中...")).toBeInTheDocument()
  })

  it("エラー時のメッセージを表示する", () => {
    useMetricsMock.mockReturnValue(createMetricsState({ error: new Error("fail") }))
    render(<NumbersPreview />)

    expect(screen.getByText("データの取得に失敗しました。")).toBeInTheDocument()
  })

  it("取得したメトリクスを描画する", () => {
    const response: MetricsResponse = {
      blocks: [
        { kind: "single", metric: { label: "公開からの日数", value: "10 日" } },
        {
          kind: "group",
          label: "ブログ",
          groups: [
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

import { fireEvent, render, screen } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import Shops from "./Shops"
import { usePageMeta } from "../hooks/usePageMeta"

vi.mock("../hooks/usePageMeta", () => ({
  usePageMeta: vi.fn(),
}))

vi.mock("leaflet", () => {
  const createMap = () => ({
    fitBounds: vi.fn(),
    setView: vi.fn(),
    getZoom: vi.fn(() => 13),
    remove: vi.fn(),
    invalidateSize: vi.fn(),
  })
  const createMarker = () => ({
    addTo: vi.fn().mockReturnThis(),
    on: vi.fn(),
    bindTooltip: vi.fn(),
    remove: vi.fn(),
    openTooltip: vi.fn(),
    closeTooltip: vi.fn(),
  })

  return {
    default: {
      map: vi.fn(() => createMap()),
      tileLayer: vi.fn(() => ({ addTo: vi.fn().mockReturnThis() })),
      latLngBounds: vi.fn((coords: unknown[]) => ({
        isValid: () => coords.length > 0,
        pad: vi.fn().mockReturnThis(),
      })),
      marker: vi.fn(() => createMarker()),
      icon: vi.fn(() => ({})),
    },
  }
})

const usePageMetaMock = usePageMeta as unknown as MockedFunction<typeof usePageMeta>

describe("Shops", () => {
  beforeAll(() => {
    const ResizeObserverMock: typeof ResizeObserver = class implements ResizeObserver {
      private readonly callback: ResizeObserverCallback

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
      }

      observe(target: Element, options?: ResizeObserverOptions) {
        void this.callback
        void target
        void options
      }

      unobserve(target: Element) {
        void target
      }

      disconnect() {}

      takeRecords(): ResizeObserverEntry[] {
        return []
      }
    }

    ;(globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver = ResizeObserverMock
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it("メタ情報を設定し、店のリストを表示する", () => {
    render(<Shops />)

    expect(screen.getByRole("heading", { level: 1, name: "推し店" })).toBeInTheDocument()
    expect(screen.getByText("遊飯家 酒舞")).toBeInTheDocument()
    expect(screen.getByText("たなか青空笑店")).toBeInTheDocument()
    expect(usePageMetaMock).toHaveBeenCalledWith({
      title: "推し店",
      description: "増田とその他！おすすめのスポットをマップ付きで紹介。カテゴリー別に推し店を探せます。",
      canonicalPath: "/shops",
    })
  })

  it("カテゴリー絞り込みで該当店舗のみ表示する", () => {
    render(<Shops />)

    fireEvent.click(screen.getByRole("button", { name: "ラーメン" }))

    expect(screen.getByText("たなか青空笑店")).toBeInTheDocument()
    expect(screen.queryByText("遊飯家 酒舞")).not.toBeInTheDocument()
  })
})

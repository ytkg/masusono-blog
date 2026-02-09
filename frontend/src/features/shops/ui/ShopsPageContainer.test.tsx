import { fireEvent, render, screen, within } from "@testing-library/react"
import { type MockedFunction, vi } from "vitest"
import { createShopBaseId } from "@/features/shops/lib/shopSelection"
import type { Shop } from "@/features/shops/model/shop"
import { useShops } from "@/features/shops/hooks/useShops"
import { ShopsPageContainer } from "@/features/shops/ui/ShopsPageContainer"

vi.mock("@/features/shops/hooks/useShops", () => ({
  useShops: vi.fn(),
}))

vi.mock("@/features/shops/hooks/usePreventBodyScroll", () => ({
  usePreventBodyScroll: () => {},
}))

vi.mock("@/features/shops/ui/ShopsMap", () => ({
  ShopsMap: ({ selectedKey }: { selectedKey: string | null }) => (
    <div data-testid="shops-map" data-selected-key={selectedKey ?? ""} />
  ),
}))

const useShopsMock = useShops as unknown as MockedFunction<typeof useShops>

function mockUseShops(overrides: Partial<ReturnType<typeof useShops>> = {}) {
  useShopsMock.mockReturnValue({
    shops: [],
    isLoading: false,
    errorMessage: null,
    rawError: null,
    ...overrides,
  })
}

describe("ShopsPageContainer", () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it("loading状態ではスケルトンを表示する", () => {
    mockUseShops({ isLoading: true, shops: [] })

    const { container } = render(<ShopsPageContainer />)

    expect(container.querySelectorAll(".MuiSkeleton-root").length).toBeGreaterThan(0)
  })

  it("error状態ではエラーメッセージを表示する", () => {
    mockUseShops({ errorMessage: "データの取得に失敗しました。", rawError: new Error("network") })

    render(<ShopsPageContainer />)

    expect(screen.getByText("データの取得に失敗しました。")).toBeInTheDocument()
  })

  it("empty状態では空状態メッセージを表示する", () => {
    mockUseShops({ shops: [] })

    render(<ShopsPageContainer />)

    expect(screen.getByText("表示する推し店がありません。")).toBeInTheDocument()
  })

  it("loaded状態では店舗カード一覧を表示する", () => {
    const shops: Shop[] = [
      { name: "増田珈琲", category: "カフェ", lat: 35.681236, lng: 139.767125, desc: "豆がうまい" },
    ]
    mockUseShops({ shops })

    render(<ShopsPageContainer />)

    expect(screen.getByText("増田珈琲")).toBeInTheDocument()
    expect(screen.getByText("豆がうまい")).toBeInTheDocument()
  })

  it("絞り込みで選択中店舗が対象外になった場合は先頭へ補正される", () => {
    const ramenShop: Shop = { name: "増田ラーメン", category: "ラーメン", lat: 35.6895, lng: 139.6917 }
    const cafeShop: Shop = { name: "増田珈琲", category: "カフェ", lat: 35.681236, lng: 139.767125 }
    mockUseShops({ shops: [ramenShop, cafeShop] })

    render(<ShopsPageContainer />)

    const ramenId = `${createShopBaseId(ramenShop)}#1`
    const cafeId = `${createShopBaseId(cafeShop)}#1`
    const map = screen.getByTestId("shops-map")

    expect(map).toHaveAttribute("data-selected-key", ramenId)

    fireEvent.click(screen.getByLabelText("増田珈琲 を選択"))
    expect(map).toHaveAttribute("data-selected-key", cafeId)

    fireEvent.click(screen.getByRole("button", { name: "ラーメン" }))
    expect(map).toHaveAttribute("data-selected-key", ramenId)
  })

  it("外部リンクのaria-labelが具体的文言になっている", () => {
    const shops: Shop[] = [
      { name: "増田珈琲", category: "カフェ", lat: 35.681236, lng: 139.767125, url: "https://example.com" },
    ]
    mockUseShops({ shops })

    render(<ShopsPageContainer />)

    const card = screen.getByLabelText("増田珈琲 を選択")
    expect(within(card).getByLabelText("増田珈琲 の外部サイトを新しいタブで開く")).toBeInTheDocument()
  })
})

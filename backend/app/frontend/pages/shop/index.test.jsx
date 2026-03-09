import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import Shops from "./index"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title }) => <div>seo:{title}</div>,
}))

vi.mock("../../features/shops/usePreventBodyScroll", () => ({
  usePreventBodyScroll: vi.fn(),
}))

vi.mock("../../features/shops/ShopsMap", () => ({
  default: ({ visibleShops, selectedKey }) => <div>{`map:${visibleShops.length}:${selectedKey ?? "none"}`}</div>,
}))

vi.mock("../../features/shops/ShopsList", () => ({
  default: ({ shops, selectedKey, onSelect, getKey }) => (
    <div>
      <div>{`list:${shops.length}:${selectedKey ?? "none"}`}</div>
      {shops.map((shop) => (
        <button key={shop.name} onClick={() => onSelect(getKey(shop))}>
          {shop.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock("../../features/shops/ShopCategoryFilter", () => ({
  DEFAULT_CATEGORY: "all",
  default: ({ categories, onChange }) => (
    <div>
      <div>{`categories:${categories.join(",")}`}</div>
      <button onClick={() => onChange("ラーメン")}>ラーメンに切替</button>
      <button onClick={() => onChange("all")}>すべてに切替</button>
    </div>
  ),
}))

describe("Shops page", () => {
  it("カテゴリ、選択状態、子コンポーネント連携を制御する", async () => {
    const shops = [
      { name: "A店", category: "カフェ", lat: 35.1, lng: 139.1 },
      { name: "B店", category: "ラーメン", lat: 35.2, lng: 139.2 },
      { name: "C店", category: "ラーメン", lat: 35.3, lng: 139.3 },
    ]

    render(<Shops shops={shops} />)

    expect(screen.getByText("seo:推し店")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "推し店" })).toBeInTheDocument()
    expect(screen.getByText("categories:カフェ,ラーメン")).toBeInTheDocument()
    expect(await screen.findByText(/map:3:/)).toBeInTheDocument()

    fireEvent.click(screen.getByText("B店"))
    expect(await screen.findByText((text) => text.startsWith("list:3:") && text.includes("B店-ラーメン"))).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "ラーメンに切替" }))
    expect(await screen.findByText((text) => text.startsWith("map:2:") && text.includes("B店-ラーメン"))).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "すべてに切替" }))
    expect(await screen.findByText((text) => text.startsWith("map:3:") && text.includes("B店-ラーメン"))).toBeInTheDocument()
  })
})

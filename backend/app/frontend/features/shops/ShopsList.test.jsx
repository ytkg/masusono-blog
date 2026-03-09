import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ShopsList from "./ShopsList"

describe("ShopsList", () => {
  it("対象がなければ空状態を表示する", () => {
    render(<ShopsList shops={[]} />)

    expect(screen.getByText("表示する推し店がありません。")).toBeInTheDocument()
  })

  it("店舗カードを表示し選択できる", () => {
    const onSelect = vi.fn()

    render(
      <ShopsList
        shops={[
          {
            name: "喫茶ますだ",
            lat: 35.1,
            lng: 139.1,
            category: "カフェ",
            url: "https://example.com",
            desc: "おすすめです",
          },
        ]}
        selectedKey="shop-1"
        getKey={() => "shop-1"}
        onSelect={onSelect}
      />,
    )

    fireEvent.click(screen.getByRole("button", { name: "喫茶ますだ を選択" }))

    expect(onSelect).toHaveBeenCalledWith("shop-1")
    expect(screen.getByRole("link", { name: "喫茶ますだ の外部サイトを新しいタブで開く" })).toHaveAttribute(
      "href",
      "https://example.com",
    )
    expect(screen.getByText("おすすめです")).toBeInTheDocument()
  })
})

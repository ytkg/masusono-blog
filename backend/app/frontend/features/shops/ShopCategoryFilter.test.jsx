import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ShopCategoryFilter from "./ShopCategoryFilter"

describe("ShopCategoryFilter", () => {
  it("すべてとカテゴリ選択を onChange に渡す", () => {
    const onChange = vi.fn()

    render(<ShopCategoryFilter category="all" categories={["ラーメン", "カフェ"]} onChange={onChange} />)

    fireEvent.click(screen.getByRole("button", { name: "すべて" }))
    fireEvent.click(screen.getByRole("button", { name: "ラーメン" }))

    expect(onChange).toHaveBeenNthCalledWith(1, "all")
    expect(onChange).toHaveBeenNthCalledWith(2, "ラーメン")
  })
})

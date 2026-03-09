import { render } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ShopsMap from "./ShopsMap"

const { useLeafletMapMock } = vi.hoisted(() => ({
  useLeafletMapMock: vi.fn(),
}))

vi.mock("./useLeafletMap", () => ({
  useLeafletMap: useLeafletMapMock,
}))

describe("ShopsMap", () => {
  it("map ref と props を useLeafletMap へ渡す", () => {
    const onSelect = vi.fn()
    const getKey = vi.fn()

    render(<ShopsMap shops={[{ name: "A" }]} visibleShops={[{ name: "A" }]} selectedKey="id-1" onSelect={onSelect} getKey={getKey} />)

    expect(useLeafletMapMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mapContainerRef: expect.objectContaining({ current: expect.any(HTMLDivElement) }),
        shops: [{ name: "A" }],
        visibleShops: [{ name: "A" }],
        selectedKey: "id-1",
        onSelect,
        getKey,
      }),
    )
  })
})

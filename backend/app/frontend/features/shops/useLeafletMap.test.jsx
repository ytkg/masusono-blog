import { renderHook } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => {
  const markers = []
  const map = {
    fitBounds: vi.fn(),
    setView: vi.fn(),
    invalidateSize: vi.fn(),
    getZoom: vi.fn(() => 12),
    remove: vi.fn(),
  }
  const latLngBounds = vi.fn(() => ({
    isValid: () => true,
    pad: vi.fn(() => "PADDED_BOUNDS"),
  }))
  const marker = vi.fn(([lat, lng]) => {
    const record = {
      lat,
      lng,
      addTo: vi.fn(() => record),
      on: vi.fn((eventName, handler) => {
        if (eventName === "click") record.click = handler
        return record
      }),
      bindTooltip: vi.fn(() => record),
      openTooltip: vi.fn(),
      closeTooltip: vi.fn(),
      off: vi.fn(),
      remove: vi.fn(),
    }
    markers.push(record)
    return record
  })
  return {
    markers,
    map,
    latLngBounds,
    marker,
    mapFactory: vi.fn(() => map),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    icon: vi.fn(() => "ICON"),
  }
})

vi.mock("leaflet", () => ({
  default: {
    map: mocks.mapFactory,
    tileLayer: mocks.tileLayer,
    marker: mocks.marker,
    latLngBounds: mocks.latLngBounds,
    icon: mocks.icon,
  },
}))

describe("useLeafletMap", () => {
  beforeEach(() => {
    class MockResizeObserver {
      constructor(callback) {
        this.callback = callback
        this.observe = vi.fn()
        this.disconnect = vi.fn()
      }
    }
    vi.stubGlobal("ResizeObserver", MockResizeObserver)
  })

  afterEach(() => {
    mocks.markers.length = 0
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it("地図初期化、bounds、marker、選択同期、cleanup を行う", async () => {
    const { useLeafletMap } = await import("./useLeafletMap")
    const onSelect = vi.fn()
    const getKey = (shop) => shop.id
    const mapContainerRef = { current: document.createElement("div") }
    const shops = [
      { id: "a", name: "A店", lat: 35.1, lng: 139.1 },
      { id: "b", name: "B店", lat: 35.2, lng: 139.2 },
      { id: "invalid", name: "X店", lat: 999, lng: 999 },
    ]

    const { unmount } = renderHook(() =>
      useLeafletMap({
        mapContainerRef,
        shops,
        visibleShops: shops.slice(0, 2),
        selectedKey: "b",
        onSelect,
        getKey,
      }),
    )

    expect(mocks.mapFactory).toHaveBeenCalledWith(mapContainerRef.current)
    expect(mocks.tileLayer).toHaveBeenCalledTimes(1)
    expect(mocks.latLngBounds).toHaveBeenCalledWith([
      [35.1, 139.1],
      [35.2, 139.2],
    ])
    expect(mocks.map.fitBounds).toHaveBeenCalledWith("PADDED_BOUNDS")
    expect(mocks.marker).toHaveBeenCalledWith([35.1, 139.1], { icon: "ICON" })
    expect(mocks.marker).toHaveBeenCalledWith([35.2, 139.2], { icon: "ICON" })
    expect(mocks.markers.some((marker) => marker.openTooltip.mock.calls.length > 0)).toBe(true)
    expect(mocks.map.setView).toHaveBeenCalledWith([35.2, 139.2], 14, { animate: true })

    mocks.markers[0].click()
    expect(onSelect).toHaveBeenCalledWith("a")

    unmount()

    expect(mocks.markers.every((marker) => marker.off.mock.calls.length > 0)).toBe(true)
    expect(mocks.markers.every((marker) => marker.remove.mock.calls.length > 0)).toBe(true)
    expect(mocks.map.remove).toHaveBeenCalledTimes(1)
  })
})

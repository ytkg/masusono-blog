import { expect, it } from "vitest"
import { chartPointIndex } from "./trendChartGeometry"

it("handles empty points and a collapsed chart rectangle", () => {
  expect(chartPointIndex(10, { left: 10, width: 0 }, 5)).toBe(0)
  expect(chartPointIndex(10, { left: 0, width: 360 }, 0)).toBe(0)
  expect(chartPointIndex(10, { left: 0, width: 360 }, 1)).toBe(0)
  expect(chartPointIndex(-10, { left: 0, width: 360 }, 5)).toBe(0)
  expect(chartPointIndex(400, { left: 0, width: 360 }, 5)).toBe(4)
})

import { expect, it } from "vitest"
import { chartPointIndex, normalizePoints, chartPointX } from "./trendChartGeometry"

it("handles empty points and a collapsed chart rectangle", () => {
  expect(chartPointIndex(10, { left: 10, width: 0 }, 5)).toBe(0)
  expect(chartPointIndex(10, { left: 0, width: 360 }, 0)).toBe(0)
  expect(chartPointIndex(10, { left: 0, width: 360 }, 1)).toBe(0)
  expect(chartPointIndex(-10, { left: 0, width: 360 }, 5)).toBe(0)
  expect(chartPointIndex(400, { left: 0, width: 360 }, 5)).toBe(4)
})

it("skips invalid values while keeping each point's original X position", () => {
  const points = [{ totalArticles: 1 }, { totalArticles: NaN }, { totalArticles: 3 }]
  const normalized = normalizePoints(points, "totalArticles", 3)
  expect(normalized.map((point) => point.x)).toEqual([chartPointX(0, 3), chartPointX(2, 3)])
  expect(normalized[0].y).toBeCloseTo(128.666667)
  expect(normalized[1].y).toBe(18)
  expect(Number.isNaN(points[1].totalArticles)).toBe(true)
})

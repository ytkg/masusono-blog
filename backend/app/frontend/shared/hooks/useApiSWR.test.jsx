import { renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import useSWR from "swr"
import { fetchJson } from "../lib/fetchJson"
import useApiSWR from "./useApiSWR"

vi.mock("swr", () => ({ default: vi.fn() }))
vi.mock("../lib/fetchJson", () => ({ fetchJson: vi.fn() }))

describe("useApiSWR", () => {
  it("有効時はendpointと共通fetcherを渡す", () => {
    renderHook(() => useApiSWR("/api/example.json", true))

    expect(useSWR).toHaveBeenCalledWith("/api/example.json", fetchJson)
  })

  it("無効時はリクエストを止める", () => {
    renderHook(() => useApiSWR("/api/example.json", false))

    expect(useSWR).toHaveBeenCalledWith(null, fetchJson)
  })
})

import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import useMediaUpload from "./useMediaUpload"
import { jsonResponse } from "@/test/jsonResponse"

afterEach(() => vi.unstubAllGlobals())

describe("useMediaUpload", () => {
  it("認証切れを通知し、入力と送信状態をリセットする", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }))
    const onUnauthorized = vi.fn()
    const onUploaded = vi.fn()
    const { result } = renderHook(() => useMediaUpload({ csrfToken: "csrf", onUnauthorized, onUploaded }))
    const input = { value: "selected" }
    result.current.fileInputRef.current = input
    await act(async () => {
      await result.current.uploadFile(new File(["image"], "image.png", { type: "image/png" }))
    })
    expect(onUnauthorized).toHaveBeenCalledOnce()
    expect(onUploaded).not.toHaveBeenCalled()
    expect(result.current.uploading).toBe(false)
    expect(result.current.uploadError).toBeNull()
    expect(input.value).toBe("")
  })

  it("送信中は状態を公開し、成功後に一覧更新を通知する", async () => {
    let resolve
    vi.stubGlobal(
      "fetch",
      vi.fn().mockReturnValue(
        new Promise((done) => {
          resolve = done
        }),
      ),
    )
    const onUploaded = vi.fn()
    const { result } = renderHook(() => useMediaUpload({ csrfToken: "csrf", onUnauthorized: vi.fn(), onUploaded }))
    let task
    act(() => {
      task = result.current.uploadFile(new File(["image"], "image.png", { type: "image/png" }))
    })
    expect(result.current.uploading).toBe(true)
    await act(async () => {
      resolve(jsonResponse({ media: { id: "new" } }))
      await task
    })
    expect(onUploaded).toHaveBeenCalledOnce()
    expect(result.current.uploading).toBe(false)
  })
})

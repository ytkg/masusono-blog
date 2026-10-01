import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import NavigationFailureDialog from "./NavigationFailureDialog"
import { dismissNavigationFailure, installNavigationRecovery } from "../shared/lib/navigationRecovery"

afterEach(() => {
  dismissNavigationFailure()
  vi.unstubAllGlobals()
})

it("遷移先への通常リンクと閉じる操作を表示する", async () => {
  const handlers = {}
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
  const remove = installNavigationRecovery({
    on: (name, handler) => {
      handlers[name] = handler
      return () => {}
    },
  })
  handlers.before({ detail: { visit: { id: "1", url: new URL("/authors", window.location.href) } } })
  handlers.httpException({ detail: { response: { status: 502, headers: {} } }, preventDefault: vi.fn() })
  render(<NavigationFailureDialog />)
  expect(screen.getByRole("dialog")).toHaveAccessibleName("読み込みに失敗しました")
  expect(screen.getByRole("link", { name: "再読み込み" })).toHaveAttribute(
    "href",
    new URL("/authors", window.location.href).href,
  )
  fireEvent.click(screen.getByRole("button", { name: "閉じる" }))
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
  remove()
})

import { act } from "react"
import { render } from "@testing-library/react"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { vi } from "vitest"
import ScrollRestoration from "./ScrollRestoration"

describe("ScrollRestoration", () => {
  it("ルート変更時にスクロール位置をリセットする", async () => {
    const originalScrollTo = window.scrollTo
    if (!window.scrollTo) {
      window.scrollTo = () => {}
    }
    const scrollSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {})

    const router = createMemoryRouter(
      [
        { path: "/", element: <ScrollRestoration /> },
        { path: "/about", element: <ScrollRestoration /> },
      ],
      { initialEntries: ["/"] },
    )

    render(<RouterProvider router={router} />)
    expect(scrollSpy).toHaveBeenCalledTimes(1)

    await act(async () => {
      await router.navigate("/about")
    })

    expect(scrollSpy).toHaveBeenCalledTimes(2)
    expect(scrollSpy).toHaveBeenLastCalledWith({ top: 0, left: 0, behavior: "auto" })

    scrollSpy.mockRestore()
    window.scrollTo = originalScrollTo
  })
})

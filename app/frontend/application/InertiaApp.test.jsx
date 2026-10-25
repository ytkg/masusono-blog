import { render, screen } from "@testing-library/react"
import { afterEach, expect, it, vi } from "vitest"
import { useTheme } from "@mui/material/styles"
import InertiaApp from "./InertiaApp"
import theme from "../theme"

vi.mock("../components/NavigationFailureDialog", () => ({
  default: () => <div role="status">navigation recovery</div>,
}))

afterEach(() => document.getElementById("app")?.remove())

it("ページへ props とテーマを渡し、クライアント起動状態をマウント期間だけ公開する", () => {
  const root = document.createElement("div")
  root.id = "app"
  document.body.append(root)
  function Page({ title }) {
    const currentTheme = useTheme()
    return <h1 data-primary={currentTheme.palette.primary.main}>{title}</h1>
  }
  const { unmount } = render(<InertiaApp App={Page} props={{ title: "記事一覧" }} />, { container: root })
  expect(screen.getByRole("heading", { name: "記事一覧" })).toHaveAttribute("data-primary", theme.palette.primary.main)
  expect(screen.getByRole("status")).toHaveTextContent("navigation recovery")
  expect(root.dataset.clientReady).toBe("true")
  unmount()
  expect(root).not.toHaveAttribute("data-client-ready")
})

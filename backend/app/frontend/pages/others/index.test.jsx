import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import OthersIndex from "./index"

vi.mock("../../shared/SeoHead", () => ({
  default: ({ title, canonicalPath }) => <div>{`seo:${title}:${canonicalPath}`}</div>,
}))

vi.mock("../../features/apps/masudaRun/MasudaRunApp", () => ({
  default: () => <div>MasudaRunApp</div>,
}))

vi.mock("../../features/apps/settings/SettingsApp", () => ({
  default: () => <div>SettingsApp</div>,
}))

describe("Others page", () => {
  it("その他ページにミニアプリを表示する", async () => {
    render(<OthersIndex />)

    expect(screen.getByText("seo:増田とその他のその他！:/others")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "増田とその他のその他！" })).toBeInTheDocument()
    expect(await screen.findByText("MasudaRunApp")).toBeInTheDocument()
    expect(await screen.findByText("SettingsApp")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "管理を開く" })).toBeInTheDocument()
  })
})

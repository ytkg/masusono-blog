import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import Header from "./Header"

describe("Header", () => {
  it("ロゴをホームへのリンクとして表示する", () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )

    const link = screen.getByRole("link", { name: "増田とその他！" })
    expect(link).toHaveAttribute("href", "/")
    expect(screen.getByAltText("増田とその他！")).toBeInTheDocument()
  })
})

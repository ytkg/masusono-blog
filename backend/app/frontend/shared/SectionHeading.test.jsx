import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import SectionHeading from "./SectionHeading"

describe("SectionHeading", () => {
  it("見出しを指定 variant/component で描画する", () => {
    render(
      <SectionHeading variant="h4" component="h3">
        セクション
      </SectionHeading>,
    )

    expect(screen.getByRole("heading", { name: "セクション", level: 3 })).toBeInTheDocument()
  })
})

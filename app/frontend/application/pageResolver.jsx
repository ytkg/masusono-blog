const pages = import.meta.glob(["../pages/**/*.jsx", "!../pages/**/*.test.jsx", "!../pages/**/*.spec.jsx"])

export async function resolvePage(name) {
  const normalized = String(name)
  const lower = normalized.toLowerCase()
  const candidates = [
    `../pages/${normalized}.jsx`,
    `../pages/${normalized}/index.jsx`,
    `../pages/${lower}.jsx`,
    `../pages/${lower}/index.jsx`,
  ]
  const path = candidates.find((candidate) => pages[candidate])
  if (!path) throw new Error(`Inertia page not found: ${name}`)

  const page = await pages[path]()
  if (!page.default.layout) {
    const { default: AppLayout } = await import("../layouts/AppLayout")
    page.default.layout = (pageNode) => <AppLayout>{pageNode}</AppLayout>
  }
  return page
}

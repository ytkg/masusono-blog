import { expect, test } from "@playwright/test"
import { mockPageProps } from "./helpers"

for (const attributes of ['data-server-rendered="true" id="app"', 'id="app" data-server-rendered="true"']) {
  test(`mockPageProps clears SSR with trailing DevTools script: ${attributes}`, async () => {
    const payload = { props: { title: "original" } }
    const discovery = '<script data-inertia-devtools-id type="application/json">"request-id"</script>'
    const html = `<!DOCTYPE html><html><body><script data-page="app" type="application/json">${JSON.stringify(payload)}</script><div ${attributes}><div><p>original</p></div></div>${discovery}</body></html>`
    let fulfilled
    const page = {
      route: async (_, handler) => {
        await handler({
          fetch: async () => ({ headers: () => ({ "content-type": "text/html" }), text: async () => html }),
          fulfill: async (result) => {
            fulfilled = result
          },
        })
      },
    }
    await mockPageProps(page, "/", (props) => {
      props.title = "replacement<script>"
    })
    expect(fulfilled.body).toContain('<div id="app"></div>' + discovery)
    expect(fulfilled.body).not.toContain("data-server-rendered")
    expect(fulfilled.body).not.toContain("<p>original</p>")
    expect(fulfilled.body).toContain('"title":"replacement\\u003cscript>"')
  })
}

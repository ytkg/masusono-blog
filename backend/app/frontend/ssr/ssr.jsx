import { createInertiaApp } from "@inertiajs/react"
import createServer from "@inertiajs/react/server"
import { renderToString } from "react-dom/server"
import AppProviders from "../shared/AppProviders"
import { resolvePage } from "../shared/pageResolver"

createServer(
  (page) =>
    createInertiaApp({
      page,
      render: renderToString,
      resolve: resolvePage,
      setup: ({ App, props }) => (
        <AppProviders>
          <App {...props} />
        </AppProviders>
      ),
    }),
  { host: "127.0.0.1" },
)

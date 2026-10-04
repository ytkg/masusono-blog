import { createInertiaApp } from "@inertiajs/react"
import createServer from "@inertiajs/react/server"
import { renderToString } from "react-dom/server"
import AppProviders from "../shared/AppProviders"
import { resolvePage } from "../shared/pageResolver"
import { createCachedRenderer } from "./renderCache"

const renderInertiaPage = (page) =>
  createInertiaApp({
    page,
    render: renderToString,
    resolve: resolvePage,
    setup: ({ App, props }) => (
      <AppProviders>
        <App {...props} />
      </AppProviders>
    ),
  })

createServer(import.meta.env.PROD ? createCachedRenderer(renderInertiaPage) : renderInertiaPage, { host: "127.0.0.1" })

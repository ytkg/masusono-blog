import { createInertiaApp } from "@inertiajs/react"
import createServer from "@inertiajs/react/server"
import { renderToString } from "react-dom/server"
import InertiaApp from "../shared/InertiaApp"
import { resolvePage } from "../shared/pageResolver"

createServer(
  (page) =>
    createInertiaApp({
      page,
      render: renderToString,
      resolve: resolvePage,
      setup: ({ App, props }) => <InertiaApp App={App} props={props} />,
    }),
  { host: "127.0.0.1" },
)

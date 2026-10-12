import AppProviders from "./AppProviders"

export default function InertiaApp({ App, props }) {
  return (
    <AppProviders>
      <App {...props} />
    </AppProviders>
  )
}

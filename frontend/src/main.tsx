import { createRoot } from "react-dom/client"
import "./index.css"
import { RootApp } from "@/app/RootApp"

const rootElement = document.getElementById("root")

if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(<RootApp />)

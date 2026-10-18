import { createContext, useContext } from "react"

const AppActivityContext = createContext(true)

export const AppActivityProvider = AppActivityContext.Provider

export function useAppActive() {
  return useContext(AppActivityContext)
}

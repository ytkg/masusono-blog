import { createContext, useContext } from "react"

const AppsLoadingContext = createContext(() => {})

export const AppsLoadingProvider = AppsLoadingContext.Provider

export function useAppLoading() {
  return useContext(AppsLoadingContext)
}

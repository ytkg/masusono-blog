import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import './index.css'
import App from './App.tsx'
import theme from './theme.ts'
import { BrowserRouter } from 'react-router-dom'

export function RootApp() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        registration?.unregister().catch((err) => {
          console.error('Service worker unregister failed:', err)
        })
      })
      caches
        .keys()
        .then((keys) => Promise.all(keys.filter((key) => key.startsWith('masusono-cache-')).map((key) => caches.delete(key))))
        .catch((err) => {
          console.warn('Failed to clear service worker caches in dev:', err)
        })
      return
    }

    navigator.serviceWorker.register('/service-worker.js', { scope: '/' }).catch((err) => {
      console.error('Service worker registration failed:', err)
    })
  }, [])

  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  )
}

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(<RootApp />)

import { useCallback, useRef, useState } from "react"
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings"
import CollectionsIcon from "@mui/icons-material/Collections"
import ArticleIcon from "@mui/icons-material/Article"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { requestJson } from "../../../shared/lib/fetchJson"
import AppsDialogLauncher from "../shared/AppsDialogLauncher"
import AdminMedia from "./AdminMedia"
import AdminArticles from "./AdminArticles"

const sessionUrl = "/api/app/management/session"

function Login({ csrfToken, onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event) {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      await onLogin({ username, password, csrfToken })
      setPassword("")
    } catch (result) {
      setError(result?.message || "ログインできませんでした。時間をおいて再度お試しください。")
    } finally {
      setPending(false)
    }
  }

  return (
    <Stack
      component="form"
      onSubmit={handleSubmit}
      spacing={2}
      sx={{ maxWidth: 420, width: "100%", mx: "auto", mt: 2 }}
    >
      <Typography component="h3" variant="h6" fontWeight={700}>
        ログイン
      </Typography>
      <TextField
        label="ユーザー名"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        required
        fullWidth
      />
      <TextField
        label="パスワード"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
        fullWidth
      />
      {error ? (
        <Typography role="alert" color="error">
          {error}
        </Typography>
      ) : null}
      <Button type="submit" variant="contained" size="large" disabled={pending}>
        {pending ? "ログイン中…" : "ログイン"}
      </Button>
    </Stack>
  )
}

function Dashboard({ onMedia, onArticles }) {
  return (
    <Stack spacing={1} alignItems="flex-start">
      <Button variant="outlined" startIcon={<CollectionsIcon />} onClick={onMedia} sx={{ p: 2 }}>
        メディア一覧へ
      </Button>
      <Button variant="outlined" startIcon={<ArticleIcon />} onClick={onArticles} sx={{ p: 2 }}>
        記事一覧へ
      </Button>
    </Stack>
  )
}

export default function AdminApp() {
  const [view, setView] = useState("checking")
  const [csrfToken, setCsrfToken] = useState("")
  const [error, setError] = useState("")
  const requestIdRef = useRef(0)
  const handleUnauthorized = useCallback(() => setView("login"), [])

  async function loadSession(requestId) {
    try {
      const session = await requestJson(sessionUrl)
      if (requestId !== requestIdRef.current) return
      setCsrfToken(session.csrf_token)
      setView(session.authenticated ? "dashboard" : "login")
    } catch {
      if (requestId !== requestIdRef.current) return
      setError("認証状態を確認できませんでした。時間をおいて再度お試しください。")
      setView("error")
    }
  }

  function handleOpen(registerLoadingTask) {
    requestIdRef.current += 1
    setView("checking")
    setError("")
    registerLoadingTask(loadSession(requestIdRef.current))
  }

  async function handleLogin({ username, password, csrfToken: token }) {
    const result = await requestJson(sessionUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-Token": token },
      body: JSON.stringify({ username, password }),
    })
    setCsrfToken(result.csrf_token)
    setView("dashboard")
  }

  return (
    <AppsDialogLauncher
      title="管理"
      buttonAriaLabel="管理を開く"
      buttonIcon={<AdminPanelSettingsIcon />}
      onOpen={handleOpen}
      onClose={() => {
        requestIdRef.current += 1
        setView("checking")
      }}
    >
      {view === "login" ? <Login csrfToken={csrfToken} onLogin={handleLogin} /> : null}
      {view === "dashboard" ? (
        <Dashboard onMedia={() => setView("media")} onArticles={() => setView("articles")} />
      ) : null}
      {view === "media" ? <AdminMedia onBack={() => setView("dashboard")} onUnauthorized={handleUnauthorized} /> : null}
      {view === "articles" ? (
        <AdminArticles onBack={() => setView("dashboard")} onUnauthorized={handleUnauthorized} />
      ) : null}
      {view === "error" ? (
        <Stack spacing={2} alignItems="flex-start">
          <Typography role="alert">{error}</Typography>
          <Button
            onClick={() => {
              setView("checking")
              loadSession(requestIdRef.current)
            }}
          >
            再試行
          </Button>
        </Stack>
      ) : null}
    </AppsDialogLauncher>
  )
}

import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import PageContainer from "../../shared/PageContainer"
import SeoHead from "../../shared/SeoHead"

export default function AdminLogin({ error, csrfToken }) {
  return (
    <>
      <SeoHead title="管理画面にログイン" description="管理画面へのログイン" canonicalPath="/admin/login" />
      <PageContainer id="admin-login">
        <Stack component="form" action="/admin/login" method="post" spacing={2} sx={{ maxWidth: 420, mx: "auto" }}>
          <Typography component="h1" variant="h5" fontWeight={700}>
            管理画面にログイン
          </Typography>
          <input type="hidden" name="authenticity_token" value={csrfToken} />
          <TextField label="ユーザー名" name="username" autoComplete="username" required fullWidth />
          <TextField
            label="パスワード"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            fullWidth
          />
          {error ? (
            <Box role="alert" sx={{ color: "error.main" }}>
              {error}
            </Box>
          ) : null}
          <Button type="submit" variant="contained" size="large">
            ログイン
          </Button>
        </Stack>
      </PageContainer>
    </>
  )
}

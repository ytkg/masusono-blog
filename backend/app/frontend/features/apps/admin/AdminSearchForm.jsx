import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"

export default function AdminSearchForm({ label, value, onChange, onSubmit, children }) {
  const fields = (
    <>
      <TextField
        label={label}
        name="q"
        size="small"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        sx={children ? { flex: 1 } : { flex: 1, minWidth: 0 }}
      />
      {children}
      <Button type="submit" variant="contained">
        検索
      </Button>
    </>
  )
  return children ? (
    <Stack
      component="form"
      onSubmit={onSubmit}
      direction={{ xs: "column", sm: "row" }}
      spacing={1}
      sx={{ mb: { xs: 1, sm: 2 } }}
    >
      {fields}
    </Stack>
  ) : (
    <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", gap: 1, mb: { xs: 1, sm: 2 } }}>
      {fields}
    </Box>
  )
}

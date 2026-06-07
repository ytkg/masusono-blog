import CloseIcon from "@mui/icons-material/Close"
import SearchIcon from "@mui/icons-material/Search"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"

export default function ArticleSearchBox({
  autoFocus = false,
  onChange,
  onClear,
  query,
}) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: { xs: 45, sm: 53 },
        zIndex: (theme) => theme.zIndex.appBar - 1,
        bgcolor: "background.default",
        borderBottom: "1px solid",
        borderColor: "divider",
        pt: 1.5,
        pb: 1.5,
      }}
    >
      <TextField
        autoFocus={autoFocus}
        fullWidth
        value={query}
        onChange={(event) => onChange(event.target.value)}
        placeholder="記事を検索"
        size="small"
        slotProps={{
          htmlInput: {
            "aria-label": "記事を検索",
          },
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="disabled" />
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton aria-label="検索語をクリア" edge="end" size="small" onClick={onClear}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
    </Box>
  )
}

import CloseIcon from "@mui/icons-material/Close"
import SearchIcon from "@mui/icons-material/Search"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"

export default function ArticleSearchBox({ isSearching, onChange, onClear, query, resultCount }) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: { xs: 44, sm: 52 },
        zIndex: (theme) => theme.zIndex.appBar - 1,
        bgcolor: "background.default",
        pt: 1,
        pb: 1.5,
      }}
    >
      <TextField
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
      {isSearching ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 0 }}>
          {resultCount}件
        </Typography>
      ) : null}
    </Box>
  )
}

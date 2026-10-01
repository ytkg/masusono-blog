import { HEADER_HEIGHT } from "../../shared/pageLayout"
import CloseIcon from "@mui/icons-material/Close"
import SearchIcon from "@mui/icons-material/Search"
import Box from "@mui/material/Box"
import AuxiliaryIconButton from "../../shared/AuxiliaryIconButton"
import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"

export default function ArticleSearchBox({ autoFocus = false, onChange, onClear, query }) {
  return (
    <Box
      sx={{
        position: "sticky",
        top: HEADER_HEIGHT,
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
        sx={{ "& .MuiInputBase-root": { height: 40 } }}
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
                <AuxiliaryIconButton aria-label="検索語をクリア" edge="end" onClick={onClear}>
                  <CloseIcon fontSize="small" />
                </AuxiliaryIconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
    </Box>
  )
}

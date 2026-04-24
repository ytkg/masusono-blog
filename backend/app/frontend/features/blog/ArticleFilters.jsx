import { useId, useState } from "react"
import CloseIcon from "@mui/icons-material/Close"
import FilterListIcon from "@mui/icons-material/FilterList"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Dialog from "@mui/material/Dialog"
import DialogContent from "@mui/material/DialogContent"
import DialogTitle from "@mui/material/DialogTitle"
import Fab from "@mui/material/Fab"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import { DEFAULT_AUTHOR, DEFAULT_YEAR_MONTH } from "./articleFilterUtils"

export default function ArticleFilters({
  author,
  authorOptions,
  yearMonth,
  yearMonthOptions,
  authorTotalCount,
  yearMonthTotalCount,
  onAuthorChange,
  onYearMonthChange,
}) {
  const [open, setOpen] = useState(false)
  const titleId = useId()
  const hasActiveFilters = author !== DEFAULT_AUTHOR || yearMonth !== DEFAULT_YEAR_MONTH

  const handleAuthorChange = (nextAuthor) => {
    onAuthorChange(nextAuthor)
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleYearMonthChange = (nextYearMonth) => {
    onYearMonthChange(nextYearMonth)
    if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <>
      <Fab
        variant="extended"
        aria-label="絞り込みを開く"
        color={hasActiveFilters ? "primary" : "default"}
        onClick={() => setOpen(true)}
        sx={{
          position: "fixed",
          right: 12,
          bottom: { xs: 110, sm: 118 },
          zIndex: (theme) => theme.zIndex.tooltip,
          boxShadow: 3,
        }}
      >
        <FilterListIcon sx={{ mr: 1 }} />
        {hasActiveFilters ? "絞り込み中" : "絞り込み"}
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} aria-labelledby={titleId} fullWidth maxWidth="sm">
        <DialogTitle
          id={titleId}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pr: 1,
          }}
        >
          絞り込み
          <IconButton aria-label="閉じる" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "grid",
              gap: 1,
              pt: 1,
            }}
          >
            {authorOptions.length ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  著者
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={`著者: すべて (${authorTotalCount})`}
                    variant={author === DEFAULT_AUTHOR ? "filled" : "outlined"}
                    color={author === DEFAULT_AUTHOR ? "primary" : "default"}
                    onClick={() => handleAuthorChange(DEFAULT_AUTHOR)}
                  />
                  {authorOptions.map(({ name, count }) => (
                    <Chip
                      key={name}
                      label={`${name} (${count})`}
                      variant={author === name ? "filled" : "outlined"}
                      color={author === name ? "primary" : "default"}
                      onClick={() => handleAuthorChange(name)}
                    />
                  ))}
                </Box>
              </Box>
            ) : null}
            {yearMonthOptions.length ? (
              <Box sx={{ display: "grid", gap: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  年月
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Chip
                    label={`年月: すべて (${yearMonthTotalCount})`}
                    variant={yearMonth === DEFAULT_YEAR_MONTH ? "filled" : "outlined"}
                    color={yearMonth === DEFAULT_YEAR_MONTH ? "primary" : "default"}
                    onClick={() => handleYearMonthChange(DEFAULT_YEAR_MONTH)}
                  />
                  {yearMonthOptions.map(({ yearMonth: optionYearMonth, count }) => (
                    <Chip
                      key={optionYearMonth}
                      label={`${optionYearMonth} (${count})`}
                      variant={yearMonth === optionYearMonth ? "filled" : "outlined"}
                      color={yearMonth === optionYearMonth ? "primary" : "default"}
                      onClick={() => handleYearMonthChange(optionYearMonth)}
                    />
                  ))}
                </Box>
              </Box>
            ) : null}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

import Box from "@mui/material/Box"
import { blue } from "@mui/material/colors"
import Button from "@mui/material/Button"
import MenuItem from "@mui/material/MenuItem"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import useCalendarFeed from "./useCalendarFeed"
import EmptyStatus from "../../shared/components/EmptyStatus"
import ArticlesList from "./ArticlesList"

const monthLengths = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

export default function CalendarFeed() {
  const { groups, selection, todayMonth, todayDay, failed, retry, changeMonth, selectDay } = useCalendarFeed()

  if (groups === null) {
    return (
      <Box sx={{ py: 2, textAlign: "center" }}>
        <Typography role="status" color="text.secondary">
          {failed ? "記事を読み込めませんでした。" : "記事を読み込んでいます…"}
        </Typography>
        {failed ? <Button onClick={retry}>再試行</Button> : null}
      </Box>
    )
  }
  if (!groups.length) return <EmptyStatus>記事がありません。</EmptyStatus>

  const { month, day: selectedDay } = selection
  const articlesByDay = new Map(
    groups
      .filter(({ monthDay }) => Number(monthDay.split("/")[0]) === month)
      .map(({ monthDay, articles }) => [Number(monthDay.split("/")[1]), articles]),
  )
  const selectedLabel = `${month}月${selectedDay}日`

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Button
          aria-label="前月"
          onClick={() => changeMonth(month === 1 ? 12 : month - 1)}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ChevronLeftIcon />
        </Button>
        <TextField
          select
          label="月"
          value={month}
          onChange={(event) => changeMonth(Number(event.target.value))}
          size="small"
          sx={{ minWidth: 120 }}
        >
          {monthLengths.map((_, index) => (
            <MenuItem key={index + 1} value={index + 1}>
              {index + 1}月
            </MenuItem>
          ))}
        </TextField>
        <Button
          aria-label="翌月"
          onClick={() => changeMonth(month === 12 ? 1 : month + 1)}
          sx={{ minWidth: 44, minHeight: 44 }}
        >
          <ChevronRightIcon />
        </Button>
      </Box>
      <Box
        aria-label={`${month}月の日付`}
        sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: { xs: 0.5, sm: 1 } }}
      >
        {Array.from({ length: monthLengths[month - 1] }, (_, index) => {
          const day = index + 1
          const count = articlesByDay.get(day)?.length ?? 0
          const selected = selectedDay === day
          const today = todayMonth === month && todayDay === day
          return (
            <Button
              key={day}
              disabled={!count}
              aria-label={`${month}月${day}日、記事${count}件`}
              aria-pressed={selected}
              aria-current={today ? "date" : undefined}
              onClick={() => selectDay(day)}
              sx={{
                minWidth: 0,
                minHeight: { xs: 64, sm: 80 },
                px: 0,
                flexDirection: "column",
                border: "1px solid",
                borderColor: selected ? blue[700] : today ? "primary.main" : "divider",
                ...(today && {
                  outline: "2px solid",
                  outlineColor: count ? "primary.contrastText" : "primary.main",
                  outlineOffset: -4,
                }),
                bgcolor: selected ? blue[700] : count ? "primary.light" : "background.paper",
                color: count ? "primary.contrastText" : "text.primary",
                "&.Mui-focusVisible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                "&:hover": { bgcolor: selected ? blue[800] : "primary.light" },
                "&.Mui-disabled": { color: "text.primary", borderColor: today ? "primary.main" : "divider" },
              }}
            >
              <Typography component="span" sx={{ fontWeight: 700 }}>
                {day}
              </Typography>
              <Typography component="span" sx={{ fontSize: { xs: 10, sm: 12 } }}>
                {count}件
              </Typography>
            </Button>
          )
        })}
      </Box>
      {selectedDay !== null ? (
        <Box component="section" aria-label={selectedLabel} sx={{ mt: 3 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            {selectedLabel}
          </Typography>
          <ArticlesList articles={articlesByDay.get(selectedDay) ?? []} />
        </Box>
      ) : null}
    </Box>
  )
}

import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Typography from "@mui/material/Typography"
import useCalendarFeed from "./useCalendarFeed"
import EmptyStatus from "../../shared/components/EmptyStatus"
import ArticlesList from "./ArticlesList"

export default function CalendarFeed() {
  const { groups, expandedMonths, failed, retry, changeMonth } = useCalendarFeed()

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

  const months = new Map()
  for (const group of groups) {
    const month = group.monthDay.split("/")[0]
    if (!months.has(month)) months.set(month, [])
    months.get(month).push(group)
  }

  return (
    <Box>
      {[...months].map(([month, days], index) => (
        <Accordion
          key={month}
          expanded={expandedMonths.at(-1) === month}
          onChange={(_, expanded) => changeMonth(month, expanded)}
          disableGutters
          elevation={0}
          slotProps={{ heading: { component: "h2" }, transition: { unmountOnExit: true } }}
          sx={{
            bgcolor: "transparent",
            borderBottom: "1px solid",
            borderColor: "divider",
            "&::before": { display: "none" },
          }}
        >
          <AccordionSummary
            id={`calendar-month-${month}-heading`}
            aria-controls={`calendar-month-${month}-content`}
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 0,
              minHeight: index === 0 ? 44 : 56,
              ...(index === 0 && {
                alignItems: "flex-start",
                "& .MuiAccordionSummary-content": { mt: 0, mb: 1.5 },
                "& .MuiAccordionSummary-expandIconWrapper": { mt: 0.5 },
              }),
            }}
          >
            <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
              {Number(month)}月
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 0, pt: 1, pb: 2 }}>
            <Box sx={{ display: "grid", gap: 1.5 }}>
              {days.map(({ monthDay, articles }, index) => {
                const [monthNumber, day] = monthDay.split("/").map(Number)
                const label = `${monthNumber}月${day}日`
                return (
                  <Box
                    component="section"
                    key={monthDay}
                    aria-label={label}
                    sx={{
                      borderBottom: index < days.length - 1 ? "1px solid" : 0,
                      borderColor: "divider",
                      pb: index < days.length - 1 ? 1.5 : 0,
                    }}
                  >
                    <Typography component="h3" variant="body2" sx={{ mb: 2, color: "text.secondary", fontWeight: 700 }}>
                      {label}
                    </Typography>
                    <ArticlesList articles={articles} />
                  </Box>
                )
              })}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  )
}

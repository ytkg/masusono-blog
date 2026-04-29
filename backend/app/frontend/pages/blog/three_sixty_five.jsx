import { useMemo, useState } from "react"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Accordion from "@mui/material/Accordion"
import AccordionDetails from "@mui/material/AccordionDetails"
import AccordionSummary from "@mui/material/AccordionSummary"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import PageContainer from "../../shared/PageContainer"
import SectionHeading from "../../shared/SectionHeading"
import SeoHead from "../../shared/SeoHead"

export default function BlogThreeSixtyFive({ months = [] }) {
  const [expandedMonthId, setExpandedMonthId] = useState(null)
  const totalDaysCount = useMemo(
    () => months.reduce((sum, month) => sum + (month.totalDaysCount ?? 0), 0),
    [months],
  )
  const filledDaysCount = useMemo(
    () => months.reduce((sum, month) => sum + (month.filledDaysCount ?? 0), 0),
    [months],
  )
  const totalProgressPercentLabel = `${Math.round(totalDaysCount ? (filledDaysCount / totalDaysCount) * 100 : 0)}%`

  function handleMonthChange(monthId) {
    setExpandedMonthId((currentMonthId) => (currentMonthId === monthId ? null : monthId))
  }

  return (
    <>
      <SeoHead
        title="365日"
        description="365日ブログ記事のタイトル一覧。"
        canonicalPath="/blog/365"
      />

      <PageContainer id="blog-365" sx={{ pb: 3 }}>
        <Box sx={{ mx: "auto", maxWidth: 1120 }}>
          <Box
            sx={{
              display: "grid",
              gap: 2,
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.5fr) minmax(280px, 0.8fr)" },
              alignItems: "end",
              mb: 3,
            }}
          >
            <SectionHeading component="h1" gutterBottom={false}>
              365日
            </SectionHeading>

            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                px: 2,
                py: 1.5,
                backgroundColor: "#fafafa",
              }}
            >
              <Typography color="text.secondary" sx={{ fontSize: "0.82rem", letterSpacing: "0.04em" }}>
                全体
              </Typography>
              <Typography sx={{ mt: 0.35, fontSize: "1.2rem", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                {filledDaysCount}/{totalDaysCount}日 ({totalProgressPercentLabel})
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.35, fontSize: "0.9rem" }}>
                記事ありの日を月別に集約
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              alignItems: "start",
            }}
          >
            {months.map((month) => {
              const articleDays = month.days.filter((day) => day.articles.length > 0)
              const progressPercent = month.totalDaysCount ? (month.filledDaysCount / month.totalDaysCount) * 100 : 0
              const progressSummaryLabel = `${month.filledDaysCount}/${month.totalDaysCount}日 (${Math.round(progressPercent)}%)`

              return (
                <Accordion
                  key={month.id}
                  disableGutters
                  expanded={expandedMonthId === month.id}
                  onChange={() => handleMonthChange(month.id)}
                  sx={{
                    overflow: "hidden",
                    border: "1px solid",
                    borderColor: expandedMonthId === month.id ? "#bdbdbd" : "divider",
                    borderRadius: 3,
                    boxShadow: "none",
                    backgroundColor: "background.paper",
                    alignSelf: "start",
                    transition: "border-color 160ms ease, background-color 160ms ease",
                    "&.MuiAccordion-root": {
                      borderRadius: 3,
                    },
                    "&.MuiAccordion-root:first-of-type": {
                      borderTopLeftRadius: 12,
                      borderTopRightRadius: 12,
                    },
                    "&.MuiAccordion-root:last-of-type": {
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    },
                    "&::before": { display: "none" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`${month.id}-content`}
                    id={`${month.id}-header`}
                    sx={{
                      px: 2,
                      py: 0.25,
                      "& .MuiAccordionSummary-content": { my: 1.25 },
                    }}
                  >
                    <Box sx={{ width: "100%" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.25 }}>
                        <SectionHeading variant="h6" component="h2" gutterBottom={false}>
                          {month.title}
                        </SectionHeading>
                      </Box>
                      <Box
                        aria-hidden="true"
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                          gap: 0.45,
                          mt: 1.1,
                        }}
                      >
                        {month.days.map((day) => {
                          const hasArticles = day.articles.length > 0
                          const dayLabel = day.id.slice(-2).replace(/^0/, "")

                          return (
                            <Box
                              key={day.id}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minHeight: 22,
                                borderRadius: 999,
                                border: "1px solid",
                                borderColor: hasArticles ? "#1f1f1f" : "#ececec",
                                backgroundColor: hasArticles ? "#1f1f1f" : "#fdfdfd",
                                color: hasArticles ? "#fff" : "#b8b8b8",
                                fontSize: "0.68rem",
                                fontWeight: hasArticles ? 700 : 500,
                                fontVariantNumeric: "tabular-nums",
                                lineHeight: 1,
                              }}
                            >
                              {dayLabel}
                            </Box>
                          )
                        })}
                      </Box>
                      <Box
                        sx={{
                          mt: 1.1,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 999,
                            backgroundColor: "#f2f2f2",
                            overflow: "hidden",
                          }}
                        >
                          <Box
                            sx={{
                              height: "100%",
                              width: `${progressPercent}%`,
                              borderRadius: 999,
                              backgroundColor: "#9a9a9a",
                            }}
                          />
                        </Box>
                        <Typography
                          color="text.secondary"
                          sx={{ flexShrink: 0, fontSize: "0.8rem", fontWeight: 500, fontVariantNumeric: "tabular-nums" }}
                        >
                          {progressSummaryLabel}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                    {articleDays.length ? (
                      <Stack spacing={1.25}>
                        {articleDays.map((day) => (
                          <Box
                            key={day.id}
                            component="section"
                            sx={{
                              borderTop: "1px solid",
                              borderColor: "#efefef",
                              pt: 1.35,
                              "&:first-of-type": {
                                pt: 0.45,
                                borderTop: "none",
                              },
                            }}
                          >
                            <Typography color="text.secondary" sx={{ fontSize: "0.82rem", fontWeight: 700, letterSpacing: "0.02em" }}>
                              {day.title}
                            </Typography>
                            <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 1.5, listStylePosition: "outside" }}>
                              {day.articles.map((article) => (
                                <Box
                                  key={article.id}
                                  component="li"
                                  sx={{
                                    fontSize: "0.98rem",
                                    fontWeight: 500,
                                    lineHeight: 1.65,
                                    "& + &": { mt: 0.35 },
                                    "&::marker": { color: "#b0b0b0" },
                                  }}
                                >
                                  {article.title}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary" sx={{ fontSize: "0.92rem", pt: 0.5 }}>
                        まだ記事がある日はありません。
                      </Typography>
                    )}
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Box>
        </Box>
      </PageContainer>
    </>
  )
}

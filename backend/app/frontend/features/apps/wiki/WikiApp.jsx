import MenuBookIcon from "@mui/icons-material/MenuBook"
import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableRow from "@mui/material/TableRow"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import Link from "@mui/material/Link"
import Typography from "@mui/material/Typography"
import { useEffect, useMemo, useState } from "react"
import AppsDrawerLauncher from "../shared/AppsDrawerLauncher"
import { wikiAuthors } from "./wikiData"

function ReferenceList({ references }) {
  return (
    <Stack component="ol" spacing={0.75} sx={{ m: 0, p: 0, listStyle: "none" }}>
      {references.map((reference, index) => (
        <Box
          key={reference.id}
          component="li"
          id={`wiki-reference-${reference.id}`}
          sx={{
            display: "grid",
            gridTemplateColumns: "1.5rem minmax(0, 1fr)",
            columnGap: 0.5,
            alignItems: "start",
            lineHeight: 1.7,
          }}
        >
          <Typography
            component="span"
            variant="body2"
            sx={{
              color: "text.secondary",
              textAlign: "left",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {index + 1}.
          </Typography>
          <Typography
            component="a"
            href={`/articles/${reference.id}`}
            variant="body2"
            sx={{
              color: "text.secondary",
              textDecoration: "none",
              minWidth: 0,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {reference.title}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

function WikiFactsTable({ facts }) {
  if (!facts?.length) {
    return null
  }

  return (
    <TableContainer
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Table size="small" sx={{ tableLayout: "fixed" }}>
        <TableBody>
          {facts.map((fact) => (
            <TableRow key={`${fact.label}-${fact.value}`}>
              <TableCell
                component="th"
                scope="row"
                sx={{
                  width: "34%",
                  px: 1.5,
                  py: 1.25,
                  verticalAlign: "top",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "text.secondary",
                  borderBottomColor: "divider",
                  backgroundColor: "grey.50",
                }}
              >
                {fact.label}
              </TableCell>
              <TableCell
                sx={{
                  px: 1.5,
                  py: 1.25,
                  verticalAlign: "top",
                  fontSize: "13px",
                  lineHeight: 1.8,
                  color: "text.primary",
                  borderBottomColor: "divider",
                }}
              >
                {fact.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function normalizeParagraph(paragraph) {
  if (typeof paragraph === "string") {
    return { text: paragraph, referenceIds: [] }
  }

  return {
    text: paragraph.text,
    referenceIds: paragraph.referenceIds ?? [],
  }
}

function collectParagraphs(entry) {
  return [
    ...(entry.summaryParagraphs ?? []),
    ...((entry.sections ?? []).flatMap((section) => section.paragraphs ?? [])),
  ].map(normalizeParagraph)
}

function orderReferencesByAppearance(entry) {
  const references = entry.references ?? []
  const referenceMap = new Map(references.map((reference) => [reference.id, reference]))
  const orderedIds = []
  const seen = new Set()

  collectParagraphs(entry).forEach((paragraph) => {
    paragraph.referenceIds.forEach((referenceId) => {
      if (referenceMap.has(referenceId) && !seen.has(referenceId)) {
        seen.add(referenceId)
        orderedIds.push(referenceId)
      }
    })
  })

  references.forEach((reference) => {
    if (!seen.has(reference.id)) {
      orderedIds.push(reference.id)
    }
  })

  return orderedIds.map((referenceId) => referenceMap.get(referenceId)).filter(Boolean)
}

function WikiReferenceMarkers({ referenceIds, referenceIndexMap }) {
  if (!referenceIds?.length) {
    return null
  }

  return (
    <>
      {" "}
      {referenceIds.map((referenceId) => {
        const index = referenceIndexMap.get(referenceId)

        if (!index) {
          return null
        }

        return (
          <Link
            key={referenceId}
            href={`#wiki-reference-${referenceId}`}
            underline="none"
            sx={{
              color: "text.secondary",
              fontSize: "0.8em",
              verticalAlign: "super",
              lineHeight: 1,
              ml: 0.25,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            [{index}]
          </Link>
        )
      })}
    </>
  )
}

function WikiSection({ section, referenceIndexMap }) {
  return (
    <Box component="section" sx={{ pt: 2.25, borderTop: "1px solid", borderColor: "divider" }}>
      <Typography
        variant="h6"
        component="h3"
        sx={{ fontSize: "16px", fontWeight: 700, mb: 1.25, letterSpacing: 0, color: "text.primary" }}
      >
        {section.title}
      </Typography>
      <Stack spacing={1.25}>
        {section.paragraphs.map((paragraph) => {
          const normalizedParagraph = normalizeParagraph(paragraph)

          return (
            <Typography
              key={`${section.title}-${normalizedParagraph.text}`}
              variant="body2"
              sx={{ color: "text.primary", lineHeight: 1.9 }}
            >
              {normalizedParagraph.text}
              <WikiReferenceMarkers
                referenceIds={normalizedParagraph.referenceIds}
                referenceIndexMap={referenceIndexMap}
              />
            </Typography>
          )
        })}
      </Stack>
    </Box>
  )
}

export function WikiContent({ entries = wikiAuthors }) {
  const [selectedAuthorName, setSelectedAuthorName] = useState(entries[0]?.authorName ?? "")

  useEffect(() => {
    if (!entries.some((entry) => entry.authorName === selectedAuthorName)) {
      setSelectedAuthorName(entries[0]?.authorName ?? "")
    }
  }, [entries, selectedAuthorName])

  const selectedEntry = useMemo(
    () => entries.find((entry) => entry.authorName === selectedAuthorName) ?? entries[0] ?? null,
    [entries, selectedAuthorName],
  )
  const orderedReferences = useMemo(
    () => (selectedEntry ? orderReferencesByAppearance(selectedEntry) : []),
    [selectedEntry],
  )
  const referenceIndexMap = useMemo(
    () => new Map(orderedReferences.map((reference, index) => [reference.id, index + 1])),
    [orderedReferences],
  )

  if (!selectedEntry) {
    return null
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      <Typography variant="body2" color="text.secondary">
        各記事をもとに確認できた事実を整理している。推測は含まない。
      </Typography>

      <Tabs
        value={selectedEntry.authorName}
        onChange={(_event, nextValue) => setSelectedAuthorName(nextValue)}
        variant="fullWidth"
        aria-label="Wiki著者タブ"
        sx={{
          minHeight: 40,
          "& .MuiTabs-indicator": {
            height: 2,
            borderRadius: 999,
          },
          "& .MuiTab-root": {
            minHeight: 40,
            minWidth: 0,
            px: 0.5,
            fontSize: "14px",
            fontWeight: 700,
            textTransform: "none",
          },
        }}
      >
        {entries.map((entry) => (
          <Tab key={entry.authorName} value={entry.authorName} label={entry.authorName} />
        ))}
      </Tabs>

      <Stack spacing={2.5}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Typography component="h2" sx={{ fontSize: { xs: "24px", sm: "28px" }, fontWeight: 700, lineHeight: 1.3 }}>
            {selectedEntry.authorName}
          </Typography>
        </Box>

        <Box component="section">
          <Typography variant="h6" component="h3" sx={{ fontSize: "16px", fontWeight: 700, mb: 1.25 }}>
            概要
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.35fr) minmax(260px, 0.85fr)" },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Stack spacing={1.25}>
              {selectedEntry.summaryParagraphs.map((paragraph) => {
                const normalizedParagraph = normalizeParagraph(paragraph)

                return (
                  <Typography
                    key={`${selectedEntry.authorName}-${normalizedParagraph.text}`}
                    variant="body2"
                    sx={{ color: "text.primary", lineHeight: 1.95 }}
                  >
                    {normalizedParagraph.text}
                    <WikiReferenceMarkers
                      referenceIds={normalizedParagraph.referenceIds}
                      referenceIndexMap={referenceIndexMap}
                    />
                  </Typography>
                )
              })}
            </Stack>
            <WikiFactsTable facts={selectedEntry.facts} />
          </Box>
        </Box>

        {selectedEntry.sections.map((section) => (
          <WikiSection
            key={`${selectedEntry.authorName}-${section.title}`}
            section={section}
            referenceIndexMap={referenceIndexMap}
          />
        ))}

        <Box component="section" sx={{ pt: 2.25, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="h6" component="h3" sx={{ fontSize: "16px", fontWeight: 700, mb: 1.25 }}>
            参考文献
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
            本文の根拠として参照した記事。
          </Typography>
          <ReferenceList references={orderedReferences} />
        </Box>
      </Stack>
    </Box>
  )
}

export default function WikiApp() {
  return (
    <AppsDrawerLauncher title="Wiki" launcherLabel="Wiki" buttonAriaLabel="Wikiを開く" buttonIcon={<MenuBookIcon />}>
      <WikiContent />
    </AppsDrawerLauncher>
  )
}

import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import { SHOPS_PAGE_LAYOUT } from "./shopsPageStyleConstants"

export default function ShopsList({ shops, selectedKey, getKey, onSelect }) {
  return (
    <Box
      sx={{
        overflow: "auto",
        pr: SHOPS_PAGE_LAYOUT.listRightPadding,
        flex: 1,
        minHeight: 0,
        pb: SHOPS_PAGE_LAYOUT.listBottomPadding,
      }}
    >
      {!shops?.length ? (
        <Typography variant="body2" color="text.secondary">
          表示する推し店がありません。
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {shops.map((shop) => {
            const key = getKey ? getKey(shop) : `${shop.name}-${shop.lat}-${shop.lng}`
            const isSelected = Boolean(selectedKey && selectedKey === key)
            return (
              <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  onClick={() => (onSelect ? onSelect(key) : null)}
                  sx={{
                    cursor: onSelect ? "pointer" : "default",
                    borderColor: isSelected ? "primary.main" : "divider",
                  }}
                  role="button"
                  aria-pressed={isSelected}
                  aria-label={`${shop.name} を選択`}
                >
                  <CardContent
                    sx={{
                      px: SHOPS_PAGE_LAYOUT.cardContentPaddingX,
                      py: SHOPS_PAGE_LAYOUT.cardContentPaddingY,
                      "&:last-child": { pb: SHOPS_PAGE_LAYOUT.cardContentLastPaddingBottom },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: SHOPS_PAGE_LAYOUT.cardMetaGap,
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {shop.name}
                      </Typography>
                      {shop.url ? (
                        <IconButton
                          component="a"
                          href={shop.url}
                          target="_blank"
                          rel="noreferrer"
                          size="small"
                          aria-label={`${shop.name} の外部サイトを新しいタブで開く`}
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      ) : null}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: SHOPS_PAGE_LAYOUT.cardMetaGap,
                        flexWrap: "wrap",
                        mb: SHOPS_PAGE_LAYOUT.cardCategoryMarginBottom,
                      }}
                    >
                      <Chip size="small" label={shop.category} />
                    </Box>
                    {shop.desc ? (
                      <Typography variant="body2" color="text.secondary">
                        {shop.desc}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}
    </Box>
  )
}

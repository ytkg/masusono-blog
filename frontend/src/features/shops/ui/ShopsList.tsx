import Box from "@mui/material/Box"
import Grid from "@mui/material/Grid"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Typography from "@mui/material/Typography"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import ContentCardSkeletonList from "@/shared/ui/ContentCardSkeletonList"
import type { Shop } from "@/features/shops/model/shop"
import { SHOPS_PAGE_LAYOUT } from "@/features/shops/ui/shopsPageStyleConstants"

type ShopsListProps = {
  shops: Shop[]
  selectedKey: string | null
  isLoading: boolean
  errorMessage: string | null
  getKey: (shop: Shop) => string
  onSelect: (key: string) => void
}

type ShopsListState = "loading" | "error" | "empty" | "loaded"

function getShopsListState({
  shops,
  isLoading,
  errorMessage,
}: Pick<ShopsListProps, "shops" | "isLoading" | "errorMessage">): ShopsListState {
  if (isLoading && shops.length === 0) return "loading"
  if (errorMessage) return "error"
  if (shops.length === 0) return "empty"
  return "loaded"
}

function ShopsStateMessage({ message }: { message: string }) {
  return (
    <Typography variant="body2" color="text.secondary">
      {message}
    </Typography>
  )
}

function ShopsCardsGrid({
  shops,
  selectedKey,
  getKey,
  onSelect,
}: Pick<ShopsListProps, "shops" | "selectedKey" | "getKey" | "onSelect">) {
  return (
    <Grid container spacing={2}>
      {shops.map((shop) => {
        const key = getKey(shop)
        const isSelected = selectedKey === key

        return (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              variant="outlined"
              sx={{ borderColor: isSelected ? "primary.main" : "divider", cursor: "pointer" }}
              onClick={() => onSelect(key)}
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
                  {shop.url && (
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
                  )}
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
                {shop.desc && (
                  <Typography variant="body2" color="text.secondary">
                    {shop.desc}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

export function ShopsList({ shops, selectedKey, isLoading, errorMessage, getKey, onSelect }: ShopsListProps) {
  const state = getShopsListState({ shops, isLoading, errorMessage })

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
      {state === "loading" && <ContentCardSkeletonList count={4} />}
      {state === "error" && <ShopsStateMessage message={errorMessage ?? "データの取得に失敗しました。"} />}
      {state === "empty" && <ShopsStateMessage message="表示する推し店がありません。" />}
      {state === "loaded" && (
        <ShopsCardsGrid shops={shops} selectedKey={selectedKey} getKey={getKey} onSelect={onSelect} />
      )}
    </Box>
  )
}

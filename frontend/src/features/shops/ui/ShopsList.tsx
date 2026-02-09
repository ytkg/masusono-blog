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

type ShopsListProps = {
  shops: Shop[]
  isLoading: boolean
  hasError: boolean
  getKey: (shop: Shop) => string
  onSelect: (key: string) => void
}

export function ShopsList({ shops, isLoading, hasError, getKey, onSelect }: ShopsListProps) {
  const showLoadingSkeleton = isLoading && shops.length === 0

  return (
    <Box sx={{ overflow: "auto", pr: 1, flex: 1, minHeight: 0, pb: 4 }}>
      {showLoadingSkeleton && <ContentCardSkeletonList count={4} />}
      {!showLoadingSkeleton && hasError && (
        <Typography variant="body2" color="text.secondary">
          データの取得に失敗しました。
        </Typography>
      )}
      {!showLoadingSkeleton && !hasError && shops.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          表示する推し店がありません。
        </Typography>
      )}
      {!showLoadingSkeleton && !hasError && shops.length > 0 && (
        <Grid container spacing={2}>
          {shops.map((shop) => {
            const key = getKey(shop)
            return (
              <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{ borderColor: "divider", cursor: "pointer" }}
                  onClick={() => onSelect(key)}
                >
                  <CardContent sx={{ px: 1.25, py: 1, "&:last-child": { pb: 1.5 } }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
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
                          aria-label="open"
                        >
                          <OpenInNewIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
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
      )}
    </Box>
  )
}

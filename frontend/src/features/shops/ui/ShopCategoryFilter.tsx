import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import { DEFAULT_CATEGORY } from "@/features/shops/hooks/useShopFilter"
import { SHOPS_PAGE_LAYOUT } from "@/features/shops/ui/shopsPageStyleConstants"

type ShopCategoryFilterProps = {
  category: string
  categories: string[]
  onChange: (category: string) => void
}

export function ShopCategoryFilter({ category, categories, onChange }: ShopCategoryFilterProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: SHOPS_PAGE_LAYOUT.cardMetaGap,
        flexWrap: "wrap",
        mt: SHOPS_PAGE_LAYOUT.sectionSpacing,
        mb: SHOPS_PAGE_LAYOUT.sectionSpacing,
      }}
    >
      <Chip
        label="すべて"
        variant={category === DEFAULT_CATEGORY ? "filled" : "outlined"}
        color={category === DEFAULT_CATEGORY ? "primary" : "default"}
        onClick={() => onChange(DEFAULT_CATEGORY)}
      />
      {categories.map((cat) => (
        <Chip
          key={cat}
          label={cat}
          variant={category === cat ? "filled" : "outlined"}
          color={category === cat ? "primary" : "default"}
          onClick={() => onChange(cat)}
        />
      ))}
    </Box>
  )
}

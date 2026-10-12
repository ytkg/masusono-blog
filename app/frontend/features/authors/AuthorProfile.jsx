import Box from "@mui/material/Box"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"
import { labelTextSx, nameTextSx, bioTextSx, imageSx, profileGap, profileTextSpacing } from "./authorProfileStyles"

export default function AuthorProfile({
  author,
  headingComponent = "h1",
  imageAlt = `${author.name}のアイコン`,
  imageLoading,
  children,
  sx,
  ...props
}) {
  const image = author.imageUrl

  return (
    <Box
      component="section"
      {...props}
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: profileGap,
          textAlign: "center",
        },
        sx,
      ]}
    >
      {image ? <Box component="img" src={image} alt={imageAlt} loading={imageLoading} sx={imageSx} /> : null}
      <Stack spacing={profileTextSpacing} sx={{ width: "100%", minWidth: 0, maxWidth: 640 }}>
        <Typography variant="overline" color="text.secondary" sx={labelTextSx}>
          {author.title}
        </Typography>
        <Typography variant="h5" component={headingComponent} sx={nameTextSx}>
          {author.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ ...bioTextSx, textAlign: "left" }}>
          {author.bio}
        </Typography>
        {children}
      </Stack>
    </Box>
  )
}

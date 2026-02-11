import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import PodcastEpisodeCard from "./PodcastEpisodeCard"

export default function PodcastEpisodesList({ episodes }) {
  if (!episodes?.length) {
    return <Typography color="text.secondary">エピソードがありません。</Typography>
  }

  return (
    <Box sx={{ display: "grid", gap: 2 }}>
      {episodes.map((episode) => (
        <PodcastEpisodeCard key={episode.id} episode={episode} />
      ))}
    </Box>
  )
}

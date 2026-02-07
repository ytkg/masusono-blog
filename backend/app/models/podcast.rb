class Podcast
  def self.all
    podcasts = Microcms::FetchPodcastsService.execute

    podcasts.map do |podcast|
      podcast_id = podcast["no"].to_s
      title = podcast["title"]
      published_at = PublishedAtFormatter.format(podcast["publishedAt"])
      audio_url = podcast["audioUrl"]

      {
        "id" => podcast_id,
        "title" => title,
        "publishedAt" => published_at,
        "audioUrl" => audio_url
      }
    end
  end
end

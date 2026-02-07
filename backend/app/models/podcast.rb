class Podcast
  def self.all
    podcasts = Microcms::FetchPodcastsService.execute

    podcasts.map do |podcast|
      audio_url = podcast["audioUrl"]
      podcast_id = extract_podcast_id(audio_url)
      title = podcast["title"]
      published_at = PublishedAtFormatter.format(podcast["publishedAt"])

      {
        "id" => podcast_id,
        "title" => title,
        "publishedDate" => published_at,
        "audioUrl" => audio_url
      }
    end
  end

  def self.extract_podcast_id(audio_url)
    match = audio_url.to_s.match(%r{\Ahttps://storage\.googleapis\.com/masusono-podcast/(?<id>\d+)\.mp3(?:\?.*)?\z})
    match ? match[:id] : ""
  end
  private_class_method :extract_podcast_id
end

class PodcastsIndexUsecase
  Result = Struct.new(:podcasts, keyword_init: true)

  def self.call
    new.call
  end

  def call
    podcasts = Podcast.all.map { |podcast| build_podcast(podcast) }
    Result.new(podcasts: podcasts)
  end

  private

  def build_podcast(podcast)
    audio_url = podcast[:audioUrl]

    {
      id: extract_podcast_id(audio_url),
      title: podcast[:title],
      publishedDate: PublishedAtFormatter.format(podcast[:publishedAt]),
      audioUrl: audio_url
    }
  end

  def extract_podcast_id(audio_url)
    match = audio_url.to_s.match(%r{\Ahttps://storage\.googleapis\.com/masusono-podcast/(?<id>\d+)\.mp3(?:\?.*)?\z})
    match ? match[:id] : ""
  end
end

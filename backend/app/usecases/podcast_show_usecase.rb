class PodcastShowUsecase
  def self.call(episode_id:)
    new(episode_id:).call
  end

  def initialize(episode_id:)
    @episode_id = episode_id.to_s
  end

  def call
    podcast = Podcast.all.find { |item| extract_podcast_id(item[:audioUrl]) == @episode_id }
    return not_found_result unless podcast

    audio_url = podcast[:audioUrl]

    { props: { episode: build_episode(podcast, audio_url) }, status: :ok }
  end

  private

  def build_episode(podcast, audio_url)
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

  def not_found_result
    { props: { episode: nil }, status: :not_found }
  end
end

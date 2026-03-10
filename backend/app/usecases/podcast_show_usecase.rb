class PodcastShowUsecase
  def self.call(episode_id:)
    new(episode_id: episode_id).call
  end

  def initialize(episode_id:)
    @episode_id = episode_id
  end

  def call
    episode = PodcastIndexUsecase.call.dig(:props, :episodes)&.find { |item| item[:id] == @episode_id }

    {
      props: {
        episode: episode
      },
      status: episode.nil? ? :not_found : :ok
    }
  end
end

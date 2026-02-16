class PodcastIndexUsecase
  def self.call
    new.call
  end

  def call
    {
      episodes: Api::Podcast::EpisodesIndexUsecase.call.fetch(:episodes)
    }
  end
end

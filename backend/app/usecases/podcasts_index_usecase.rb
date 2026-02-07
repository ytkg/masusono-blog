class PodcastsIndexUsecase
  def self.call
    new.call
  end

  def call
    { podcasts: Podcast.all }
  end
end

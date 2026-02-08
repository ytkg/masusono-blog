class PodcastsIndexUsecase
  Result = Struct.new(:podcasts, keyword_init: true)

  def self.call
    new.call
  end

  def call
    Result.new(podcasts: Podcast.all)
  end
end

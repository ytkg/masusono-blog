class Podcast
  def self.all
    Microcms::FetchPodcastsService.execute
  end
end

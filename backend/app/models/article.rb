class Article
  def self.all
    Microcms::FetchArticlesService.execute
  end
end

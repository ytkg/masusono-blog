class Article
  def self.all
    Microcms::FetchArticlesService.execute.map do |article|
      article.merge(content: ArticleContentImageUrlOptimizer.call(article[:content]))
    end
  end
end

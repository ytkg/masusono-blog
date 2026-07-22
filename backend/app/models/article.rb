class Article
  def self.all
    fetch_all
  end

  def self.find(id)
    return nil if id.nil? || id.empty?

    normalize(Microcms::FetchArticlesService.execute(ids: id)).first
  end

  def self.for_author(author_id)
    return [] if author_id.nil? || author_id.empty?

    fetch_by_filter("author[equals]#{author_id}")
  end

  def self.fetch_all
    normalize(Microcms::FetchArticlesService.execute)
  end

  def self.fetch_by_filter(filters)
    return [] if filters.nil? || filters.empty?

    normalize(Microcms::FetchArticlesService.execute(filters:))
  end

  def self.normalize(articles)
    articles.map do |article|
      article.merge(content: ArticleContentImageUrlOptimizer.call(article[:content]))
    end
  end
end

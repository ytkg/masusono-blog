class Article
  def self.all
    articles = Microcms::FetchArticlesService.execute

    articles.map do |article|
      raw_author = article["author"]
      author = raw_author.is_a?(Hash) ? raw_author["name"] : nil

      {
        id: article["id"],
        publishedDate: PublishedAtFormatter.format(article["publishedAt"]),
        title: article["title"],
        content: article["content"],
        author: author
      }
    end
  end
end

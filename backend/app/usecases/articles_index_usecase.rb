class ArticlesIndexUsecase
  include AuthorNameExtractor

  Result = Struct.new(:articles, keyword_init: true)

  def self.call
    new.call
  end

  def call
    articles = Article.all.map { |article| build_article(article) }
    Result.new(articles: articles)
  end

  private

  def build_article(article)
    {
      id: article[:id],
      title: article[:title],
      publishedDate: PublishedAtFormatter.format(article[:publishedAt]),
      content: article[:content],
      author: extract_author_name(article[:author])
    }
  end
end

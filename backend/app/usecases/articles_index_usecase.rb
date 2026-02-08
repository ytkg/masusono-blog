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
      publishedDate: PublishedAtFormatter.format(article[:publishedAt]),
      title: article[:title],
      content: article[:content],
      author: extract_author_name(article[:author])
    }
  end
end

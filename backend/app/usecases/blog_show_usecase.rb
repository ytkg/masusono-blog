class BlogShowUsecase
  include AuthorNameExtractor

  def self.call(article_id:)
    new(article_id:).call
  end

  def initialize(article_id:)
    @article_id = article_id
  end

  def call
    article = Article.all.find { |item| item[:id] == @article_id }
    return { article: nil, status: :not_found } unless article

    { article: build_article(article), status: :ok }
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

class ArticlesShowUsecase
  include AuthorNameExtractor

  def self.call(article_id:)
    new(article_id:).call
  end

  def initialize(article_id:)
    @article_id = article_id
  end

  def call
    article = Article.all.find { |item| item[:id] == @article_id }
    return nil unless article

    {
      id: article[:id],
      title: article[:title],
      publishedDate: PublishedAtFormatter.format(article[:publishedAt]),
      content: article[:content],
      author: extract_author_name(article[:author])
    }
  end
end

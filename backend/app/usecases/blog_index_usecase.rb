class BlogIndexUsecase
  include AuthorNameExtractor

  def self.call
    new.call
  end

  def call
    {
      articles: Article.all.map { |article| build_article(article) }
    }
  end

  private

  def build_article(article)
    {
      id: article[:id],
      title: article[:title],
      publishedDate: DateDisplayFormatter.format(article[:publishedAt]),
      content: article[:content],
      author: extract_author_name(article[:author])
    }
  end
end

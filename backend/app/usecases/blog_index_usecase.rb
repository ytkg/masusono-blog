class BlogIndexUsecase
  include AuthorNameExtractor

  def self.call
    new.call
  end

  def call
    {
      props: {
        articles: Article.all.map { |article| build_article(article) }
      },
      status: :ok
    }
  end

  private

  def build_article(article)
    {
      id: article[:id],
      title: article[:title],
      publishedDate: DateDisplayFormatter.format(article[:publishedAt]),
      content: article[:content],
      author: extract_author_name(article[:author]),
      authorId: extract_author_id(article[:author]),
      authorImageUrl: extract_author_image_url(article[:author])
    }
  end
end

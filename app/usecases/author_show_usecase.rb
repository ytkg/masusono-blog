class AuthorShowUsecase
  def self.call(author_id:)
    new(author_id:).call
  end

  def initialize(author_id:)
    @author_id = author_id
  end

  def call
    author = Author.find(@author_id)
    author = AuthorPayloadBuilder.call(author:) if author
    return { props: { author: nil, articles: [] } } if author.nil?

    articles = ArticlePayloadBuilder.collection(Article.for_author(author.fetch(:id)))

    {
      props: {
        author:,
        articles:
      }
    }
  end
end

class AuthorShowUsecase
  def self.call(author_id:)
    author = Author.find(author_id)
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

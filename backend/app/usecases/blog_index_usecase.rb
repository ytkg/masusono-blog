class BlogIndexUsecase
  def self.call
    new.call
  end

  def call
    {
      props: {
        articles: Article.all.map { |article| ArticlePayloadBuilder.call(article:) }
      },
      status: :ok
    }
  end
end

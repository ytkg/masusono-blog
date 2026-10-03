class BlogIndexUsecase
  def self.call
    new.call
  end

  def call
    {
      props: {
        articles: ArticlePayloadBuilder.collection(Article.all)
      },
      status: :ok
    }
  end
end

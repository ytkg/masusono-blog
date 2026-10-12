class BlogIndexUsecase
  def self.call
    {
      props: {
        articles: ArticlePayloadBuilder.collection(Article.all)
      },
      status: :ok
    }
  end
end

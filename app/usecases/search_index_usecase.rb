class SearchIndexUsecase
  def self.call
    {
      props: {
        articles: ArticlePayloadBuilder.collection(Article.all)
      }
    }
  end
end

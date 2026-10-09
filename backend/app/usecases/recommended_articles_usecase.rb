class RecommendedArticlesUsecase
  def self.call
    articles = Article.all.uniq { |article| article[:id] }.sample(3)
    { json: { articles: ArticlePayloadBuilder.collection(articles) }, status: :ok }
  end
end

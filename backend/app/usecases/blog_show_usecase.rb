class BlogShowUsecase
  def self.call(article_id:)
    new(article_id: article_id).call
  end

  def initialize(article_id:)
    @article_id = article_id
  end

  def call
    article = Article.find(@article_id)
    related_articles = article ? RelatedArticlesBuilder.call(article:) : []
    image = ArticleOgpImage.path(article:) if article
    article = ArticlePayloadBuilder.call(article:) if article

    {
      props: {
        article: article,
        relatedArticles: related_articles,
        ogpImagePath: image
      },
      status: article.nil? ? :not_found : :ok
    }
  end
end

class BlogShowUsecase
  def self.call(article_id:)
    new(article_id: article_id).call
  end

  def initialize(article_id:)
    @article_id = article_id
  end

  def call
    article = Article.find(@article_id)
    unless article
      return {
        props: { article: nil, relatedArticles: [], yearAgoArticles: [], ogpImagePath: nil },
        status: :not_found
      }
    end

    related_articles = RelatedArticlesBuilder.call(article:)
    year_ago_articles = YearAgoArticlesBuilder.call(article:)
    image = ArticleOgpImage.path(article:)
    article = ArticlePayloadBuilder.call(article:)

    {
      props: {
        article: article,
        relatedArticles: related_articles,
        yearAgoArticles: year_ago_articles,
        ogpImagePath: image
      },
      status: :ok
    }
  end
end

class ArticleImagesShowUsecase
  def self.call(article_id:, version:)
    # Check publication before accessing image caches, including old URLs.
    article = Article.find(article_id)
    return { found: false } unless article
    return { found: true, redirect_path: ArticleOgpImage.path(article:) } unless version == ArticleOgpImage.version(article:)

    { found: true, image: ArticleOgpImage.call(article:) }
  end
end

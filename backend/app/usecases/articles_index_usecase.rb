class ArticlesIndexUsecase
  Result = Struct.new(:articles, keyword_init: true)

  def self.call
    new.call
  end

  def call
    Result.new(articles: Article.all)
  end
end

class BlogShowUsecase
  def self.call(article_id:)
    new(article_id: article_id).call
  end

  def initialize(article_id:)
    @article_id = article_id
  end

  def call
    {
      article: BlogIndexUsecase.call.fetch(:articles).find { |item| item[:id] == @article_id }
    }
  end
end

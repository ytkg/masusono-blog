class BlogShowUsecase
  def self.call(article_id:)
    new(article_id: article_id).call
  end

  def initialize(article_id:)
    @article_id = article_id
  end

  def call
    article = BlogIndexUsecase.call.dig(:props, :articles)&.find { |item| item[:id] == @article_id }

    {
      props: {
        article: article
      },
      status: article.nil? ? :not_found : :ok
    }
  end
end

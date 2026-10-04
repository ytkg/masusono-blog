class ArticlesPageUsecase
  PAGE_SIZE = 10

  class InvalidOffset < StandardError; end

  def self.call(offset: 0)
    parsed_offset = Integer(offset.to_s, 10, exception: false)
    unless parsed_offset && parsed_offset >= 0
      raise InvalidOffset, "offset must be a non-negative integer."
    end

    page = Article.page(limit: PAGE_SIZE, offset: parsed_offset)
    articles = page.fetch(:contents)
    next_offset = parsed_offset + articles.size
    {
      json: {
        articles: ArticlePayloadBuilder.collection(articles),
        pagination: {
          nextOffset: articles.any? && next_offset < page.fetch(:total_count) ? next_offset : nil
        }
      },
      status: :ok
    }
  end
end

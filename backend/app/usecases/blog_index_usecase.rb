class BlogIndexUsecase
  def self.call
    new.call
  end

  def call
    {
      articles: Api::Blog::ArticlesIndexUsecase.call.fetch(:articles)
    }
  end
end

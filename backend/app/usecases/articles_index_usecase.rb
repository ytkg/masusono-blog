class ArticlesIndexUsecase
  def self.call
    new.call
  end

  def call
    { articles: Article.all }
  end
end

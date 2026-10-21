class SentenceArticlesUsecase
  def self.call
    { json: { articles: Article.all.map { |article| { id: article[:id], content: article[:content].to_s } } } }
  end
end

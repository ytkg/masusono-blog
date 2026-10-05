class ArticlesPageUsecase
  def self.call(offset: 0)
    { json: ArticlesPageQuery.call(offset: offset), status: :ok }
  end
end

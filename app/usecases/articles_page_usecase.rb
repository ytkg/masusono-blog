class ArticlesPageUsecase
  def self.call(offset: 0)
    { json: ArticlesPageQuery.call(offset:), status: :ok }
  end
end

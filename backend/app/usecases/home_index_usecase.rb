class HomeIndexUsecase
  def self.call
    { props: ArticlesPageQuery.call, status: :ok }
  end
end

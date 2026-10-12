class HomeIndexUsecase
  def self.call
    { props: ArticlesPageQuery.call }
  end
end

class HomeIndexUsecase
  def self.call
    result = ArticlesPageUsecase.call
    { props: result.fetch(:json), status: result.fetch(:status) }
  end
end

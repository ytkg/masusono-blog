class HomeIndexUsecase
  def self.call
    new.call
  end

  def call
    result = BlogIndexUsecase.call

    {
      props: result.fetch(:props),
      status: result.fetch(:status)
    }
  end
end

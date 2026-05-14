class NumbersIndexUsecase
  def self.call
    new.call
  end

  def call
    metrics_result = Api::App::Numbers::MetricsIndexUsecase.call

    {
      props: {
        metrics: metrics_result.fetch(:json)
      },
      status: metrics_result.fetch(:status)
    }
  end
end

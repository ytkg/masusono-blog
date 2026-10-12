class NumbersIndexUsecase
  def self.call
    new.call
  end

  def call
    metrics_result = Numbers::MetricsIndexUsecase.call

    {
      props: {
        metrics: metrics_result.fetch(:metrics)
      },
      status: metrics_result.fetch(:status)
    }
  end
end

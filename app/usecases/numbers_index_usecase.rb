class NumbersIndexUsecase
  def self.call
    new.call
  end

  def call
    metrics_result = Numbers::MetricsQuery.call

    {
      props: {
        metrics: metrics_result.fetch(:metrics)
      }
    }
  end
end

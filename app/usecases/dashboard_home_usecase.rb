class DashboardHomeUsecase
  def self.call
    { props: { metrics: Numbers::MetricsQuery.call.fetch(:metrics) } }
  end
end

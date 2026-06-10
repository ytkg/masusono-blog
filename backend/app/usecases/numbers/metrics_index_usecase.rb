module Numbers
  class MetricsIndexUsecase
    CACHE_KEY = "numbers/metrics_index".freeze
    CACHE_EXPIRES_IN = 1.hour
    CACHE = ActiveSupport::Cache::MemoryStore.new(size: 4.megabytes)

    def self.call
      new.call
    end

    def call
      CACHE.fetch(CACHE_KEY, expires_in: CACHE_EXPIRES_IN) do
        build_result
      end
    end

    private

    def build_result
      source_data = fetch_source_data
      article_summary = ArticleMetricsSummary.call(articles: source_data.fetch(:articles))
      metrics = MetricsPayloadBuilder.call(source_data:, article_summary:)
      metrics[:trend] = MetricsTrendBuilder.call(
        articles: source_data.fetch(:articles),
        masuda_run_rankings: source_data.fetch(:masuda_run_rankings),
        start_date: MetricsPayloadBuilder::LAUNCH_DATE
      )

      {
        metrics:,
        status: :ok
      }
    end

    def fetch_source_data
      masuda_run_rankings = fetch_masuda_run_rankings

      {
        articles: ::Article.all,
        masuda_run_rankings:,
        masuda_run_total_plays: masuda_run_rankings&.size
      }
    end

    def fetch_masuda_run_rankings
      ::MasudaRunRanking.all
    rescue ::Microcms::FetchContentsService::FetchError, ::Faraday::Error => error
      Rails.logger.warn(
        "[Numbers::MetricsIndexUsecase] failed to fetch masuda run rankings: #{error.class}: #{error.message}"
      )
      nil
    end
  end
end

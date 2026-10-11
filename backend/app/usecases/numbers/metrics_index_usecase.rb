module Numbers
  class MetricsIndexUsecase
    LAUNCH_DATE = Date.new(2025, 10, 5)
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
      character_counter = cached_character_counter
      article_summary = ArticleMetricsSummary.call(articles: source_data.fetch(:articles), character_counter:)
      metrics = MetricsPayloadBuilder.call(article_summary:)
      metrics[:trend] = MetricsTrendBuilder.call(
        articles: source_data.fetch(:articles),
        start_date: LAUNCH_DATE,
        character_counter:
      )

      {
        metrics:,
        status: :ok
      }
    end

    def cached_character_counter
      counts = {}.compare_by_identity
      ->(article) { counts.fetch(article) { counts[article] = ArticleMetric.character_count(article) } }
    end

    def fetch_source_data
      {
        articles: ::Article.all
      }
    end
  end
end

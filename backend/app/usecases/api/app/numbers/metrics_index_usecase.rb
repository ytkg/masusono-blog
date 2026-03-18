module Api
  module App
    module Numbers
      class MetricsIndexUsecase
        def self.call
          new.call
        end

        def call
          source_data = fetch_source_data
          article_summary = ::Api::App::Numbers::ArticleMetricsSummary.call(articles: source_data.fetch(:articles))

          {
            json: ::Api::App::Numbers::MetricsPayloadBuilder.call(source_data:, article_summary:),
            status: :ok
          }
        end

        private

        def fetch_source_data
          {
            articles: ::Article.all,
            shops: ::Shop.all,
            podcasts: ::Podcast.all,
            masuda_run_total_plays: fetch_masuda_run_total_plays
          }
        end

        def fetch_masuda_run_total_plays
          ::MasudaRunRanking.total_count
        rescue ::Microcms::FetchContentsService::FetchError, ::Faraday::Error => error
          Rails.logger.warn(
            "[Api::App::Numbers::MetricsIndexUsecase] failed to fetch masuda run total plays: #{error.class}: #{error.message}"
          )
          nil
        end
      end
    end
  end
end

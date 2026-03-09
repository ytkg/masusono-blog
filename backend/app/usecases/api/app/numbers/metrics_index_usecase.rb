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
            podcasts: ::Podcast.all
          }
        end
      end
    end
  end
end

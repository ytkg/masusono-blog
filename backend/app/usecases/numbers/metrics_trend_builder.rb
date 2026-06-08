module Numbers
  class MetricsTrendBuilder
    include ActiveSupport::NumberHelper

    DATE_FORMAT = "%Y/%m/%d"
    POINT_DATE_FORMAT = "%Y-%m-%d"

    SERIES = [
      { key: :total_articles, data_key: :totalArticles, label: "総記事数", unit: "本" },
      { key: :total_chars, data_key: :totalChars, label: "総文字数", unit: "字" },
      { key: :masuda_run_total_plays, data_key: :masudaRunTotalPlays, label: "増田RUN総プレイ回数", unit: "回" }
    ].freeze

    def self.call(articles:, masuda_run_rankings:, start_date:, end_date: Date.current)
      new(articles:, masuda_run_rankings:, start_date:, end_date:).call
    end

    def initialize(articles:, masuda_run_rankings:, start_date:, end_date:)
      @articles = articles
      @masuda_run_rankings = masuda_run_rankings
      @start_date = start_date
      @end_date = end_date
    end

    def call
      {
        title: "推移",
        description: "各指標の累積値を日ごとに表示しています。",
        series: build_series,
        points: build_points
      }
    end

    private

    attr_reader :articles, :masuda_run_rankings, :start_date, :end_date

    def build_series
      SERIES.map do |definition|
        key = definition.fetch(:key)
        {
          key: definition.fetch(:data_key),
          label: definition.fetch(:label),
          unit: definition.fetch(:unit),
          finalValue: format_value(final_values[key], definition.fetch(:unit))
        }
      end
    end

    def build_points
      @build_points ||= begin
        article_events = grouped_article_events
        masuda_run_events = grouped_masuda_run_events
        totals = { total_articles: 0, total_chars: 0, masuda_run_total_plays: 0 }

        date_range.map do |date|
          article_data = article_events.fetch(date, { total_articles: 0, total_chars: 0 })
          totals[:total_articles] += article_data.fetch(:total_articles)
          totals[:total_chars] += article_data.fetch(:total_chars)
          totals[:masuda_run_total_plays] += masuda_run_events.fetch(date, 0) unless masuda_run_rankings.nil?

          {
            date: date.strftime(POINT_DATE_FORMAT),
            label: date.strftime(DATE_FORMAT),
            totalArticles: totals.fetch(:total_articles),
            totalChars: totals.fetch(:total_chars),
            masudaRunTotalPlays: masuda_run_rankings.nil? ? nil : totals.fetch(:masuda_run_total_plays)
          }
        end
      end
    end

    def grouped_article_events
      articles.each_with_object({}) do |article, grouped|
        date = parse_date(article[:publishedAt] || article[:publishedDate])
        next if date.nil?

        grouped[date] ||= { total_articles: 0, total_chars: 0 }
        grouped[date][:total_articles] += 1
        grouped[date][:total_chars] += article_char_count(article)
      end
    end

    def grouped_masuda_run_events
      return {} if masuda_run_rankings.nil?

      masuda_run_rankings.each_with_object(Hash.new(0)) do |ranking, grouped|
        date = parse_date(ranking[:createdAt])
        grouped[date] += 1 unless date.nil?
      end
    end

    def date_range
      @date_range ||= (start_date..effective_end_date).to_a
    end

    def effective_end_date
      @effective_end_date ||= [ end_date, latest_event_date ].compact.max
    end

    def latest_event_date
      [
        *articles.filter_map { |article| parse_date(article[:publishedAt] || article[:publishedDate]) },
        *Array(masuda_run_rankings).filter_map { |ranking| parse_date(ranking[:createdAt]) }
      ].max
    end

    def final_values
      @final_values ||= build_points.last&.slice(:totalArticles, :totalChars, :masudaRunTotalPlays)&.then do |values|
        {
          total_articles: values.fetch(:totalArticles),
          total_chars: values.fetch(:totalChars),
          masuda_run_total_plays: values.fetch(:masudaRunTotalPlays)
        }
      end || { total_articles: 0, total_chars: 0, masuda_run_total_plays: nil }
    end

    def article_char_count(article)
      ArticleCharacterCounter.call(article[:content])
    end

    def parse_date(value)
      return value if value.is_a?(Date)
      return nil if value.blank?

      Time.zone.parse(value.to_s)&.to_date
    rescue ArgumentError
      nil
    end

    def format_value(value, unit)
      return nil if value.nil?

      "#{number_to_delimited(value)} #{unit}"
    end
  end
end

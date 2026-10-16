module Numbers
  class MetricsTrendBuilder
    include ActiveSupport::NumberHelper

    DATE_FORMAT = "%Y/%m/%d"
    POINT_DATE_FORMAT = "%Y-%m-%d"

    SERIES = [
      { key: :totalArticles, label: "記事数", unit: "本/日" },
      { key: :totalChars, label: "文字数", unit: "字/日" }
    ].freeze

    def self.call(articles:, start_date:, end_date: Date.current, character_counter: ArticleMetric.method(:character_count))
      new(articles:, start_date:, end_date:, character_counter:).call
    end

    def initialize(articles:, start_date:, end_date:, character_counter: ArticleMetric.method(:character_count))
      @articles = articles
      @character_counter = character_counter
      @start_date = start_date
      @end_date = end_date
    end

    def call
      {
        title: "推移",
        description: "当日を含む直近7日間の1日平均（投稿のない日は0）。",
        series: build_series,
        points: build_points
      }
    end

    private

    attr_reader :articles, :start_date, :end_date, :character_counter

    def build_series
      final_point = build_points.last || {}
      SERIES.map do |definition|
        key = definition.fetch(:key)
        {
          key:,
          label: definition.fetch(:label),
          unit: definition.fetch(:unit),
          finalValue: format_value(final_point.fetch(key, 0), definition.fetch(:unit))
        }
      end
    end

    def build_points
      @build_points ||= begin
        article_events = grouped_article_events
        (start_date..effective_end_date).map do |date|
          totals = initial_totals
          (date - 6..date).each do |day|
            counts = article_events.fetch(day) { initial_totals }
            totals.each_key { |key| totals[key] += counts.fetch(key) }
          end
          build_point(date, totals)
        end
      end
    end

    def build_point(date, totals)
      {
        date: date.strftime(POINT_DATE_FORMAT),
        label: date.strftime(DATE_FORMAT),
        totalArticles: totals.fetch(:total_articles) / 7.0,
        totalChars: totals.fetch(:total_chars) / 7.0
      }
    end

    def grouped_article_events
      @grouped_article_events ||= articles.each_with_object({}) do |article, grouped|
        date = article_date(article)
        next if date.nil?

        grouped[date] ||= initial_totals
        grouped[date][:total_articles] += 1
        grouped[date][:total_chars] += character_counter.call(article)
      end
    end

    def effective_end_date
      @effective_end_date ||= [ end_date, latest_event_date ].compact.max
    end

    def latest_event_date
      grouped_article_events.each_key.max
    end

    def initial_totals
      { total_articles: 0, total_chars: 0 }
    end

    def article_date(article)
      parse_date(article[:publishedAt] || article[:publishedDate])
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

      "#{number_to_rounded(value, precision: 2, strip_insignificant_zeros: true, delimiter: ",")} #{unit}"
    end
  end
end

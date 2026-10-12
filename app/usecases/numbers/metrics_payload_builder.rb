module Numbers
  class MetricsPayloadBuilder
    include ActiveSupport::NumberHelper

    def self.call(article_summary:)
      new(article_summary:).call
    end

    def initialize(article_summary:)
      @article_summary = article_summary
    end

    def call
      {
        rows: [
          build_row("全体", article_summary.fetch(:totals)),
          *article_summary.fetch(:author_rows).map { |name, counts| build_row(name, counts) }
        ]
      }
    end

    private

    attr_reader :article_summary

    def build_row(name, counts)
      {
        label: name,
        articles: format_count(counts.fetch(:articles), "本"),
        chars: format_count(counts.fetch(:chars), "字"),
        averageChars: format_average_chars(counts)
      }
    end

    def format_average_chars(counts)
      article_count = counts.fetch(:articles)
      return "—" if article_count.zero?

      average = counts.fetch(:chars).quo(article_count).round
      format_count(average, "字")
    end

    def format_count(value, unit)
      "#{number_to_delimited(value)} #{unit}"
    end
  end
end

module Numbers
  class MetricsPayloadBuilder
    include ActiveSupport::NumberHelper

    LAUNCH_DATE = Date.new(2025, 10, 5)
    DATE_FORMAT = "%Y/%m/%d"

    UNITS = {
      articles: "本",
      chars: "字"
    }.freeze

    LABELS = {
      launch: "増田とその他！始動から",
      total_articles: "総記事数",
      total_chars: "総文字数"
    }.freeze

    BLOG_METRIC_DEFINITIONS = [
      { metric_key: :articles, label_key: :total_articles },
      { metric_key: :chars, label_key: :total_chars }
    ].freeze

    def self.call(article_summary:)
      new(article_summary:).call
    end

    def initialize(article_summary:)
      @article_summary = article_summary
    end

    def call
      {
        blocks: [
          build_launch_block,
          *build_blog_metric_blocks
        ]
      }
    end

    private

    attr_reader :article_summary

    def build_launch_block
      build_block(label: launch_label, value: days_since_launch_text)
    end

    def build_blog_metric_blocks
      BLOG_METRIC_DEFINITIONS.map do |definition|
        build_blog_metric_block(definition)
      end
    end

    def build_blog_metric_block(definition)
      metric_key = definition.fetch(:metric_key)
      label_key = definition.fetch(:label_key)

      build_count_block(
        label_key: label_key,
        value: totals.fetch(metric_key),
        unit_key: metric_key,
        children: build_author_metric_children(metric_key:, label_key:)
      )
    end

    def build_author_metric_children(metric_key:, label_key:)
      author_rows.map do |name, data|
        { label: "#{name}の#{label(label_key)}", value: format_count(data.fetch(metric_key), unit(metric_key)) }
      end
    end

    def build_block(label:, value:, children: nil)
      block = { label: label, value: value }
      block[:children] = children if children
      block
    end

    def build_count_block(label_key:, value:, unit_key:, children: nil)
      formatted_value = value.nil? ? nil : format_count(value, unit(unit_key))
      build_block(label: label(label_key), value: formatted_value, children: children)
    end

    def totals
      article_summary.fetch(:totals)
    end

    def author_rows
      article_summary.fetch(:author_rows)
    end

    def launch_label
      "#{label(:launch)}（#{LAUNCH_DATE.strftime(DATE_FORMAT)}〜）"
    end

    def label(key)
      LABELS.fetch(key)
    end

    def unit(key)
      UNITS.fetch(key)
    end

    def days_since_launch
      (Date.current - LAUNCH_DATE).to_i
    end

    def days_since_launch_text
      "#{days_since_launch} 日"
    end

    def format_count(value, unit)
      "#{number_to_delimited(value)} #{unit}"
    end
  end
end

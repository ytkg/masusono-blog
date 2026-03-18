module Api
  module App
    module Numbers
      class MetricsPayloadBuilder
        include ActiveSupport::NumberHelper

        LAUNCH_DATE = Date.new(2025, 10, 5)
        DATE_FORMAT = "%Y/%m/%d"

        UNITS = {
          articles: "本",
          chars: "字",
          plays: "回",
          shops: "件"
        }.freeze

        LABELS = {
          launch: "増田とその他！始動から",
          blog: "ブログ",
          total_articles: "総記事数",
          total_chars: "総文字数",
          masuda_run_total_plays: "増田RUN総プレイ回数",
          podcast_total: "ポッドキャスト総本数",
          shops: "推し店",
          total_count: "総件数",
          uncategorized: "未分類"
        }.freeze

        BLOG_METRIC_DEFINITIONS = [
          { metric_key: :articles, label_key: :total_articles },
          { metric_key: :chars, label_key: :total_chars }
        ].freeze

        def self.call(source_data:, article_summary:)
          new(source_data: source_data, article_summary: article_summary).call
        end

        def initialize(source_data:, article_summary:)
          @source_data = source_data
          @article_summary = article_summary
        end

        def call
          {
            blocks: [
              build_launch_block,
              build_blog_block,
              build_podcast_block,
              build_shops_block,
              build_masuda_run_block
            ]
          }
        end

        private

        attr_reader :source_data, :article_summary

        def build_launch_block
          build_block(label: launch_label, value: days_since_launch_text)
        end

        def build_blog_block
          build_section_block(label(:blog), children: build_blog_metric_blocks)
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

        def build_podcast_block
          build_count_block(label_key: :podcast_total, value: source_data.fetch(:podcasts).size, unit_key: :articles)
        end

        def build_masuda_run_block
          build_count_block(
            label_key: :masuda_run_total_plays,
            value: source_data.fetch(:masuda_run_total_plays),
            unit_key: :plays
          )
        end

        def build_shops_block
          shops = source_data.fetch(:shops)

          build_section_block(
            label(:shops),
            children: [
              build_count_block(
                label_key: :total_count,
                value: shops.size,
                unit_key: :shops,
                children: build_shop_category_children(shops)
              )
            ]
          )
        end

        def build_shop_category_children(shops)
          grouped_categories(shops).sort_by { |name, _| name }.map do |name, items|
            { label: "#{name}の#{unit(:shops)}数", value: format_count(items.size, unit(:shops)) }
          end
        end

        def grouped_categories(shops)
          shops.group_by { |shop| normalize_shop_category(shop[:category]) }
        end

        def build_block(label:, value:, children: nil)
          block = { label: label, value: value }
          block[:children] = children if children
          block
        end

        def build_section_block(section_label, children:)
          build_block(label: section_label, value: nil, children: children)
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

        def normalize_shop_category(category)
          normalized = category.to_s.strip
          normalized == "" ? label(:uncategorized) : normalized
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
  end
end

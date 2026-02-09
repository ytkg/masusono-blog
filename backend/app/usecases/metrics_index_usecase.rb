class MetricsIndexUsecase
  include ActiveSupport::NumberHelper
  include AuthorNameExtractor

  LAUNCH_DATE = Date.new(2025, 10, 5)
  DATE_FORMAT = "%Y/%m/%d"

  PRIORITY_AUTHOR_KEYWORD = "増田"
  UNKNOWN_AUTHOR_NAME = "不明"

  UNITS = {
    articles: "本",
    chars: "字",
    shops: "件"
  }.freeze

  LABELS = {
    launch: "増田とその他！始動から",
    blog: "ブログ",
    total_articles: "総記事数",
    total_chars: "総文字数",
    podcast_total: "ポッドキャスト総本数",
    shops: "推し店",
    total_count: "総件数",
    uncategorized: "未分類"
  }.freeze
  BLOG_METRIC_DEFINITIONS = [
    { metric_key: :articles, label_key: :total_articles },
    { metric_key: :chars, label_key: :total_chars }
  ].freeze

  def self.call
    new.call
  end

  def call
    { metrics: build_metrics(fetch_source_data) }
  end

  private

  def build_metrics(source_data)
    totals = summarize_articles(source_data[:articles])
    author_rows = sort_author_rows(totals[:authors])

    {
      blocks: build_metric_blocks(totals, author_rows, source_data)
    }
  end

  def build_metric_blocks(totals, author_rows, source_data)
    [
      build_launch_block,
      build_blog_block(totals, author_rows),
      build_podcast_block(source_data[:podcasts].size),
      build_shops_block(source_data[:shops])
    ]
  end

  def fetch_source_data
    {
      articles: Article.all,
      shops: Shop.all,
      podcasts: Podcast.all
    }
  end

  def build_launch_block
    build_block(label: launch_label, value: days_since_launch_text)
  end

  def build_blog_block(totals, author_rows)
    build_section_block(label(:blog), children: build_blog_metric_blocks(totals, author_rows))
  end

  def build_blog_metric_blocks(totals, author_rows)
    BLOG_METRIC_DEFINITIONS.map do |definition|
      build_blog_metric_block(totals, author_rows, definition)
    end
  end

  def build_blog_metric_block(totals, author_rows, definition)
    metric_key = definition.fetch(:metric_key)
    label_key = definition.fetch(:label_key)

    build_count_block(
      label_key: label_key,
      value: totals[metric_key],
      unit_key: metric_key,
      children: build_author_metric_children(author_rows, metric_key: metric_key, label_key: label_key)
    )
  end

  def build_author_metric_children(author_rows, metric_key:, label_key:)
    author_rows.map do |name, data|
      { label: "#{name}の#{label(label_key)}", value: format_count(data[metric_key], unit(metric_key)) }
    end
  end

  def sort_author_rows(authors)
    authors.sort_by do |name, data|
      [ name.include?(PRIORITY_AUTHOR_KEYWORD) ? 0 : 1, -data[:articles], name ]
    end
  end

  def summarize_articles(articles)
    totals = initial_article_totals

    articles.each do |article|
      char_count = article_char_count(article)
      add_article_totals(totals, char_count)
      add_author_totals(totals, normalize_author_name(article[:author]), char_count)
    end

    totals
  end

  def initial_article_totals
    {
      articles: 0,
      chars: 0,
      authors: Hash.new { |hash, key| hash[key] = { articles: 0, chars: 0 } }
    }
  end

  def add_article_totals(totals, char_count)
    totals[:articles] += 1
    totals[:chars] += char_count
  end

  def add_author_totals(totals, author_name, char_count)
    totals[:authors][author_name][:articles] += 1
    totals[:authors][author_name][:chars] += char_count
  end

  def build_podcast_block(podcast_count)
    build_count_block(label_key: :podcast_total, value: podcast_count, unit_key: :articles)
  end

  def build_shops_block(shops)
    category_children = build_shop_category_children(shops)

    build_section_block(
      label(:shops),
      children: [
        build_count_block(
          label_key: :total_count,
          value: shops.size,
          unit_key: :shops,
          children: category_children
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
    build_block(label: label(label_key), value: format_count(value, unit(unit_key)), children: children)
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

  def normalize_author_name(raw_author)
    normalized = extract_normalized_author_name(raw_author)
    normalized == "" ? UNKNOWN_AUTHOR_NAME : normalized
  end

  def article_char_count(article)
    strip_html(article[:content].to_s).length
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

  def strip_html(text)
    html_sanitizer.sanitize(text)
  end

  def html_sanitizer
    @html_sanitizer ||= Rails::Html::FullSanitizer.new
  end
end

class MetricsController < ApplicationController
  include MicrocmsResponseHandling
  include ActiveSupport::NumberHelper

  LAUNCH_DATE = Date.new(2025, 10, 5)
  PODCAST_TOTAL = 0

  def show
    response = microcms_client.response
    return render_microcms_error(response) unless response.success?

    articles = microcms_client.all_articles(response: response)
    render json: build_metrics(articles)
  rescue StandardError => e
    log_microcms_error("metrics generation failed", e)
    head :bad_gateway
  end

  private

  def build_metrics(articles)
    totals = summarize_articles(articles)
    author_rows = totals[:authors].sort_by do |name, data|
      [
        name.include?("増田") ? 0 : 1,
        -data[:articles],
        name,
      ]
    end
    author_article_children = author_rows.map do |name, data|
      { "label" => "#{name}の総記事数", "value" => format_count(data[:articles], "本") }
    end
    author_char_children = author_rows.map do |name, data|
      { "label" => "#{name}の総文字数", "value" => format_count(data[:chars], "字") }
    end
    {
      "blocks" => [
        {
          "kind" => "single",
          "metric" => {
            "label" => "増田とその他！始動から（#{LAUNCH_DATE.strftime('%Y/%m/%d')}〜）",
            "value" => "#{days_since_launch} 日",
          },
        },
        {
          "kind" => "group",
          "label" => "ブログ",
          "groups" => [
            {
              "label" => "総記事数",
              "value" => format_count(totals[:articles], "本"),
              "children" => author_article_children,
            },
            {
              "label" => "総文字数",
              "value" => format_count(totals[:chars], "字"),
              "children" => author_char_children,
            },
          ],
        },
        {
          "kind" => "single",
          "metric" => {
            "label" => "ポッドキャスト総本数",
            "value" => format_count(PODCAST_TOTAL, "本"),
          },
        },
        build_shops_block,
      ],
    }
  end

  def summarize_articles(articles)
    totals = {
      articles: 0,
      chars: 0,
      authors: Hash.new { |hash, key| hash[key] = { articles: 0, chars: 0 } },
    }

    articles.each do |article|
      content = article["content"].to_s
      char_count = strip_html(content).length
      totals[:articles] += 1
      totals[:chars] += char_count

      author_name = article["author"].to_s.strip
      author_name = "不明" if author_name == ""
      totals[:authors][author_name][:articles] += 1
      totals[:authors][author_name][:chars] += char_count
    end

    totals
  end

  def build_shops_block
    shops = Shop.all
    categories = shops.group_by { |shop| normalize_shop_category(shop["category"]) }
    children = categories.sort_by { |name, _| name }.map do |name, items|
      { "label" => "#{name}の件数", "value" => format_count(items.size, "件") }
    end

    {
      "kind" => "group",
      "label" => "推し店",
      "groups" => [
        {
          "label" => "総件数",
          "value" => format_count(shops.size, "件"),
          "children" => children,
        },
      ],
    }
  end

  def normalize_shop_category(category)
    normalized = category.to_s.strip
    normalized == "" ? "未分類" : normalized
  end

  def days_since_launch
    (Date.current - LAUNCH_DATE).to_i
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

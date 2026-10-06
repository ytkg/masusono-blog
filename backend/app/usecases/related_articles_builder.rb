class RelatedArticlesBuilder
  EXCLUDED_TAGS = %w[価値観 感情 自己理解 思い出 お金 節約 おすすめ].freeze

  def self.call(article:)
    tags = eligible_tags(article[:tags])
    return [] if tags.empty?

    # Article.all uses the public microCMS API, so unpublished/deleted articles
    # are absent. Fetch afresh to reflect publication and tag changes immediately.
    Article.all.uniq { |candidate| candidate[:id] }.filter_map do |candidate|
      next if candidate[:id].blank? || candidate[:id] == article[:id]

      common_count = (tags & eligible_tags(candidate[:tags])).size
      next if common_count.zero?

      [ candidate, common_count, published_time(candidate[:publishedAt]) ]
    end.sort_by do |candidate, common_count, published_time|
      [ -common_count, published_time.nil? ? 1 : 0, -(published_time || 0), candidate[:id] ]
    end.first(3).map { |candidate, _count, _time| candidate.slice(:id, :title) }
  rescue Microcms::FetchContentsService::FetchError, Faraday::Error, JSON::ParserError => error
    Rails.logger.warn("Related articles fetch failed: #{error.class.name}")
    []
  end

  def self.eligible_tags(value)
    value.to_s.split(",").map(&:strip).reject(&:empty?).uniq - EXCLUDED_TAGS
  end
  private_class_method :eligible_tags

  def self.published_time(value)
    Time.iso8601(value).to_f if value.present?
  rescue ArgumentError
    nil
  end
  private_class_method :published_time
end

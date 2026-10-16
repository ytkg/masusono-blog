class RelatedArticlesBuilder
  MAX_ARTICLES = 3

  def self.call(article:)
    tags = parse_tags(article[:tags])
    return [] if tags.empty?

    # Fetch public articles once so every tag reflects publication changes.
    candidates = Article.all.uniq { |candidate| candidate[:id] }.reject do |candidate|
      candidate[:id].blank? || candidate[:id] == article[:id]
    end
    tags.filter_map do |tag|
      articles = candidates.select { |candidate| parse_tags(candidate[:tags]).include?(tag) }
        .sample(MAX_ARTICLES).map { |candidate| candidate.slice(:id, :title) }
      { tag: tag, articles: articles } if articles.any?
    end
  rescue Microcms::FetchContentsService::FetchError, Faraday::Error, JSON::ParserError => error
    Rails.logger.warn("Related articles fetch failed: #{error.class.name}")
    []
  end

  def self.parse_tags(value)
    value.to_s.split(",").map(&:strip).reject(&:empty?).uniq
  end
  private_class_method :parse_tags
end

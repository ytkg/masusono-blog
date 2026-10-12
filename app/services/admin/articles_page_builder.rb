module Admin
  class ArticlesPageBuilder
    PAGE_SIZE = 20
    STATUSES = {
      "all" => nil,
      "published" => "PUBLISH",
      "draft" => "DRAFT",
      "closed" => "CLOSED",
      "published_and_draft" => "PUBLISH_AND_DRAFT"
    }.freeze

    def self.call(articles:, query:, status:, page:)
      upstream_status = STATUSES.fetch(status)
      normalized_query = query.downcase
      matched = articles.select do |article|
        (!upstream_status || article[:status] == upstream_status) &&
          (normalized_query.blank? || article[:title].downcase.include?(normalized_query))
      end
      matched.sort_by! { |article| [ article[:updated_at], article[:id] ] }
      matched.reverse!

      offset = (page - 1) * PAGE_SIZE
      {
        articles: matched.slice(offset, PAGE_SIZE) || [],
        total_count: matched.size,
        has_more: offset + PAGE_SIZE < matched.size,
        page:,
        query:,
        status:
      }
    end
  end
end

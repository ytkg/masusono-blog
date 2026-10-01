require "faraday"
require "json"

module Microcms
  class FetchManagedArticlesService
    MANAGEMENT_ENDPOINT = "https://masusono.microcms-management.io/api/v1/contents/articles".freeze
    CONTENT_ENDPOINT = "https://masusono.microcms.io/api/v1/articles".freeze
    PAGE_SIZE = 20
    UPSTREAM_PAGE_SIZE = 100
    MAX_PAGE = 10_000
    STATUSES = {
      "all" => nil,
      "published" => "PUBLISH",
      "draft" => "DRAFT",
      "closed" => "CLOSED",
      "published_and_draft" => "PUBLISH_AND_DRAFT"
    }.freeze

    class FetchError < StandardError; end

    def self.call(query:, status:, page:, connection: nil, api_key: nil)
      new(connection:, api_key:).call(query:, status:, page:)
    end

    def initialize(connection: nil, api_key: nil)
      @api_key = api_key || Rails.application.credentials.dig(:microcms, :api_key)
      raise FetchError, "microCMS API key is missing" if @api_key.blank?

      @connection = connection || Faraday.new do |client|
        client.options.open_timeout = 5
        client.options.timeout = 10
      end
    end

    def call(query:, status:, page:)
      page_number = Integer(page, exception: false)
      raise ArgumentError, "Invalid page" unless page_number && page_number.between?(1, MAX_PAGE)
      raise ArgumentError, "Invalid status" unless STATUSES.key?(status)

      articles = articles_by_id
      matched = fetch_all(MANAGEMENT_ENDPOINT).filter_map do |metadata|
        article = articles[metadata.fetch("id", nil)]
        next unless article

        build_article(metadata, article)
      end
      matched.select! { |article| article[:status] == STATUSES.fetch(status) } if STATUSES.fetch(status)
      normalized_query = query.downcase
      matched.select! { |article| article[:title].downcase.include?(normalized_query) } if normalized_query.present?
      matched.sort_by! { |article| [ article[:updated_at], article[:id] ] }
      matched.reverse!

      offset = (page_number - 1) * PAGE_SIZE
      {
        articles: matched.slice(offset, PAGE_SIZE) || [],
        total_count: matched.size,
        has_more: offset + PAGE_SIZE < matched.size,
        page: page_number,
        query: query,
        status: status
      }
    rescue JSON::ParserError, Faraday::Error, KeyError => error
      raise FetchError, "microCMS articles request failed", cause: error
    end

    private

    def articles_by_id
      fetch_all(CONTENT_ENDPOINT, fields: "id,title").each_with_object({}) do |article, result|
        result[article.fetch("id")] = article
      end
    end

    def fetch_all(endpoint, fields: nil)
      contents = []
      offset = 0
      loop do
        params = { limit: UPSTREAM_PAGE_SIZE, offset: }
        params[:fields] = fields if fields
        response = @connection.get(endpoint, params) do |request|
          request.headers["X-MICROCMS-API-KEY"] = @api_key
          request.headers["Accept"] = "application/json"
        end
        raise FetchError, "microCMS articles request failed" unless response.success?

        payload = JSON.parse(response.body)
        page = payload["contents"]
        raise FetchError, "microCMS articles response is invalid" unless page.is_a?(Array)

        contents.concat(page)
        total_count = payload["totalCount"]
        limit = payload["limit"]
        break unless total_count.is_a?(Integer) && limit.is_a?(Integer) && limit.positive? && offset + limit < total_count

        offset += limit
      end
      contents
    end

    def build_article(metadata, article)
      status = Array(metadata["status"]).first
      return unless STATUSES.value?(status)

      {
        id: metadata.fetch("id"),
        title: article["title"].to_s,
        status:,
        updated_at: metadata["updatedAt"].to_s
      }
    end
  end
end
